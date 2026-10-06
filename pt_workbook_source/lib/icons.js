// Renders react-icons and hand-drawn network device symbols to PNG data URIs for pptxgenjs.
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa');

const cache = new Map();

async function svgToData(svg, size = 256) {
  const buf = await sharp(Buffer.from(svg)).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

// A react-icons glyph, optionally sitting on a filled circle.
async function icon(name, color, opts = {}) {
  const key = `fa:${name}:${color}:${opts.circle || ''}:${opts.pad || ''}`;
  if (cache.has(key)) return cache.get(key);
  const Comp = fa[name];
  if (!Comp) throw new Error('Unknown icon ' + name);
  let svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: '#' + color, size: 256 }));
  if (opts.circle) {
    // Wrap the glyph in a circle: draw circle then nest the icon scaled down.
    const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 512 512';
    const [, , vw, vh] = vb.split(/\s+/).map(Number);
    const pad = opts.pad || 0.26;
    const s = 512 * (1 - 2 * pad);
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="256" fill="#${opts.circle}"/>` +
      `<svg x="${512 * pad}" y="${512 * pad}" width="${s}" height="${s}" viewBox="${vb}" fill="#${color}" color="#${color}" style="color:#${color}">${inner}</svg></svg>`;
    void vw; void vh;
  }
  const data = await svgToData(svg, 256);
  cache.set(key, data);
  return data;
}

// Hand-drawn Cisco-style symbols (flat), so topology diagrams read like Packet Tracer ones.
const DEVICE_SVG = {
  router: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="#${fill}"/>
    <g stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none">
      <line x1="55" y1="45" x2="71.5" y2="28.5"/><line x1="45" y1="55" x2="28.5" y2="71.5"/>
      <line x1="21" y1="21" x2="37.5" y2="37.5"/><line x1="79" y1="79" x2="62.5" y2="62.5"/>
    </g>
    <g fill="#fff">
      <polygon points="80,20 76.45,33.45 66.55,23.55"/><polygon points="20,80 33.45,76.45 23.55,66.55"/>
      <polygon points="46,46 42.45,32.55 32.55,42.45"/><polygon points="54,54 67.45,57.55 57.55,67.45"/>
    </g></svg>`,
  switch: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="3" y="20" width="94" height="60" rx="10" fill="#${fill}"/>
    <g stroke="#fff" stroke-width="7" stroke-linecap="round"><line x1="18" y1="38" x2="66" y2="38"/><line x1="82" y1="62" x2="34" y2="62"/></g>
    <g fill="#fff"><polygon points="84,38 66,27 66,49"/><polygon points="16,62 34,51 34,73"/></g></svg>`,
  mls: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="3" y="20" width="94" height="60" rx="10" fill="#${fill}"/>
    <g stroke="#fff" stroke-width="7" stroke-linecap="round"><line x1="14" y1="38" x2="50" y2="38"/><line x1="64" y1="62" x2="30" y2="62"/></g>
    <g fill="#fff"><polygon points="66,38 50,28 50,48"/><polygon points="14,62 30,52 30,72"/></g>
    <circle cx="80" cy="50" r="13" fill="none" stroke="#E8B92E" stroke-width="6"/></svg>`,
  pc: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="8" y="12" width="84" height="58" rx="6" fill="#${fill}"/>
    <rect x="15" y="19" width="70" height="44" rx="3" fill="#CFE3D4"/>
    <polygon points="40,70 60,70 64,84 36,84" fill="#${fill}"/>
    <rect x="26" y="83" width="48" height="7" rx="3" fill="#${fill}"/></svg>`,
  server: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="22" y="4" width="56" height="92" rx="7" fill="#${fill}"/>
    <g fill="#CFE3D4"><rect x="30" y="16" width="40" height="8" rx="2"/><rect x="30" y="32" width="40" height="8" rx="2"/><rect x="30" y="48" width="40" height="8" rx="2"/></g>
    <circle cx="50" cy="78" r="6" fill="#4CAF50"/></svg>`,
  cloud: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <g fill="#${fill}"><circle cx="32" cy="58" r="20"/><circle cx="52" cy="44" r="25"/><circle cx="72" cy="58" r="19"/><rect x="30" y="56" width="44" height="22" rx="4"/></g></svg>`,
  laptop: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="16" y="18" width="68" height="46" rx="5" fill="#${fill}"/><rect x="22" y="24" width="56" height="34" rx="2" fill="#CFE3D4"/>
    <polygon points="6,70 94,70 88,82 12,82" fill="#${fill}"/></svg>`,
};

async function device(kind, fill) {
  const key = `dev:${kind}:${fill}`;
  if (cache.has(key)) return cache.get(key);
  const data = await svgToData(DEVICE_SVG[kind](fill), 256);
  cache.set(key, data);
  return data;
}

module.exports = { icon, device };
