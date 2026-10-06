// Part 04 — VLANs and trunks (Lab 2)
const section = {
  num: '04', short: 'VLANs & trunks', icon: 'FaLayerGroup',
  title: 'How to separate a network with VLANs',
  desc: 'Split one switched network into departments — STAFF, STUDENTS, FINANCE — and carry them all between switches over trunks. (Lab 2)',
  items: ['understand VLANs before you configure', 'plan the VLAN lab', 'create and name VLANs', 'put ports into VLANs', 'configure trunk links', 'manage a switch through VLAN 99', 'check VLANs and trunks', 'change VLANs safely'],
  notes: 'Lab 2 runs through parts 04, 05 and 06: VLANs and trunks first, then router-on-a-stick, then DHCP for each VLAN. Keep the same .pkt file and save a copy after each part.',
};

const VC = (P) => ({ 10: P.v10, 20: P.v20, 30: P.v30, 99: P.v99 });

const slides = [
  {
    title: 'How to understand VLANs before you configure them',
    goal: 'A VLAN turns one physical switch into several separate “rooms”, each with its own subnet.',
    async render(s, { K, P }) {
      K.card(s, {
        x: 0.6, y: 1.85, w: 5.75, h: 3.75, pt: 14, psa: 4, check: true,
        body: [
          '**Without VLANs**, a switch is one big room: a broadcast from any PC reaches every PC.',
          '**VLANs make separate rooms.** A port in VLAN 10 only talks to other VLAN 10 ports.',
          '**One VLAN = one subnet.** STAFF = 192.168.10.0/24, STUDENTS = 192.168.20.0/24.',
          '**Access port** — carries one VLAN; for a PC, printer or access point.',
          '**Trunk port** — carries many VLANs between switches (and to a router); each frame gets an 802.1Q tag with its VLAN number.',
          '**Between VLANs you need a router** or a Layer 3 switch (part 05).',
        ],
      });
      K.card(s, { x: 0.6, y: 5.75, w: 5.75, h: 1.05, fill: P.blueTint, line: 'B8C9E0', headColor: '1F4E8C', head: 'Think of it like this', pt: 13, body: ['One building (switch), separate rooms (VLANs), one shared lift (trunk) that keeps everyone’s badge on (the tag).'] });
      const c = VC(P);
      const s1x = 7.6, s2x = 11.3, sy = 2.55;
      K.link(s, s1x, sy, s2x, sy, { color: P.deep, width: 5 });
      s.addText('TRUNK — carries VLAN 10, 20 and 30 (tagged)', { x: s1x + 0.2, y: sy - 0.5, w: s2x - s1x - 0.4, h: 0.3, fontSize: 12, bold: true, color: P.deep, align: 'center', margin: 0, isTextBox: true });
      const pcs = [[10, 'STAFF'], [20, 'STUDENTS'], [30, 'FINANCE']];
      for (const [sx, name] of [[s1x, 'S1'], [s2x, 'S2']]) {
        pcs.forEach(([v], i) => {
          const px = sx - 1.0 + i * 1.0, py = 4.25;
          K.link(s, sx, sy + 0.2, px, py - 0.3, { color: c[v], width: 2.5 });
        });
        await K.dev(s, 'switch', sx, sy, 0.78, name, null, { labelPos: 'above' });
        for (let i = 0; i < pcs.length; i++) {
          const [v] = pcs[i];
          await K.dev(s, 'pc', sx - 1.0 + i * 1.0, 4.25, 0.55, `VLAN ${v}`, null, { fill: c[v], labelColor: c[v], labelPt: 11, labelW: 1.0 });
        }
      }
      // 802.1Q frame
      const fx = 7.0, fy = 5.25;
      s.addText('A frame on the trunk:', { x: fx, y: fy, w: 3, h: 0.3, fontSize: 12, bold: true, color: P.text, margin: 0, isTextBox: true });
      const seg = [['Dest MAC', 1.05, P.tint], ['Src MAC', 1.0, P.tint], ['802.1Q tag: VLAN 10', 1.85, P.gold], ['Data', 1.0, P.tint]];
      let x = fx;
      for (const [t, w, f] of seg) {
        s.addShape('rect', { x, y: fy + 0.35, w, h: 0.45, fill: { color: f }, line: { color: P.border, width: 1 } });
        s.addText(t, { x, y: fy + 0.35, w, h: 0.45, fontSize: 11, bold: f === P.gold, color: P.deep, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
        x += w;
      }
      s.addText('The receiving switch reads the tag, removes it and delivers the frame only to VLAN 10 ports.', { x: fx, y: fy + 0.85, w: 5.75, h: 0.55, fontSize: 12, color: P.muted, margin: 0, valign: 'top', isTextBox: true });
    },
    notes: 'Use the building analogy: one floor (switch), walls (VLANs), a lift between floors that carries everyone but keeps their badges (the trunk and its tags). Ask: if VLAN 10 and VLAN 20 PCs are on the same switch, can they ping? (No — not without a router.)',
  },
  {
    title: 'How to plan the VLAN lab (Lab 2 topology)',
    tag: 'LAB 2',
    goal: 'Plan before you type: every VLAN gets a number, a name, a set of ports and its own subnet.',
    async render(s, { K, P }) {
      const c = VC(P);
      const r = [3.4, 2.15], s1 = [1.95, 3.6], s2 = [4.85, 3.6];
      K.link(s, r[0], r[1], s1[0], s1[1], { color: P.deep, width: 4 });
      K.link(s, s1[0], s1[1], s2[0], s2[1], { color: P.deep, width: 4 });
      const pcs = [];
      [[s1, ['PC1', 'PC2', 'PC3']], [s2, ['PC4', 'PC5', 'PC6']]].forEach(([sw, names]) => names.forEach((n, i) => pcs.push({ sw, n, v: [10, 20, 30][i], x: sw[0] - 0.95 + i * 0.95, y: 5.1 })));
      for (const p of pcs) K.link(s, p.sw[0], p.sw[1] + 0.2, p.x, p.y - 0.3, { color: c[p.v], width: 2.5 });
      await K.dev(s, 'router', r[0], r[1], 0.62, 'R1', '4331', { labelPos: 'right', labelW: 0.9 });
      await K.dev(s, 'switch', s1[0], s1[1], 0.72, 'S1', null, { labelPos: 'left', labelW: 0.6 });
      await K.dev(s, 'switch', s2[0], s2[1], 0.72, 'S2', null, { labelPos: 'right', labelW: 0.6 });
      const addr = { PC1: '.10.11', PC2: '.20.11', PC3: '.30.11', PC4: '.10.12', PC5: '.20.12', PC6: '.30.12' };
      for (const p of pcs) await K.dev(s, 'pc', p.x, p.y, 0.5, p.n, addr[p.n], { fill: c[p.v], labelPt: 11, subPt: 10, labelW: 0.95 });
      K.tag(s, 'G0/0/1', 2.15, 2.35, { w: 0.75 });
      K.tag(s, 'G0/2', 1.55, 2.95, { w: 0.6 });
      K.tag(s, 'G0/1', 2.45, 3.3, { w: 0.6 });
      K.tag(s, 'G0/1', 4.0, 3.3, { w: 0.6 });
      K.tag(s, '**trunks** (native VLAN 99)', 2.9, 2.78, { w: 2.3, color: P.deep, pt: 11, align: 'left' });
      K.tag(s, 'PC labels show the end of the address: .10.11 = 192.168.10.11 /24', 0.6, 6.1, { w: 5.6, align: 'center', color: P.muted, pt: 11 });
      K.dataTable(s, {
        x: 6.45, y: 1.85, colW: [0.7, 1.45, 1.3, 1.55, 1.28], pt: 12, name: 'vlan plan', maxBottom: 4.6,
        head: ['VLAN', 'Name', 'Access ports', 'Subnet', 'Gateway'],
        rows: [
          [{ t: '10', color: P.v10, bold: true }, 'STAFF', 'Fa0/1 – 10', '192.168.10.0 /24', '192.168.10.1'],
          [{ t: '20', color: P.v20, bold: true }, 'STUDENTS', 'Fa0/11 – 20', '192.168.20.0 /24', '192.168.20.1'],
          [{ t: '30', color: P.v30, bold: true }, 'FINANCE', 'Fa0/21 – 24', '192.168.30.0 /24', '192.168.30.1'],
          [{ t: '99', color: P.v99, bold: true }, 'MGMT (native)', 'none — trunks only', '192.168.99.0 /24', '192.168.99.1'],
        ],
      });
      K.card(s, {
        x: 6.45, y: 4.75, w: 6.28, h: 2.05, head: 'Good to know', pt: 13, bullet: true, psa: 2,
        body: ['Switch management addresses: S1 = 192.168.99.2, S2 = 192.168.99.3.', 'Gateways are R1 sub-interfaces (part 05) — the .1 of each VLAN.', 'The same VLANs must exist on S1 and S2.', 'Cables: switch–switch cross-over; switch–router straight-through.'],
      });
    },
    notes: 'Make trainees copy this plan into their notebooks before building. Assessors expect the plan (VLAN table and addressing) as evidence, and the topology labelled with Notes in Packet Tracer.',
  },
  {
    type: 'command', tag: 'LAB 2',
    title: 'How to create and name VLANs',
    goal: 'Create the four VLANs of the plan on S1 — then do exactly the same on S2.',
    device: 'S1',
    rows: [
      { lines: [{ p: 'S1(config)#', c: 'vlan 10' }, { p: 'S1(config-vlan)#', c: 'name STAFF' }], m: 'Create VLAN 10, enter VLAN mode, and give it a name people understand. Names show in `show vlan brief`.' },
      { lines: [{ p: 'S1(config-vlan)#', c: 'vlan 20' }, { p: 'S1(config-vlan)#', c: 'name STUDENTS' }], m: 'Create the next VLAN straight from VLAN mode — no need to exit first.' },
      { lines: [{ p: 'S1(config-vlan)#', c: 'vlan 30' }, { p: 'S1(config-vlan)#', c: 'name FINANCE' }], m: 'VLAN 30 for the finance office.' },
      { lines: [{ p: 'S1(config-vlan)#', c: 'vlan 99' }, { p: 'S1(config-vlan)#', c: 'name MGMT' }], m: 'VLAN 99 for managing the switches; it will also be the trunks’ native VLAN.' },
      { p: 'S1(config-vlan)#', c: 'end', m: 'Back to privileged mode. The VLANs are applied when you leave VLAN mode.' },
    ],
    check: '`show vlan brief` lists 10 STAFF, 20 STUDENTS, 30 FINANCE and 99 MGMT (no ports yet).',
    watch: 'VLAN 1 is the default: it cannot be renamed or deleted. Repeat these commands on S2!',
    notes: 'Ask why names matter: six months later nobody remembers that VLAN 30 is finance. Show show vlan brief before and after.',
  },
  {
    type: 'command', tag: 'LAB 2',
    title: 'How to put switch ports into a VLAN (access ports)',
    goal: 'Place each user port in its department’s VLAN. A PC plugged into that port joins that VLAN’s subnet.',
    device: 'S1',
    rows: [
      { p: 'S1(config)#', c: 'interface range fa0/1 - 10', m: 'Select the ten STAFF ports.' },
      { p: 'S1(config-if-range)#', c: 'switchport mode access', m: 'Fix them as access ports: one VLAN, for end devices. They can no longer turn themselves into trunks.' },
      { p: 'S1(config-if-range)#', c: 'switchport access vlan 10', m: 'Put the ports in VLAN 10 (STAFF).' },
      { lines: [{ p: 'S1(config-if-range)#', c: 'interface range fa0/11 - 20' }, { p: 'S1(config-if-range)#', c: 'switchport mode access' }, { p: 'S1(config-if-range)#', c: 'switchport access vlan 20' }], m: 'The same three steps for the STUDENTS ports.' },
      { lines: [{ p: 'S1(config-if-range)#', c: 'interface range fa0/21 - 24' }, { p: 'S1(config-if-range)#', c: 'switchport mode access' }, { p: 'S1(config-if-range)#', c: 'switchport access vlan 30' }], m: 'And for the FINANCE ports. Then do the same on S2.' },
    ],
    check: '`show vlan brief` → Fa0/1–10 beside VLAN 10, Fa0/11–20 beside 20, Fa0/21–24 beside 30.',
    watch: 'A missing VLAN is created for you (“% Access VLAN does not exist. Creating vlan 10”) — but with no name.',
    notes: 'Have trainees give PC1 and PC4 (both VLAN 10) addresses and ping: it works across the switches only after the trunk on the next slide is up. PC1 to PC2 (different VLANs) must fail until part 05.',
  },
  {
    type: 'command', tag: 'LAB 2',
    title: 'How to configure a trunk link',
    goal: 'Links between switches, and to the router, must carry every VLAN. Make them 802.1Q trunks — at both ends.',
    device: 'S1',
    rows: [
      { p: 'S1(config)#', c: 'interface range g0/1 - 2', m: 'Select both uplinks: G0/1 goes to S2, G0/2 goes to R1.' },
      { p: 'S1(config-if-range)#', c: 'switchport mode trunk', m: 'Make them trunks: they carry all VLANs, tagging each frame with its VLAN number (802.1Q).' },
      { p: 'S1(config-if-range)#', c: 'switchport trunk native vlan 99', m: 'Untagged frames now belong to VLAN 99 instead of VLAN 1 — safer. Both ends of a link must agree.' },
      { p: 'S1(config-if-range)#', c: 'switchport trunk allowed vlan 10,20,30,99', m: 'Only these VLANs may cross the trunk.' },
      { lines: [{ p: 'S2(config)#', c: 'interface g0/1' }, { p: 'S2(config-if)#', c: 'switchport mode trunk' }, { p: 'S2(config-if)#', c: 'switchport trunk native vlan 99' }, { p: 'S2(config-if)#', c: 'switchport trunk allowed vlan 10,20,30,99' }], m: 'The same on S2’s uplink to S1 — a trunk has two ends!' },
    ],
    check: '`show interfaces trunk` → G0/1 and G0/2: mode on, status trunking, native vlan 99.',
    watch: 'On a 3560, type `switchport trunk encapsulation dot1q` before `switchport mode trunk`.',
    notes: 'Now PC1 can ping PC4 (same VLAN, different switches). Break it on purpose: remove VLAN 10 from the allowed list on one end and watch the ping fail.',
  },
  {
    type: 'command', tag: 'LAB 2',
    title: 'How to manage a switch through VLAN 99',
    goal: 'Move each switch’s management address out of VLAN 1 into the MGMT VLAN, away from user traffic.',
    device: 'S1',
    rows: [
      { p: 'S1(config)#', c: 'interface vlan 99', m: 'Open the SVI of the management VLAN.' },
      { p: 'S1(config-if)#', c: 'ip address 192.168.99.2 255.255.255.0', m: 'S1’s management address (S2 uses 192.168.99.3).' },
      { p: 'S1(config-if)#', c: 'no shutdown', m: 'Switch the SVI on.' },
      { lines: [{ p: 'S1(config-if)#', c: 'exit' }, { p: 'S1(config)#', c: 'ip default-gateway 192.168.99.1' }], m: 'R1’s VLAN 99 sub-interface (part 05) is the way out for management traffic.' },
      { lines: [{ p: 'S1(config)#', c: 'interface vlan 1' }, { p: 'S1(config-if)#', c: 'shutdown' }], m: 'Optional: switch off the unused VLAN 1 interface so it is not used by mistake.' },
    ],
    check: '`show ip interface brief` → Vlan99 192.168.99.2 up up (once a trunk carrying VLAN 99 is up).',
    watch: 'Vlan99 stays down until VLAN 99 exists on the switch and a port or trunk carrying it is up.',
    notes: 'After part 05 is finished, SSH from PC1 to 192.168.99.2 to prove the management VLAN works through the router.',
  },
  {
    title: 'How to check VLANs and trunks',
    tag: 'LAB 2',
    goal: 'Two show commands prove the VLAN design is built correctly. Learn to read them line by line.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: 7.25, h: 4.98, pt: 11, title: 'S1  ›  CLI  (columns shortened)', name: 'vlan check',
        lines: [
          'S1# show vlan brief',
          'VLAN Name           Status    Ports',
          '---- -------------- --------- -------------------------',
          '1    default        active',
          '10   STAFF          active    {{Fa0/1, Fa0/2, Fa0/3 ...}}',
          '20   STUDENTS       active    Fa0/11, Fa0/12 ...',
          '30   FINANCE        active    Fa0/21, Fa0/22, Fa0/23, Fa0/24',
          '99   MGMT           active',
          '',
          'S1# show interfaces trunk',
          'Port    Mode  Encapsulation  Status     Native vlan',
          'Gig0/1  on    802.1q         {{trunking}}   {{99}}',
          'Gig0/2  on    802.1q         trunking   99',
          '',
          'Port    Vlans allowed on trunk',
          'Gig0/1  {{10,20,30,99}}',
          'Gig0/2  10,20,30,99',
        ],
      });
      const cards = [
        ['Ports beside the right VLAN', 'The access ports are correct. Trunk ports never appear in this list — that is normal.'],
        ['trunking + native vlan 99', 'The trunk is up and both ends agree on the native VLAN.'],
        ['Vlans allowed on trunk', 'Only these VLANs can cross. A missing VLAN here means its PCs can’t reach the other switch.'],
      ];
      let y = 1.82;
      for (const [h, b] of cards) { K.card(s, { x: 8.1, y, w: 4.63, h: 1.3, head: h, body: [b], pt: 13, headPt: 14 }); y += 1.42; }
      K.card(s, { x: 8.1, y: 6.08, w: 4.63, h: 0.72, fill: P.redTint, line: P.redBorder, body: ['**Same-VLAN ping fails?** Check the VLAN exists on both switches.'], pt: 13, check: true });
    },
    notes: 'Trainees often panic that trunk ports are missing from show vlan brief. Explain that trunks belong to all allowed VLANs, so they are listed in show interfaces trunk instead.',
  },
  {
    type: 'command', tag: 'LAB 2',
    title: 'How to change, add or remove VLANs safely',
    goal: 'Networks change. Edit VLAN membership and trunk lists without cutting off users who are already working.',
    device: 'S1',
    rows: [
      { p: 'S1(config-if)#', c: 'switchport trunk allowed vlan add 40', m: 'Add VLAN 40 to a trunk’s list. Without the word `add`, the list is replaced and the other VLANs stop crossing!' },
      { p: 'S1(config-if)#', c: 'switchport trunk allowed vlan remove 30', m: 'Take just VLAN 30 off the trunk.' },
      { lines: [{ p: 'S1(config)#', c: 'interface fa0/5' }, { p: 'S1(config-if)#', c: 'switchport access vlan 20' }], m: 'Move one port to another VLAN: re-type the command with the new number.' },
      { p: 'S1(config-if)#', c: 'no switchport access vlan', m: 'Send the port back to VLAN 1 (the default).' },
      { p: 'S1(config)#', c: 'no vlan 30', m: 'Delete VLAN 30. Its ports become inactive — move them to another VLAN first.' },
    ],
    check: 'Run `show vlan brief` and `show interfaces trunk` after every change.',
    watch: 'Ports left in a deleted VLAN go silent: their PCs lose the network with no error message.',
    notes: 'Troubleshooting-log example (Lab 8): “PC3 cannot ping PC6 → show interfaces trunk → VLAN 30 not allowed → switchport trunk allowed vlan add 30 → PASS”.',
  },
];

module.exports = { section, slides };
