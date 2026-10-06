// Part 09 — STP and EtherChannel (Lab 5)
const section = {
  num: '09', short: 'STP & EtherChannel', icon: 'FaProjectDiagram',
  title: 'How to add redundancy without loops',
  desc: 'Extra links between switches keep users online when a cable fails — if Spanning Tree controls them. EtherChannel turns parallel links into one. (Lab 5)',
  items: ['understand Spanning Tree and the lab', 'choose the root bridge, PortFast and BPDU Guard', 'read show spanning-tree', 'bundle links with LACP EtherChannel'],
  notes: 'Lab 5: three 2960 switches in a triangle (cross-over cables), S1–S2 joined by two links that become an EtherChannel. PC1 on S3 Fa0/10 and PC2 on S1 Fa0/10, both in VLAN 10. All inter-switch links are trunks.',
};

const slides = [
  {
    title: 'How to understand Spanning Tree before you configure it',
    tag: 'LAB 5',
    goal: 'Redundant links are good for uptime but create loops. Spanning Tree keeps one path active and the others on standby.',
    async render(s, { K, P }) {
      K.card(s, {
        x: 0.6, y: 1.85, w: 6.0, h: 3.75, pt: 14, psa: 6, bullet: true,
        body: [
          '**Extra links = backup paths** — but they also create loops.',
          '**A loop is deadly at Layer 2:** frames have no TTL, so broadcasts circle for ever (a broadcast storm) and the network freezes.',
          '**STP elects a root bridge** (the lowest bridge ID) and keeps the best path from every switch to it.',
          'Every other path is **blocked** — but kept ready.',
          '**If the active path fails**, the blocked port starts forwarding: in 1–2 seconds with Rapid PVST+.',
        ],
      });
      K.card(s, { x: 0.6, y: 5.75, w: 6.0, h: 1.05, fill: P.blueTint, line: 'B8C9E0', headColor: '1F4E8C', head: 'Think of it like this', pt: 13, body: ['A ring road with one barrier: traffic never circles, and if the main road closes the barrier lifts.'] });
      const S1 = [9.75, 2.75], S2 = [11.85, 4.85], S3 = [7.65, 4.85];
      K.link(s, S1[0] + 0.05, S1[1] - 0.05, S2[0] + 0.05, S2[1] - 0.05, { width: 2.25 });
      K.link(s, S1[0] - 0.08, S1[1] + 0.08, S2[0] - 0.08, S2[1] + 0.08, { width: 2.25 });
      K.link(s, S1[0], S1[1], S3[0], S3[1], { width: 2.25 });
      K.link(s, S3[0], S3[1], S2[0], S2[1], { width: 2.25, dash: 'dash', color: P.darkRed });
      K.link(s, S1[0], S1[1], S1[0] - 1.35, S1[1], { width: 1.75, color: P.v10 });
      K.link(s, S3[0], S3[1], S3[0], 6.1, { width: 1.75, color: P.v10 });
      await K.dev(s, 'switch', S1[0], S1[1], 0.72, 'S1', null, { labelPos: 'right', labelW: 0.5 });
      await K.dev(s, 'switch', S2[0], S2[1], 0.72, 'S2', null, { labelPos: 'below' });
      await K.dev(s, 'switch', S3[0], S3[1], 0.72, 'S3', null, { labelPos: 'left', labelW: 0.5 });
      await K.dev(s, 'pc', S1[0] - 1.45, S1[1], 0.5, 'PC2', 'VLAN 10', { fill: P.v10, labelPos: 'above' });
      await K.dev(s, 'pc', S3[0], 6.25, 0.5, 'PC1', 'VLAN 10', { fill: P.v10, labelPos: 'right', labelW: 0.9 });
      s.addShape('roundRect', { x: S1[0] - 0.42, y: S1[1] - 0.85, w: 0.84, h: 0.3, fill: { color: P.gold }, line: { type: 'none' }, rectRadius: 0.05 });
      s.addText('ROOT', { x: S1[0] - 0.42, y: S1[1] - 0.85, w: 0.84, h: 0.3, fontSize: 12, bold: true, color: P.deep, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      K.tag(s, 'Po1 = Fa0/1 + Fa0/2', 10.95, 3.45, { w: 1.9, align: 'left', pt: 11, bold: true });
      K.tag(s, 'Fa0/3', 7.7, 3.85, { w: 0.7, pt: 11 });
      K.tag(s, 'Fa0/4', 8.25, 5.05, { w: 0.7, pt: 11 });
      s.addShape('roundRect', { x: 8.75, y: 4.67, w: 2.15, h: 0.36, fill: { color: P.redTint }, line: { color: P.redBorder, width: 0.75 }, rectRadius: 0.05 });
      s.addText('S3 Fa0/4 BLOCKED (backup)', { x: 8.75, y: 4.67, w: 2.15, h: 0.36, fontSize: 11, bold: true, color: P.darkRed, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addText('Cross-over cables between switches; all switch–switch links are trunks.', { x: 9.2, y: 5.8, w: 3.53, h: 0.6, fontSize: 12, color: P.muted, margin: 0, valign: 'top', isTextBox: true });
    },
    notes: 'Demonstrate a broadcast storm only in theory — in Packet Tracer STP is on by default, which is why some ports show amber for about 30 seconds when you connect them. Ask: which port would you block to break the triangle? STP decides it for you.',
  },
  {
    type: 'command', tag: 'LAB 5',
    title: 'How to set the root bridge, PortFast and BPDU Guard',
    goal: 'Choose the centre of the network yourself, start PC ports instantly, and protect them from rogue switches.',
    device: 'S1 / S2 / S3',
    rows: [
      { p: 'S1(config)#', c: 'spanning-tree mode rapid-pvst', m: 'Use Rapid PVST+: it recovers in about 1–2 s instead of 30–50 s. Type it on every switch.' },
      { p: 'S1(config)#', c: 'spanning-tree vlan 1,10,20 root primary', m: 'Make S1 the root bridge for these VLANs (priority 24576) — your choice, not luck.' },
      { p: 'S2(config)#', c: 'spanning-tree vlan 1,10,20 root secondary', m: 'S2 takes over as root if S1 fails (priority 28672).' },
      { lines: [{ p: 'S3(config)#', c: 'interface fa0/10' }, { p: 'S3(config-if)#', c: 'spanning-tree portfast' }], m: 'The PC port starts forwarding at once — no 30-second wait. Only on ports to end devices!' },
      { p: 'S3(config-if)#', c: 'spanning-tree bpduguard enable', m: 'If someone plugs a switch into this PC port, the port shuts down (err-disabled) before a loop forms.' },
    ],
    check: '`show spanning-tree vlan 10` on S1 says “This bridge is the root”.',
    watch: 'Never use PortFast on a port that connects to another switch — it can create a temporary loop.',
    notes: 'Without root primary, the switch with the lowest MAC address wins by accident — often the oldest, slowest switch. Do the same PortFast and BPDU Guard on S1 Fa0/10 for PC2.',
  },
  {
    title: 'How to read show spanning-tree',
    tag: 'LAB 5',
    goal: 'Find the root, the blocked port and the edge port from one output — then prove that failover works.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: 7.35, h: 4.98, pt: 11, title: 'S3  ›  CLI', name: 'stp output',
        lines: [
          'S3# show spanning-tree vlan 10',
          'VLAN0010',
          '  Spanning tree enabled protocol rstp',
          '  Root ID    Priority    {{24586}}',
          '             Address     0001.4295.A7C1',
          '             Cost        19',
          '             Port        3(FastEthernet0/3)',
          '  Bridge ID  Priority    32778',
          '',
          'Interface   Role Sts Cost  Prio.Nbr Type',
          '----------- ---- --- ----- -------- --------',
          'Fa0/3       {{Root FWD}} 19    128.3    P2p',
          'Fa0/4       {{Altn BLK}} 19    128.4    P2p',
          'Fa0/10      Desg FWD 19    128.10   P2p {{Edge}}',
        ],
      });
      const cards = [
        ['Root ID priority 24586', '24576 (root primary) + 10 (the VLAN number): the root is S1.'],
        ['Root FWD', 'This switch’s best path to the root, forwarding. Cost 19 = one 100 Mbps link.'],
        ['Altn BLK', 'The blocked backup port. It breaks the loop and waits to take over.'],
        ['Desg FWD … Edge', 'The PC port, forwarding at once thanks to PortFast.'],
      ];
      let y = 1.82;
      for (const [h, b] of cards) { K.card(s, { x: 8.2, y, w: 4.53, h: 1.0, head: h, body: [b], pt: 12, headPt: 13, pad: 0.12 }); y += 1.08; }
      K.card(s, { x: 8.2, y: 6.16, w: 4.53, h: 0.64, fill: P.blueTint, line: 'B8C9E0', body: ['**Test:** `ping -t` PC1 → PC2, then shut S3 Fa0/3.'], pt: 12, pad: 0.12 });
    },
    notes: 'During the failover test, Fa0/4 changes from Altn BLK to Root FWD and only 1–3 replies are lost. Stop ping -t with Ctrl+C. Repeat the test with classic STP (spanning-tree mode pvst) to compare recovery time.',
  },
  {
    type: 'command', tag: 'LAB 5',
    title: 'How to bundle links with an LACP EtherChannel',
    goal: 'Join the two S1–S2 links into one logical link: double the bandwidth, and STP blocks neither of them.',
    device: 'S1',
    rows: [
      { p: 'S1(config)#', c: 'interface range fa0/1 - 2', m: 'The two parallel links between S1 and S2.' },
      { p: 'S1(config-if-range)#', c: 'channel-group 1 mode active', m: 'Bundle them as Port-channel 1 using LACP. `active` proposes the bundle; the other end must be `active` or `passive`.' },
      { p: 'S1(config-if-range)#', c: 'exit', m: 'Back to global mode. Interface Port-channel1 now exists.' },
      { lines: [{ p: 'S1(config)#', c: 'interface port-channel 1' }, { p: 'S1(config-if)#', c: 'switchport mode trunk' }], m: 'From now on configure the bundle, not its member ports. Here it becomes one logical trunk.' },
      { c: '! Repeat the same commands on S2', comment: true, m: 'A bundle needs both ends configured.' },
      { p: 'S1#', c: 'show etherchannel summary', m: 'Look for `Po1(SU)` (S = Layer 2, U = in use) with both members marked `(P)` = bundled.' },
    ],
    check: 'Both switches show `Po1(SU)` with `Fa0/1(P) Fa0/2(P)`; STP now treats Po1 as one link.',
    watch: 'Members must match: speed, duplex, access/trunk mode and allowed VLANs. (I) or (s) = a mismatch.',
    notes: 'LACP modes: active + active or active + passive form a bundle; passive + passive never does. Mode on forces a bundle without negotiation and must be on at both ends.',
  },
];

module.exports = { section, slides };
