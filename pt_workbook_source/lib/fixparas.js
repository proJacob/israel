// pptxgenjs writes an <a:pPr> before every run of a multi-run paragraph. The schema allows one,
// first. Keep only the leading pPr of each paragraph so every renderer reads the same properties.
const fs = require('fs');
const JSZip = require('jszip');

function fixXml(xml) {
  let removed = 0;
  const out = xml.replace(/<a:p>([\s\S]*?)<\/a:p>/g, (whole, inner) => {
    let first = true;
    const cleaned = inner.replace(/<a:pPr\b[^>]*\/>|<a:pPr\b[^>]*>[\s\S]*?<\/a:pPr>/g, (m, offset) => {
      if (first && offset === 0) { first = false; return m; }
      first = false;
      removed += 1;
      return '';
    });
    return `<a:p>${cleaned}</a:p>`;
  });
  return { out, removed };
}

// pptxgenjs gives the slide-number placeholder a fixed id (25), which repeats the id of the 24th
// object on busy slides. Shape ids must be unique — animations target shapes by id — so any
// repeated id after its first use is renumbered past the highest id on the slide.
function fixIds(xml) {
  const re = /(<p:cNvPr id=")(\d+)(")/g;
  const seen = new Set();
  let max = 0, m;
  while ((m = re.exec(xml))) max = Math.max(max, Number(m[2]));
  let renumbered = 0;
  const out = xml.replace(re, (all, a, id, b) => {
    if (!seen.has(id)) { seen.add(id); return all; }
    renumbered += 1;
    max += 1;
    seen.add(String(max));
    return `${a}${max}${b}`;
  });
  return { out, renumbered };
}

async function fixParagraphs(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  let total = 0;
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/(slides|slideLayouts|slideMasters|notesSlides)\/[^/]+\.xml$/.test(name)) continue;
    let xml = await zip.file(name).async('string');
    const { out, removed } = fixXml(xml);
    let changed = removed > 0;
    xml = out;
    if (/^ppt\/slides\//.test(name)) {
      const ids = fixIds(xml);
      if (ids.renumbered) { xml = ids.out; changed = true; }
    }
    if (changed) zip.file(name, xml);
    total += removed;
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  return total;
}

module.exports = { fixParagraphs, fixXml, fixIds };
