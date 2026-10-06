// Part 05 — inter-VLAN routing (Lab 2 continued)
const section = {
  num: '05', short: 'Inter-VLAN routing', icon: 'FaExchangeAlt',
  title: 'How to let VLANs talk to each other',
  desc: 'VLANs are separate subnets, so traffic between them must be routed. Use router-on-a-stick (Lab 2) or a Layer 3 switch.',
  items: ['choose an inter-VLAN routing method', 'configure router-on-a-stick', 'follow a packet between VLANs', 'route on a Layer 3 switch'],
  notes: 'Continue the Lab 2 file. Before starting, prove the problem: PC1 (VLAN 10) cannot ping PC2 (VLAN 20). After this part, it can.',
};

const slides = [
  {
    title: 'How to choose an inter-VLAN routing method',
    goal: 'Three ways to route between VLANs. Labs use the first two; know all three for the assessment.',
    async render(s, { K, P }) {
      const cols = [
        { x: 0.6, head: 'Router-on-a-stick', kind: 'stick', body: ['One router port + one trunk; a sub-interface per VLAN (`g0/0/1.10`).', '✔  Cheap — one cable', '✘  All inter-VLAN traffic shares one link', '**Use:** small sites and labs (Lab 2)'] },
        { x: 4.75, head: 'Layer 3 switch (SVIs)', kind: 'mls', body: ['The switch routes inside itself; `interface vlan 10` is VLAN 10’s gateway.', '✔  Fast and scalable', '✘  Needs a multilayer switch (3560)', '**Use:** campus core / distribution'] },
        { x: 8.9, head: 'One router port per VLAN', kind: 'legacy', body: ['Each VLAN gets its own physical router port and its own cable.', '✔  Simple to understand', '✘  Runs out of router ports quickly', '**Use:** rarely — old designs'] },
      ];
      const w = 3.83;
      for (const c of cols) {
        s.addShape('roundRect', { x: c.x, y: 1.85, w, h: 4.05, fill: { color: P.tint2 }, line: { color: P.border, width: 1 }, rectRadius: 0.08 });
        const cx = c.x + w / 2;
        const vc = [P.v10, P.v20, P.v30];
        if (c.kind === 'stick' || c.kind === 'legacy') {
          if (c.kind === 'stick') K.link(s, cx, 2.3, cx, 3.05, { color: P.deep, width: 5 });
          else vc.forEach((col, i) => K.link(s, cx - 0.18 + i * 0.18, 2.35, cx - 0.18 + i * 0.18, 3.0, { color: col, width: 2.5 }));
          await K.dev(s, 'router', cx, 2.25, 0.5);
          await K.dev(s, 'switch', cx, 3.1, 0.55);
          if (c.kind === 'stick') K.tag(s, '1 trunk', cx + 0.12, 2.5, { w: 0.9, align: 'left', bold: true, color: P.deep });
          else K.tag(s, '1 cable per VLAN', cx + 0.3, 2.5, { w: 1.4, align: 'left', bold: true, color: P.deep });
        } else {
          for (let i = 0; i < 3; i++) K.link(s, cx, 2.55, cx - 0.8 + i * 0.8, 3.2, { color: vc[i], width: 2.5 });
          await K.dev(s, 'mls', cx, 2.5, 0.62);
          for (let i = 0; i < 3; i++) await K.dev(s, 'pc', cx - 0.8 + i * 0.8, 3.25, 0.38, null, null, { fill: vc[i] });
        }
        K.card(s, { x: c.x + 0.05, y: 3.6, w: w - 0.1, h: 2.25, head: c.head, body: c.body, pt: 14, psa: 3, fill: P.tint2, line: P.tint2 });
      }
      await K.checkWatch(s, { tip: 'Whatever the method, each PC’s default gateway is the router or SVI address in its own VLAN (the .1).', title: 'methods' });
    },
    notes: 'Ask which method a school with 40 VLANs should use (Layer 3 switch) and which a small office with one router should use (router-on-a-stick). The legacy method is examined as a comparison point.',
  },
  {
    type: 'command', tag: 'LAB 2',
    title: 'How to configure router-on-a-stick (1 of 2)',
    goal: 'R1 routes between the VLANs over one trunk to S1. Each VLAN gets a sub-interface on G0/0/1.',
    device: 'R1',
    rows: [
      { lines: [{ p: 'R1(config)#', c: 'interface g0/0/1' }, { p: 'R1(config-if)#', c: 'no shutdown' }], m: 'Switch on the physical port that connects to S1’s trunk. It gets no IP address itself.' },
      { p: 'R1(config-if)#', c: 'interface g0/0/1.10', m: 'Create sub-interface 10, a virtual port inside G0/0/1. Matching the number to the VLAN avoids confusion.' },
      { p: 'R1(config-subif)#', c: 'description STAFF gateway', m: 'A label for people.' },
      { p: 'R1(config-subif)#', c: 'encapsulation dot1Q 10', m: 'The key command: this sub-interface handles frames tagged VLAN 10. Type it before the IP address.' },
      { p: 'R1(config-subif)#', c: 'ip address 192.168.10.1 255.255.255.0', m: 'The default gateway of every STAFF PC.' },
    ],
    check: '`show ip interface brief` → G0/0/1 and G0/0/1.10 are both up up.',
    watch: 'IOS refuses the IP address until `encapsulation dot1Q` is set — always type it first.',
    notes: 'Draw the “stick”: one cable, many VLANs. Each sub-interface is a door for one VLAN. The number after the dot is only a label; the dot1Q number is what really matters.',
  },
  {
    type: 'command', tag: 'LAB 2',
    title: 'How to configure router-on-a-stick (2 of 2)',
    goal: 'Add a sub-interface for every other VLAN — including the native management VLAN — then test across VLANs.',
    device: 'R1',
    rows: [
      { lines: [{ p: 'R1(config-subif)#', c: 'interface g0/0/1.20' }, { p: 'R1(config-subif)#', c: 'encapsulation dot1Q 20' }, { p: 'R1(config-subif)#', c: 'ip address 192.168.20.1 255.255.255.0' }], m: 'The gateway of the STUDENTS VLAN.' },
      { lines: [{ p: 'R1(config-subif)#', c: 'interface g0/0/1.30' }, { p: 'R1(config-subif)#', c: 'encapsulation dot1Q 30' }, { p: 'R1(config-subif)#', c: 'ip address 192.168.30.1 255.255.255.0' }], m: 'The gateway of the FINANCE VLAN.' },
      { lines: [{ p: 'R1(config-subif)#', c: 'interface g0/0/1.99' }, { p: 'R1(config-subif)#', c: 'encapsulation dot1Q 99 native' }, { p: 'R1(config-subif)#', c: 'ip address 192.168.99.1 255.255.255.0' }], m: 'The MGMT gateway. `native` = untagged frames belong here; it must match the trunk’s native VLAN on S1.' },
      { lines: [{ p: 'R1(config-subif)#', c: 'end' }, { p: 'R1#', c: 'copy running-config startup-config' }], m: 'Finish and save.' },
    ],
    check: '`show ip route connected` → four C routes (VLANs 10, 20, 30, 99). PC1 (VLAN 10) pings PC2 (VLAN 20).',
    watch: 'S1’s port to R1 (G0/2) must be a trunk, and each PC’s gateway must be the .1 of its own VLAN.',
    notes: 'Test matrix: PC1→PC2, PC1→PC3, PC2→PC6, and from PC1 ping 192.168.99.2 (S1 management). Then SSH from PC1 to S1 through the router.',
  },
  {
    title: 'How to follow a packet from VLAN 10 to VLAN 20',
    tag: 'LAB 2',
    goal: 'Understand what router-on-a-stick really does: the packet goes up the trunk and comes back down it.',
    async render(s, { K, P }) {
      const R = [3.6, 2.2], S = [3.6, 3.75], A = [1.5, 5.0], B = [5.7, 5.0];
      K.link(s, A[0] + 0.3, A[1] - 0.25, S[0] - 0.42, S[1] + 0.12, { color: P.v10, width: 3, end: 'triangle' });
      K.link(s, S[0] - 0.15, S[1] - 0.3, R[0] - 0.15, R[1] + 0.32, { color: P.v10, width: 3, end: 'triangle' });
      K.link(s, R[0] + 0.15, R[1] + 0.32, S[0] + 0.15, S[1] - 0.3, { color: P.v20, width: 3, end: 'triangle' });
      K.link(s, S[0] + 0.42, S[1] + 0.12, B[0] - 0.3, B[1] - 0.25, { color: P.v20, width: 3, end: 'triangle' });
      await K.dev(s, 'router', R[0], R[1], 0.64, 'R1', 'G0/0/1.10 and .20', { labelPos: 'right', labelW: 1.9 });
      await K.dev(s, 'switch', S[0], S[1], 0.74, 'S1', null, { labelPos: 'right', labelW: 0.6 });
      await K.dev(s, 'pc', A[0], A[1], 0.62, 'PC1 — VLAN 10', '192.168.10.11', { fill: P.v10, labelW: 1.8 });
      await K.dev(s, 'pc', B[0], B[1], 0.62, 'PC2 — VLAN 20', '192.168.20.11', { fill: P.v20, labelW: 1.8 });
      K.tag(s, 'tag 10', 2.65, 2.85, { w: 0.7, bold: true, color: P.v10 });
      K.tag(s, 'tag 20', 3.85, 2.85, { w: 0.7, bold: true, color: P.v20 });
      const b = [[1, 2.2, 4.1], [2, 2.95, 2.5], [3, 2.6, 2.03], [4, 4.0, 3.2], [5, 4.85, 4.1]];
      for (const [n, x, y] of b) K.numBadge(s, n, x, y, 0.34);
      K.steps(s, {
        x: 7.0, y: 1.9, w: 5.73, pt: 14, gap: 0.14, badge: P.gold, badgeText: P.deep, maxBottom: 5.95, name: 'packet walk',
        items: [
          { t: 'PC1 sends to 192.168.20.11 — another subnet — so it sends to its gateway, 192.168.10.1.' },
          { t: 'S1 receives it on Fa0/1 (VLAN 10) and sends it up the trunk tagged **10**.' },
          { t: 'R1’s sub-interface G0/0/1.10 accepts tag 10, looks up 192.168.20.0 and finds it on G0/0/1.20.' },
          { t: 'R1 sends the packet back down the same cable, tagged **20**.' },
          { t: 'S1 removes the tag and delivers it out Fa0/11 (VLAN 20) to PC2.' },
        ],
      });
      await K.checkWatch(s, { tip: 'See it yourself: Simulation mode, filter ICMP, ping PC1 → PC2, and open the envelope on the trunk to see the 802.1Q tag.', title: 'packet walk' });
    },
    notes: 'Run this in Simulation mode. Click the PDU on the trunk link going up and coming down: the 802.1Q VLAN number changes from 10 to 20. That is the whole idea of router-on-a-stick.',
  },
  {
    type: 'command',
    title: 'How to route between VLANs on a Layer 3 switch',
    goal: 'A multilayer switch (3560) can be the gateway for every VLAN itself — faster than router-on-a-stick.',
    device: 'MLS1',
    rows: [
      { p: 'MLS1(config)#', c: 'ip routing', m: 'Turn on routing inside the switch. Without it the SVIs cannot route between VLANs.' },
      { lines: [{ p: 'MLS1(config)#', c: 'vlan 10' }, { p: 'MLS1(config-vlan)#', c: 'name STAFF' }, { p: 'MLS1(config-vlan)#', c: 'vlan 20' }, { p: 'MLS1(config-vlan)#', c: 'name STUDENTS' }, { p: 'MLS1(config-vlan)#', c: 'exit' }], m: 'Create the VLANs on the multilayer switch too.' },
      { lines: [{ p: 'MLS1(config)#', c: 'interface vlan 10' }, { p: 'MLS1(config-if)#', c: 'ip address 192.168.10.1 255.255.255.0' }, { p: 'MLS1(config-if)#', c: 'no shutdown' }], m: 'The SVI of VLAN 10 is now the default gateway of the STAFF PCs.' },
      { lines: [{ p: 'MLS1(config-if)#', c: 'interface vlan 20' }, { p: 'MLS1(config-if)#', c: 'ip address 192.168.20.1 255.255.255.0' }, { p: 'MLS1(config-if)#', c: 'no shutdown' }], m: 'The same for VLAN 20 (STUDENTS). Access ports are set exactly as in part 04.' },
    ],
    check: '`show ip route` lists both VLAN subnets as C (connected via Vlan10 and Vlan20); the PCs ping each other.',
    watch: 'On a 3560, `no switchport` turns a port into a routed port, and trunks need `switchport trunk encapsulation dot1q` first.',
    notes: 'Build a small separate file for this: one 3560, two PCs in VLAN 10 and 20 on its access ports. In the capstone project the core switch works this way, with ip helper-address on each SVI for DHCP.',
  },
];

module.exports = { section, slides };
