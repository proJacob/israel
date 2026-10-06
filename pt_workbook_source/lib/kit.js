// Shared palette, layout constants and slide-building helpers for the Packet Tracer CLI workbook.
// The look follows the unit's main deck: forest green, Cambria headings, Calibri body, Courier New code.
const { icon, device } = require('./icons');

const P = {
  dark: '1E5631', deep: '1B2B22', mid: '2B7043', alt: '24663A', tint: 'E8F1EA', tint2: 'F2F8F3', border: 'B7C9BA',
  text: '2B2B2B', muted: '6B6B6B', gold: 'E8B92E', red: 'E0605A', darkRed: '8B1A1A', redTint: 'FBEAEA', redBorder: 'E9B8B5',
  dotGreen: '4CAF50', white: 'FFFFFF', prompt: '8FC9A0', out: 'D5E2D8', comment: '9FB3A6', light: 'CFE3D4', headGray: 'C9D6CC',
  v10: '2F855A', v20: '2B6CB0', v30: 'C05621', v99: '718096', console: '29A8D8', serial: 'C53030', blueTint: 'E6EEF8',
};
const CODE = 'Courier New';
const W = 13.333, H = 7.5, MX = 0.6, CW = W - 2 * MX;
const FOOTER = 'How to configure switches and routers in Packet Tracer  •  0612 451 07A  •  Kabete National Polytechnic';

// ---------- text markup: `code`  **bold**  (terminals also take {{highlight}}) ----------
function runs(str, base = {}, o = {}) {
  const out = [];
  const codeSize = o.codeSize || (base.fontSize ? base.fontSize - 1 : undefined);
  const parts = String(str).split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter((s) => s !== '');
  for (const part of parts) {
    if (part.startsWith('`')) {
      out.push({ text: part.slice(1, -1), options: { ...base, fontFace: CODE, bold: true, color: o.codeColor || P.dark, ...(codeSize ? { fontSize: codeSize } : {}) } });
    } else if (part.startsWith('**')) {
      out.push({ text: part.slice(2, -2), options: { ...base, bold: true, ...(o.boldColor ? { color: o.boldColor } : {}) } });
    } else {
      out.push({ text: part, options: { ...base } });
    }
  }
  return out;
}

// Paragraphs: array of strings (or {t, bullet, color, size}) → runs with breakLine between paragraphs.
function paras(list, base = {}, o = {}) {
  const out = [];
  list.forEach((item, i) => {
    const it = typeof item === 'string' ? { t: item } : item;
    const pBase = { ...base, ...(it.color ? { color: it.color } : {}), ...(it.size ? { fontSize: it.size } : {}), ...(it.bold ? { bold: true } : {}) };
    const r = runs(it.t, pBase, o);
    if (it.bullet || o.bullet) {
      r[0].options = { ...r[0].options, bullet: it.num ? { type: 'number', indent: 18 } : (o.bulletChar ? { characterCode: o.bulletChar, indent: 16 } : { indent: 16 }), indentLevel: it.level || 0 };
    }
    if (o.paraSpaceAfter !== undefined) r[0].options.paraSpaceAfter = o.paraSpaceAfter;
    if (i < list.length - 1) r[r.length - 1].options = { ...r[r.length - 1].options, breakLine: true };
    out.push(...r);
  });
  return out;
}

// ---------- rough text metrics, used to keep tables inside their area ----------
const CODE_CH = 0.6 / 72; // Courier New: 0.6 em per character, in inches per point
const BODY_CH = 0.5 / 72; // Calibri: about 0.5 em on average, with slack for word wrap
function lineCount(text, widthIn, pt, mono) {
  const clean = String(text).replace(/`|\*\*|\{\{|\}\}/g, '');
  const cap = Math.max(8, Math.floor(widthIn / (pt * (mono ? CODE_CH : BODY_CH))));
  let lines = 0;
  for (const para of clean.split('\n')) {
    if (mono) { lines += Math.max(1, Math.ceil(para.length / cap)); continue; }
    // greedy word wrap
    let cur = 0, l = 1;
    for (const word of para.split(/\s+/)) {
      const add = (cur ? 1 : 0) + word.length;
      if (cur + add > cap) { l += 1; cur = word.length; } else cur += add;
    }
    lines += l;
  }
  return lines;
}

const warnings = [];
function warn(msg) { warnings.push(msg); }

// ---------- common slide furniture ----------
let MENU_SLIDE = 3;
function setMenuSlide(n) { MENU_SLIDE = n; }

async function homeButton(slide, dark = false) {
  const data = await icon('FaHome', 'FFFFFF', { circle: dark ? P.mid : P.dark, pad: 0.27 });
  slide.addImage({ data, x: 12.43, y: 6.93, w: 0.4, h: 0.4, hyperlink: { slide: MENU_SLIDE, tooltip: 'Back to the workbook menu' }, altText: 'Home: back to the workbook menu', objectName: 'Home button' });
}

function goal(slide, text, y = 1.27) {
  slide.addText([{ text: 'Goal:  ', options: { bold: true, color: P.mid } }, ...runs(text, { color: P.text })], {
    x: MX, y, w: CW, h: 0.42, fontSize: 14, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Goal',
  });
}

// Command rows: dark "terminal" cells (prompt + command, always visible) and light "What it does"
// cells. Each cell is its own shape, sized from real font metrics, so that with o.reveal the
// meaning cells can be brought in one click at a time (shapes named "Reveal NN"; see animate.js).
const M = require('./measure');
const PT_IN = 1 / 72;
function measureRuns(list) {
  return list.map((r) => ({ text: r.text, mono: r.options && r.options.fontFace === CODE, bold: !!(r.options && r.options.bold), pt: (r.options && r.options.fontSize) || 14 }));
}
function commandTable(slide, o) {
  const x = o.x ?? MX, y = o.y ?? 1.82, w = o.w ?? CW, codeW = o.codeW ?? 6.75;
  const meanW = w - codeW;
  const codePt = o.codePt || 12, meanPt = o.meanPt || 14;
  const padX = 0.12, padY = 0.05, hdrH = 0.34, sep = 0.02;
  const margin = [padX / PT_IN, padX / PT_IN, padY / PT_IN, padY / PT_IN]; // points: left, right, bottom, top
  slide.addText([
    { text: '●  ', options: { color: P.red } }, { text: '●  ', options: { color: P.gold } }, { text: '●   ', options: { color: P.dotGreen } },
    { text: o.headerLeft || `${o.device || 'R1'}  —  type the white text, then press Enter`, options: { color: P.headGray, bold: true } },
  ], { shape: 'rect', x, y, w: codeW - sep, h: hdrH, fill: { color: P.deep }, line: { type: 'none' }, fontSize: 11, valign: 'middle', margin, objectName: 'Command header' });
  slide.addText(o.headerRight || 'What it does', { shape: 'rect', x: x + codeW, y, w: meanW, h: hdrH, fill: { color: P.tint }, line: { type: 'none' }, color: P.dark, bold: true, fontSize: 12, valign: 'middle', margin, objectName: 'Meaning header' });
  let cy = y + hdrH + sep;
  o.rows.forEach((r, idx) => {
    const nn = String(idx + 1).padStart(2, '0');
    const lines = r.lines || [{ p: r.p, c: r.c, comment: r.comment }];
    const codeRuns = [];
    let codeLines = 0;
    lines.forEach((ln, i) => {
      const last = i === lines.length - 1;
      if (ln.p) codeRuns.push({ text: ln.p + ' ', options: { color: P.prompt, bold: false } });
      codeRuns.push({ text: ln.c, options: { color: ln.comment ? P.comment : P.white, bold: !ln.comment, italic: !!ln.comment, breakLine: !last } });
      codeLines += M.lineCount([{ text: (ln.p ? ln.p + ' ' : '') + ln.c, mono: true, bold: true, pt: codePt }], codeW - sep - 2 * padX);
    });
    const meanRuns = runs(r.m, { color: P.text, fontSize: meanPt });
    const meanLines = M.lineCount(measureRuns(meanRuns), meanW - 2 * padX);
    const rowH = Math.max(M.linesHeight(codeLines, 'mono', codePt), M.linesHeight(meanLines, 'body', meanPt)) + 2 * padY + 0.02;
    slide.addText(codeRuns, { shape: 'rect', x, y: cy, w: codeW - sep, h: rowH, fill: { color: P.deep }, line: { type: 'none' }, fontFace: CODE, fontSize: codePt, valign: 'middle', margin, objectName: `Command ${nn}` });
    slide.addText(meanRuns, { shape: 'rect', x: x + codeW, y: cy, w: meanW, h: rowH, fill: { color: idx % 2 ? P.white : P.tint2 }, line: { type: 'none' }, fontSize: meanPt, valign: 'middle', margin, objectName: o.reveal ? `Reveal ${nn} meaning` : `Meaning ${nn}` });
    cy += rowH + sep;
  });
  const limit = o.maxBottom ?? 5.92;
  if (cy > limit + 0.01) warn(`${o.title || 'command table'}: bottom ${cy.toFixed(2)} > ${limit}`);
  if (process.env.SHOW_BOTTOMS) console.log(`  rows end at ${cy.toFixed(2)}  ${o.title || ''}`);
  return cy;
}

// "Check it" and "Watch out" boxes along the bottom of a slide. With o.reveal they come in together
// on the click after the last command (shapes named "Reveal 99 …").
async function checkWatch(slide, o) {
  const y = o.y ?? 6.02, h = o.h ?? 0.82;
  const items = [];
  if (o.check) items.push({ kind: 'check', text: o.check });
  if (o.watch) items.push({ kind: 'watch', text: o.watch });
  if (o.tip) items.push({ kind: 'tip', text: o.tip });
  const gap = 0.3, ax = o.x ?? MX, aw = o.w ?? CW;
  const bw = (aw - gap * (items.length - 1)) / items.length;
  const pt = o.size || 14;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const x = ax + i * (bw + gap);
    const sty = {
      check: { fill: P.tint, line: P.border, label: 'Check it:', color: P.dark, icon: 'FaCheckCircle', ic: P.mid },
      watch: { fill: P.redTint, line: P.redBorder, label: 'Watch out:', color: P.darkRed, icon: 'FaExclamationTriangle', ic: P.darkRed },
      tip: { fill: P.blueTint, line: 'B8C9E0', label: 'Tip:', color: '1F4E8C', icon: 'FaLightbulb', ic: '1F4E8C' },
    }[it.kind];
    const name = (part) => (o.reveal ? `Reveal 99 ${it.kind} ${part}` : `${it.kind} ${part}`);
    slide.addShape('roundRect', { x, y, w: bw, h, fill: { color: sty.fill }, line: { color: sty.line, width: 1 }, rectRadius: 0.08, objectName: name('box') });
    slide.addImage({ data: await icon(sty.icon, sty.ic), x: x + 0.16, y: y + (h - 0.32) / 2, w: 0.32, h: 0.32, altText: sty.label, objectName: name('icon') });
    const textRuns = [{ text: sty.label + '  ', options: { bold: true, color: sty.color, fontSize: pt } }, ...runs(it.text, { color: P.text, fontSize: pt })];
    slide.addText(textRuns, { x: x + 0.6, y: y + 0.04, w: bw - 0.72, h: h - 0.08, fontSize: pt, valign: 'middle', margin: 0, isTextBox: true, objectName: name('text') });
    const lines = M.lineCount(measureRuns(textRuns), bw - 0.72);
    if (M.linesHeight(lines, 'body', pt) > h - 0.08) warn(`${o.title || ''} ${it.kind} box text overflows (${lines} lines)`);
  }
}

// Dark terminal window with traffic-light dots. lines: strings; prompts auto-coloured; {{x}} = highlight; lines starting with ! = comment.
function terminal(slide, o) {
  const { x, y, w, h } = o;
  const pt = o.pt || 12;
  slide.addShape('roundRect', { x, y, w, h, fill: { color: P.deep }, line: { color: P.deep, width: 0.5 }, rectRadius: 0.08, objectName: 'Terminal window' });
  ['red', 'gold', 'dotGreen'].forEach((c, i) => slide.addShape('ellipse', { x: x + 0.18 + i * 0.2, y: y + 0.13, w: 0.12, h: 0.12, fill: { color: P[c] }, line: { type: 'none' } }));
  if (o.title) slide.addText(o.title, { x: x + 0.85, y: y + 0.05, w: w - 1.0, h: 0.28, fontSize: 11, color: P.headGray, bold: true, margin: 0, valign: 'middle', isTextBox: true });
  const out = [];
  const promptRe = /^([A-Za-z][\w-]*(?:\([\w-]+\))?[#>]|C:\\>)(\s?)(.*)$/;
  o.lines.forEach((line, i) => {
    const last = i === o.lines.length - 1;
    const seg = [];
    const m = line.match(promptRe);
    if (line.startsWith('!')) {
      seg.push({ text: line, options: { color: P.comment, italic: true } });
    } else if (m && !o.noPrompt) {
      seg.push({ text: m[1] + (m[2] || ''), options: { color: P.prompt } });
      seg.push(...hl(m[3], { color: P.white, bold: true }));
    } else {
      seg.push(...hl(line, { color: P.out }));
    }
    if (!seg.length || line === '') seg.push({ text: ' ', options: { color: P.out } });
    if (!last) seg[seg.length - 1].options.breakLine = true;
    out.push(...seg);
  });
  slide.addText(out, { x: x + 0.2, y: y + 0.42, w: w - 0.35, h: h - 0.52, fontFace: CODE, fontSize: pt, valign: 'top', margin: 0, isTextBox: true, objectName: 'Terminal text', paraSpaceAfter: 0, lineSpacingMultiple: o.lsm || 1.0 });
  const maxLines = Math.floor((h - 0.52) / (pt * 1.18 / 72));
  let used = 0;
  for (const l of o.lines) used += lineCount(l, w - 0.35, pt, true);
  if (used > maxLines) warn(`${o.name || 'terminal'}: ${used} lines > ${maxLines} capacity`);
  const longest = Math.max(...o.lines.map((l) => l.replace(/\{\{|\}\}/g, '').length));
  const cap = Math.floor((w - 0.35) / (pt * CODE_CH));
  if (longest > cap) warn(`${o.name || 'terminal'}: line of ${longest} chars wraps (cap ${cap})`);
}
function hl(text, base) {
  const parts = String(text).split(/(\{\{[^}]+\}\})/g).filter((s) => s !== '');
  return parts.map((p) => (p.startsWith('{{') ? { text: p.slice(2, -2), options: { ...base, color: P.gold, bold: true } } : { text: p, options: { ...base } }));
}

// A light card with a bold heading and body text.
function card(slide, o) {
  const { x, y, w, h } = o;
  slide.addShape('roundRect', { x, y, w, h, fill: { color: o.fill || P.tint2 }, line: { color: o.line || P.border, width: 1 }, rectRadius: 0.08, objectName: o.name || 'Card' });
  const pad = o.pad ?? 0.16;
  const items = [];
  if (o.head) items.push(...runs(o.head, { bold: true, color: o.headColor || P.dark, fontSize: o.headPt || 14 }, { codeColor: o.headColor || P.dark }));
  if (o.head && o.body) items[items.length - 1].options.breakLine = true;
  if (o.body) {
    const b = Array.isArray(o.body) ? o.body : [o.body];
    items.push(...paras(b, { color: o.color || P.text, fontSize: o.pt || 14 }, { bullet: o.bullet, paraSpaceAfter: o.psa }));
  }
  slide.addText(items, { x: x + pad, y: y + pad * 0.7, w: w - 2 * pad, h: h - pad * 1.4, valign: o.valign || 'top', margin: 0, isTextBox: true, fontSize: o.pt || 14 });
  if (o.check !== false) {
    let lines = 0;
    if (o.head) lines += lineCount(o.head, w - 2 * pad, o.headPt || 14, false) * ((o.headPt || 14) / (o.pt || 14));
    for (const b of (Array.isArray(o.body) ? o.body : o.body ? [o.body] : [])) lines += lineCount(typeof b === 'string' ? b : b.t, w - 2 * pad - (o.bullet ? 0.3 : 0), o.pt || 14, false) + (o.psa ? o.psa / (o.pt || 14) : 0);
    if (lines * (o.pt || 14) * 1.22 / 72 > h - pad * 1.4 + 0.02) warn(`card "${(o.head || '').slice(0, 30)}" may overflow: ~${lines.toFixed(1)} lines in ${h}in`);
  }
}

// Numbered circle (gold by default) with a number inside.
function numBadge(slide, n, x, y, d = 0.36, fill = P.gold, color = P.deep) {
  slide.addShape('ellipse', { x, y, w: d, h: d, fill: { color: fill }, line: { type: 'none' } });
  slide.addText(String(n), { x, y, w: d, h: d, fontSize: d > 0.4 ? 16 : 13, bold: true, color, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
}

// Vertical list of numbered steps: [{h, t}] (h bold heading, t text)
function steps(slide, o) {
  const { x, y, w } = o;
  let cy = y;
  const pt = o.pt || 14;
  o.items.forEach((it, i) => {
    const text = [];
    if (it.h) text.push(...runs(it.h, { bold: true, color: P.dark, fontSize: pt }));
    if (it.h && it.t) text[text.length - 1].options.breakLine = true;
    if (it.t) text.push(...runs(it.t, { color: P.text, fontSize: pt }));
    const lines = (it.h ? lineCount(it.h, w - 0.6, pt, false) : 0) + (it.t ? lineCount(it.t, w - 0.6, pt, false) : 0);
    const hh = Math.max(0.42, lines * pt * 1.22 / 72 + 0.06);
    numBadge(slide, it.n ?? i + 1, x, cy + 0.02, 0.36, o.badge || P.dark, o.badgeText || P.white);
    slide.addText(text, { x: x + 0.52, y: cy, w: w - 0.52, h: hh, valign: 'top', margin: 0, isTextBox: true, fontSize: pt });
    cy += hh + (o.gap ?? 0.14);
  });
  if (o.maxBottom && cy > o.maxBottom) warn(`steps "${o.name || ''}" bottom ${cy.toFixed(2)} > ${o.maxBottom}`);
  return cy;
}

// Simple data table in the deck style.
function dataTable(slide, o) {
  const pt = o.pt || 13;
  const rows = [];
  rows.push(o.head.map((h) => ({ text: h, options: { bold: true, color: P.white, fill: { color: P.dark }, fontSize: pt, valign: 'middle' } })));
  let estH = (pt * 1.25 / 72) + 0.12;
  o.rows.forEach((r, ri) => {
    let maxL = 1;
    rows.push(r.map((c, ci) => {
      const cell = typeof c === 'object' && !Array.isArray(c) ? c : { t: c };
      const mono = cell.mono || (o.monoCols && o.monoCols.includes(ci));
      const base = { color: cell.color || P.text, fontSize: pt, ...(cell.bold ? { bold: true } : {}) };
      const t = mono ? [{ text: cell.t, options: { ...base, fontFace: CODE, bold: true, color: cell.color || P.dark, fontSize: pt - 1 } }] : runs(cell.t, base);
      maxL = Math.max(maxL, lineCount(cell.t, o.colW[ci] - 0.22, mono ? pt - 1 : pt, mono));
      return { text: t, options: { fill: { color: cell.fill || (ri % 2 ? P.white : P.tint2) }, valign: 'middle', fontSize: pt } };
    }));
    estH += maxL * pt * 1.22 / 72 + 0.12;
  });
  slide.addTable(rows, { x: o.x ?? MX, y: o.y, w: o.colW.reduce((a, b) => a + b, 0), colW: o.colW, ...(o.rowH ? { rowH: o.rowH } : {}), border: { type: 'solid', pt: 1, color: P.border }, margin: [0.05, 0.1, 0.05, 0.1], fontFace: 'Calibri', objectName: o.name || 'Table' });
  if (o.rowH) estH = o.rowH.reduce((a, b) => a + b, 0);
  if (o.maxBottom && o.y + estH > o.maxBottom) warn(`table "${o.name || o.head[0]}" estimated bottom ${(o.y + estH).toFixed(2)} > ${o.maxBottom}`);
  return o.y + estH;
}

// ---------- topology drawing ----------
const DEV_FILL = { router: P.dark, switch: P.mid, mls: P.alt, pc: '3E4A43', server: '4A5A50', cloud: 'A3ADA8', laptop: '3E4A43', isp: '6B6B6B' };
async function dev(slide, kind, cx, cy, size, label, sub, o = {}) {
  const k = kind === 'isp' ? 'router' : kind;
  const data = await device(k, o.fill || DEV_FILL[kind]);
  const hgt = size;
  slide.addImage({ data, x: cx - size / 2, y: cy - hgt / 2, w: size, h: hgt, altText: label || kind });
  if (label) {
    const lp = o.labelPos || 'below';
    const lw = o.labelW || 1.6;
    let lx = cx - lw / 2, ly = cy + hgt / 2 - (kind === 'switch' || kind === 'mls' ? 0.1 : 0.02), al = 'center';
    if (lp === 'above') ly = cy - hgt / 2 - (sub ? 0.5 : 0.3) + (kind === 'switch' || kind === 'mls' ? 0.1 : 0);
    if (lp === 'right') { lx = cx + size / 2 + 0.05; ly = cy - (sub ? 0.25 : 0.15); al = 'left'; }
    if (lp === 'left') { lx = cx - size / 2 - lw - 0.05; ly = cy - (sub ? 0.25 : 0.15); al = 'right'; }
    const t = [{ text: label, options: { bold: true, color: o.labelColor || P.text, fontSize: o.labelPt || 12, breakLine: !!sub } }];
    if (sub) t.push({ text: sub, options: { color: o.subColor || P.muted, fontSize: o.subPt || 10 } });
    slide.addText(t, { x: lx, y: ly, w: lw, h: sub ? 0.5 : 0.3, align: al, valign: 'top', margin: 0, isTextBox: true });
  }
}
function link(slide, x1, y1, x2, y2, o = {}) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  const flipH = x2 < x1, flipV = y2 < y1;
  slide.addShape('line', { x, y, w: Math.max(w, 0.001), h: Math.max(h, 0.001), flipH, flipV, line: { color: o.color || '3A3A3A', width: o.width || 2, dashType: o.dash || 'solid', ...(o.end ? { endArrowType: o.end } : {}), ...(o.begin ? { beginArrowType: o.begin } : {}) } });
}
function tag(slide, text, x, y, o = {}) {
  const w = o.w || 1.4, h = o.h || 0.26;
  slide.addText(runs(text, { color: o.color || P.text, fontSize: o.pt || 10, bold: !!o.bold }, { codeColor: o.codeColor || o.color || P.dark }), {
    x, y, w, h, align: o.align || 'center', valign: 'middle', margin: 0.02, isTextBox: true,
    ...(o.fill ? { fill: { color: o.fill }, line: { color: o.line || o.fill, width: 0.75 }, shape: 'roundRect', rectRadius: 0.05 } : {}),
  });
}

module.exports = { P, CODE, W, H, MX, CW, FOOTER, runs, paras, lineCount, warnings, warn, setMenuSlide, homeButton, goal, commandTable, checkWatch, terminal, card, numBadge, steps, dataTable, dev, link, tag, icon, device };
