// Part 01 — Packet Tracer basics
const section = {
  num: '01', short: 'Packet Tracer basics', icon: 'FaMousePointer',
  title: 'How to get started in Packet Tracer',
  desc: 'Build a network on screen: add devices, choose the right cables, open the command line and test with ping.',
  items: ['find your way around the workspace', 'add devices and connect the right cable', 'open the CLI of a router or switch', 'give a PC an address and ping', 'watch packets in Simulation mode'],
  notes: 'Part 01 is about the tool, not the commands. Trainees who are confident with Packet Tracer make fewer “mystery” mistakes later (wrong cable, port off, simulation left running).',
};

const slides = [
  {
    title: 'How to find your way around the Packet Tracer workspace',
    goal: 'Know where everything is before you build: six areas you will use in every lab.',
    async render(s, { K, P }) {
      const x0 = 0.6, y0 = 1.85, w0 = 7.55, h0 = 4.72;
      s.addShape('roundRect', { x: x0, y: y0, w: w0, h: h0, fill: { color: 'F7F9F8' }, line: { color: '9AA5A0', width: 1 }, rectRadius: 0.05 });
      s.addShape('rect', { x: x0, y: y0, w: w0, h: 0.32, fill: { color: '3E4A43' }, line: { type: 'none' } });
      s.addText('Cisco Packet Tracer — Lab2_VLANs_YourName.pkt', { x: x0 + 0.15, y: y0, w: 6, h: 0.32, fontSize: 10, color: 'FFFFFF', margin: 0, valign: 'middle', isTextBox: true });
      s.addShape('rect', { x: x0, y: y0 + 0.32, w: w0, h: 0.28, fill: { color: 'E4EAE6' }, line: { type: 'none' } });
      s.addText('File    Edit    Options    View    Tools    Extensions    Window    Help', { x: x0 + 0.15, y: y0 + 0.32, w: 6.6, h: 0.28, fontSize: 10, color: P.text, margin: 0, valign: 'middle', isTextBox: true });
      s.addShape('rect', { x: x0, y: y0 + 0.6, w: w0, h: 0.34, fill: { color: 'EEF2EF' }, line: { type: 'none' } });
      for (let i = 0; i < 10; i++) s.addShape('roundRect', { x: x0 + 0.15 + i * 0.3, y: y0 + 0.66, w: 0.22, h: 0.22, fill: { color: 'C6D1CA' }, line: { type: 'none' }, rectRadius: 0.03 });
      // Logical / Physical + common tools
      const ty = y0 + 1.0;
      s.addShape('rect', { x: x0 + 0.12, y: ty, w: 0.85, h: 0.3, fill: { color: 'FFFFFF' }, line: { color: '9AA5A0', width: 0.75 } });
      s.addText('Logical', { x: x0 + 0.12, y: ty, w: 0.85, h: 0.3, fontSize: 10, bold: true, color: P.dark, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addShape('rect', { x: x0 + 0.97, y: ty, w: 0.85, h: 0.3, fill: { color: 'E4EAE6' }, line: { color: '9AA5A0', width: 0.75 } });
      s.addText('Physical', { x: x0 + 0.97, y: ty, w: 0.85, h: 0.3, fontSize: 10, color: P.muted, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      const tools = ['FaMousePointer', 'FaSearch', 'FaTimes', 'FaStickyNote', 'FaPen', 'FaEnvelope'];
      for (let i = 0; i < tools.length; i++) {
        s.addShape('roundRect', { x: x0 + 4.55 + i * 0.4, y: ty, w: 0.3, h: 0.3, fill: { color: 'FFFFFF' }, line: { color: 'C6D1CA', width: 0.75 }, rectRadius: 0.04 });
        s.addImage({ data: await K.icon(tools[i], i === 5 ? P.gold : '3E4A43'), x: x0 + 4.6 + i * 0.4, y: ty + 0.05, w: 0.2, h: 0.2, altText: tools[i].slice(2) });
      }
      // workspace
      const wy = ty + 0.38;
      s.addShape('rect', { x: x0 + 0.12, y: wy, w: w0 - 0.24, h: 2.0, fill: { color: 'FFFFFF' }, line: { color: 'D5DDD8', width: 0.75 } });
      const cx = x0 + 3.8;
      K.link(s, cx, wy + 0.45, cx, wy + 1.05, { width: 1.5 });
      K.link(s, cx, wy + 1.05, cx - 1.3, wy + 1.6, { width: 1.5 });
      K.link(s, cx, wy + 1.05, cx + 1.3, wy + 1.6, { width: 1.5 });
      await K.dev(s, 'router', cx, wy + 0.42, 0.42, 'R1', null, { labelPos: 'right', labelW: 0.6, labelPt: 10 });
      await K.dev(s, 'switch', cx, wy + 1.05, 0.46, 'S1', null, { labelPos: 'right', labelW: 0.6, labelPt: 10 });
      await K.dev(s, 'pc', cx - 1.3, wy + 1.6, 0.38, 'PC-A', null, { labelPos: 'left', labelW: 0.7, labelPt: 10 });
      await K.dev(s, 'pc', cx + 1.3, wy + 1.6, 0.38, 'PC-B', null, { labelPos: 'right', labelW: 0.7, labelPt: 10 });
      // bottom panels
      const by = wy + 2.1;
      s.addShape('rect', { x: x0 + 0.12, y: by, w: 2.75, h: 1.08, fill: { color: 'EEF2EF' }, line: { color: 'C6D1CA', width: 0.75 } });
      const kinds = [['router', P.dark], ['switch', P.mid], ['pc', '3E4A43'], ['server', '4A5A50'], ['cloud', 'A3ADA8']];
      for (let i = 0; i < kinds.length; i++) s.addImage({ data: await K.device(kinds[i][0], kinds[i][1]), x: x0 + 0.25 + i * 0.5, y: by + 0.12, w: 0.34, h: 0.34, altText: kinds[i][0] });
      s.addText('Network Devices › Routers', { x: x0 + 0.22, y: by + 0.6, w: 2.6, h: 0.3, fontSize: 10, color: P.text, margin: 0, isTextBox: true });
      s.addShape('rect', { x: x0 + 2.97, y: by, w: 2.4, h: 1.08, fill: { color: 'EEF2EF' }, line: { color: 'C6D1CA', width: 0.75 } });
      const models = ['4331', '4321', '2911', '1941'];
      for (let i = 0; i < models.length; i++) {
        s.addImage({ data: await K.device('router', P.dark), x: x0 + 3.1 + i * 0.56, y: by + 0.12, w: 0.32, h: 0.32, altText: 'router ' + models[i] });
        s.addText(models[i], { x: x0 + 3.0 + i * 0.56, y: by + 0.48, w: 0.52, h: 0.25, fontSize: 9, color: P.text, align: 'center', margin: 0, isTextBox: true });
      }
      s.addShape('rect', { x: x0 + 5.47, y: by, w: 1.96, h: 1.08, fill: { color: 'EEF2EF' }, line: { color: 'C6D1CA', width: 0.75 } });
      s.addShape('rect', { x: x0 + 5.57, y: by + 0.12, w: 0.86, h: 0.3, fill: { color: 'FFFFFF' }, line: { color: '9AA5A0', width: 0.75 } });
      s.addText('Realtime', { x: x0 + 5.57, y: by + 0.12, w: 0.86, h: 0.3, fontSize: 9, bold: true, color: P.dark, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addShape('rect', { x: x0 + 6.45, y: by + 0.12, w: 0.88, h: 0.3, fill: { color: 'E4EAE6' }, line: { color: '9AA5A0', width: 0.75 } });
      s.addText('Simulation', { x: x0 + 6.45, y: by + 0.12, w: 0.88, h: 0.3, fontSize: 9, color: P.muted, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addText('▶▶ Fast Forward Time', { x: x0 + 5.57, y: by + 0.55, w: 1.8, h: 0.3, fontSize: 9, color: P.text, margin: 0, isTextBox: true });
      const marks = [[1, x0 + 3.2, y0 + 0.62], [2, x0 + 1.95, ty - 0.03], [3, x0 + 0.25, wy + 0.1], [4, x0 + 4.1, ty - 0.03], [5, x0 + 2.5, by - 0.18], [6, x0 + 7.1, by - 0.18]];
      for (const [n, bx, by2] of marks) K.numBadge(s, n, bx, by2, 0.34);
      K.steps(s, {
        x: 8.45, y: 1.85, w: 4.28, pt: 14, gap: 0.1, badge: P.gold, badgeText: P.deep, maxBottom: 5.95, name: 'workspace',
        items: [
          { h: 'Menu and toolbar', t: 'File › Save As, Undo, Zoom.' },
          { h: 'Logical / Physical tabs', t: 'Stay in Logical: the network diagram.' },
          { h: 'Workspace', t: 'Drag devices here and cable them.' },
          { h: 'Common tools', t: 'Select, Inspect, Delete, Note, Draw, Add Simple PDU.' },
          { h: 'Device-Type Selection box', t: 'Pick a category, then a model.' },
          { h: 'Realtime / Simulation', t: 'Run normally, or step through packets.' },
        ],
      });
      await K.checkWatch(s, { x: 8.45, w: 4.28, tip: 'Save often (Ctrl+S): name files like Lab2_VLANs_YourName.pkt', y: 5.95, h: 0.62, size: 13, title: 'workspace' });
    },
    notes: 'Open Packet Tracer on the projector and point at each numbered area. Positions move slightly between versions 8.x and 9.x, but the names stay the same — hovering over a button shows its name. Ask trainees to save an empty file with the naming pattern now.',
  },
  {
    title: 'How to add devices and connect them with the right cable',
    goal: 'Build the topology on screen. The right cable makes the link light green; the wrong one leaves it red.',
    async render(s, { K, P }) {
      K.steps(s, {
        x: 0.6, y: 1.85, w: 5.75, pt: 14, gap: 0.16, maxBottom: 5.9, name: 'add devices',
        items: [
          { h: 'Add a device', t: 'Bottom-left: Network Devices › Routers, then drag a **4331** onto the workspace. Switches › **2960** and End Devices › **PC** work the same way.' },
          { h: 'Pick a cable', t: 'Click **Connections** (the lightning-bolt icon), then the cable type you need.' },
          { h: 'Connect', t: 'Click the first device and choose its port, then click the second device and choose its port.' },
          { h: 'Read the link lights', t: 'Green = up. Amber = switch port still starting (wait about 30 s or click Fast Forward Time). Red = down.' },
        ],
      });
      const x = 6.7, w = 6.03;
      s.addText('Which cable?', { x, y: 1.85, w, h: 0.32, fontSize: 15, bold: true, color: P.dark, margin: 0, isTextBox: true });
      const rows = [
        { name: 'Copper Straight-Through', use: 'different device types: PC–switch, switch–router', line: { color: '333333' } },
        { name: 'Copper Cross-Over', use: 'same device types: switch–switch, router–router, PC–PC (and PC–router)', line: { color: '333333', dash: 'dash' } },
        { name: 'Console', use: 'PC RS 232 port → router or switch Console port, to reach the CLI', line: { color: P.console, width: 2.5 } },
        { name: 'Serial DCE / DTE', use: 'router–router WAN link (the router needs a serial module)', line: { color: P.serial }, bolt: P.serial },
        { name: 'Fiber', use: 'fibre ports: long or fast links between switches', line: { color: 'E07B00' } },
        { name: 'Automatic', use: 'Packet Tracer chooses for you — avoid it in assessments', bolt: P.gold },
      ];
      let y = 2.27;
      for (const r of rows) {
        s.addShape('roundRect', { x, y, w, h: 0.58, fill: { color: P.tint2 }, line: { color: P.border, width: 0.75 }, rectRadius: 0.05 });
        if (r.line) K.link(s, x + 0.15, y + 0.29, x + 1.05, y + 0.29, { color: r.line.color, width: r.line.width || 2.25, dash: r.line.dash });
        if (r.bolt) s.addImage({ data: await K.icon('FaBolt', r.bolt), x: x + 0.47, y: y + 0.15, w: 0.27, h: 0.27, altText: 'lightning' });
        s.addText(K.runs(`**${r.name}** — ${r.use}`, { color: P.text, fontSize: 13 }), { x: x + 1.2, y: y + 0.02, w: w - 1.3, h: 0.54, valign: 'middle', margin: 0, isTextBox: true, fontSize: 13 });
        y += 0.62;
      }
      await K.checkWatch(s, { watch: 'Red light on a router link even with the right cable? Router ports stay off until you type `no shutdown` (part 03).', title: 'cables' });
    },
    notes: 'Rule of thumb: “different devices – straight; same devices – cross”. A PC and a router count as the same kind (both are hosts), so a direct PC–router link needs a cross-over. Show the amber light on a new switch link and use Fast Forward Time.',
  },
  {
    title: 'How to open the command line (CLI) of a router or switch',
    goal: 'Reach the Cisco IOS command line — the way you will configure everything in this workbook.',
    async render(s, { K, P }) {
      K.card(s, { x: 0.6, y: 1.85, w: 6.0, h: 1.12, head: 'Quick way — the CLI tab', body: ['Click the router or switch → **CLI** tab → click inside the black window and press **Enter**.'] });
      K.card(s, { x: 0.6, y: 3.12, w: 6.0, h: 1.38, head: 'Real-life way — a console cable', body: ['Console cable: PC **RS 232** → device **Console**. Then PC › Desktop › **Terminal** → OK (keep 9600 bits/s) → press **Enter**.'] });
      K.card(s, { x: 0.6, y: 4.65, w: 6.0, h: 1.25, head: 'The Config tab (a shortcut)', body: ['Forms that type commands for you, shown at the bottom as **Equivalent IOS Commands**. Learn from it, but practise in the CLI.'] });
      K.terminal(s, {
        x: 6.9, y: 1.85, w: 5.83, h: 2.75, pt: 12, title: 'R1  ›  CLI  (end of the start-up messages)', name: 'open cli',
        lines: ['   --- System Configuration Dialog ---', '', 'Would you like to enter the initial', 'configuration dialog? [yes/no]: {{no}}', '', 'Press RETURN to get started!', '', 'Router>{{enable}}', 'Router#'],
      });
      K.card(s, { x: 6.9, y: 4.75, w: 5.83, h: 1.15, fill: P.tint, body: ['Answer **no** — you will configure by hand. `Router>` = user mode (look only); `enable` takes you to `Router#`.'] });
      await K.checkWatch(s, { watch: 'Nothing on screen? Click inside the CLI window and press Enter — the device may still be starting up.', title: 'open cli' });
    },
    notes: 'Demonstrate both ways. The console method matters because it is how a brand-new real device is configured, and assessors like to see it. Point out the Equivalent IOS Commands box in the Config tab as a learning aid only.',
  },
  {
    title: 'How to give a PC an IP address and test it with ping',
    goal: 'Every PC needs an address, mask and default gateway before it can talk. Then prove it with ping.',
    async render(s, { K, P }) {
      const x0 = 0.6, y0 = 1.85, w0 = 5.9, h0 = 2.45;
      s.addShape('roundRect', { x: x0, y: y0, w: w0, h: h0, fill: { color: 'FFFFFF' }, line: { color: '9AA5A0', width: 1 }, rectRadius: 0.05 });
      s.addShape('rect', { x: x0, y: y0, w: w0, h: 0.34, fill: { color: '3E4A43' }, line: { type: 'none' } });
      s.addText('PC-A  ›  Desktop  ›  IP Configuration', { x: x0 + 0.15, y: y0, w: 5, h: 0.34, fontSize: 11, color: 'FFFFFF', bold: true, margin: 0, valign: 'middle', isTextBox: true });
      s.addText([{ text: '○ DHCP      ', options: { color: P.muted } }, { text: '● Static', options: { color: P.dark, bold: true } }], { x: x0 + 0.2, y: y0 + 0.42, w: 4, h: 0.3, fontSize: 12, margin: 0, valign: 'middle', isTextBox: true });
      const fields = [['IPv4 Address', '192.168.1.10'], ['Subnet Mask', '255.255.255.0'], ['Default Gateway', '192.168.1.1'], ['DNS Server', '192.168.50.10']];
      fields.forEach(([k, v], i) => {
        const fy = y0 + 0.8 + i * 0.4;
        s.addText(k, { x: x0 + 0.2, y: fy, w: 1.8, h: 0.32, fontSize: 12, color: P.text, margin: 0, valign: 'middle', isTextBox: true });
        s.addShape('rect', { x: x0 + 2.05, y: fy, w: 3.55, h: 0.32, fill: { color: 'FFFFFF' }, line: { color: 'B5BFB9', width: 0.75 } });
        s.addText(v, { x: x0 + 2.15, y: fy, w: 3.4, h: 0.32, fontSize: 12, fontFace: K.CODE, bold: true, color: P.dark, margin: 0, valign: 'middle', isTextBox: true });
      });
      K.steps(s, {
        x: 0.6, y: 4.45, w: 5.9, pt: 14, gap: 0.08, maxBottom: 5.95, name: 'pc ip',
        items: [
          { t: 'Click the PC → **Desktop** → **IP Configuration**.' },
          { t: 'Choose **Static**, type address, mask and gateway (or **DHCP** — part 06).' },
          { t: 'Close it, open **Command Prompt** and test.' },
        ],
      });
      K.terminal(s, {
        x: 6.8, y: 1.85, w: 5.93, h: 4.05, pt: 11, title: 'PC-A  ›  Command Prompt  (output shortened)', name: 'ping',
        lines: ['C:\\>ipconfig', '   IPv4 Address......: 192.168.1.10', '   Subnet Mask.......: 255.255.255.0', '   Default Gateway...: 192.168.1.1', '', 'C:\\>ping 192.168.1.1', 'Reply from 192.168.1.1: bytes=32 time<1ms TTL=255', 'Reply from 192.168.1.1: bytes=32 time<1ms TTL=255', '   ...', '   Packets: Sent = 4, Received = {{4}}, Lost = {{0}}', '', 'C:\\>tracert 192.168.20.10', '! lists every router on the way'],
      });
      await K.checkWatch(s, { tip: 'No typing: **Add Simple PDU** (closed envelope) → click source → click destination → read the PDU list.', watch: 'The first ping may lose one reply while ARP finds the MAC address. That is normal — ping again.', title: 'pc ip' });
    },
    notes: 'Make trainees say the three numbers aloud: address, mask, gateway. “Request timed out” means no answer; “Destination host unreachable” means a router said it has no route. Show ipconfig before every ping when troubleshooting.',
  },
  {
    title: 'How to watch packets travel in Simulation mode',
    goal: 'Slow the network down and see each packet hop by hop — the best way to understand ARP, DHCP and routing.',
    async render(s, { K, P }) {
      K.steps(s, {
        x: 0.6, y: 1.85, w: 6.1, pt: 14, gap: 0.1, maxBottom: 5.95, name: 'simulation',
        items: [
          { t: 'Click **Simulation** (bottom-right, next to Realtime).' },
          { t: '**Edit Filters** → tick only what you want to see, e.g. **ICMP** and **ARP**.' },
          { t: 'Make traffic: **Add Simple PDU** from PC-A to PC-B, or ping from the Command Prompt.' },
          { t: 'Press **Capture/Forward** for one step, or **Play** to run.' },
          { t: 'Click an envelope (or an Event List row) → the **OSI Model** tab explains each layer.' },
          { t: 'Click **Realtime** to go back to normal.' },
        ],
      });
      const x = 7.0, y = 1.9;
      K.link(s, x + 0.5, y + 0.55, x + 2.85, y + 0.55, { width: 2 });
      K.link(s, x + 2.85, y + 0.55, x + 5.2, y + 0.55, { width: 2 });
      await K.dev(s, 'pc', x + 0.5, y + 0.55, 0.55, 'PC-A', '192.168.1.10');
      await K.dev(s, 'switch', x + 2.85, y + 0.55, 0.62, 'S1');
      await K.dev(s, 'pc', x + 5.2, y + 0.55, 0.55, 'PC-B', '192.168.1.11');
      s.addImage({ data: await K.icon('FaEnvelope', P.gold), x: x + 1.45, y: y + 0.08, w: 0.36, h: 0.3, altText: 'ARP packet' });
      s.addImage({ data: await K.icon('FaEnvelope', P.v20), x: x + 3.85, y: y + 0.08, w: 0.36, h: 0.3, altText: 'ICMP packet' });
      K.dataTable(s, {
        x, y: 3.35, colW: [1.15, 1.45, 1.45, 1.68], pt: 12, name: 'event list', maxBottom: 5.9,
        head: ['Time (s)', 'Last device', 'At device', 'Type'],
        rows: [['0.000', '--', 'PC-A', 'ARP'], ['0.001', 'PC-A', 'S1', 'ARP'], ['0.002', 'S1', 'PC-B', 'ARP'], ['0.003', 'PC-B', 'S1', 'ARP'], ['0.005', 'PC-A', 'S1', 'ICMP']],
      });
      await K.checkWatch(s, { check: 'You should see ARP first (“who has 192.168.1.11?”), then the ICMP echo request and reply.', watch: 'Nothing moves? Tick the protocol in **Edit Filters**, then press **Capture/Forward**.', title: 'simulation' });
    },
    notes: 'Run one ping in Simulation mode with ARP + ICMP filters. Ask: why does ARP happen first? (The PC knows the IP but not the MAC.) Run it again — no ARP this time, because the ARP table now has the entry. This is also how to see DHCP DORA in part 06.',
  },
];

module.exports = { section, slides };
