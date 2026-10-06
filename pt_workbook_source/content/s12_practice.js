// Part 12 — practice labs, self-check and quick reference
const section = {
  num: '12', short: 'Practice & quick reference', icon: 'FaClipboardCheck',
  title: 'How to practise and revise on your own',
  desc: 'Two challenge labs that combine everything, a checklist to judge your own competence, and one-page command cards for revision.',
  items: ['build challenge lab A: VLANs, routing between them and DHCP', 'build challenge lab B: routing, NAT and security', 'check yourself against the competence list', 'revise with the switch and router cards'],
  notes: 'Use the challenge labs for revision before the practical CAT. Trainees should build them from a blank workspace, without the slides, then use the slides only to check.',
};

async function miniLab2(s, K, P, x0, y0) {
  const r = [x0 + 2.4, y0 + 0.45], s1 = [x0 + 1.35, y0 + 1.6], s2 = [x0 + 3.45, y0 + 1.6];
  K.link(s, r[0], r[1], s1[0], s1[1], { color: P.deep, width: 3.5 });
  K.link(s, s1[0], s1[1], s2[0], s2[1], { color: P.deep, width: 3.5 });
  const vc = [P.v10, P.v20, P.v30];
  for (const sw of [s1, s2]) for (let i = 0; i < 3; i++) K.link(s, sw[0], sw[1], sw[0] - 0.6 + i * 0.6, y0 + 2.65, { color: vc[i], width: 2 });
  await K.dev(s, 'router', r[0], r[1], 0.55, 'R1', 'DHCP + gateways', { labelPos: 'right', labelW: 1.6 });
  await K.dev(s, 'switch', s1[0], s1[1], 0.6, 'S1', null, { labelPos: 'left', labelW: 0.5 });
  await K.dev(s, 'switch', s2[0], s2[1], 0.6, 'S2', null, { labelPos: 'right', labelW: 0.5 });
  for (const sw of [s1, s2]) for (let i = 0; i < 3; i++) await K.dev(s, 'pc', sw[0] - 0.6 + i * 0.6, y0 + 2.7, 0.42, null, null, { fill: vc[i] });
  K.tag(s, 'VLAN 10 / 20 / 30 PCs on both switches;  VLAN 99 = management', x0, y0 + 3.05, { w: 4.9, pt: 11, color: P.muted });
}

async function miniLab3(s, K, P, x0, y0) {
  const isp = [x0 + 2.45, y0 + 0.35], r1 = [x0 + 1.3, y0 + 1.35], r2 = [x0 + 3.6, y0 + 1.35], r3 = [x0 + 2.45, y0 + 2.45];
  K.link(s, isp[0], isp[1], r1[0], r1[1], { width: 2.25 });
  K.link(s, r1[0], r1[1], r2[0], r2[1], { width: 2.25 });
  K.link(s, r2[0], r2[1], r3[0], r3[1], { width: 2.25 });
  K.link(s, r1[0], r1[1], r3[0], r3[1], { width: 2.25 });
  K.link(s, r1[0], r1[1], r1[0] - 0.85, r1[1] + 0.8, { width: 1.75, color: P.v10 });
  K.link(s, r2[0], r2[1], r2[0] + 0.85, r2[1] + 0.8, { width: 1.75, color: P.v10 });
  K.link(s, r3[0], r3[1], r3[0] + 1.05, r3[1], { width: 1.75, color: P.v10 });
  await K.dev(s, 'isp', isp[0], isp[1], 0.5, 'ISP', null, { labelPos: 'right', labelW: 0.6 });
  await K.dev(s, 'router', r1[0], r1[1], 0.55, 'R1', null, { labelPos: 'left', labelW: 0.5 });
  await K.dev(s, 'router', r2[0], r2[1], 0.55, 'R2', null, { labelPos: 'right', labelW: 0.5 });
  await K.dev(s, 'router', r3[0], r3[1], 0.55, 'R3', null, { labelPos: 'left', labelW: 0.5 });
  await K.dev(s, 'pc', r1[0] - 0.85, r1[1] + 0.85, 0.42, null, null, { fill: P.v10 });
  await K.dev(s, 'pc', r2[0] + 0.85, r2[1] + 0.85, 0.42, null, null, { fill: P.v10 });
  await K.dev(s, 'pc', r3[0] + 1.1, r3[1], 0.42, null, null, { fill: P.v10 });
  K.tag(s, 'Lab 3 triangle + an ISP router on R1 (203.0.113.0/29)', x0, y0 + 3.05, { w: 4.9, pt: 11, color: P.muted });
}

function labSlide(title, goal, drawFn, tasks, criteria, notes) {
  return {
    title, goal, tag: 'CHALLENGE',
    async render(s, { K, P }) {
      s.addShape('roundRect', { x: 0.6, y: 1.85, w: 5.0, h: 3.55, fill: { color: P.tint2 }, line: { color: P.border, width: 1 }, rectRadius: 0.08 });
      await drawFn(s, K, P, 0.65, 1.95);
      K.card(s, { x: 5.85, y: 1.85, w: 6.88, h: 3.55, head: 'Tasks — from a blank workspace', pt: 13, psa: 2, body: tasks.map((t) => ({ t, bullet: true, num: true })) });
      K.card(s, { x: 0.6, y: 5.55, w: 12.13, h: 1.25, fill: P.tint, head: 'You are competent when…', pt: 13, body: [criteria] });
    },
    notes,
  };
}

const slides = [
  labSlide(
    'How to practise: challenge lab A — VLANs, routing and DHCP',
    'Rebuild Lab 2 without the slides. Time yourself: aim for under 90 minutes.',
    miniLab2,
    [
      'Basic set-up and SSH on R1, S1 and S2; shut unused ports.',
      'VLANs 10 STAFF, 20 STUDENTS, 30 FINANCE, 99 MGMT on both switches.',
      'Access ports as in the plan; trunks with native VLAN 99.',
      'Router-on-a-stick on R1 G0/0/1 (.10, .20, .30, .99 native).',
      'DHCP pools for VLANs 10, 20, 30 (exclude .1–.20); PCs on DHCP.',
      'Switch management in VLAN 99; save every device.',
    ],
    'every PC leases an address from its own VLAN, PCs in different VLANs ping each other, `show interfaces trunk` shows native VLAN 99, SSH works and Telnet fails.',
    'Assessment tip: watch trainees type rather than only checking the result, and ask them to explain three commands of your choice.'
  ),
  labSlide(
    'How to practise: challenge lab B — routing, NAT and security',
    'Combine Lab 3 and Lab 6: OSPF inside, PAT to the ISP, and a security policy.',
    miniLab3,
    [
      'Address all links (/30) and LANs; OSPF area 0 on R1, R2, R3.',
      'R1: default route to the ISP + `default-information originate`.',
      'PAT on R1 for all three LANs (inside: LAN and links; outside: ISP).',
      'ACL: LAN 3 may reach LAN 1 only by web (TCP 80).',
      'SSH on every router; VTY access only from one admin PC.',
      'Port security on the LAN 1 switch; NTP and Syslog to a server.',
    ],
    'every PC reaches the ISP side, `show ip nat translations` shows the PCs, the ACL tests pass, OSPF neighbours are FULL, and the failover of one link is survived.',
    'For PAT across OSPF: R1’s links to R2 and R3 are also ip nat inside, and access-list 1 must include all three LAN subnets.'
  ),
  {
    title: 'How to check you are competent: a self-assessment list',
    goal: 'Tick each line only when you can do it without the slides — this is what the practical assessment looks for.',
    async render(s, { K, P }) {
      const left = ['Choose and connect the right cables', 'Move between IOS modes and use `?`', 'Do the basic set-up and save it', 'Address router ports and a switch SVI', 'Set up SSH with local users', 'Create VLANs and access ports', 'Configure trunks with a native VLAN', 'Configure router-on-a-stick'];
      const right = ['Route between VLANs on a Layer 3 switch', 'Configure DHCP pools, exclusions and relay', 'Configure static, default and OSPF routes', 'Lock ports with port security', 'Write and apply standard and extended ACLs', 'Configure PAT and static NAT', 'Set the root bridge, PortFast, EtherChannel', 'Find faults with the ping ladder and show commands'];
      for (const [col, list] of [[0, left], [1, right]]) {
        const x = 0.6 + col * 6.2;
        list.forEach((t, i) => {
          const y = 1.88 + i * 0.6;
          s.addShape('roundRect', { x, y, w: 5.93, h: 0.5, fill: { color: i % 2 ? 'FFFFFF' : P.tint2 }, line: { color: P.border, width: 0.75 }, rectRadius: 0.05 });
          s.addShape('rect', { x: x + 0.15, y: y + 0.12, w: 0.26, h: 0.26, fill: { color: 'FFFFFF' }, line: { color: P.dark, width: 1.25 } });
          s.addText(K.runs(t, { color: P.text, fontSize: 14 }), { x: x + 0.55, y, w: 5.3, h: 0.5, valign: 'middle', margin: 0, isTextBox: true });
        });
      }
    },
    notes: 'Print this slide for each trainee. They tick a line only after doing the task from a blank workspace without help; anything unticked becomes their practice plan for the week.',
  },
  {
    title: 'How to remember the commands: switch quick reference',
    goal: 'One page of the switch commands used in this workbook. The prompt shows the mode; replace the example values.',
    async render(s, { K, P }) {
      const cards = [
        ['Basic set-up', ['hostname S1', 'enable secret <password>', 'line console 0', ' password <password>', ' login', 'interface vlan 99', ' ip address <ip> <mask>', 'ip default-gateway <router-ip>', 'copy running-config startup-config']],
        ['VLANs and trunks', ['vlan 10', ' name STAFF', 'interface range fa0/1 - 10', ' switchport mode access', ' switchport access vlan 10', 'interface g0/1', ' switchport mode trunk', ' switchport trunk native vlan 99', ' switchport trunk allowed vlan add 40']],
        ['Security, STP, EtherChannel', ['switchport port-security', 'switchport port-security maximum 1', 'switchport port-security mac-address sticky', 'switchport port-security violation shutdown', 'spanning-tree mode rapid-pvst', 'spanning-tree vlan 10 root primary', 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'channel-group 1 mode active']],
        ['Check it', ['show vlan brief', 'show interfaces trunk', 'show ip interface brief', 'show mac address-table', 'show port-security interface fa0/1', 'show spanning-tree vlan 10', 'show etherchannel summary', 'show cdp neighbors']],
      ];
      quickCards(s, K, P, cards);
    },
    notes: 'Lines that start with a space are typed inside the interface (or line) above them. “...” means “switchport port-security” or “switchport trunk” as in the line above.',
  },
  {
    title: 'How to remember the commands: router quick reference',
    goal: 'One page of the router commands used in this workbook. Practise until you no longer need it.',
    async render(s, { K, P }) {
      const cards = [
        ['Interfaces and SSH', ['interface g0/0/0', ' ip address <ip> <mask>', ' no shutdown', 'interface g0/0/1.10', ' encapsulation dot1Q 10', 'ip domain-name <domain>', 'crypto key generate rsa general-keys modulus 1024', 'line vty 0 4', ' transport input ssh', ' login local']],
        ['Routing', ['ip route <network> <mask> <next-hop>', 'ip route 0.0.0.0 0.0.0.0 <isp-address>', 'router ospf 10', ' router-id 1.1.1.1', ' network <network> <wildcard> area 0', ' passive-interface g0/0/0', 'router eigrp 100', 'router rip', 'ipv6 unicast-routing']],
        ['DHCP, NAT, ACL', ['ip dhcp excluded-address <first> <last>', 'ip dhcp pool <NAME>', ' network <network> <mask>', ' default-router <gateway>', 'ip helper-address <server>', 'ip nat inside   |   ip nat outside', 'ip nat inside source list 1 interface g0/0/2 overload', 'ip access-group <ACL> in']],
        ['Check it', ['show ip interface brief', 'show ip route', 'show ip protocols', 'show ip ospf neighbor', 'show ip dhcp binding', 'show ip nat translations', 'show access-lists', 'show running-config']],
      ];
      quickCards(s, K, P, cards);
    },
    notes: 'Use these cards for timed drills: call out a task (“default route to the ISP”) and trainees write the command in 10 seconds.',
  },
];

function quickCards(s, K, P, cards) {
  const gap = 0.22, w = (K.CW - gap) / 2, h = 2.46;
  cards.forEach(([head, lines], i) => {
    const x = 0.6 + (i % 2) * (w + gap), y = 1.8 + Math.floor(i / 2) * (h + gap);
    const dark = i === 3;
    s.addShape('roundRect', { x, y, w, h, fill: { color: dark ? P.deep : P.tint2 }, line: { color: dark ? P.deep : P.border, width: 1 }, rectRadius: 0.08 });
    s.addShape('roundRect', { x, y, w, h: 0.45, fill: { color: dark ? P.alt : P.dark }, line: { type: 'none' }, rectRadius: 0.08 });
    s.addText(head, { x: x + 0.18, y, w: w - 0.3, h: 0.45, fontSize: 14, bold: true, color: 'FFFFFF', valign: 'middle', margin: 0, isTextBox: true });
    const pt = lines.length > 9 ? 11 : 12;
    const runs = lines.map((l, j) => ({ text: l, options: { fontFace: K.CODE, bold: !l.startsWith(' '), color: dark ? 'FFFFFF' : P.dark, fontSize: pt, breakLine: j < lines.length - 1 } }));
    const cw = w - 0.36;
    s.addText(runs, { x: x + 0.18, y: y + 0.56, w: cw, h: h - 0.64, valign: 'top', margin: 0, isTextBox: true });
    for (const l of lines) if (l.length * 12 * 0.6 / 72 > cw) K.warn(`quick card line wraps: ${l}`);
  });
}

module.exports = { section, slides };
