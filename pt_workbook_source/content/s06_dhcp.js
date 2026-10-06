// Part 06 — DHCP (Lab 2 continued + relay)
const section = {
  num: '06', short: 'DHCP', icon: 'FaAddressCard',
  title: 'How to hand out IP addresses automatically with DHCP',
  desc: 'Let the router lease addresses, masks, gateways and DNS servers to every PC — for one LAN, for every VLAN, and across subnets with a relay. (Lab 4, built on the Lab 2 file)',
  items: ['understand the DORA conversation', 'make a router a DHCP server', 'give every VLAN its own pool', 'check the leases', 'relay DHCP to a server', 'fix common DHCP problems'],
  notes: 'Lab 4 here builds on the Lab 2 file: add a server LAN on R1 G0/0/0 (192.168.50.0/24: SRV1 = 192.168.50.10 for DNS/web, SRV2 = 192.168.50.11 for DHCP) and a LIBRARY LAN on R1 G0/0/2 (192.168.40.0/24). On a 4331, G0/0/2 needs a GLC-T module first.',
};

const slides = [
  {
    title: 'How to understand DHCP: the DORA conversation',
    goal: 'A PC with no address asks for one. Four messages later it has an address, mask, gateway and DNS server.',
    async render(s, { K, P }) {
      const ax = 1.35, bx = 6.15, top = 2.2;
      await K.dev(s, 'pc', ax, top, 0.6, 'PC (client)', 'no address yet', { labelPos: 'right', labelW: 1.6 });
      await K.dev(s, 'router', bx, top, 0.6, 'R1', 'DHCP server', { labelPos: 'left', labelW: 1.4 });
      K.link(s, ax, top + 0.4, ax, 6.0, { color: 'A0AAA4', width: 1.25, dash: 'dash' });
      K.link(s, bx, top + 0.4, bx, 6.0, { color: 'A0AAA4', width: 1.25, dash: 'dash' });
      const msgs = [
        ['1  Discover (broadcast): “Is there a DHCP server?”', 1, P.v20],
        ['2  Offer: “You can have 192.168.10.21”', -1, P.mid],
        ['3  Request (broadcast): “I’ll take 192.168.10.21”', 1, P.v20],
        ['4  Acknowledge: “It’s yours — mask, gateway, DNS, lease”', -1, P.mid],
      ];
      msgs.forEach(([t, dir, col], i) => {
        const y = 3.35 + i * 0.72;
        if (dir > 0) K.link(s, ax + 0.05, y, bx - 0.05, y, { color: col, width: 2.75, end: 'triangle' });
        else K.link(s, bx - 0.05, y, ax + 0.05, y, { color: col, width: 2.75, end: 'triangle' });
        s.addText(K.runs(t, { color: P.text, fontSize: 13 }), { x: ax + 0.1, y: y - 0.36, w: bx - ax - 0.2, h: 0.32, align: 'center', valign: 'bottom', margin: 0, isTextBox: true, fontSize: 13 });
      });
      K.card(s, { x: 7.2, y: 1.85, w: 5.53, h: 1.15, head: 'What the PC receives', body: ['IP address, subnet mask, default gateway and DNS server (plus domain name and lease time).'], pt: 14 });
      K.card(s, { x: 7.2, y: 3.15, w: 5.53, h: 1.4, head: 'DHCP or static?', body: ['**DHCP:** PCs, laptops, phones. **Static:** routers, switches, servers, printers — keep their addresses out of the pool.'], pt: 14 });
      K.card(s, { x: 7.2, y: 4.7, w: 5.53, h: 1.15, head: 'A good plan for each /24 subnet', body: ['.1 = gateway   •   .2 – .20 = static devices   •   .21 – .254 = DHCP pool'], pt: 14 });
      await K.checkWatch(s, { watch: 'A PC showing 169.254.x.x got no DHCP answer — it gave itself an automatic (APIPA) address.', title: 'dora' });
    },
    notes: 'Watch DORA in Simulation mode: filter DHCP only, set a PC to DHCP, and step through the four messages. Ask why Discover and Request are broadcasts (the PC has no address and does not know the server yet).',
  },
  {
    type: 'command', tag: 'LAB 4',
    title: 'How to configure a router as a DHCP server (1 of 2)',
    goal: 'R1 will lease addresses to the STAFF PCs in VLAN 10 (192.168.10.0/24), keeping .1–.20 for static devices.',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'ip dhcp excluded-address 192.168.10.1 192.168.10.20', m: 'Never lease .1 to .20 — they are kept for the gateway, servers, printers and switches. Do this before the pool.' },
      { p: 'R1(config)#', c: 'ip dhcp pool STAFF-POOL', m: 'Create a pool (you choose the name) and enter `(dhcp-config)#` mode.' },
      { p: 'R1(dhcp-config)#', c: 'network 192.168.10.0 255.255.255.0', m: 'The subnet to lease from: .21 to .254 after the exclusions.' },
      { p: 'R1(dhcp-config)#', c: 'default-router 192.168.10.1', m: 'The default gateway given to clients: the router’s own address on that LAN.' },
      { p: 'R1(dhcp-config)#', c: 'dns-server 192.168.50.10', m: 'The DNS server clients use to turn names into IP addresses.' },
    ],
    check: '`show ip dhcp pool` → STAFF-POOL, with the number of leased addresses.',
    watch: 'A wrong `default-router` lets PCs get an address but never leave their own subnet.',
    notes: 'Stress the order: exclusions first, then the pool. If the pool exists first, a PC may lease an address that you meant to give a printer.',
  },
  {
    type: 'command', tag: 'LAB 4',
    title: 'How to configure a router as a DHCP server (2 of 2)',
    goal: 'Finish the pool, then switch the PCs to DHCP and check that they lease their addresses.',
    device: 'R1',
    rows: [
      { p: 'R1(dhcp-config)#', c: 'domain-name knp.local', m: 'The DNS suffix added to short names (`www` becomes `www.knp.local`).' },
      { p: 'R1(dhcp-config)#', c: 'exit', m: 'Back to global configuration mode.' },
      { c: '! On each PC: Desktop › IP Configuration › DHCP', comment: true, m: 'The PC asks for an address. “DHCP request successful” appears and the fields fill in by themselves.' },
      { p: 'C:\\>', c: 'ipconfig /all', m: 'Shows the leased address, mask, gateway, DNS server and the PC’s MAC (Physical Address).' },
      { p: 'R1#', c: 'show ip dhcp binding', m: 'One line per lease: the IP given out and the MAC of the PC that has it.' },
    ],
    check: 'Each STAFF PC gets 192.168.10.21 or higher, gateway 192.168.10.1 and DNS 192.168.50.10.',
    watch: 'Select **DHCP** in IP Configuration first; `ipconfig /release` and `/renew` then get a fresh lease.',
    notes: 'If a PC keeps “Requesting IP address”, check the VLAN of its switch port and the trunk to R1 — the DHCP request has to reach the right sub-interface.',
  },
  {
    type: 'command', tag: 'LAB 4',
    title: 'How to give every VLAN its own DHCP pool',
    goal: 'One router can serve every VLAN. It picks the pool whose network matches the sub-interface the request came in on.',
    device: 'R1',
    rows: [
      { lines: [{ p: 'R1(config)#', c: 'ip dhcp excluded-address 192.168.20.1 192.168.20.20' }, { p: 'R1(config)#', c: 'ip dhcp excluded-address 192.168.30.1 192.168.30.20' }], m: 'Keep the first 20 addresses of each VLAN for static devices.' },
      { lines: [{ p: 'R1(config)#', c: 'ip dhcp pool STUDENT-POOL' }, { p: 'R1(dhcp-config)#', c: 'network 192.168.20.0 255.255.255.0' }, { p: 'R1(dhcp-config)#', c: 'default-router 192.168.20.1' }, { p: 'R1(dhcp-config)#', c: 'dns-server 192.168.50.10' }], m: 'The pool for VLAN 20. Its gateway is sub-interface G0/0/1.20.' },
      { lines: [{ p: 'R1(dhcp-config)#', c: 'ip dhcp pool FINANCE-POOL' }, { p: 'R1(dhcp-config)#', c: 'network 192.168.30.0 255.255.255.0' }, { p: 'R1(dhcp-config)#', c: 'default-router 192.168.30.1' }, { p: 'R1(dhcp-config)#', c: 'dns-server 192.168.50.10' }], m: 'The pool for VLAN 30. Its gateway is G0/0/1.30.' },
    ],
    check: 'PCs in VLANs 10, 20 and 30 each lease an address from their own subnet; `show ip dhcp binding` lists them all.',
    watch: 'No pool for VLAN 99: switches and routers keep static addresses.',
    notes: 'Ask: how does R1 know which pool to use? The request arrives on G0/0/1.20, whose address is 192.168.20.1, so R1 uses the pool whose network contains that address.',
  },
  {
    title: 'How to check DHCP leases on the router and the PC',
    tag: 'LAB 4',
    goal: 'Match what the router handed out with what the PC received. The MAC address links the two.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: 5.95, h: 3.35, pt: 11, title: 'R1  ›  CLI  (columns shortened)', name: 'binding',
        lines: ['R1# show ip dhcp binding', 'IP address      Hardware address  Type', '{{192.168.10.21}}   {{0060.4721.6A1B}}    Automatic', '192.168.20.21   00D0.97C4.3A02    Automatic', '192.168.30.21   0001.C7A3.11F5    Automatic', '', 'R1# show ip dhcp pool', 'Pool STAFF-POOL :', ' Total addresses     : 254', ' Leased addresses    : {{1}}', ' Excluded addresses  : 20'],
      });
      K.terminal(s, {
        x: 6.78, y: 1.82, w: 5.95, h: 3.35, pt: 11, title: 'PC1  ›  Command Prompt  (shortened)', name: 'ipconfig all',
        lines: ['C:\\>ipconfig /all', 'FastEthernet0 Connection:(default port)', '   Physical Address....: {{0060.4721.6A1B}}', '   IPv4 Address........: {{192.168.10.21}}', '   Subnet Mask.........: 255.255.255.0', '   Default Gateway.....: 192.168.10.1', '   DHCP Servers........: 192.168.10.1', '   DNS Servers.........: 192.168.50.10'],
      });
      const cards = [
        ['Match the MAC', 'The Hardware address in the binding is the PC’s Physical Address: now you know who has which IP.'],
        ['Leased addresses', 'Counts up as PCs join. Still 0 while PCs wait? Their requests are not reaching R1.'],
        ['Renew a lease', 'On the PC: `ipconfig /release`, then `ipconfig /renew` (DHCP must be selected).'],
      ];
      cards.forEach(([h, b], i) => K.card(s, { x: 0.6 + i * 4.14, y: 5.35, w: 3.85, h: 1.45, head: h, body: [b], pt: 13, headPt: 14 }));
    },
    notes: 'Have trainees find their own PC in the binding table by matching MAC addresses. This is also the quickest way to find a device that has “disappeared” on a real network.',
  },
  {
    title: 'How to relay DHCP from another subnet (ip helper-address)',
    tag: 'LAB 4', reveal: 'rows',
    goal: 'The LIBRARY LAN (192.168.40.0/24) gets its addresses from SRV2, a DHCP server in another subnet.',
    async render(s, { K, P }) {
      const y = 2.6, pc = 1.2, r = 6.2, sv = 11.3;
      K.link(s, pc + 0.35, y, r - 0.35, y, { width: 2.25 });
      K.link(s, r + 0.35, y, sv - 0.35, y, { width: 2.25 });
      await K.dev(s, 'pc', pc, y, 0.6, 'LIB-PC', null, { labelPos: 'below' });
      await K.dev(s, 'router', r, y, 0.6, 'R1', null, { labelPos: 'below' });
      await K.dev(s, 'server', sv, y, 0.62, 'SRV2', '192.168.50.11', { labelPos: 'below' });
      K.link(s, pc + 0.4, y - 0.42, r - 0.4, y - 0.42, { color: P.v20, width: 2.25, end: 'triangle' });
      K.link(s, r + 0.4, y - 0.42, sv - 0.4, y - 0.42, { color: P.mid, width: 2.25, end: 'triangle' });
      K.tag(s, 'DHCP Discover — a broadcast', pc + 0.6, y - 0.78, { w: 4.0, pt: 12, bold: true, color: P.v20 });
      K.tag(s, 'forwarded as a unicast to 192.168.50.11', r + 0.6, y - 0.78, { w: 4.3, pt: 12, bold: true, color: P.mid });
      K.tag(s, 'LIBRARY LAN 192.168.40.0/24', pc + 0.6, y + 0.05, { w: 4.0, pt: 11, color: P.muted });
      K.tag(s, 'G0/0/2  .40.1', r - 1.6, y + 0.05, { w: 1.2, pt: 11, color: P.text, align: 'right' });
      K.tag(s, 'G0/0/0  .50.1', r + 0.4, y + 0.05, { w: 1.3, pt: 11, color: P.text, align: 'left' });
      K.tag(s, 'SERVER LAN 192.168.50.0/24', r + 1.7, y + 0.05, { w: 3.0, pt: 11, color: P.muted });
      K.commandTable(s, {
        y: 3.35, device: 'R1', title: 'relay table', maxBottom: 5.3, reveal: true,
        rows: [
          { lines: [{ p: 'R1(config)#', c: 'interface g0/0/2' }, { p: 'R1(config-if)#', c: 'ip address 192.168.40.1 255.255.255.0' }, { p: 'R1(config-if)#', c: 'no shutdown' }], m: 'The LIBRARY port — the clients’ gateway. (On a 4331, add a GLC-T module to G0/0/2 first.)' },
          { p: 'R1(config-if)#', c: 'ip helper-address 192.168.50.11', m: 'Routers drop broadcasts. This catches the DHCP broadcast and forwards it to SRV2, stamped with 192.168.40.1 so SRV2 picks the right pool.' },
        ],
      });
      K.card(s, { x: 0.6, y: 5.42, w: 7.75, h: 1.38, head: 'On SRV2: Services › DHCP', pt: 13, body: ['Service **On** • Pool Name **LIB-POOL** • Default Gateway **192.168.40.1** • DNS Server **192.168.50.10** • Start IP **192.168.40.100** • Mask **255.255.255.0** • Maximum Users **50** → **Add**'] });
      K.card(s, { x: 8.6, y: 5.42, w: 4.13, h: 1.38, fill: P.redTint, line: P.redBorder, headColor: P.darkRed, head: 'Watch out', pt: 13, body: ['Helper goes on the port facing the **clients**. SRV2 needs gateway 192.168.50.1 to reply.'] });
    },
    notes: 'This is how large networks work: one central DHCP server, and a helper address on every client-facing router interface or SVI. Show the relayed Discover in Simulation mode: it leaves R1 as a unicast from 192.168.40.1.',
  },
  {
    title: 'How to fix common DHCP problems',
    goal: 'Most DHCP faults are not in the pool at all — they are VLAN, trunk, gateway or relay mistakes.',
    async render(s, { K, P }) {
      K.dataTable(s, {
        y: 1.85, colW: [3.2, 3.45, 5.48], pt: 13, name: 'dhcp faults', maxBottom: 5.92,
        head: ['What you see', 'Most likely cause', 'How to fix it'],
        rows: [
          ['PC address is **169.254.x.x**', 'No DHCP reply reached the PC', 'Check the pool `network`, the port’s VLAN, the trunk’s allowed VLANs, and the helper address'],
          ['PC has an address but cannot leave its subnet', 'Wrong `default-router` in the pool', 'Set it to the router’s address in that subnet, then renew the lease'],
          ['PC gets an address from the wrong subnet', 'Its switch port is in the wrong VLAN', '`switchport access vlan` with the right VLAN number'],
          ['Two devices with the same address', 'A static device’s address is not excluded', 'Add `ip dhcp excluded-address` for it, then renew the PCs'],
          ['Websites work by IP but not by name', 'Missing or wrong `dns-server`', 'Fix `dns-server` in the pool and renew the lease'],
          ['Relay clients get nothing', 'Helper on the wrong port, or the server has no route back', 'Helper on the client-side port; give the server a default gateway'],
        ],
      });
      await K.checkWatch(s, { tip: 'Prove every fix: `ipconfig /renew` on the PC, then `show ip dhcp binding` on the router.', title: 'dhcp faults' });
    },
    notes: 'Fault-finding game: inject one of these faults into a trainee’s file and let a partner diagnose it using only the What you see column, show commands and ipconfig.',
  },
];

module.exports = { section, slides };
