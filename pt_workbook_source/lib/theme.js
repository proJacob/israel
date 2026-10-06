// Writes the deck's own colour scheme and theme name into ppt/theme/theme1.xml.
// pptxgenjs sets the theme fonts but always writes Office's default colours.
const fs = require('fs');
const JSZip = require('jszip');

const SLOTS = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function writeTheme(file, theme) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const part = 'ppt/theme/theme1.xml';
  const xml = await zip.file(part).async('string');
  for (const k of SLOTS) if (!/^[0-9A-Fa-f]{6}$/.test(theme.colors[k])) throw new Error(`theme colour ${k} must be 6 hex digits`);
  const name = esc(theme.name);
  const scheme = `<a:clrScheme name="${name}">` + SLOTS.map((k) => `<a:${k}><a:srgbClr val="${theme.colors[k].toUpperCase()}"/></a:${k}>`).join('') + '</a:clrScheme>';
  const out = xml
    .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => scheme)
    .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, head) => `${head}${name}"`);
  if (!out.includes(scheme)) throw new Error('No colour scheme found in ' + part);
  zip.file(part, out);
  for (const n of Object.keys(zip.files)) {
    if (!n.endsWith('.xml')) continue;
    const bad = (await zip.file(n).async('string')).match(/<a:srgbClr val="((?![0-9A-Fa-f]{6}")[^"]*)"/);
    if (bad) throw new Error(`${n}: colour "${bad[1]}" is not 6 hex digits`);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

module.exports = { writeTheme };
