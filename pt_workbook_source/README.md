# Packet Tracer CLI workbook — source

Builds `Packet_Tracer_CLI_Workbook_0612_451_07A.pptx` (92 slides, every title starting "How to…") in the folder above.

```bash
npm install
node build.js            # writes ../Packet_Tracer_CLI_Workbook_0612_451_07A.pptx
```

- `content/s01_pt.js` … `content/s12_practice.js` — one file per part (slide text, commands, notes). Edit these to change wording or commands.
- `lib/kit.js` — colours, fonts and slide building blocks (command tables, terminals, cards, topology drawing).
- `build.js` — layouts, cover, menu, part dividers and closing slide.

Set `ONLY=s04_vlan,s06_dhcp` to build just some parts while editing.
