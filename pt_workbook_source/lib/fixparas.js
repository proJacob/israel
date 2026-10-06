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

async function fixParagraphs(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  let total = 0;
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/(slides|slideLayouts|slideMasters|notesSlides)\/[^/]+\.xml$/.test(name)) continue;
    const xml = await zip.file(name).async('string');
    const { out, removed } = fixXml(xml);
    if (removed) { zip.file(name, out); total += removed; }
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  return total;
}

module.exports = { fixParagraphs, fixXml };
