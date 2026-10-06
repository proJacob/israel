// Part 11 — testing and troubleshooting
const section = {
  num: '11', short: 'Troubleshooting', icon: 'FaStethoscope',
  title: 'How to test and troubleshoot your network',
  desc: 'A calm, systematic method finds any fault: climb the ping ladder, ask the right show command, fix one thing, re-test, and log it.',
  items: ['climb the ping ladder', 'choose the right show command', 'fix the most common Packet Tracer mistakes', 'keep a troubleshooting log'],
  notes: 'This part supports the Lab 8 troubleshooting challenge: the trainer injects 6–8 faults into a working Lab 2 + Lab 3 network; pairs find, fix and log them.',
};

const slides = [
  {
    title: 'How to troubleshoot step by step: the ping ladder',
    goal: 'Climb from the PC itself to the far network. The first step that fails tells you where the fault is.',
    async render(s, { K, P }) {
      const rungs = [
        ['ping 127.0.0.1', 'the PC’s own network software works'],
        ['ping 192.168.10.21', 'its own address: the network card is set up'],
        ['ping 192.168.10.1', 'the gateway: cable, switch port, VLAN and router port work'],
        ['ping 172.16.2.10', 'a remote PC: routing works there and back'],
        ['ping www.knp.local', 'by name: DNS works'],
      ];
      const x = 1.2, w = 6.35, h = 0.72;
      rungs.forEach(([cmd, t], i) => {
        const y = 5.55 - i * 0.88;
        s.addShape('roundRect', { x, y, w, h, fill: { color: i % 2 ? P.tint : P.tint2 }, line: { color: P.border, width: 1 }, rectRadius: 0.08 });
        K.numBadge(s, i + 1, x + 0.15, y + 0.17, 0.38, P.dark, 'FFFFFF');
        s.addText([{ text: cmd, options: { fontFace: K.CODE, bold: true, color: P.dark, fontSize: 13, breakLine: true } }, { text: t, options: { color: P.text, fontSize: 13 } }], { x: x + 0.7, y: y + 0.04, w: w - 0.85, h: h - 0.08, valign: 'middle', margin: 0, isTextBox: true });
      });
      K.link(s, 0.8, 6.2, 0.8, 1.95, { color: P.mid, width: 3, end: 'triangle' });
      s.addText('climb', { x: 0.35, y: 3.75, w: 0.4, h: 0.9, fontSize: 12, bold: true, color: P.mid, margin: 0, isTextBox: true, vert: 'vert270', align: 'center', valign: 'middle' });
      K.card(s, { x: 7.95, y: 1.85, w: 4.78, h: 1.1, fill: P.redTint, line: P.redBorder, headColor: P.darkRed, head: 'Stop at the first step that fails', body: ['The fault is between that step and the one below it.'], pt: 14 });
      K.card(s, {
        x: 7.95, y: 3.1, w: 4.78, h: 2.75, head: 'Then follow the method', pt: 14, psa: 4,
        body: [
          { t: 'Symptom: what exactly fails?', bullet: true, num: true },
          { t: 'Theory: what could cause it?', bullet: true, num: true },
          { t: 'Test it with a show command', bullet: true, num: true },
          { t: 'Fix one thing only', bullet: true, num: true },
          { t: 'Re-test, then log it', bullet: true, num: true },
        ],
      });
      s.addText(K.runs('`tracert` shows the last router that answered — the fault is just after it.', { color: P.muted, fontSize: 13 }), { x: 7.95, y: 6.0, w: 4.78, h: 0.55, margin: 0, valign: 'middle', isTextBox: true });
    },
    notes: 'Example: steps 1–3 work but 4 fails → the LAN is fine; look at routing (show ip route on each router, both directions). Steps 1–4 work but 5 fails → DNS (server address in the PC or the DHCP pool).',
  },
  {
    title: 'How to choose the right show command',
    goal: 'Each question has one command that answers it. Learn this table and you can diagnose almost anything.',
    async render(s, { K, P }) {
      K.dataTable(s, {
        y: 1.85, colW: [3.95, 4.0, 4.18], pt: 12, name: 'show commands', maxBottom: 6.85,
        head: ['Question', 'Command', 'Look for'],
        rows: [
          ['Are my ports up and addressed?', { t: 'show ip interface brief', mono: true }, 'up / up and the right IP'],
          ['What is configured?', { t: 'show running-config', mono: true }, 'typos, a missing `no shutdown`'],
          ['Which port is in which VLAN?', { t: 'show vlan brief', mono: true }, 'ports beside the right VLAN'],
          ['Are the trunks working?', { t: 'show interfaces trunk', mono: true }, 'trunking, native VLAN, allowed VLANs'],
          ['Which device is plugged in where?', { t: 'show cdp neighbors', mono: true }, 'device, local port, remote port'],
          ['Where did the switch learn a MAC?', { t: 'show mac address-table', mono: true }, 'the MAC on the expected port'],
          ['Does the router know the way?', { t: 'show ip route', mono: true }, 'a C, S, O, R or D route'],
          ['Did DHCP lease addresses?', { t: 'show ip dhcp binding', mono: true }, 'one line per PC'],
          ['Are OSPF neighbours up?', { t: 'show ip ospf neighbor', mono: true }, 'FULL state'],
          ['Is the ACL matching?', { t: 'show access-lists', mono: true }, 'match counts going up'],
          ['Is NAT translating?', { t: 'show ip nat translations', mono: true }, 'inside local ↔ inside global'],
          ['Is port security blocking?', { t: 'show port-security interface fa0/1', mono: true }, 'Secure-up or Secure-shutdown'],
        ],
      });
    },
    notes: 'Turn this into a quiz: read a question, trainees shout the command. Remember the do prefix: from config mode type do show ip interface brief.',
  },
  {
    title: 'How to fix the most common Packet Tracer mistakes (1 of 2)',
    goal: 'These faults cause most “it doesn’t work” moments in class. Check them first.',
    async render(s, { K, P }) {
      K.dataTable(s, {
        y: 1.85, colW: [3.3, 3.55, 5.28], pt: 13, name: 'mistakes 1', maxBottom: 6.85,
        head: ['Symptom', 'Likely cause', 'Fix'],
        rows: [
          ['Red link light on a router port', 'The port was never switched on', '`no shutdown` on that interface'],
          ['Red link light, port is on', 'Wrong cable type', 'Straight-through between different devices; cross-over between the same kind'],
          ['Amber light on a switch port', 'Spanning Tree is still starting the port', 'Wait about 30 s, or click Fast Forward Time'],
          ['% Invalid input detected', 'A typo, or the wrong mode', 'Read the prompt; use `?` to see what is allowed'],
          ['PC cannot ping its own gateway', 'Wrong IP/mask/gateway, or port in the wrong VLAN', '`ipconfig` on the PC; `show vlan brief` on the switch'],
          ['PCs in different VLANs cannot ping', 'Trunk, sub-interface or gateway problem', '`show interfaces trunk`; check `encapsulation dot1Q` and each PC’s gateway'],
        ],
      });
      await K.checkWatch(s, { tip: 'Fix one thing at a time and re-test — otherwise you won’t know which change fixed it.', title: 'mistakes 1' });
    },
    notes: 'Ask trainees which of these they have already met. Most have met the first three in Lab 1.',
  },
  {
    title: 'How to fix the most common Packet Tracer mistakes (2 of 2)',
    goal: 'More faults to rule out — from DHCP and routing to saving and hardware.',
    async render(s, { K, P }) {
      K.dataTable(s, {
        y: 1.85, colW: [3.3, 3.55, 5.28], pt: 13, name: 'mistakes 2', maxBottom: 6.85,
        head: ['Symptom', 'Likely cause', 'Fix'],
        rows: [
          ['PC address is 169.254.x.x', 'No DHCP reply', 'See “How to fix common DHCP problems” (part 06)'],
          ['Remote network unreachable', 'A route is missing — often the return route', '`show ip route` on every router along the path'],
          ['Configuration gone after a reload', 'It was never saved', '`copy running-config startup-config` after every working step'],
          ['SSH connection refused', 'No RSA keys or domain name, or `login` instead of `login local`', '`show ip ssh`; check the VTY lines'],
          ['G0/0/2 missing on a 4331', 'The SFP slot is empty', 'Power off, insert a GLC-T module, power on'],
          ['The first ping loses one reply', 'ARP is finding the MAC address', 'Normal — ping again'],
        ],
      });
      await K.checkWatch(s, { tip: 'Still stuck? Compare `show running-config` line by line with the slide for that skill.', title: 'mistakes 2' });
    },
    notes: 'The last row matters: trainees often “fix” a working network because the first ping lost one reply. Teach them to ping twice before deciding.',
  },
  {
    title: 'How to keep a troubleshooting log',
    goal: 'Write down every fault as you go. The log is assessment evidence and stops you fixing the same thing twice.',
    async render(s, { K, P }) {
      const blank = ['', '', '', '', '', ''];
      K.dataTable(s, {
        y: 1.85, colW: [0.55, 2.5, 2.35, 2.45, 2.83, 1.45], pt: 12, name: 'log', rowH: [0.38, 0.62, 0.55, 0.55, 0.55, 0.55], maxBottom: 5.92,
        head: ['#', 'Test / symptom', 'Command used', 'Root cause', 'Fix applied', 'Re-test'],
        rows: [
          ['1', 'PC3 cannot ping PC6', { t: 'show interfaces trunk', mono: true }, 'VLAN 30 not allowed on the trunk', { t: 'switchport trunk allowed vlan add 30', mono: true }, { t: 'PASS', bold: true, color: P.mid }],
          ['2', ...blank.slice(1)], ['3', ...blank.slice(1)], ['4', ...blank.slice(1)], ['5', ...blank.slice(1)],
        ],
      });
      await K.checkWatch(s, { tip: 'Lab 8 scoring: 2 points for each fault fixed and logged; minus 1 for any new fault you create.', watch: 'Change one thing at a time, and re-test after each change.', title: 'log' });
    },
    notes: 'Lab 8: write a test plan (10+ tests) before touching anything, test bottom-up with the ping ladder, then log each fault in this format and write a one-page test report.',
  },
];

module.exports = { section, slides };
