// Part 07 — routing (Lab 3)
const section = {
  num: '07', short: 'Routing', icon: 'FaRoute',
  title: 'How to connect networks with routing',
  desc: 'Teach routers where every network is — by hand with static routes, or automatically with OSPF, RIP and EIGRP. (Lab 3)',
  items: ['set up the routing lab', 'read a routing table', 'configure static and default routes', 'configure single-area OSPF', 'configure RIPv2 and EIGRP', 'check and troubleshoot routing'],
  notes: 'Lab 3: three 4331 routers in a triangle joined by /30 links, each with its own LAN. Do the parts in order and remove each method before the next, because the route with the lowest administrative distance always wins.',
};

const slides = [
  {
    title: 'How to set up the routing lab (Lab 3 topology)',
    tag: 'LAB 3',
    goal: 'Three routers, three LANs, three point-to-point links. Every link is its own /30 subnet.',
    async render(s, { K, P }) {
      const R1 = [2.05, 2.55], R2 = [5.35, 2.55], R3 = [3.7, 4.7];
      const L1 = [0.95, 3.75], L2 = [6.45, 3.75], L3 = [3.7, 5.95];
      K.link(s, R1[0], R1[1], R2[0], R2[1], { width: 2.5 });
      K.link(s, R2[0], R2[1], R3[0], R3[1], { width: 2.5 });
      K.link(s, R1[0], R1[1], R3[0], R3[1], { width: 2.5 });
      K.link(s, R1[0], R1[1], L1[0], L1[1], { width: 1.75, color: P.v10 });
      K.link(s, R2[0], R2[1], L2[0], L2[1], { width: 1.75, color: P.v10 });
      K.link(s, R3[0], R3[1], L3[0], L3[1], { width: 1.75, color: P.v10 });
      await K.dev(s, 'router', R1[0], R1[1], 0.62, 'R1', null, { labelPos: 'above' });
      await K.dev(s, 'router', R2[0], R2[1], 0.62, 'R2', null, { labelPos: 'above' });
      await K.dev(s, 'router', R3[0], R3[1], 0.62, 'R3', null, { labelPos: 'right', labelW: 0.5 });
      await K.dev(s, 'pc', L1[0], L1[1], 0.5, 'PC1', '172.16.1.10');
      await K.dev(s, 'pc', L2[0], L2[1], 0.5, 'PC2', '172.16.2.10');
      await K.dev(s, 'pc', L3[0], L3[1], 0.5, 'PC3', '172.16.3.10', { labelPos: 'right', labelW: 1.2 });
      K.tag(s, '10.0.0.0/30', 3.05, 2.2, { w: 1.3, bold: true, color: P.deep, pt: 11 });
      K.tag(s, '10.0.0.4/30', 4.7, 3.55, { w: 1.2, bold: true, color: P.deep, pt: 11, align: 'left' });
      K.tag(s, '10.0.0.8/30', 1.55, 3.55, { w: 1.3, bold: true, color: P.deep, pt: 11, align: 'right' });
      K.tag(s, 'LAN 1  172.16.1.0/24', 0.35, 4.75, { w: 1.9, color: P.v10, pt: 10, bold: true });
      K.tag(s, 'LAN 2  172.16.2.0/24', 5.3, 4.75, { w: 1.8, color: P.v10, pt: 10, bold: true });
      K.tag(s, 'LAN 3  172.16.3.0/24', 1.4, 5.85, { w: 1.9, color: P.v10, pt: 10, bold: true, align: 'right' });
      K.dataTable(s, {
        x: 7.2, y: 1.85, colW: [0.7, 1.55, 1.64, 1.64], pt: 12, name: 'lab3 table', maxBottom: 3.9,
        head: ['Router', 'G0/0/0 (LAN)', 'G0/0/1', 'G0/0/2'],
        rows: [['R1', '172.16.1.1 /24', '10.0.0.1 /30 → R2', '10.0.0.9 /30 → R3'], ['R2', '172.16.2.1 /24', '10.0.0.2 /30 → R1', '10.0.0.5 /30 → R3'], ['R3', '172.16.3.1 /24', '10.0.0.6 /30 → R2', '10.0.0.10 /30 → R1']],
      });
      K.card(s, {
        x: 7.2, y: 3.95, w: 5.53, h: 2.85, head: 'Order of work', pt: 13, psa: 2,
        body: [
          { t: 'Router–router links: cross-over cables. Add a GLC-T module to each G0/0/2.', bullet: true, num: true },
          { t: 'Address every interface and `no shutdown`; PCs use their router’s .1 as gateway.', bullet: true, num: true },
          { t: 'Ping each neighbour across every /30 link before any routing.', bullet: true, num: true },
          { t: 'Then: static → OSPF → RIP → EIGRP. Remove each before the next, e.g. `no router ospf 10`.', bullet: true, num: true },
        ],
      });
    },
    notes: 'A /30 has exactly two usable addresses — one for each router on the link. Ask trainees to work out the four addresses of 10.0.0.4/30 (network .4, R2 .5, R3 .6, broadcast .7).',
  },
  {
    title: 'How to read a routing table',
    tag: 'LAB 3',
    goal: '`show ip route` is the router’s map. Each line tells you how a network was learned and which way to send packets.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: 7.55, h: 3.95, pt: 11, title: 'R1  ›  CLI  (shortened — OSPF running)', name: 'route table',
        lines: [
          'R1# show ip route',
          'Codes: L - local, C - connected, S - static, R - RIP,',
          '       O - OSPF, D - EIGRP, * - candidate default',
          'Gateway of last resort is {{not set}}',
          '',
          'C    10.0.0.0/30 is directly connected, GigabitEthernet0/0/1',
          'L    10.0.0.1/32 is directly connected, GigabitEthernet0/0/1',
          'C    172.16.1.0/24 is directly connected, GigabitEthernet0/0/0',
          'L    172.16.1.1/32 is directly connected, GigabitEthernet0/0/0',
          '{{O}}    172.16.2.0/24 {{[110/2]}} via {{10.0.0.2}}, 00:01:12, {{GigabitEthernet0/0/1}}',
          'O    172.16.3.0/24 [110/2] via 10.0.0.10, 00:01:12, GigabitEthernet0/0/2',
        ],
      });
      const cards = [
        ['Code letter', 'How the route was learned: C connected, L the router’s own address, S static, O OSPF, R RIP, D EIGRP, S* default.'],
        ['[110/2]', '[administrative distance / metric]. Lower distance = more trusted source; lower metric = better path.'],
        ['via 10.0.0.2  •  G0/0/1', 'The next-hop router, and the port the packet leaves by.'],
        ['Gateway of last resort', 'The default route. “not set” = packets to unknown networks are dropped.'],
      ];
      let y = 1.82;
      for (const [h, b] of cards) { K.card(s, { x: 8.4, y, w: 4.33, h: 0.93, head: h, body: [b], pt: 12, headPt: 13, pad: 0.12 }); y += 1.0; }
      s.addText('Administrative distance — the lower number wins:', { x: 0.6, y: 5.95, w: 4.7, h: 0.5, fontSize: 14, bold: true, color: P.dark, valign: 'middle', margin: 0, isTextBox: true });
      const ad = [['Connected', '0'], ['Static', '1'], ['EIGRP', '90'], ['OSPF', '110'], ['RIP', '120']];
      ad.forEach(([n, v], i) => {
        const x = 5.35 + i * 1.5;
        s.addShape('roundRect', { x, y: 5.95, w: 1.38, h: 0.5, fill: { color: i === 0 ? P.dark : P.tint }, line: { color: P.border, width: 0.75 }, rectRadius: 0.06 });
        s.addText([{ text: v + '  ', options: { bold: true, fontFace: 'Cambria', fontSize: 16, color: i === 0 ? P.gold : P.dark } }, { text: n, options: { fontSize: 12, color: i === 0 ? 'FFFFFF' : P.text } }], { x, y: 5.95, w: 1.38, h: 0.5, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      });
      s.addText('If two methods know the same network, only the lowest distance goes into the table — that is why each lab part removes the previous method.', { x: 0.6, y: 6.5, w: K.CW, h: 0.45, fontSize: 12, color: P.muted, margin: 0, valign: 'middle', isTextBox: true });
    },
    notes: 'Analogy: the routing table is the signboards at a junction — “Nakuru: left, Mombasa: right”. The default route is the board that says “everywhere else: take the highway”.',
  },
  {
    type: 'command', tag: 'LAB 3',
    title: 'How to configure static routes',
    goal: 'Tell each router by hand where the networks it is not connected to are (Lab 3, part A).',
    device: 'R1 / R2 / R3',
    rows: [
      { p: 'R1(config)#', c: 'ip route 172.16.2.0 255.255.255.0 10.0.0.2', m: 'To reach LAN 2, send packets to R2 (10.0.0.2, its address on our shared link). Parts: network, mask, next hop.' },
      { p: 'R1(config)#', c: 'ip route 172.16.3.0 255.255.255.0 10.0.0.10', m: 'To reach LAN 3, send packets to R3.' },
      { p: 'R1(config)#', c: 'ip route 172.16.2.0 255.255.255.0 10.0.0.10 5', m: 'A floating static route: a backup path to LAN 2 via R3 with distance 5, used only if the main route (distance 1) fails.' },
      { lines: [{ p: 'R2(config)#', c: 'ip route 172.16.1.0 255.255.255.0 10.0.0.1' }, { p: 'R2(config)#', c: 'ip route 172.16.3.0 255.255.255.0 10.0.0.6' }, { p: 'R2(config)#', c: 'ip route 172.16.1.0 255.255.255.0 10.0.0.6 5' }], m: 'R2 needs routes too — every router needs a route there and back — plus its own floating backup to LAN 1 via R3.' },
      { lines: [{ p: 'R3(config)#', c: 'ip route 172.16.1.0 255.255.255.0 10.0.0.9' }, { p: 'R3(config)#', c: 'ip route 172.16.2.0 255.255.255.0 10.0.0.5' }], m: 'R3’s routes to LAN 1 and LAN 2.' },
    ],
    check: '`show ip route static` shows S routes; PC1 pings PC2 and PC3. Shut R1 G0/0/1: the floating routes take over.',
    watch: 'The next hop is the neighbour’s address on the shared link — never your own address or the neighbour’s LAN address.',
    notes: 'Test the floating route: shut R1’s G0/0/1 and look at show ip route — the S route via 10.0.0.10 appears. No shut it again and the original route returns.',
  },
  {
    type: 'command',
    title: 'How to configure a default route',
    goal: 'A default route catches every destination the router doesn’t know — usually “all Internet traffic: go to the ISP”.',
    device: 'R1 / R2',
    rows: [
      { p: 'R1(config)#', c: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', m: '“Anything I don’t know, send to the ISP router 203.0.113.1.” `0.0.0.0 0.0.0.0` matches every address.' },
      { p: 'R2(config)#', c: 'ip route 0.0.0.0 0.0.0.0 10.0.0.1', m: 'A branch router with only one way out needs just this one route instead of many static routes.' },
      { lines: [{ p: 'R1(config)#', c: 'router ospf 10' }, { p: 'R1(config-router)#', c: 'default-information originate' }], m: 'With OSPF running, R1 shares its default route, so the other routers learn it automatically (as O*E2).' },
      { p: 'R1#', c: 'show ip route', m: 'Look for `S* 0.0.0.0/0 [1/0] via 203.0.113.1` and “Gateway of last resort is 203.0.113.1”.' },
    ],
    check: 'From a PC, `tracert` to an Internet server: the trace passes R1 and then the ISP router.',
    watch: 'Point the default route only at the real exit. Two routers defaulting to each other bounce packets until they expire.',
    notes: 'The ISP link appears in Lab 4 (part 08) and in Challenge lab B. In Lab 3, try the branch idea: replace R2’s static routes with one default route to R1.',
  },
  {
    type: 'command', tag: 'LAB 3',
    title: 'How to configure OSPF (single area) (1 of 2)',
    goal: 'OSPF lets routers find every network by themselves and reroute when a link fails (Lab 3, part B — R1 shown).',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'router ospf 10', m: 'Start OSPF process 10. The number is local — neighbours don’t need to match it.' },
      { p: 'R1(config-router)#', c: 'router-id 1.1.1.1', m: 'A unique ID for R1 (R2 = 2.2.2.2, R3 = 3.3.3.3) that makes outputs easy to read.' },
      { p: 'R1(config-router)#', c: 'network 172.16.1.0 0.0.0.255 area 0', m: 'Run OSPF on the port in 172.16.1.0/24 and put it in area 0. `0.0.0.255` is the wildcard of 255.255.255.0.' },
      { lines: [{ p: 'R1(config-router)#', c: 'network 10.0.0.0 0.0.0.3 area 0' }, { p: 'R1(config-router)#', c: 'network 10.0.0.8 0.0.0.3 area 0' }], m: 'Run OSPF on both /30 links (wildcard `0.0.0.3`).' },
      { p: 'R1(config-router)#', c: 'passive-interface g0/0/0', m: 'No OSPF hellos to the PCs, but the LAN is still advertised.' },
    ],
    check: '`show ip ospf neighbor` → 2.2.2.2 and 3.3.3.3 in FULL state; `show ip route ospf` → O routes.',
    watch: 'Remove the static routes first (`no ip route …`) — with distance 1 they would hide the OSPF routes.',
    notes: 'Wildcard trick: 255.255.255.255 minus the subnet mask. For /24: 0.0.0.255; for /30: 0.0.0.3. The next slide has R2 and R3 in full.',
  },
  {
    title: 'How to configure OSPF (single area) (2 of 2)',
    tag: 'LAB 3',
    goal: 'The same pattern on R2 and R3: their own router ID, their own LAN and their two links.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: 5.95, h: 2.75, pt: 11, title: 'R2  ›  CLI', name: 'ospf r2',
        lines: ['R2(config)# router ospf 10', 'R2(config-router)# router-id 2.2.2.2', 'R2(config-router)# network 172.16.2.0 0.0.0.255 area 0', 'R2(config-router)# network 10.0.0.0 0.0.0.3 area 0', 'R2(config-router)# network 10.0.0.4 0.0.0.3 area 0', 'R2(config-router)# passive-interface g0/0/0'],
      });
      K.terminal(s, {
        x: 6.78, y: 1.82, w: 5.95, h: 2.75, pt: 11, title: 'R3  ›  CLI', name: 'ospf r3',
        lines: ['R3(config)# router ospf 10', 'R3(config-router)# router-id 3.3.3.3', 'R3(config-router)# network 172.16.3.0 0.0.0.255 area 0', 'R3(config-router)# network 10.0.0.4 0.0.0.3 area 0', 'R3(config-router)# network 10.0.0.8 0.0.0.3 area 0', 'R3(config-router)# passive-interface g0/0/0'],
      });
      s.addText('Work out the wildcard:  255.255.255.255 − subnet mask', { x: 0.6, y: 4.78, w: 6, h: 0.35, fontSize: 14, bold: true, color: P.dark, margin: 0, isTextBox: true });
      K.dataTable(s, {
        x: 0.6, y: 5.2, colW: [1.0, 2.6, 2.35], pt: 12, monoCols: [1, 2], name: 'wildcards', maxBottom: 6.85,
        head: ['Prefix', 'Subnet mask', 'Wildcard'],
        rows: [['/24', '255.255.255.0', '0.0.0.255'], ['/26', '255.255.255.192', '0.0.0.63'], ['/30', '255.255.255.252', '0.0.0.3']],
      });
      K.card(s, { x: 6.78, y: 4.78, w: 5.95, h: 2.02, fill: P.tint, head: 'Check it on every router', pt: 13, bullet: true, psa: 2, body: ['`show ip protocols` lists the networks OSPF is running on', '`show ip ospf neighbor` shows two neighbours in FULL state', 'Each PC can ping the other two PCs'] });
    },
    notes: 'Common errors: typing the subnet mask instead of the wildcard (OSPF accepts it but matches nothing useful), or a network statement that does not cover the link. show ip protocols reveals both.',
  },
  {
    title: 'How to check OSPF neighbours and routes',
    tag: 'LAB 3',
    goal: 'Two commands prove OSPF works: the neighbours are FULL and the remote LANs appear as O routes.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: K.CW, h: 2.95, pt: 11, title: 'R1  ›  CLI', name: 'ospf check',
        lines: [
          'R1# show ip ospf neighbor',
          'Neighbor ID     Pri   State           Dead Time   Address         Interface',
          '{{2.2.2.2}}           1   {{FULL}}/DR         00:00:35    10.0.0.2        GigabitEthernet0/0/1',
          '3.3.3.3           1   {{FULL}}/BDR        00:00:33    10.0.0.10       GigabitEthernet0/0/2',
          'R1# show ip route ospf',
          'O    172.16.2.0/24 {{[110/2]}} via 10.0.0.2, 00:02:10, GigabitEthernet0/0/1',
          'O    172.16.3.0/24 [110/2] via 10.0.0.10, 00:02:10, GigabitEthernet0/0/2',
          'O    10.0.0.4/30 [110/2] via {{10.0.0.2}}, 00:02:10, GigabitEthernet0/0/1',
          '                 [110/2] via {{10.0.0.10}}, 00:02:10, GigabitEthernet0/0/2',
        ],
      });
      const cards = [
        ['FULL', 'The routers have swapped their complete maps. INIT, 2WAY or no line at all? Check areas, wildcards and passive ports. DR/BDR is just the neighbour’s role on that link.'],
        ['[110/2]', 'OSPF’s distance (110) and cost (2): 1 for the link to R2 plus 1 for R2’s LAN — each Gigabit link costs 1.'],
        ['Two “via” lines', 'Two paths with the same cost: OSPF shares traffic across both (equal-cost load balancing).'],
      ];
      cards.forEach(([h, b], i) => K.card(s, { x: 0.6 + i * 4.14, y: 4.95, w: 3.85, h: 1.85, head: h, body: [b], pt: 13, headPt: 14 }));
    },
    notes: 'Failover test: start ping -t from PC1 to PC2, then shut R1 G0/0/1. OSPF reroutes through R3 after a few lost replies. Compare with the static lab, where nothing happens without the floating route.',
  },
  {
    type: 'command', tag: 'LAB 3',
    title: 'How to configure RIP version 2',
    goal: 'RIP is the simplest routing protocol — fine for small networks. First remove OSPF: `no router ospf 10` (part C).',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'router rip', m: 'Start RIP and enter `(config-router)#` mode.' },
      { p: 'R1(config-router)#', c: 'version 2', m: 'Use RIPv2: it sends subnet masks (needed for /30 and /24 subnets) and uses multicast.' },
      { p: 'R1(config-router)#', c: 'no auto-summary', m: 'Advertise the real subnets, not the summary 172.16.0.0/16.' },
      { p: 'R1(config-router)#', c: 'network 172.16.0.0', m: 'Run RIP on the ports in 172.16.x.x. RIP takes classful network numbers — no mask.' },
      { p: 'R1(config-router)#', c: 'network 10.0.0.0', m: 'Run RIP on both 10.0.0.x links.' },
      { p: 'R1(config-router)#', c: 'passive-interface g0/0/0', m: 'No RIP updates to the PCs; the LAN is still advertised.' },
    ],
    check: '`show ip route rip` → `R 172.16.2.0/24 [120/1] via 10.0.0.2` (120 = RIP’s distance, 1 = one hop).',
    watch: '`network` means “run RIP on my ports in this network”, not “route to it”. RIP gives up after 15 hops.',
    notes: 'Same commands on R2 and R3 — with RIP the network statements are identical on all three routers (172.16.0.0 and 10.0.0.0). RIP updates every 30 seconds; use Fast Forward Time.',
  },
  {
    type: 'command', tag: 'LAB 3',
    title: 'How to configure EIGRP',
    goal: 'EIGRP is Cisco’s fast-converging protocol. First remove RIP: `no router rip` (part D).',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'router eigrp 100', m: 'Start EIGRP in autonomous system 100. Every neighbour must use the same number.' },
      { p: 'R1(config-router)#', c: 'eigrp router-id 1.1.1.1', m: 'A unique ID, as in OSPF.' },
      { p: 'R1(config-router)#', c: 'network 172.16.1.0 0.0.0.255', m: 'Run EIGRP on the LAN port — the same wildcard idea as OSPF, but no area.' },
      { lines: [{ p: 'R1(config-router)#', c: 'network 10.0.0.0 0.0.0.3' }, { p: 'R1(config-router)#', c: 'network 10.0.0.8 0.0.0.3' }], m: 'Run EIGRP on both links.' },
      { p: 'R1(config-router)#', c: 'passive-interface g0/0/0', m: 'No EIGRP hellos to the LAN.' },
      { p: 'R1(config-router)#', c: 'no auto-summary', m: 'Advertise the real subnets, not a classful summary.' },
    ],
    check: '`show ip eigrp neighbors` lists R2 and R3; the routes appear as `D … [90/3072]`.',
    watch: 'A different AS number (100 vs 10) means no neighbours at all. EIGRP routes show as D, not E.',
    notes: 'Fill in the comparison table from the original Lab 3 part E: code, AD, metric to 172.16.2.0, failover time, lines of configuration per router.',
  },
  {
    title: 'How to troubleshoot routing',
    tag: 'LAB 3',
    goal: 'Work bottom-up: interfaces first, then neighbours, then routes — in both directions.',
    async render(s, { K, P }) {
      K.dataTable(s, {
        y: 1.85, colW: [3.15, 3.6, 5.38], pt: 13, name: 'routing faults', maxBottom: 5.92,
        head: ['Symptom', 'Check with', 'Likely fix'],
        rows: [
          ['Interface down', '`show ip interface brief`', '`no shutdown`, the right cable, the same subnet at both ends'],
          ['No OSPF or EIGRP neighbours', '`show ip protocols`, `show ip ospf neighbor`', 'Same area / same AS; correct network statements; router links not passive'],
          ['A network is missing from the table', '`show ip route` on each router', 'Add the missing `network` statement on the router that owns it'],
          ['Ping works one way only', '`show ip route` on the far router', 'Add the return route — both directions are needed'],
          ['Traffic takes an odd path', '`show ip route` (look at the codes)', 'Lowest distance wins: remove the old method (`no router rip`)'],
          ['Ping fails part-way', '`tracert` from a PC', 'The fault is just after the last router that answered'],
        ],
      });
      await K.checkWatch(s, { tip: 'Ping each neighbour first: if two directly connected routers can’t ping, no routing protocol will work.', title: 'routing faults' });
    },
    notes: 'This table is the basis of the Lab 8 troubleshooting challenge. Ask trainees to log each fault as: symptom → test → finding → fix → re-test.',
  },
];

module.exports = { section, slides };
