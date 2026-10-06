// Builds "How to configure switches and routers in Packet Tracer" — a CLI workbook deck.
// Usage: node build.js [output.pptx] [logo.jpeg]   (needs: npm install)
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const K = require('./lib/kit');
const { P, MX, CW, FOOTER, runs, paras, icon } = K;

const OUT = process.argv[2] || path.join(__dirname, '..', 'Packet_Tracer_CLI_Workbook_0612_451_07A.pptx');
const LOGO = process.argv[3] || path.join(__dirname, 'assets', 'knp_logo.jpeg');
const LOGO_DATA = 'image/jpeg;base64,' + fs.readFileSync(LOGO).toString('base64');
const LOGO_AR = 376 / 229;

const THEME = {
  name: 'KNP Packet Tracer',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: P.text, lt1: 'FFFFFF', dk2: P.dark, lt2: P.tint,
    accent1: P.dark, accent2: P.mid, accent3: P.gold, accent4: P.v20, accent5: P.v30, accent6: P.darkRed,
    hlink: P.mid, folHlink: P.alt,
  },
};

// Sections in order. Each content module exports { section, slides }.
const SECTION_FILES = ['s01_pt', 's02_ios', 's03_setup', 's04_vlan', 's05_intervlan', 's06_dhcp', 's07_routing', 's08_security', 's09_stp', 's10_mgmt', 's11_trouble', 's12_practice'];
const SECTIONS = (process.env.ONLY ? process.env.ONLY.split(',') : SECTION_FILES).map((f) => require('./content/' + f));

async function main() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'Jacob Kimwele';
  pres.company = 'Kabete National Polytechnic';
  pres.title = 'How to configure switches and routers in Packet Tracer';
  pres.subject = 'Cisco IOS CLI workbook — Perform Network Design and Management (0612 451 07A), ICT Technician Level 6';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  // ---------- layouts ----------
  pres.defineSlideMaster({
    title: 'PT_CONTENT',
    background: { color: 'FFFFFF' },
    margin: [0.5, 0.6, 0.5, 0.6],
    objects: [
      { image: { x: 11.93, y: 0.24, w: 0.86, h: 0.86 / LOGO_AR, data: LOGO_DATA, altText: 'Kabete National Polytechnic logo' } },
      { text: { text: FOOTER, options: { x: MX, y: 7.07, w: 9.5, h: 0.24, fontSize: 9, color: P.muted, margin: 0, valign: 'middle' } } },
      { placeholder: { options: { name: 'kicker', type: 'body', x: MX, y: 0.3, w: 10.9, h: 0.28, fontSize: 11, bold: true, color: C.accent2, charSpacing: 1, margin: 0, valign: 'middle', align: 'left' }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 0.6, w: 11.1, h: 0.6, fontSize: 26, bold: true, color: C.accent1, margin: 0, valign: 'middle', align: 'left' }, text: '' } },
    ],
    slideNumber: { x: 11.7, y: 7.07, w: 0.6, h: 0.24, fontSize: 9, color: P.muted, align: 'right', margin: 0 },
  });
  pres.defineSlideMaster({
    title: 'PT_DIVIDER',
    background: { color: P.dark },
    objects: [
      { text: { text: '', options: { shape: 'ellipse', x: 8.15, y: -2.4, w: 7.6, h: 7.6, fill: { color: P.mid, transparency: 55 }, line: { type: 'none' } } } },
      { placeholder: { options: { name: 'num', type: 'body', x: MX, y: 0.75, w: 3.5, h: 1.25, fontSize: 72, bold: true, color: C.accent3, fontFace: 'Cambria', margin: 0, valign: 'bottom', align: 'left' }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 2.2, w: 7.1, h: 1.75, fontSize: 34, bold: true, color: 'FFFFFF', margin: 0, valign: 'top', align: 'left' }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: MX, y: 4.05, w: 6.9, h: 1.3, fontSize: 16, color: P.light, margin: 0, valign: 'top', align: 'left' }, text: '' } },
    ],
    slideNumber: { x: 11.7, y: 7.07, w: 0.6, h: 0.24, fontSize: 9, color: P.light, align: 'right', margin: 0 },
  });
  pres.defineSlideMaster({
    title: 'PT_COVER',
    background: { color: P.dark },
    objects: [
      { text: { text: '', options: { shape: 'ellipse', x: 8.4, y: -2.9, w: 7.9, h: 7.9, fill: { color: P.mid, transparency: 55 }, line: { type: 'none' } } } },
      { text: { text: '', options: { shape: 'ellipse', x: 10.9, y: 5.2, w: 3.6, h: 3.6, fill: { color: P.alt, transparency: 30 }, line: { type: 'none' } } } },
    ],
  });

  // ---------- slide numbering (needed for menu hyperlinks) ----------
  let n = 3; // cover, how-to-use, menu
  for (const sec of SECTIONS) {
    n += 1;
    sec.section.dividerNo = n;
    n += sec.slides.length;
  }
  const total = n + 1;
  K.setMenuSlide(3);

  // ---------- front matter ----------
  pres.addSection({ title: 'Start here' });
  await cover(pres);
  await usage(pres);
  await menu(pres);

  // ---------- sections ----------
  for (const sec of SECTIONS) {
    const st = `${sec.section.num} ${sec.section.short}`;
    pres.addSection({ title: st });
    await divider(pres, sec.section, st);
    for (const spec of sec.slides) {
      const s = pres.addSlide({ masterName: 'PT_CONTENT', sectionTitle: st });
      const kicker = `${sec.section.num}  •  ${sec.section.short.toUpperCase()}${spec.tag ? '  •  ' + spec.tag : ''}`;
      s.addText(kicker, { placeholder: 'kicker' });
      s.addText(spec.title, { placeholder: 'title' });
      if (!/^How to /.test(spec.title)) K.warn('Title does not start with How to: ' + spec.title);
      if (spec.title.length > 62) K.warn(`Long title (${spec.title.length}): ${spec.title}`);
      await K.homeButton(s);
      if (spec.goal) K.goal(s, spec.goal);
      if (spec.type === 'command') {
        K.commandTable(s, { ...spec, title: spec.title });
        await K.checkWatch(s, { check: spec.check, watch: spec.watch, tip: spec.tip, title: spec.title });
      } else {
        await spec.render(s, { pres, K, P, C });
      }
      if (spec.notes) s.addNotes(spec.notes);
    }
  }
  pres.addSection({ title: 'Close' });
  await closing(pres);

  await pres.writeFile({ fileName: OUT });
  const fixed = await require('./lib/fixparas').fixParagraphs(OUT);
  console.log(`Removed ${fixed} stray paragraph-property blocks`);
  await require('./lib/theme').writeTheme(OUT, THEME);
  console.log(`Wrote ${OUT} — ${total} slides`);
  if (K.warnings.length) console.log('WARNINGS:\n  ' + K.warnings.join('\n  '));
}

// ---------- front matter and dividers ----------
async function cover(pres) {
  const s = pres.addSlide({ masterName: 'PT_COVER', sectionTitle: 'Start here' });
  s.addShape('roundRect', { x: MX, y: 0.55, w: 1.6, h: 1.05, fill: { color: 'FFFFFF' }, line: { type: 'none' }, rectRadius: 0.1 });
  s.addImage({ data: LOGO_DATA, x: MX + 0.12, y: 0.55 + (1.05 - 1.36 / LOGO_AR) / 2, w: 1.36, h: 1.36 / LOGO_AR, altText: 'Kabete National Polytechnic logo' });
  s.addText('KABETE NATIONAL POLYTECHNIC  •  COMPUTING AND INFORMATICS', { x: MX, y: 1.9, w: 9, h: 0.3, fontSize: 12, bold: true, color: P.gold, charSpacing: 1.5, margin: 0, isTextBox: true });
  s.addText('How to configure switches and routers in Packet Tracer', { x: MX, y: 2.3, w: 9.6, h: 1.55, fontSize: 40, bold: true, color: 'FFFFFF', fontFace: 'Cambria', margin: 0, valign: 'top', isTextBox: true });
  s.addText('A step-by-step Cisco IOS command-line (CLI) workbook for trainees and trainers', { x: MX, y: 3.95, w: 9.6, h: 0.4, fontSize: 18, color: P.light, margin: 0, isTextBox: true });
  s.addText('Perform Network Design and Management  •  Unit code 0612 451 07A  •  ICT Technician Level 6', { x: MX, y: 4.38, w: 9.6, h: 0.35, fontSize: 14, color: P.light, margin: 0, isTextBox: true });
  const chips = [['FaCogs', 'Set up'], ['FaLayerGroup', 'VLANs'], ['FaAddressCard', 'DHCP'], ['FaRoute', 'Routing'], ['FaShieldAlt', 'Security'], ['FaStethoscope', 'Troubleshooting']];
  let x = MX;
  for (const [ic, label] of chips) {
    s.addImage({ data: await icon(ic, 'FFFFFF', { circle: P.mid, pad: 0.28 }), x, y: 5.2, w: 0.5, h: 0.5, altText: label });
    s.addText(label, { x: x + 0.58, y: 5.2, w: 1.45, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', valign: 'middle', margin: 0, isTextBox: true });
    x += label.length > 9 ? 2.25 : 1.6;
  }
  s.addText('Trainer: Jacob Kimwele  •  CBET training slides  •  October 2026', { x: MX, y: 6.75, w: 8, h: 0.3, fontSize: 12, color: P.light, margin: 0, isTextBox: true });
  s.addNotes('Welcome. This workbook pulls the Packet Tracer part of the unit into one place and turns it into step-by-step skills. Every slide starts with “How to…”, so trainees can find a skill fast and practise it alone. Commands are on the left (exactly what to type), the meaning is on the right, and each slide ends with a check and a common mistake.');
}

async function usage(pres) {
  const s = pres.addSlide({ masterName: 'PT_CONTENT', sectionTitle: 'Start here' });
  s.addText('START HERE', { placeholder: 'kicker' });
  s.addText('How to use this workbook', { placeholder: 'title' });
  await K.homeButton(s);
  // Mini mock-up of a command slide
  const fx = MX, fy = 1.45, fw = 6.2, fh = 3.35;
  s.addShape('roundRect', { x: fx, y: fy, w: fw, h: fh, fill: { color: 'FFFFFF' }, line: { color: P.border, width: 1.25 }, rectRadius: 0.08, shadow: { type: 'outer', color: '000000', opacity: 0.12, blur: 6, offset: 2, angle: 90 } });
  s.addText('How to configure a router interface', { x: fx + 0.25, y: fy + 0.18, w: 4.6, h: 0.32, fontSize: 14, bold: true, color: P.dark, fontFace: 'Cambria', margin: 0, isTextBox: true });
  s.addText([{ text: 'Goal: ', options: { bold: true, color: P.mid } }, { text: 'give R1’s LAN port its gateway address', options: { color: P.text } }], { x: fx + 0.25, y: fy + 0.55, w: 5.2, h: 0.26, fontSize: 10, margin: 0, isTextBox: true });
  s.addShape('rect', { x: fx + 0.25, y: fy + 0.9, w: 3.05, h: 1.6, fill: { color: P.deep }, line: { type: 'none' } });
  s.addText([
    { text: 'R1(config)# ', options: { color: P.prompt } }, { text: 'interface g0/0/0', options: { color: 'FFFFFF', bold: true, breakLine: true } },
    { text: 'R1(config-if)# ', options: { color: P.prompt } }, { text: 'ip address …', options: { color: 'FFFFFF', bold: true, breakLine: true } },
    { text: 'R1(config-if)# ', options: { color: P.prompt } }, { text: 'no shutdown', options: { color: 'FFFFFF', bold: true } },
  ], { x: fx + 0.35, y: fy + 0.98, w: 2.9, h: 1.45, fontFace: K.CODE, fontSize: 10, margin: 0, valign: 'top', paraSpaceAfter: 8, isTextBox: true });
  s.addShape('rect', { x: fx + 3.3, y: fy + 0.9, w: 2.65, h: 1.6, fill: { color: P.tint2 }, line: { type: 'none' } });
  s.addText(paras(['Select the port', 'Give it its address', 'Switch it on'], { color: P.text, fontSize: 10 }, { paraSpaceAfter: 8 }), { x: fx + 3.42, y: fy + 0.98, w: 2.45, h: 1.45, margin: 0, valign: 'top', isTextBox: true });
  s.addShape('roundRect', { x: fx + 0.25, y: fy + 2.65, w: 2.75, h: 0.48, fill: { color: P.tint }, line: { color: P.border, width: 0.75 }, rectRadius: 0.05 });
  s.addText([{ text: 'Check it: ', options: { bold: true, color: P.dark } }, { text: 'show ip int brief', options: { color: P.text } }], { x: fx + 0.35, y: fy + 2.65, w: 2.6, h: 0.48, fontSize: 10, margin: 0, valign: 'middle', isTextBox: true });
  s.addShape('roundRect', { x: fx + 3.2, y: fy + 2.65, w: 2.75, h: 0.48, fill: { color: P.redTint }, line: { color: P.redBorder, width: 0.75 }, rectRadius: 0.05 });
  s.addText([{ text: 'Watch out: ', options: { bold: true, color: P.darkRed } }, { text: 'no shutdown!', options: { color: P.text } }], { x: fx + 3.3, y: fy + 2.65, w: 2.6, h: 0.48, fontSize: 10, margin: 0, valign: 'middle', isTextBox: true });
  // badges on the mock
  const marks = [[1, fx + 5.05, fy + 0.15], [2, fx + 5.55, fy + 0.5], [3, fx + 0.02, fy + 1.55], [4, fx + 5.8, fy + 1.55], [5, fx + 5.55, fy + 2.71]];
  for (const [num, bx, by] of marks) K.numBadge(s, num, bx, by, 0.36, P.gold, P.deep);
  // Explanations
  K.steps(s, {
    x: 7.15, y: 1.45, w: 5.58, pt: 14, gap: 0.12, badge: P.gold, badgeText: P.deep, maxBottom: 4.95, name: 'usage',
    items: [
      { h: 'Title — the skill', t: 'Every slide starts with “How to…”.' },
      { h: 'Goal — what and why', t: 'What you will achieve, in one line.' },
      { h: 'Dark column — what to type', t: 'Type the white text. The green prompt shows the mode you must be in.' },
      { h: 'Light column — what it means', t: 'Each command explained in plain English.' },
      { h: 'Check it / Watch out', t: 'Prove it worked, and avoid the usual mistake.' },
    ],
  });
  K.card(s, {
    x: MX, y: 5.0, w: 6.2, h: 1.78, head: 'Typing conventions', pt: 14, bullet: true,
    body: ['`R1(config)#` is the prompt — never type it', 'Lines that start with `!` are notes — skip them', 'Names, passwords and IPs are lab examples', 'Short forms work: `conf t`, `int g0/0/0`, `sh ip int br`'],
  });
  K.card(s, {
    x: 7.15, y: 5.0, w: 5.58, h: 1.78, head: 'Study routine for every slide', pt: 14, fill: P.tint,
    body: ['Read the goal → build it in Packet Tracer → type the commands → run the check → break it on purpose, then fix it.'],
  });
  s.addNotes('Walk through the anatomy once. Point out that the prompt is not typed, and that every command slide has the same layout, so trainees always know where to look. Encourage the study routine: the “break it and fix it” step builds troubleshooting skill.');
}

async function menu(pres) {
  const s = pres.addSlide({ masterName: 'PT_CONTENT', sectionTitle: 'Start here' });
  s.addText('START HERE', { placeholder: 'kicker' });
  s.addText('How to find your way: the workbook menu', { placeholder: 'title' });
  await K.homeButton(s);
  s.addText(runs('Click a tile to jump to that part. The **home button** at the bottom right of every slide brings you back here.', { color: P.text }), { x: MX, y: 1.27, w: CW, h: 0.42, fontSize: 14, margin: 0, valign: 'middle', isTextBox: true });
  const cols = 4, gap = 0.25, tw = (CW - gap * (cols - 1)) / cols, th = 1.47;
  for (let i = 0; i < SECTIONS.length; i++) {
    const sec = SECTIONS[i].section;
    const r = Math.floor(i / cols), c = i % cols;
    const x = MX + c * (tw + gap), y = 1.85 + r * (th + 0.2);
    const darkTile = (r + c) % 2 === 0;
    s.addShape('roundRect', { x, y, w: tw, h: th, fill: { color: darkTile ? P.dark : P.tint }, line: { color: darkTile ? P.dark : P.border, width: 1 }, rectRadius: 0.1, objectName: `Tile ${sec.num}` });
    s.addImage({ data: await icon(sec.icon, darkTile ? P.dark : 'FFFFFF', { circle: darkTile ? 'FFFFFF' : P.dark, pad: 0.27 }), x: x + 0.2, y: y + 0.2, w: 0.52, h: 0.52, altText: sec.short });
    s.addText(sec.num, { x: x + tw - 1.0, y: y + 0.16, w: 0.8, h: 0.45, fontSize: 22, bold: true, fontFace: 'Cambria', color: darkTile ? P.gold : P.mid, align: 'right', margin: 0, isTextBox: true });
    s.addText(sec.short, { x: x + 0.2, y: y + 0.82, w: tw - 0.35, h: 0.55, fontSize: 15, bold: true, color: darkTile ? 'FFFFFF' : P.dark, valign: 'top', margin: 0, isTextBox: true });
    // invisible click target covering the whole tile
    s.addShape('rect', { x, y, w: tw, h: th, fill: { color: 'FFFFFF', transparency: 100 }, line: { type: 'none' }, hyperlink: { slide: sec.dividerNo, tooltip: `Go to part ${sec.num}: ${sec.short}` }, objectName: `Link to part ${sec.num}` });
  }
  s.addNotes('Interactive menu: in Slide Show, click a tile to jump to that part. Every slide has a home button (bottom right) that returns here. Suggested order for a new class: 01 → 12. For revision, jump straight to the part you need.');
}

async function divider(pres, sec, st) {
  const s = pres.addSlide({ masterName: 'PT_DIVIDER', sectionTitle: st });
  s.addText(sec.num, { placeholder: 'num' });
  s.addText(sec.title, { placeholder: 'title' });
  s.addText(sec.desc, { placeholder: 'body' });
  // "In this part" panel
  let lines = 0;
  for (const it of sec.items) lines += K.lineCount(it, 4.58 - 0.85, 15, false);
  const listH = lines * 15 * 1.25 / 72 + sec.items.length * 8 / 72;
  const px = 8.15, pw = 4.58, ph = Math.min(5.3, Math.max(2.6, listH + 1.15)), py = Math.max(1.0, 3.75 - ph / 2);
  s.addShape('roundRect', { x: px, y: py, w: pw, h: ph, fill: { color: P.deep, transparency: 25 }, line: { color: P.alt, width: 1 }, rectRadius: 0.1 });
  s.addText('In this part, learn how to:', { x: px + 0.3, y: py + 0.28, w: pw - 0.6, h: 0.35, fontSize: 15, bold: true, color: P.gold, margin: 0, isTextBox: true });
  s.addText(paras(sec.items, { color: 'FFFFFF', fontSize: 15 }, { bullet: true, paraSpaceAfter: 8 }), { x: px + 0.3, y: py + 0.8, w: pw - 0.5, h: ph - 1.0, valign: 'top', margin: 0, isTextBox: true });
  if (listH > ph - 1.0) K.warn(`divider ${sec.num} items may overflow (${lines} lines)`);
  s.addShape('roundRect', { x: MX, y: 6.55, w: 1.0, h: 0.62, fill: { color: 'FFFFFF' }, line: { type: 'none' }, rectRadius: 0.06 });
  s.addImage({ data: LOGO_DATA, x: MX + 0.05, y: 6.55 + (0.62 - 0.9 / LOGO_AR) / 2, w: 0.9, h: 0.9 / LOGO_AR, altText: 'Kabete National Polytechnic logo' });
  await K.homeButton(s, true);
  if (sec.notes) s.addNotes(sec.notes);
}

async function closing(pres) {
  const s = pres.addSlide({ masterName: 'PT_DIVIDER', sectionTitle: 'Close' });
  s.addText('★', { placeholder: 'num' });
  s.addText('How to keep improving after this workbook', { placeholder: 'title' });
  s.addText('Competence comes from repetition: rebuild each lab from a blank workspace until you can do it without the slides.', { placeholder: 'body' });
  const px = 8.15, py = 1.35, pw = 4.58;
  const items = [
    ['FaRedo', 'Repeat', 'Rebuild every lab from scratch; time yourself.'],
    ['FaSave', 'Save evidence', 'Keep each .pkt file and config backup in your portfolio.'],
    ['FaBook', 'Read further', 'Cisco Networking Academy: Packet Tracer and CCNA courses; Jeremy’s IT Lab (free CCNA videos).'],
    ['FaQuestionCircle', 'Ask', 'Bring every error message to class — they are the best lessons.'],
  ];
  let y = py;
  for (const [ic, h, t] of items) {
    s.addShape('roundRect', { x: px, y, w: pw, h: 1.12, fill: { color: P.deep, transparency: 25 }, line: { color: P.alt, width: 1 }, rectRadius: 0.08 });
    s.addImage({ data: await icon(ic, P.deep, { circle: P.gold, pad: 0.28 }), x: px + 0.2, y: y + 0.27, w: 0.52, h: 0.52, altText: h });
    s.addText([{ text: h, options: { bold: true, color: P.gold, breakLine: true } }, { text: t, options: { color: 'FFFFFF' } }], { x: px + 0.88, y: y + 0.08, w: pw - 1.0, h: 0.96, fontSize: 13, valign: 'middle', margin: 0, isTextBox: true });
    y += 1.24;
  }
  s.addText('Questions?', { x: MX, y: 5.55, w: 6, h: 0.6, fontSize: 28, bold: true, color: P.gold, fontFace: 'Cambria', margin: 0, isTextBox: true });
  s.addShape('roundRect', { x: MX, y: 6.55, w: 1.0, h: 0.62, fill: { color: 'FFFFFF' }, line: { type: 'none' }, rectRadius: 0.06 });
  s.addImage({ data: LOGO_DATA, x: MX + 0.05, y: 6.55 + (0.62 - 0.9 / LOGO_AR) / 2, w: 0.9, h: 0.9 / LOGO_AR, altText: 'Kabete National Polytechnic logo' });
  await K.homeButton(s, true);
  s.addNotes('Close by asking each trainee to name one command they will practise tonight. Remind them that the assessment is practical: they must type the configuration themselves and explain what each command does.');
}

main().catch((e) => { console.error(e); process.exit(1); });
