// Measures wrapped text with real font metrics, so animated shapes can be sized exactly
// (shapes do not grow to fit their text the way table rows do).
// Carlito and Liberation Mono have the same metrics as Calibri and Courier New.
const fs = require('fs');
const path = require('path');

let opentype = null;
try { opentype = require('opentype.js'); } catch { /* falls back to estimates */ }

const DIRS = [
  path.join(__dirname, '..', 'fonts'),
  '/usr/share/fonts/truetype/crosextra',
  '/usr/share/fonts/truetype/liberation',
  '/usr/share/fonts/truetype/msttcorefonts',
  'C:/Windows/Fonts',
  '/Library/Fonts',
];
const FILES = {
  body: ['Carlito-Regular.ttf', 'calibri.ttf', 'Calibri.ttf'],
  bodyBold: ['Carlito-Bold.ttf', 'calibrib.ttf', 'Calibri Bold.ttf'],
  mono: ['LiberationMono-Regular.ttf', 'cour.ttf', 'Courier New.ttf'],
  monoBold: ['LiberationMono-Bold.ttf', 'courbd.ttf', 'Courier New Bold.ttf'],
};
// Single line spacing as a multiple of the font size (ascent + descent + line gap).
const LINE = { body: 1.2207, mono: 1.1328 };

const fonts = {};
function font(kind) {
  if (kind in fonts) return fonts[kind];
  fonts[kind] = null;
  if (!opentype) return null;
  for (const dir of DIRS) for (const f of FILES[kind]) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) {
      const b = fs.readFileSync(p);
      fonts[kind] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
      return fonts[kind];
    }
  }
  return null;
}

let warned = false;
function width(text, kind, pt) {
  const f = font(kind);
  if (f) return f.getAdvanceWidth(text, pt, { kerning: false });
  if (!warned) { warned = true; console.warn('measure.js: fonts not found, using estimates (install Carlito and Liberation Mono)'); }
  return text.length * pt * (kind.startsWith('mono') ? 0.6 : 0.52);
}

// runs: [{ text, mono, bold, pt }]. Paragraph breaks: "\n" inside text or { br: true } items.
// Returns the number of lines the text wraps to in a box widthIn inches wide.
function lineCount(runs, widthIn) {
  const avail = widthIn * 72 * 0.98;
  // Split into paragraphs of words; each word keeps its own measured width.
  const paras = [[]];
  let word = { w: 0, s: '' };
  const pushWord = () => { if (word.s) paras[paras.length - 1].push({ w: word.w, sp: 0, s: word.s }); word = { w: 0, s: '' }; };
  for (const r of runs) {
    if (r.br) { pushWord(); paras.push([]); continue; }
    const kind = (r.mono ? 'mono' : 'body') + (r.bold ? 'Bold' : '');
    for (const ch of String(r.text)) {
      if (ch === '\n') { pushWord(); paras.push([]); continue; }
      if (ch === ' ') {
        pushWord();
        const cur = paras[paras.length - 1];
        if (cur.length) cur[cur.length - 1].sp += width(' ', kind, r.pt);
        continue;
      }
      word.w += width(ch, kind, r.pt);
      word.s += ch;
    }
  }
  pushWord();
  let lines = 0;
  for (const words of paras) {
    let n = 1, x = 0;
    for (let i = 0; i < words.length; i++) {
      const wd = words[i];
      const gap = i > 0 ? words[i - 1].sp : 0;
      if (x > 0 && x + gap + wd.w > avail) { n += 1; x = 0; }
      if (x === 0 && wd.w > avail) { n += Math.ceil(wd.w / avail) - 1; x = wd.w % avail; continue; }
      x += (x > 0 ? gap : 0) + wd.w;
    }
    lines += n;
  }
  return lines;
}

// Height in inches of `lines` lines of the given font kind and size.
function linesHeight(lines, kind, pt) {
  return (lines * pt * LINE[kind]) / 72;
}

module.exports = { lineCount, linesHeight, width, haveFonts: () => !!font('body') && !!font('mono') };
