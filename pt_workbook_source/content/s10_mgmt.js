// Part 10 — management services and IPv6
const section = {
  num: '10', short: 'Management & IPv6', icon: 'FaServer',
  title: 'How to manage devices and add IPv6',
  desc: 'Keep every device on the same clock, send logs to a server, discover neighbours, back up configurations — and switch on IPv6.',
  items: ['set the time and send logs (NTP, Syslog)', 'discover neighbours and allow monitoring (CDP, LLDP, SNMP)', 'back up and restore with TFTP', 'configure basic IPv6 addressing and routing'],
  notes: 'Use the Lab 2/DHCP file with SRV1 (192.168.50.10) on the server LAN: switch on its NTP, SYSLOG and TFTP services first. IPv6 uses a separate two-router file (R1–R2 with one LAN each).',
};

const slides = [
  {
    type: 'command',
    title: 'How to set the time and send logs to a server',
    goal: 'Logs are only useful if every device has the right time and sends its messages to one place.',
    device: 'R1',
    rows: [
      { p: 'R1#', c: 'clock set 09:00:00 6 October 2026', m: 'Set the clock by hand (privileged mode). Fine for one device; NTP keeps every device in step.' },
      { p: 'R1(config)#', c: 'ntp server 192.168.50.10', m: 'Take the time from the NTP server (SRV1), so the logs of all devices line up.' },
      { p: 'R1(config)#', c: 'service timestamps log datetime msec', m: 'Stamp every log message with the date and time.' },
      { p: 'R1(config)#', c: 'logging host 192.168.50.10', m: 'Copy every log message to the Syslog service on SRV1.' },
      { p: 'R1(config)#', c: 'logging trap debugging', m: 'Send all severity levels (0–7) — fine in a lab. Real networks usually send `informational` (6).' },
    ],
    check: '`show ntp status` → “Clock is synchronized”. SRV1 › Services › SYSLOG lists R1’s messages.',
    watch: 'Switch the services on first: SRV1 › Services › NTP and SYSLOG must both be On.',
    notes: 'NTP can take a minute to synchronise — use Fast Forward Time. Generate a log message on purpose (shut and no shut an interface) and find it on SRV1 with the correct timestamp.',
  },
  {
    type: 'command',
    title: 'How to discover neighbours and allow monitoring',
    goal: 'CDP and LLDP show who is connected where; SNMP lets a monitoring tool read each device’s status.',
    device: 'R1',
    rows: [
      { p: 'R1#', c: 'show cdp neighbors', m: 'Lists the Cisco devices plugged into R1: name, model, and the local and remote ports that join them.' },
      { p: 'R1#', c: 'show cdp neighbors detail', m: 'Adds each neighbour’s IP address and IOS version — ideal for mapping a network you don’t know.' },
      { lines: [{ p: 'R1(config)#', c: 'lldp run' }, { p: 'R1#', c: 'show lldp neighbors' }], m: 'LLDP is the open-standard version of CDP (works with other vendors). It is off by default.' },
      { p: 'R1(config)#', c: 'snmp-server community KNP-RO ro', m: 'Monitoring tools that know the community “KNP-RO” may read R1’s information. `ro` = read-only.' },
      { lines: [{ p: 'R1(config)#', c: 'snmp-server location KNP-ICT-MDF-Rack1' }, { p: 'R1(config)#', c: 'snmp-server contact ict@knp.ac.ke' }], m: 'Where the device is and who looks after it — shown on monitoring dashboards.' },
    ],
    check: 'PC › Desktop › MIB Browser: Advanced… (R1’s address, read community KNP-RO), then Get a value.',
    watch: 'CDP and LLDP reveal device details: switch them off on ports facing the Internet (`no cdp enable`).',
    notes: 'Mapping exercise: give trainees an unlabelled topology and let them draw it using only show cdp neighbors on each device.',
  },
  {
    title: 'How to back up and restore a configuration with TFTP',
    goal: 'Keep a copy of every configuration on a server, so a replaced or broken router is restored in minutes.',
    async render(s, { K, P }) {
      K.terminal(s, {
        x: 0.6, y: 1.82, w: 6.95, h: 4.1, pt: 11, title: 'R1  ›  CLI  (sample)', name: 'tftp',
        lines: [
          'R1# copy running-config tftp:',
          'Address or name of remote host []? {{192.168.50.10}}',
          'Destination filename [R1-confg]? {{R1-2026-10-06.cfg}}',
          'Writing running-config...!!',
          '[OK - 1052 bytes]',
          '',
          'R1# copy tftp: running-config',
          'Address or name of remote host []? 192.168.50.10',
          'Source filename []? R1-2026-10-06.cfg',
          'Destination filename [running-config]?',
          '! press Enter to accept',
        ],
      });
      K.steps(s, {
        x: 7.85, y: 1.85, w: 4.88, pt: 14, gap: 0.12, maxBottom: 5.95, name: 'tftp steps',
        items: [
          { h: 'Prepare the server', t: 'SRV1 › Services › TFTP → On.' },
          { h: 'Back up', t: '`copy running-config tftp:` → server address → a file name with device and date.' },
          { h: 'Check', t: 'The file appears in SRV1’s TFTP file list.' },
          { h: 'Restore', t: '`copy tftp: running-config` when a router is replaced or a change goes wrong.' },
        ],
      });
      await K.checkWatch(s, { watch: 'TFTP has no password and no encryption — real networks use SCP or SFTP. Back up after every change.', title: 'tftp' });
    },
    notes: 'A restore merges the file into the running-config; then save it with copy running-config startup-config. Good file names (device + date) make it easy to roll back to a known good version.',
  },
  {
    type: 'command',
    title: 'How to configure basic IPv6 on a router (1 of 2)',
    goal: 'Give R1’s ports IPv6 addresses and turn on IPv6 routing, so PCs can configure themselves (SLAAC).',
    device: 'R1',
    rows: [
      { p: 'R1(config)#', c: 'ipv6 unicast-routing', m: 'Turn on IPv6 routing (off by default). Without it R1 won’t forward IPv6 or advertise its prefixes, so SLAAC fails.' },
      { p: 'R1(config)#', c: 'interface g0/0/0', m: 'The LAN port.' },
      { p: 'R1(config-if)#', c: 'ipv6 address 2001:db8:acad:1::1/64', m: 'A global unicast address. /64 is the standard prefix for every LAN — SLAAC needs 64 host bits.' },
      { p: 'R1(config-if)#', c: 'ipv6 address fe80::1 link-local', m: 'A short, easy link-local address. PCs use it as their default gateway.' },
      { p: 'R1(config-if)#', c: 'no shutdown', m: 'Switch the port on (if it is not on already).' },
      { lines: [{ p: 'R1(config-if)#', c: 'interface g0/0/1' }, { p: 'R1(config-if)#', c: 'ipv6 address 2001:db8:acad:12::1/64' }, { p: 'R1(config-if)#', c: 'ipv6 address fe80::1 link-local' }, { p: 'R1(config-if)#', c: 'no shutdown' }], m: 'The same on the link to R2. (R2 uses ::2 and fe80::2; its LAN is 2001:db8:acad:2::/64.)' },
    ],
    check: '`show ipv6 interface brief` → each port up/up with its FE80::1 and 2001:DB8:… addresses.',
    watch: 'Type the colons carefully: `::` may appear only once in an address.',
    notes: 'IPv4 and IPv6 can run on the same ports at the same time (dual stack). Remind trainees that IPv6 never uses broadcasts — Router Advertisements are multicasts.',
  },
  {
    type: 'command',
    title: 'How to configure basic IPv6 on a router (2 of 2)',
    goal: 'Add routes between the IPv6 LANs, let the PCs configure themselves, and test end to end.',
    device: 'R1 / R2 / PC1',
    rows: [
      { p: 'R1(config)#', c: 'ipv6 route 2001:db8:acad:2::/64 2001:db8:acad:12::2', m: 'A static IPv6 route to R2’s LAN via R2’s address on the shared link — like IPv4, with a prefix length.' },
      { p: 'R2(config)#', c: 'ipv6 route ::/0 2001:db8:acad:12::1', m: 'An IPv6 default route on R2 (`::/0` = every address), back to R1.' },
      { c: '! PC1: IP Configuration › IPv6 › Automatic', comment: true, m: 'The PC builds its own address from R1’s /64 prefix (SLAAC) and uses fe80::1 as its gateway.' },
      { p: 'R1#', c: 'show ipv6 route', m: 'C, L and S routes for IPv6 — read it just like the IPv4 table.' },
      { p: 'C:\\>', c: 'ping 2001:db8:acad:2::10', m: 'From PC1, ping PC2 (static 2001:db8:acad:2::10/64, gateway fe80::2).' },
    ],
    check: '`tracert 2001:db8:acad:2::10` from PC1 passes R1 and then R2.',
    watch: 'SLAAC fails without `ipv6 unicast-routing` — R1 never sends the Router Advertisements PCs need.',
    notes: 'Extension for fast trainees: replace the static routes with OSPFv3, or add IPv4 to the same ports for a dual-stack network.',
  },
];

module.exports = { section, slides };
