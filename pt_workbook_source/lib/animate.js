// Adds PowerPoint click-to-reveal animations. pptxgenjs cannot write animations, so after the
// deck is written every slide is scanned for shapes named "Reveal NN …": each NN becomes one
// click (a Fade entrance), in ascending order. Shapes sharing an NN appear together.
// In editing view, PDF export and printouts everything stays visible.
const fs = require('fs');
const JSZip = require('jszip');

function timingXml(groups) {
  let n = 0;
  const id = () => ++n;
  const root = id(), main = id();
  let clicks = '';
  for (const group of groups) {
    const outer = id(), inner = id();
    let effects = '';
    group.forEach((t, i) => {
      const eff = id(), set = id(), fade = id();
      effects +=
        `<p:par><p:cTn id="${eff}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="${i === 0 ? 'clickEffect' : 'withEffect'}">` +
        '<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>' +
        `<p:set><p:cBhvr><p:cTn id="${set}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>` +
        `<p:tgtEl><p:spTgt spid="${t.id}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>` +
        '<p:to><p:strVal val="visible"/></p:to></p:set>' +
        `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${fade}" dur="400"/><p:tgtEl><p:spTgt spid="${t.id}"/></p:tgtEl></p:cBhvr></p:animEffect>` +
        '</p:childTnLst></p:cTn></p:par>';
    });
    clicks +=
      `<p:par><p:cTn id="${outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>` +
      `<p:par><p:cTn id="${inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${effects}</p:childTnLst></p:cTn></p:par>` +
      '</p:childTnLst></p:cTn></p:par>';
  }
  const builds = groups.flat().filter((t) => t.sp).map((t) => `<p:bldP spid="${t.id}" grpId="0" animBg="1"/>`).join('');
  return (
    '<p:timing><p:tnLst><p:par>' +
    `<p:cTn id="${root}" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>` +
    `<p:seq concurrent="1" nextAc="seek"><p:cTn id="${main}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${clicks}</p:childTnLst></p:cTn>` +
    '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>' +
    '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>' +
    '</p:childTnLst></p:cTn></p:par></p:tnLst>' +
    (builds ? `<p:bldLst>${builds}</p:bldLst>` : '') +
    '</p:timing>'
  );
}

// Returns the modified slide XML, or null when the slide has no "Reveal" shapes.
function addRevealTiming(xml) {
  const found = new Map();
  const re = /<p:(nvSpPr|nvPicPr)>\s*<p:cNvPr id="(\d+)" name="Reveal (\d+)[^"]*"/g;
  let m;
  while ((m = re.exec(xml))) {
    const key = Number(m[3]);
    if (!found.has(key)) found.set(key, []);
    found.get(key).push({ id: m[2], sp: m[1] === 'nvSpPr' });
  }
  if (!found.size) return null;
  if (xml.includes('<p:timing>')) throw new Error('slide already has animations');
  const groups = [...found.keys()].sort((a, b) => a - b).map((k) => found.get(k));
  if (!xml.includes('</p:clrMapOvr></p:sld>')) throw new Error('unexpected slide ending; cannot place <p:timing>');
  return { xml: xml.replace('</p:clrMapOvr></p:sld>', `</p:clrMapOvr>${timingXml(groups)}</p:sld>`), clicks: groups.length };
}

async function addReveals(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const report = [];
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/slides\/slide\d+\.xml$/.test(name)) continue;
    const res = addRevealTiming(await zip.file(name).async('string'));
    if (!res) continue;
    zip.file(name, res.xml);
    report.push({ slide: Number(name.match(/(\d+)\.xml$/)[1]), clicks: res.clicks });
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  return report.sort((a, b) => a.slide - b.slide);
}

module.exports = { addReveals, addRevealTiming, timingXml };
