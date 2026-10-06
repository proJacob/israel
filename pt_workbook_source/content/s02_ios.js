// Part 02 — the Cisco IOS command line
const section = {
  num: '02', short: 'The IOS command line', icon: 'FaTerminal',
  title: 'How to work in the Cisco IOS command line',
  desc: 'Every Cisco router and switch speaks IOS. Learn its modes, its built-in help and how to read its messages before you configure anything.',
  items: ['move between the command modes', 'get help and type less', 'read IOS error messages', 'name interfaces correctly'],
  notes: 'Spend time here: most beginner errors are a correct command typed in the wrong mode, or a wrong interface name. The building analogy works well: reception (>), manager’s office (#), workshop (config)#, small rooms (config-if)#.',
};

const slides = [
  {
    title: 'How to move between the IOS command modes',
    goal: 'IOS is like a building: each room (mode) allows different commands. The prompt tells you which room you are in.',
    async render(s, { K, P }) {
      const top = 1.85, bw = 3.0, bh = 1.3, xs = [0.6, 5.16, 9.72];
      const modes = [
        { name: 'User EXEC', prompt: 'R1>', desc: 'Look only: basic show, ping', fill: P.tint2, line: P.border, tc: P.dark, pc: P.mid },
        { name: 'Privileged EXEC', prompt: 'R1#', desc: 'All show, copy, reload', fill: P.tint, line: P.border, tc: P.dark, pc: P.mid },
        { name: 'Global configuration', prompt: 'R1(config)#', desc: 'Settings for the whole device', fill: P.dark, line: P.dark, tc: 'FFFFFF', pc: P.gold },
      ];
      modes.forEach((m, i) => {
        s.addShape('roundRect', { x: xs[i], y: top, w: bw, h: bh, fill: { color: m.fill }, line: { color: m.line, width: 1 }, rectRadius: 0.08 });
        s.addText([
          { text: m.name, options: { bold: true, color: m.tc, fontSize: 14, breakLine: true } },
          { text: m.prompt, options: { bold: true, color: m.pc, fontSize: 18, fontFace: K.CODE, breakLine: true } },
          { text: m.desc, options: { color: m.tc, fontSize: 14 } },
        ], { x: xs[i] + 0.15, y: top + 0.08, w: bw - 0.3, h: bh - 0.16, align: 'center', valign: 'middle', margin: 0, isTextBox: true, paraSpaceAfter: 2 });
      });
      // forward arrows
      const arrows = [[xs[0] + bw, xs[1], 'enable'], [xs[1] + bw, xs[2], 'configure\nterminal']];
      for (const [a, b, label] of arrows) {
        K.link(s, a + 0.05, top + 0.55, b - 0.05, top + 0.55, { color: P.dark, width: 2.5, end: 'triangle' });
        s.addText(label, { x: a, y: label.includes('\n') ? top - 0.12 : top + 0.12, w: b - a, h: label.includes('\n') ? 0.62 : 0.36, fontSize: 13, fontFace: K.CODE, bold: true, color: P.dark, align: 'center', valign: 'bottom', margin: 0, isTextBox: true });
      }
      // return arrows
      const backs = [[xs[1], xs[0] + bw, 'disable'], [xs[2], xs[1] + bw, 'end / exit']];
      for (const [a, b, label] of backs) {
        K.link(s, a - 0.05, top + 0.9, b + 0.05, top + 0.9, { color: P.muted, width: 1.5, dash: 'dash', end: 'triangle' });
        s.addText(label, { x: b, y: top + 0.95, w: a - b, h: 0.32, fontSize: 12, fontFace: K.CODE, bold: true, color: P.muted, align: 'center', valign: 'top', margin: 0, isTextBox: true });
      }
      // sub-modes tree
      const subs = [
        ['interface g0/0/0', 'R1(config-if)#', 'One port'],
        ['line vty 0 4', 'R1(config-line)#', 'Console or remote lines'],
        ['router ospf 10', 'R1(config-router)#', 'A routing protocol'],
        ['vlan 10', 'S1(config-vlan)#', 'A VLAN (switch)'],
        ['ip dhcp pool LAN', 'R1(dhcp-config)#', 'A DHCP pool'],
      ];
      const sw = 2.25, sg = (K.CW - 5 * sw) / 4, sy = 3.85, sh = 1.38, bus = 3.52;
      const cx = (i) => 0.6 + i * (sw + sg) + sw / 2;
      K.link(s, xs[2] + bw / 2, top + bh, xs[2] + bw / 2, bus, { color: P.dark, width: 2 });
      K.link(s, cx(0), bus, cx(4), bus, { color: P.dark, width: 2 });
      subs.forEach(([cmd, prompt, name], i) => {
        K.link(s, cx(i), bus, cx(i), sy, { color: P.dark, width: 2, end: 'triangle' });
        const x = 0.6 + i * (sw + sg);
        s.addShape('roundRect', { x, y: sy, w: sw, h: sh, fill: { color: 'FFFFFF' }, line: { color: P.dark, width: 1.25 }, rectRadius: 0.08 });
        s.addText([
          { text: cmd, options: { bold: true, color: P.text, fontSize: 12, fontFace: K.CODE, breakLine: true } },
          { text: prompt, options: { bold: true, color: P.mid, fontSize: 13, fontFace: K.CODE, breakLine: true } },
          { text: name, options: { color: P.text, fontSize: 14 } },
        ], { x: x + 0.08, y: sy + 0.08, w: sw - 0.16, h: sh - 0.16, align: 'center', valign: 'middle', margin: 0, isTextBox: true, paraSpaceAfter: 4 });
      });
      s.addText(K.runs('Typed in global configuration mode, these commands open the smaller “rooms”. `exit` = one level back;  `end` or Ctrl+Z = straight back to `R1#`.', { color: P.text, fontSize: 14 }), { x: 0.6, y: 5.35, w: K.CW, h: 0.45, valign: 'middle', margin: 0, isTextBox: true });
      await K.checkWatch(s, { check: 'Type `?` at any prompt: IOS lists exactly what that mode accepts.', watch: 'Read the prompt before you type. Most errors are the right command in the wrong mode.', title: 'modes' });
    },
    notes: 'Draw the building on the board. Have trainees move in and out of each mode and say the prompt aloud. Quick drill: “Get me to line configuration for the console” → enable, configure terminal, line console 0. Then “back to privileged mode in one step” → end.',
  },
  {
    title: 'How to get help and type less in the CLI',
    goal: 'IOS has built-in help and shortcuts. Use them and you will type less and make fewer mistakes.',
    async render(s, { K, P }) {
      K.dataTable(s, {
        y: 1.85, colW: [2.15, 5.65, 4.33], pt: 13, name: 'help keys', maxBottom: 5.92,
        head: ['Key or command', 'What it does', 'Example'],
        rows: [
          [{ t: '?', mono: true }, 'List every command or option you can type at this point', '`R1# show ?`'],
          [{ t: 'co?', mono: true }, 'List the commands that start with those letters (no space before `?`)', '`configure  connect  copy`'],
          [{ t: 'Tab', bold: true }, 'Complete a partly typed word', '`conf` + Tab gives `configure`'],
          [{ t: 'Short forms', bold: true }, 'Any abbreviation that is unique works', '`conf t`, `int g0/0/0`, `sh ip int br`'],
          [{ t: '↑  ↓  arrows', bold: true }, 'Recall the previous or next command', 'Edit it, then press Enter'],
          [{ t: 'end  or  Ctrl+Z', bold: true }, 'Jump straight back to privileged mode (`#`)', '`R1(config-if)# end` → `R1#`'],
          [{ t: 'Ctrl+Shift+6', bold: true }, 'Stop a running ping, traceroute or name lookup', 'When a typo freezes the screen'],
          [{ t: 'do', mono: true }, 'Run a show or copy command without leaving config mode', '`do show ip int brief`'],
          [{ t: 'no', mono: true }, 'Undo (reverse) a command', '`no shutdown`, `no ip address`'],
        ],
      });
      await K.checkWatch(s, { tip: 'Learn with `?`: type `show ?` or `interface ?` and IOS lists exactly what it expects next.', title: 'help keys' });
    },
    notes: 'Make the ? key a habit. A good exercise: give trainees a command they have never seen (e.g. “find the command that shows the clock”) and let them discover it with ? (show clock).',
  },
  {
    title: 'How to read IOS error messages',
    goal: 'Error messages are clues, not failures. Each one tells you what kind of mistake you made.',
    async render(s, { K, P }) {
      K.dataTable(s, {
        y: 1.85, colW: [3.55, 3.95, 4.63], pt: 13, monoCols: [0, 1], name: 'errors', maxBottom: 5.92,
        head: ['You typed', 'IOS replied', 'Why — and the fix'],
        rows: [
          ['R1> configure terminal', '% Invalid input detected at \'^\' marker.', 'You are in user mode (`>`). Type `enable` first.'],
          ['R1(config)# show running-config', '% Invalid input detected at \'^\' marker.', '`show` is not a config command. Use `do show running-config`.'],
          ['R1(config-if)# ip address 192.168.1.1', '% Incomplete command.', 'Something is missing — here the mask. Type `?` to see what comes next.'],
          ['R1# c', '% Ambiguous command: "c"', 'Several commands start with c. Type more letters.'],
          ['R1# shwo', 'Translating "shwo"...domain server (255.255.255.255)', 'IOS thinks the typo is a computer name. Press Ctrl+Shift+6; prevent it with `no ip domain-lookup`.'],
          ['R1(config-if)# ip address 192.168.1.5 255.255.255.0', '% 192.168.1.0 overlaps with GigabitEthernet0/0/0', 'Two router ports can’t share a subnet. Give this port a different one.'],
        ],
      });
      await K.checkWatch(s, { tip: 'The `^` marker points at the first character IOS did not understand — look there first.', title: 'errors' });
    },
    notes: 'Show each error live. Ask trainees to read the message aloud and say what kind of mistake it is (wrong mode, missing value, typo, design error) before fixing it.',
  },
  {
    title: 'How to name the interfaces you type',
    goal: 'Every command that touches a port needs its exact name. The name tells you the type and where the port sits.',
    async render(s, { K, P }) {
      const y = 1.95;
      const parts = [['GigabitEthernet', 3.75, 'type (short: g, fa, s)'], ['0', 0.62, 'slot'], ['0', 0.62, 'module bay'], ['0', 0.62, 'port']];
      let x = 0.6;
      parts.forEach(([t, w, lab], i) => {
        s.addShape('roundRect', { x, y, w, h: 0.62, fill: { color: i === 0 ? P.dark : P.mid }, line: { type: 'none' }, rectRadius: 0.06 });
        s.addText(t, { x, y, w, h: 0.62, fontSize: 24, bold: true, fontFace: K.CODE, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
        s.addText(lab, { x: x - 0.25, y: y + 0.68, w: w + 0.5, h: 0.3, fontSize: 12, color: P.muted, align: 'center', margin: 0, isTextBox: true });
        x += w;
        if (i < parts.length - 1) {
          s.addText('/', { x, y, w: 0.3, h: 0.62, fontSize: 24, bold: true, fontFace: K.CODE, color: P.dark, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
          x += 0.3;
        }
      });
      K.card(s, { x: 7.75, y: 1.85, w: 4.98, h: 1.2, fill: P.blueTint, line: 'B8C9E0', headColor: '1F4E8C', head: 'Not sure of the name?', body: ['Run `show ip interface brief` — it lists every port your device really has.'] });
      K.dataTable(s, {
        y: 3.3, colW: [3.75, 5.75, 2.63], pt: 13, name: 'interface names', maxBottom: 6.85,
        head: ['Device (Packet Tracer model)', 'Interface names', 'Type it as'],
        rows: [
          ['Router **4331**', 'GigabitEthernet0/0/0 and 0/0/1. **0/0/2 is an empty slot**: power off, add a **GLC-T** module, power on', '`g0/0/0`'],
          ['Router **1941 / 2901 / 2911**', 'GigabitEthernet0/0 and 0/1 (the 2911 also has 0/2)', '`g0/0`'],
          ['Router + serial module', '4331 + NIM-2T: Serial0/1/0 – 0/1/1.  1941 + HWIC-2T: Serial0/0/0 – 0/0/1', '`s0/1/0`'],
          ['Switch **2960-24TT**, multilayer **3560-24PS**', 'FastEthernet0/1 – 0/24 and GigabitEthernet0/1 – 0/2', '`fa0/1`, `g0/1`'],
          ['Virtual interfaces', 'Vlan1, Vlan99 (SVI)  •  Port-channel1  •  g0/0/1.10 (sub-interface)', '`int vlan 99`'],
        ],
      });
    },
    notes: 'The 4331 catch: in Packet Tracer its third port G0/0/2 is an empty SFP slot. Click the router → Physical tab → power switch off → drag GLC-T into the slot next to G0/0/1 → power on. Labs in this workbook that use G0/0/2 need this step. Modules are always added with the power off.',
  },
];

module.exports = { section, slides };
