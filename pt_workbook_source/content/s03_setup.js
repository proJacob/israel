// Part 03 — basic device set-up, interfaces, SVI, SSH, Lab 1
const section = {
  num: '03', short: 'Basic set-up & SSH', icon: 'FaCogs',
  title: 'How to set up a new router or switch',
  desc: 'The “starter pack” for every Cisco device: name it, secure it, address it, save it — and manage it safely with SSH. (Lab 1)',
  items: ['do the basic set-up on any device', 'save, view and erase a configuration', 'address a router interface', 'read show ip interface brief', 'give a switch a management IP', 'configure many ports at once', 'set up SSH remote access'],
  notes: 'This part follows Lab 1: R1 (4331), S1 (2960), PC-A and PC-B. Every later lab starts with this starter pack, so drill it until trainees can type it from memory.',
};

const slides = [
  {
    type: 'command', tag: 'LAB 1',
    title: 'How to do the basic set-up on any router or switch (1 of 2)',
    goal: 'Name the device, protect privileged mode and add a legal warning. Do this first on every new device.',
    device: 'R1',
    rows: [
      { p: 'Router>', c: 'enable', m: 'Move from user mode (`>`) to privileged mode (`#`). Nothing can be configured from `>`.' },
      { p: 'Router#', c: 'configure terminal', m: 'Enter global configuration mode. From now on, each command changes the live configuration at once.' },
      { p: 'Router(config)#', c: 'hostname R1', m: 'Name the device. The prompt becomes `R1(config)#`, so you always know which device you are on.' },
      { p: 'R1(config)#', c: 'no ip domain-lookup', m: 'Stop IOS treating a typo as a computer name to look up (it freezes the screen for about 30 seconds).' },
      { p: 'R1(config)#', c: 'enable secret Kabete@2026', m: 'The password for `enable`, stored as a secure hash. Never use the old `enable password` — it is stored as plain text.' },
      { p: 'R1(config)#', c: 'banner motd # Authorised access only! #', m: 'A legal warning shown to everyone who connects. The `#` signs mark where the message starts and ends.' },
    ],
    check: 'Type `end`, then `disable`, then `enable` again: R1 must now ask for the password.',
    watch: 'If your message contains #, use another start/end sign, e.g. `banner motd $ … $`.',
    notes: 'Type along with trainees. Ask before each line: “What will change on the screen?” (for hostname: the prompt). Point out that the same commands work on a switch — only the prompt says Switch instead of Router.',
  },
  {
    type: 'command', tag: 'LAB 1',
    title: 'How to do the basic set-up on any router or switch (2 of 2)',
    goal: 'Lock the console port, keep messages tidy, hide passwords and save. The same commands work on a switch.',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'line console 0', m: 'Open the settings of the console port (the light-blue cable). The prompt becomes `(config-line)#`.' },
      { p: 'R1(config-line)#', c: 'password Cons@1234', m: 'Set the console password.' },
      { p: 'R1(config-line)#', c: 'login', m: 'Make the console ask for that password. Without `login`, the password is never requested.' },
      { p: 'R1(config-line)#', c: 'logging synchronous', m: 'Stop system messages breaking into the middle of what you are typing.' },
      { p: 'R1(config-line)#', c: 'exec-timeout 5 0', m: 'Log out a session that is idle for 5 minutes 0 seconds.' },
      { lines: [{ p: 'R1(config-line)#', c: 'exit' }, { p: 'R1(config)#', c: 'service password-encryption' }], m: 'Back to global mode, then hide the console and VTY passwords in `show running-config` (weak: it only stops onlookers).' },
      { lines: [{ p: 'R1(config)#', c: 'end' }, { p: 'R1#', c: 'copy running-config startup-config' }], m: 'Back to privileged mode and save. Press Enter to accept the file name.' },
    ],
    check: 'Type `exit` to log out, then press Enter: the banner appears and the console asks for a password.',
    watch: 'Passwords are case-sensitive. Record them in your lab notes — a forgotten secret means password recovery.',
    notes: 'Common mistake: setting the console password but forgetting login. Demonstrate it: remove login, log out, and show that no password is asked. Then put it back.',
  },
  {
    type: 'command',
    title: 'How to save, view and erase a configuration',
    goal: 'The live configuration (RAM) is lost at power-off. The saved one (NVRAM) is loaded at every start-up.',
    device: 'R1',
    rows: [
      { p: 'R1#', c: 'copy running-config startup-config', m: 'Save the live configuration to NVRAM so it survives a restart. Press Enter to accept `[startup-config]`.' },
      { p: 'R1#', c: 'write memory', m: 'A shorter way to make exactly the same save (`wr` works too).' },
      { p: 'R1#', c: 'show running-config', m: 'Show the live configuration. Space = next page, Enter = next line, Q = quit.' },
      { p: 'R1#', c: 'show startup-config', m: 'Show the saved configuration. Anything missing here is not saved yet.' },
      { lines: [{ p: 'R1#', c: 'erase startup-config' }, { p: 'S1#', c: 'delete flash:vlan.dat' }], m: 'Wipe the saved configuration to start a lab again. A switch keeps its VLANs in `vlan.dat` — delete that too.' },
      { p: 'R1#', c: 'reload', m: 'Restart the device. After an erase, answer `no` to “Save?” so it starts empty.' },
    ],
    check: 'After saving, `show startup-config` shows your hostname and passwords.',
    watch: 'Anything not saved is lost when the device reloads or loses power — save after every step that works.',
    notes: 'Saving the .pkt file stores the whole lab, but assessors check that each device’s startup-config is saved too, and real devices need it. Teach both habits: Ctrl+S for the file, copy run start for each device.',
  },
  {
    type: 'command', tag: 'LAB 1',
    title: 'How to configure a router interface with an IP address',
    goal: 'Give R1’s LAN port an address so the PCs on that LAN can use it as their default gateway (192.168.1.0/24).',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'interface g0/0/0', m: 'Select the port (full name GigabitEthernet0/0/0). The prompt becomes `(config-if)#`.' },
      { p: 'R1(config-if)#', c: 'description LAN to S1 - ICT Lab', m: 'A label for people. It changes nothing, but helps whoever troubleshoots later.' },
      { p: 'R1(config-if)#', c: 'ip address 192.168.1.1 255.255.255.0', m: 'The port’s address and subnet mask. PCs on this LAN use 192.168.1.1 as their default gateway.' },
      { p: 'R1(config-if)#', c: 'no shutdown', m: 'Switch the port on. Router ports start “administratively down” — the number-one cause of red links.' },
      { p: 'R1(config-if)#', c: 'exit', m: 'Back to global configuration mode.' },
    ],
    check: '`show ip interface brief` → G0/0/0 192.168.1.1 up up. From PC-A, `ping 192.168.1.1` gets replies.',
    watch: 'Each router port needs its own subnet, and the PCs’ gateway must match this address exactly.',
    notes: 'Ask: why does a router need an IP on each port but a switch does not? (A router joins different networks; a switch forwards inside one.)',
  },
  {
    title: 'How to read show ip interface brief',
    goal: 'The most-used command in this workbook. Each row is a port; two columns tell you what is wrong.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: K.CW, h: 1.62, pt: 12, title: 'R1  ›  CLI  (shortened)', name: 'sh ip int br',
        lines: [
          'R1# show ip interface brief',
          'Interface              IP-Address      OK? Method Status                Protocol',
          'GigabitEthernet0/0/0   192.168.1.1     YES {{manual}} {{up}}                    {{up}}',
          'GigabitEthernet0/0/1   unassigned      YES unset  {{administratively down}} down',
        ],
      });
      K.dataTable(s, {
        y: 3.62, colW: [2.45, 1.2, 5.45, 3.03], pt: 13, name: 'status table', maxBottom: 5.92,
        head: ['Status', 'Protocol', 'What it means', 'Usual fix'],
        rows: [
          ['up', 'up', 'Working: cable and port are fine (Layers 1 and 2)', '—'],
          ['administratively down', 'down', 'The port is switched off (never enabled, or `shutdown` typed)', '`no shutdown`'],
          ['down', 'down', 'No signal: cable missing or wrong type, or the far end is off', 'Check the cable and the other end'],
          ['up', 'down', 'Signal OK, but the two ends disagree (e.g. encapsulation)', 'Compare the settings at both ends'],
        ],
      });
      await K.checkWatch(s, { tip: 'Method: `manual` = you typed the address, `DHCP` = it was leased, `unset` = no address yet.', title: 'sh ip int br' });
    },
    notes: 'Read the output aloud row by row. Then break the network on purpose (unplug a cable, shut a port) and let trainees diagnose from the Status and Protocol columns alone.',
  },
  {
    type: 'command', tag: 'LAB 1',
    title: 'How to give a switch a management IP address',
    goal: 'A switch forwards frames without any IP. Give it one only so you can manage it over the network (ping, SSH).',
    device: 'S1',
    rows: [
      { p: 'S1(config)#', c: 'interface vlan 1', m: 'Open the switch virtual interface (SVI) of VLAN 1 — a virtual port inside the switch.' },
      { p: 'S1(config-if)#', c: 'ip address 192.168.1.2 255.255.255.0', m: 'The switch’s management address, in the same subnet as the PCs of that VLAN.' },
      { p: 'S1(config-if)#', c: 'no shutdown', m: 'SVIs start switched off. It turns up/up once a port in that VLAN is up.' },
      { p: 'S1(config-if)#', c: 'exit', m: 'Back to global configuration mode.' },
      { p: 'S1(config)#', c: 'ip default-gateway 192.168.1.1', m: 'Where the switch sends replies for other subnets: R1’s LAN address.' },
    ],
    check: '`show ip interface brief` → Vlan1 192.168.1.2 up up. PC-A: `ping 192.168.1.2` gets replies.',
    watch: 'A Layer 2 switch has no routing table: without `ip default-gateway` it can only reply inside its own subnet.',
    notes: 'Contrast with the router: switch ports are on by default and need no IP; only the SVI does. In part 04 the management address moves to VLAN 99.',
  },
  {
    type: 'command', tag: 'LAB 1',
    title: 'How to configure many switch ports at once',
    goal: '`interface range` applies the same commands to a group of ports — faster, and fewer mistakes.',
    device: 'S1',
    rows: [
      { p: 'S1(config)#', c: 'interface range fa0/1 - 24', m: 'Select ports Fa0/1 to Fa0/24 together. The prompt becomes `(config-if-range)#`.' },
      { p: 'S1(config-if-range)#', c: 'description USER PORT', m: 'Every selected port gets the same label.' },
      { p: 'S1(config-if-range)#', c: 'interface range fa0/1 - 5, fa0/10', m: 'Mix ranges and single ports, separated by commas.' },
      { lines: [{ p: 'S1(config-if-range)#', c: 'interface range fa0/3 - 24, g0/2' }, { p: 'S1(config-if-range)#', c: 'shutdown' }], m: 'Switch off every port you are not using, so nobody can plug in. (Lab 1 uses Fa0/1, Fa0/2 and G0/1.)' },
      { lines: [{ p: 'S1(config-if-range)#', c: 'interface fa0/3' }, { p: 'S1(config-if)#', c: 'no shutdown' }], m: 'Re-enable a single port when a new user needs it.' },
    ],
    check: '`show ip interface brief` lists the unused ports as administratively down.',
    watch: 'Don’t shut the uplink to the router (G0/1 in Lab 1), or you lose contact with the rest of the network.',
    notes: 'Spaces around the dash are optional in Packet Tracer (fa0/1-24 also works). Shutting unused ports is free, effective security — assessors look for it.',
  },
  {
    type: 'command', tag: 'LAB 1',
    title: 'How to set up SSH for secure remote access (1 of 2)',
    goal: 'SSH lets you manage a device over the network, encrypted. It needs a hostname, a domain name, a user and RSA keys.',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'ip domain-name knp.ac.ke', m: 'Needed to name the encryption keys (R1.knp.ac.ke). RSA keys cannot be made without it.' },
      { p: 'R1(config)#', c: 'username netadmin privilege 15 secret N3t@dmin26', m: 'A personal admin account stored on the device. Privilege 15 = full control straight after login.' },
      { p: 'R1(config)#', c: 'username helpdesk privilege 1 secret H3lp@desk26', m: 'A help-desk account: it logs in at `R1>` (look only) and needs the enable secret to go further.' },
      { p: 'R1(config)#', c: 'crypto key generate rsa general-keys modulus 1024', m: 'Create the RSA keys that encrypt SSH; this also turns SSH on. Use at least 1024 bits (2048 on real kit).' },
      { p: 'R1(config)#', c: 'ip ssh version 2', m: 'Allow only SSH version 2 — version 1 has known weaknesses.' },
    ],
    check: '`show ip ssh` → “SSH Enabled - version 2.0”.',
    watch: '“Please define a hostname other than Router” or “…a domain-name first”? Set them, then generate the keys again.',
    notes: 'Remind trainees of the four ingredients: hostname, domain name, user account, RSA keys. If any is missing, SSH will not start.',
  },
  {
    type: 'command', tag: 'LAB 1',
    title: 'How to set up SSH for secure remote access (2 of 2)',
    goal: 'Tell the remote-access (VTY) lines to accept SSH only, using the local accounts. Then test from a PC.',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'line vty 0 4', m: 'Open the 5 virtual lines used by remote sessions (a 2960 switch has 16: `line vty 0 15`).' },
      { p: 'R1(config-line)#', c: 'transport input ssh', m: 'Accept SSH only. Telnet is refused because it sends passwords as plain text.' },
      { p: 'R1(config-line)#', c: 'login local', m: 'Ask for a username and password from the local accounts (the `username` commands).' },
      { p: 'R1(config-line)#', c: 'exec-timeout 5 0', m: 'Log out remote sessions that are idle for 5 minutes.' },
      { lines: [{ p: 'R1(config-line)#', c: 'end' }, { p: 'R1#', c: 'copy running-config startup-config' }], m: 'Back to privileged mode and save.' },
      { lines: [{ p: 'C:\\>', c: 'ssh -l netadmin 192.168.1.1' }, { c: '! then type the password (it is not shown)', comment: true }], m: 'Test from PC-A › Command Prompt. netadmin lands at `R1#`; helpdesk lands at `R1>`.' },
    ],
    check: 'From PC-A, SSH works and `telnet 192.168.1.1` fails. On a switch, secure `line vty 0 15` the same way.',
    watch: 'Use `login local`, not `login`: with `login` IOS wants a line password you never set, so every login fails.',
    notes: 'Let a trainee log in as helpdesk and try configure terminal — it fails until they enter enable. That shows privilege levels in action.',
  },
  {
    title: 'How to practise: Lab 1 — basic router and switch set-up',
    tag: 'LAB 1',
    goal: 'Build this network and apply everything in this part. Then prove it works with the checks at the bottom.',
    async render(s, { K, P }) {
      // topology
      const cx = 3.3;
      K.link(s, cx, 2.45, cx, 3.7, { width: 2.25 });
      K.link(s, cx, 3.7, cx - 1.7, 4.95, { width: 2.25 });
      K.link(s, cx, 3.7, cx + 1.7, 4.95, { width: 2.25 });
      K.link(s, cx + 1.7, 4.62, cx + 1.7, 2.35, { color: P.console, width: 2, dash: 'dash' });
      K.link(s, cx + 1.7, 2.35, cx + 0.33, 2.35, { color: P.console, width: 2, dash: 'dash' });
      await K.dev(s, 'router', cx, 2.35, 0.62, 'R1', '4331', { labelPos: 'left', labelW: 1.0 });
      await K.dev(s, 'switch', cx, 3.7, 0.7, 'S1', '2960', { labelPos: 'left', labelW: 1.0 });
      await K.dev(s, 'pc', cx - 1.7, 4.95, 0.6, 'PC-A');
      await K.dev(s, 'pc', cx + 1.7, 4.95, 0.6, 'PC-B');
      K.tag(s, 'G0/0/0', cx + 0.05, 2.75, { w: 0.75, align: 'left' });
      K.tag(s, 'G0/1', cx + 0.05, 3.25, { w: 0.6, align: 'left' });
      K.tag(s, 'Fa0/1', cx - 1.55, 4.0, { w: 0.7 });
      K.tag(s, 'Fa0/2', cx + 0.75, 4.0, { w: 0.7 });
      K.tag(s, 'console cable', cx + 1.78, 3.2, { w: 1.2, color: '1C7FA6', bold: true, align: 'left' });
      K.dataTable(s, {
        x: 6.2, y: 1.85, colW: [1.25, 1.35, 2.15, 1.78], pt: 13, name: 'lab1 addressing', maxBottom: 4.0,
        head: ['Device', 'Interface', 'IP address / mask', 'Gateway'],
        rows: [['R1', 'G0/0/0', '192.168.1.1 /24', '—'], ['S1', 'VLAN 1', '192.168.1.2 /24', '192.168.1.1'], ['PC-A', 'NIC', '192.168.1.10 /24', '192.168.1.1'], ['PC-B', 'NIC', '192.168.1.11 /24', '192.168.1.1']],
      });
      K.card(s, {
        x: 6.2, y: 4.15, w: 6.53, h: 2.65, head: 'Tasks', pt: 14, psa: 2,
        body: [
          { t: 'Build and cable it (straight-through; console cable PC-B → R1).', bullet: true, num: true },
          { t: 'Basic set-up on R1 and S1: hostname, secret, console, banner.', bullet: true, num: true },
          { t: 'Address R1 G0/0/0, S1 VLAN 1 and both PCs; shut unused ports.', bullet: true, num: true },
          { t: 'SSH on R1 and S1 (user netadmin); save both devices.', bullet: true, num: true },
          { t: 'Prove it: all pings work, SSH works, Telnet is refused.', bullet: true, num: true },
        ],
      });
      K.card(s, { x: 0.6, y: 5.75, w: 5.3, h: 1.05, fill: P.tint, body: ['Use the console cable for the first set-up of R1 — the way a brand-new real router is configured.'] });
    },
    notes: 'Allow about 4 hours including the SSH test. Assess with the checklist: correct cabling, own CLI typing, saved configs, successful tests, and the trainee explaining each command.',
  },
];

module.exports = { section, slides };
