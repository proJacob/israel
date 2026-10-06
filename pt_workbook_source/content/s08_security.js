// Part 08 — security: port security, ACLs, NAT/PAT (Lab 6)
const section = {
  num: '08', short: 'Security & NAT', icon: 'FaShieldAlt',
  title: 'How to secure switches and routers',
  desc: 'Allow only known devices on switch ports, filter traffic with ACLs, and share one public address with NAT. (Lab 6)',
  items: ['set up the security lab', 'lock switch ports', 'understand ACL rules', 'write standard and extended ACLs', 'test and read an ACL', 'configure PAT and static NAT'],
  notes: 'Lab 6 implements a written policy. Read the policy with the class first and ask which tool enforces each line: port security, a standard ACL on the VTY lines, an extended ACL, PAT, static NAT.',
};

const slides = [
  {
    title: 'How to set up the security lab (Lab 6 topology)',
    tag: 'LAB 6',
    goal: 'One router joins the STAFF LAN, the STUDENT LAN and the ISP. A written policy says who may reach what.',
    async render(s, { K, P }) {
      const ISP = [3.9, 2.05], NET = [6.0, 2.05], R1 = [3.9, 3.4], S1 = [2.0, 4.6], S2 = [5.8, 4.6];
      const st = [[0.85, 5.85, 'pc', 'ADMIN-PC', '.10.10'], [2.0, 5.85, 'pc', 'STAFF-PC', '.10.11'], [3.15, 5.85, 'server', 'WEB-INT', '.10.100']];
      K.link(s, ISP[0], ISP[1], R1[0], R1[1], { width: 2.5 });
      K.link(s, ISP[0], ISP[1], NET[0], NET[1], { width: 2 });
      K.link(s, R1[0], R1[1], S1[0], S1[1], { width: 2.25 });
      K.link(s, R1[0], R1[1], S2[0], S2[1], { width: 2.25 });
      for (const d of st) K.link(s, S1[0], S1[1], d[0], d[1], { width: 1.75, color: P.v10 });
      K.link(s, S2[0], S2[1], S2[0], 5.85, { width: 1.75, color: P.v20 });
      await K.dev(s, 'isp', ISP[0], ISP[1], 0.58, 'ISP', '203.0.113.1', { labelPos: 'left', labelW: 1.2 });
      await K.dev(s, 'cloud', NET[0], NET[1], 0.75, 'Internet server', '198.51.100.10', { labelPos: 'right', labelW: 1.5 });
      await K.dev(s, 'router', R1[0], R1[1], 0.62, 'R1', null, { labelPos: 'right', labelW: 0.5 });
      await K.dev(s, 'switch', S1[0], S1[1], 0.62, 'S1', null, { labelPos: 'left', labelW: 0.5 });
      await K.dev(s, 'switch', S2[0], S2[1], 0.62, 'S2', null, { labelPos: 'right', labelW: 0.5 });
      for (const d of st) await K.dev(s, d[2], d[0], d[1], 0.5, d[3], d[4], { fill: d[2] === 'pc' ? P.v10 : undefined, labelPt: 11, labelW: 1.15 });
      await K.dev(s, 'pc', S2[0], 5.85, 0.5, 'STU-PC1', '.20.15', { fill: P.v20, labelPt: 11, labelW: 1.15 });
      K.tag(s, 'G0/0/2  203.0.113.2 /29', 4.0, 2.62, { w: 2.2, align: 'left', pt: 10 });
      K.tag(s, 'G0/0/0  192.168.10.1', 1.15, 3.55, { w: 1.95, align: 'right', pt: 10, color: P.v10, bold: true });
      K.tag(s, 'G0/0/1  192.168.20.1', 4.75, 3.55, { w: 1.95, align: 'left', pt: 10, color: P.v20, bold: true });
      K.tag(s, 'STAFF 192.168.10.0/24', 0.45, 4.45, { w: 1.1, pt: 10, color: P.v10, h: 0.4 });
      K.tag(s, 'STUDENTS 192.168.20.0/24', 6.35, 4.45, { w: 1.15, pt: 10, color: P.v20, h: 0.4 });
      K.card(s, {
        x: 7.65, y: 1.85, w: 5.08, h: 3.75, head: 'The policy', pt: 13, psa: 3,
        body: [
          { t: 'Only ADMIN-PC may SSH to R1.', bullet: true, num: true },
          { t: 'Students may browse the internal web server — nothing else in STAFF.', bullet: true, num: true },
          { t: 'Everyone reaches the Internet through one public address (PAT).', bullet: true, num: true },
          { t: 'WEB-INT is published to the Internet as 203.0.113.5 (static NAT).', bullet: true, num: true },
          { t: 'Only registered devices may use the staff switch ports.', bullet: true, num: true },
        ],
      });
      K.card(s, { x: 7.65, y: 5.75, w: 5.08, h: 1.05, fill: P.tint, body: ['R1 also needs a default route: `ip route 0.0.0.0 0.0.0.0 203.0.113.1`.'], pt: 13 });
    },
    notes: 'The ISP link is a /29 so that the static NAT address 203.0.113.5 sits in the same subnet as R1’s outside interface — the ISP router then reaches it without extra routes. G0/0/2 on a 4331 needs a GLC-T module.',
  },
  {
    type: 'command', tag: 'LAB 6',
    title: 'How to lock switch ports with port security',
    goal: 'Only the registered PC may use each staff port. Any other device shuts the port down.',
    device: 'S1',
    rows: [
      { p: 'S1(config)#', c: 'interface range fa0/1 - 3', m: 'The three staff ports.' },
      { p: 'S1(config-if-range)#', c: 'switchport mode access', m: 'Port security only works on a port fixed as access (or trunk), not left dynamic.' },
      { p: 'S1(config-if-range)#', c: 'switchport port-security', m: 'Turn the feature on (default: 1 MAC address, violation shutdown).' },
      { p: 'S1(config-if-range)#', c: 'switchport port-security maximum 1', m: 'One device per port. (Use 2 for an IP phone with a PC behind it.)' },
      { p: 'S1(config-if-range)#', c: 'switchport port-security mac-address sticky', m: 'Learn the first device’s MAC and write it into the running-config automatically.' },
      { p: 'S1(config-if-range)#', c: 'switchport port-security violation shutdown', m: 'An unknown device shuts the port (err-disabled). Other modes: `restrict` (drop + log), `protect` (drop quietly).' },
    ],
    check: 'Ping from each PC first, then `show port-security interface fa0/2` → Secure-up, 1 sticky MAC.',
    watch: 'Recover an err-disabled port: remove the rogue device, then `shutdown` and `no shutdown` on the port.',
    notes: 'Violation test: swap STAFF-PC for a “ROGUE” laptop, ping, and Fa0/2 goes err-disabled (red). Save the config after the sticky MACs are learned, or they are lost at reload.',
  },
  {
    title: 'How to understand ACL rules before you write one',
    goal: 'An access control list (ACL) is a list of permit/deny rules that a router checks for every packet.',
    async render(s, { K, P }) {
      K.card(s, {
        x: 0.6, y: 1.85, w: 6.55, h: 4.95, pt: 14, psa: 14, bullet: true,
        body: [
          'Rules are checked **top-down**; the **first match wins** and the rest are skipped.',
          'Every ACL ends with a hidden **deny any** — include at least one permit.',
          '**Standard** (1–99): checks the **source** only → place it **near the destination**.',
          '**Extended** (100–199 or a name): source, destination, protocol and port → place it **near the source**.',
          '**Wildcards:** 0 = must match, 1 = ignore. `0.0.0.255` = a /24, `host 10.1.1.5` = one address, `any` = all.',
          'One ACL per interface, per direction (`in` or `out`).',
        ],
      });
      const x = 7.55, w = 2.75;
      s.addShape('roundRect', { x, y: 1.85, w, h: 0.55, fill: { color: P.v20 }, line: { type: 'none' }, rectRadius: 0.06 });
      s.addText('Packet arrives', { x, y: 1.85, w, h: 0.55, fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      const lines = [['Line 10 matches?', 'PERMIT', P.mid], ['Line 20 matches?', 'DENY', P.darkRed], ['Line 30 matches?', 'PERMIT', P.mid]];
      let y = 2.75;
      lines.forEach(([t, act, col]) => {
        K.link(s, x + w / 2, y - 0.35, x + w / 2, y, { color: P.muted, width: 1.75, end: 'triangle' });
        s.addShape('roundRect', { x, y, w, h: 0.55, fill: { color: P.tint }, line: { color: P.border, width: 1 }, rectRadius: 0.06 });
        s.addText(t, { x, y, w, h: 0.55, fontSize: 14, color: P.text, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
        K.link(s, x + w, y + 0.275, x + w + 0.6, y + 0.275, { color: col, width: 2, end: 'triangle' });
        s.addText('yes', { x: x + w + 0.02, y: y - 0.05, w: 0.6, h: 0.28, fontSize: 11, color: P.muted, align: 'center', margin: 0, isTextBox: true });
        s.addShape('roundRect', { x: x + w + 0.65, y: y + 0.05, w: 1.45, h: 0.45, fill: { color: col }, line: { type: 'none' }, rectRadius: 0.05 });
        s.addText(act, { x: x + w + 0.65, y: y + 0.05, w: 1.45, h: 0.45, fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
        s.addText('no', { x: x + w / 2 + 0.05, y: y + 0.56, w: 0.4, h: 0.3, fontSize: 11, color: P.muted, margin: 0, isTextBox: true });
        y += 0.9;
      });
      K.link(s, x + w / 2, y - 0.35, x + w / 2, y, { color: P.muted, width: 1.75, end: 'triangle' });
      s.addShape('roundRect', { x, y, w: w + 2.1, h: 0.6, fill: { color: P.redTint }, line: { color: P.redBorder, width: 1.25, dashType: 'dash' }, rectRadius: 0.06 });
      s.addText(K.runs('No match at all → hidden **deny any**', { color: P.darkRed, fontSize: 14 }), { x, y, w: w + 2.1, h: 0.6, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addText('Once a line matches, the packet is permitted or dropped — later lines are never read.', { x, y: y + 0.72, w: w + 2.1, h: 0.55, fontSize: 12, color: P.muted, margin: 0, valign: 'top', isTextBox: true });
    },
    notes: 'Walk a few packets through the flow chart. The order trap: a broad deny above a specific permit blocks everything the permit was meant to allow.',
  },
  {
    type: 'command', tag: 'LAB 6',
    title: 'How to let only the admin PC manage the router',
    goal: 'A standard ACL on the VTY lines: only ADMIN-PC (192.168.10.10) may open an SSH session to R1.',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'access-list 10 remark ONLY ADMIN-PC MAY MANAGE R1', m: 'A note stored with the ACL, for the next administrator.' },
      { p: 'R1(config)#', c: 'access-list 10 permit host 192.168.10.10', m: 'Permit only the admin PC’s address. The hidden deny any blocks everyone else.' },
      { p: 'R1(config)#', c: 'line vty 0 4', m: 'The remote-access lines.' },
      { p: 'R1(config-line)#', c: 'access-class 10 in', m: 'Check each incoming SSH session against ACL 10. On lines it is `access-class`; on interfaces it is `ip access-group`.' },
    ],
    check: 'ADMIN-PC: `ssh -l netadmin 192.168.10.1` works. STAFF-PC: the connection is refused.',
    watch: 'Test from ADMIN-PC before you log out — a wrong address locks everyone out (the console still works).',
    notes: 'SSH must already be configured on R1 (part 03). This is the “standard ACL near the destination” rule in action: the destination is R1 itself.',
  },
  {
    type: 'command', tag: 'LAB 6',
    title: 'How to filter traffic with an extended named ACL',
    goal: 'Students may open the intranet web server, but nothing else in the STAFF LAN. Everything else is allowed.',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'ip access-list extended STUDENT-POLICY', m: 'Create a named extended ACL. The prompt becomes `(config-ext-nacl)#`.' },
      { p: 'R1(config-ext-nacl)#', c: 'remark Students may browse the intranet only', m: 'A note stored with the ACL.' },
      { p: 'R1(config-ext-nacl)#', c: 'permit tcp 192.168.20.0 0.0.0.255 host 192.168.10.100 eq 80', m: 'Students (192.168.20.x) may open web pages (TCP port 80) on the web server.' },
      { p: 'R1(config-ext-nacl)#', c: 'deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255', m: 'Anything else from students to the staff LAN is blocked.' },
      { p: 'R1(config-ext-nacl)#', c: 'permit ip any any', m: 'Everything else (e.g. the Internet) is allowed — this beats the hidden deny any.' },
      { lines: [{ p: 'R1(config-ext-nacl)#', c: 'exit' }, { p: 'R1(config)#', c: 'interface g0/0/1' }, { p: 'R1(config-if)#', c: 'ip access-group STUDENT-POLICY in' }], m: 'Check packets as they enter R1 from the student LAN — close to the source.' },
    ],
    check: 'Run the tests on the next slide; `show access-lists` counts the matches of each line.',
    watch: 'Order matters: if the deny line came first, even the web page would be blocked.',
    notes: 'Read each line aloud as a sentence: “permit TCP from any student to host .100, port 80”. Long lines wrap in the slide, but in the CLI each permit/deny is typed on one line.',
  },
  {
    title: 'How to test and read an ACL',
    tag: 'LAB 6',
    goal: 'Prove the policy with planned tests, then read the match counters to see which line caught each packet.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: K.CW, h: 1.98, pt: 11, title: 'R1  ›  CLI', name: 'acl output',
        lines: ['R1# show access-lists', 'Standard IP access list 10', '    10 permit host 192.168.10.10 {{(2 match(es))}}', 'Extended IP access list STUDENT-POLICY', '    10 permit tcp 192.168.20.0 0.0.0.255 host 192.168.10.100 eq {{www}} (4 match(es))', '    20 deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 {{(8 match(es))}}', '    30 permit ip any any (12 match(es))'],
      });
      K.dataTable(s, {
        x: 0.6, y: 4.0, colW: [3.3, 1.85, 2.3], pt: 12, name: 'acl tests', maxBottom: 6.85,
        head: ['Test from STU-PC1', 'Expected', 'Because of'],
        rows: [['Browser: http://192.168.10.100', 'Page loads', 'line 10 (TCP 80)'], ['`ping 192.168.10.100`', 'Fails', 'line 20'], ['`ping 192.168.10.11`', 'Fails', 'line 20'], ['Browser: http://198.51.100.10', 'Page loads', 'line 30 (after NAT)']],
      });
      K.card(s, { x: 7.75, y: 4.0, w: 4.98, h: 1.55, head: 'Reading the output', pt: 13, body: ['`eq www` = port 80. 10, 20, 30 are sequence numbers: insert a line with `15 permit …`, remove one with `no 20`.'] });
      K.card(s, { x: 7.75, y: 5.68, w: 4.98, h: 1.12, fill: P.redTint, line: P.redBorder, headColor: P.darkRed, head: 'Think', pt: 13, body: ['STAFF-PC → STU-PC1 ping fails too. Why? The reply hits line 20.'] });
    },
    notes: 'ACLs are stateless: the reply from STU-PC1 enters G0/0/1 and is checked like any other packet, so line 20 drops it. Ask the class how they would allow staff to ping students (permit icmp echo-reply before line 20).',
  },
  {
    type: 'command', tag: 'LAB 6',
    title: 'How to share one public address with PAT',
    goal: 'All inside PCs reach the Internet through R1’s single public address, told apart by port numbers (NAT overload).',
    device: 'R1',
    rows: [
      { lines: [{ p: 'R1(config)#', c: 'interface g0/0/0' }, { p: 'R1(config-if)#', c: 'ip nat inside' }], m: 'The STAFF LAN port is on the inside (private addresses).' },
      { lines: [{ p: 'R1(config-if)#', c: 'interface g0/0/1' }, { p: 'R1(config-if)#', c: 'ip nat inside' }], m: 'The STUDENT LAN port is inside too.' },
      { lines: [{ p: 'R1(config-if)#', c: 'interface g0/0/2' }, { p: 'R1(config-if)#', c: 'ip nat outside' }, { p: 'R1(config-if)#', c: 'exit' }], m: 'The ISP link is the outside (public address 203.0.113.2).' },
      { lines: [{ p: 'R1(config)#', c: 'access-list 1 permit 192.168.10.0 0.0.0.255' }, { p: 'R1(config)#', c: 'access-list 1 permit 192.168.20.0 0.0.0.255' }], m: 'Choose which inside addresses may be translated. Here the ACL selects — it does not filter.' },
      { p: 'R1(config)#', c: 'ip nat inside source list 1 interface g0/0/2 overload', m: 'Translate those sources to G0/0/2’s public address and share it by port number: PAT.' },
    ],
    check: 'Browse http://198.51.100.10 from a PC, then run `show ip nat translations` on R1.',
    watch: 'NAT “does nothing”? Usually inside and outside are swapped, or the default route to the ISP is missing.',
    notes: 'Follow one packet: 192.168.20.15:1025 becomes 203.0.113.2:1025 on the way out; the reply to 203.0.113.2:1025 is translated back. A second PC using port 1025 gets another public port — that is how thousands of users share one address.',
  },
  {
    title: 'How to publish an internal server with static NAT',
    tag: 'LAB 6', reveal: true,
    goal: 'A permanent one-to-one mapping lets Internet users reach the internal web server at a public address.',
    async render(s, { K, P }) {
      K.commandTable(s, {
        y: 1.82, device: 'R1', title: 'static nat', maxBottom: 3.3, reveal: true,
        rows: [
          { p: 'R1(config)#', c: 'ip nat inside source static 192.168.10.100 203.0.113.5', m: 'Internet users who browse to 203.0.113.5 reach WEB-INT (192.168.10.100), and its replies leave as 203.0.113.5.' },
          { p: 'R1#', c: 'show ip nat translations', m: 'Show the NAT table (below).' },
        ],
      });
      K.terminal(s, {
        x: 0.6, y: 3.35, w: K.CW, h: 1.38, pt: 11, title: 'R1  ›  CLI', name: 'nat table',
        lines: ['Pro  Inside global        Inside local          Outside local        Outside global', '---  {{203.0.113.5}}          {{192.168.10.100}}        ---                  ---', 'tcp  203.0.113.2:1025     192.168.20.15:1025    198.51.100.10:80     198.51.100.10:80'],
      });
      const cards = [['Inside local', 'The private address of the inside host, e.g. 192.168.10.100.'], ['Inside global', 'The public address it becomes on the Internet, e.g. 203.0.113.5.'], ['Outside local / global', 'The Internet host — the same in this lab: 198.51.100.10.']];
      cards.forEach(([h, b], i) => K.card(s, { x: 0.6 + i * 4.14, y: 4.88, w: 3.85, h: 1.0, head: h, body: [b], pt: 13, headPt: 14, pad: 0.13 }));
      await K.checkWatch(s, { check: 'From the Internet server’s side, browse http://203.0.113.5: the WEB-INT page appears.', watch: 'Use a public address no other device uses — here one from R1’s ISP subnet (203.0.113.0/29).', title: 'static nat', reveal: true });
    },
    notes: 'Static NAT is two-way and permanent; PAT entries appear only while a conversation is active. Clear dynamic entries with clear ip nat translation * if trainees want to watch them appear again.',
  },
];

module.exports = { section, slides };
