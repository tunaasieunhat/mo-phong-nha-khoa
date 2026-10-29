/* ================== ASSETS 1: SVG helpers + isometric world sprites ==================
   Every sprite is generated as an SVG string (exportable as a file) and rasterised once into an Image.
   Sprite coordinates: world pixels, origin = the object's anchor on the floor; iso tile = 64 x 32. */
const OUT = '#5b3818';
const ASSETS = {}; // key -> { img, x0, y0, w, h, svg }
const ASSET_DEFS = {};
function hx(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const t = k < 0 ? 0 : 255, p = Math.abs(k);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
const ipt = (i, j, z = 0) => [(i - j) * 32, (i + j) * 16 - z];
const pts = (a) => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
const pg = (a, fill, o = {}) => `<polygon points="${pts(a)}" fill="${fill}"${o.ns ? '' : ` stroke="${o.st || OUT}" stroke-width="${o.sw || 1.3}" stroke-linejoin="round" stroke-opacity="${o.so || 0.75}"`}${o.op ? ` opacity="${o.op}"` : ''}/>`;
function sbox(i, j, w, d, h, z, c, o = {}) {
  const e0 = ipt(i, j + d, z), c0 = ipt(i + w, j + d, z), b0 = ipt(i + w, j, z), a1 = ipt(i, j, z + h), b1 = ipt(i + w, j, z + h), c1 = ipt(i + w, j + d, z + h), e1 = ipt(i, j + d, z + h);
  let s = '';
  if (!o.noL) s += pg([e0, c0, c1, e1], o.left || c, o);
  if (!o.noR) s += pg([c0, b0, b1, c1], o.right || hx(c, -0.16), o);
  s += pg([a1, b1, c1, e1], o.top || hx(c, 0.16), o);
  if (o.hl) s += `<polyline points="${pts([e1, a1, b1])}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round"/>`;
  return s;
}
function scyl(i, j, r, h, z, c, o = {}) {
  const [cx, cy] = ipt(i, j, z), rx = r * 45.25, ry = r * 22.6, st = `stroke="${OUT}" stroke-width="1.3" stroke-opacity=".75"`;
  return `<path d="M${cx - rx},${cy - h} L${cx - rx},${cy} A${rx},${ry} 0 0 0 ${cx + rx},${cy} L${cx + rx},${cy - h} Z" fill="${o.side || c}" ${st}/>` +
    (o.band ? `<path d="M${cx - rx},${cy - h * 0.55} A${rx},${ry} 0 0 0 ${cx + rx},${cy - h * 0.55}" fill="none" stroke="${o.band}" stroke-width="3"/>` : '') +
    `<ellipse cx="${cx}" cy="${cy - h}" rx="${rx}" ry="${ry}" fill="${o.top || hx(c, 0.18)}" ${st}/>`;
}
const shadowSvg = (cx, cy, rx, ry, op = 0.22) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#24400c" opacity="${op}"/>`;
const SCALE_FOR = (w, h) => (w * h > 40000 ? 2.2 : 2.6);
function svgDoc(x0, y0, w, h, body, defs = '', sc) {
  sc = sc || SCALE_FOR(w, h);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${w} ${h}" width="${Math.round(w * sc)}" height="${Math.round(h * sc)}">${defs ? '<defs>' + defs + '</defs>' : ''}${body}</svg>`;
}
const grad = (id, c1, c2, vert = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vert ? 0 : 1}" y2="${vert ? 1 : 0}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
const rgrad = (id, c1, c2, cx = 0.35, cy = 0.3) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.75"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;
function def(key, x0, y0, w, h, fn) { ASSET_DEFS[key] = () => { const r = fn(); return { x0, y0, w, h, svg: svgDoc(x0, y0, w, h, r.body || r, r.defs || '') }; }; }

/* ---------- dental chair (basic + premium) ---------- */
function chairSvg(prem) {
  const up = prem ? '#f3f6fb' : '#36b3a4', acc = prem ? '#3b6fd8' : '#2a8f83', base = prem ? '#c9d2dc' : '#6b7280';
  let s = shadowSvg(0, 14, 78, 30, 0.2);
  s += scyl(0.05, 0.1, 0.32, 3, 0, base) + scyl(0.05, 0.1, 0.2, 14, 3, hx(base, 0.1));
  // assistant side: spittoon + suction
  s += sbox(-1.05, -0.3, 0.42, 0.55, 30, 0, '#f4f7f8', { hl: 1 });
  const [bx, by] = ipt(-0.84, -0.02, 30); s += `<ellipse cx="${bx}" cy="${by}" rx="12" ry="6" fill="#bfe6f5" stroke="${OUT}" stroke-opacity=".6"/><ellipse cx="${bx}" cy="${by}" rx="6" ry="3" fill="#7cc4e4"/>`;
  s += `<path d="M${bx + 10},${by - 4} q8,-14 2,-24" fill="none" stroke="#9aa7b2" stroke-width="3" stroke-linecap="round"/>`;
  // seat, leg rest, back rest, head rest
  s += sbox(-0.42, -0.25, 0.84, 1.15, 9, 16, up, { hl: 1 });
  s += sbox(-0.42, 0.9, 0.84, 0.78, 7, 12, up, { hl: 1 });
  const b1 = ipt(-0.42, -0.25, 25), b2 = ipt(0.42, -0.25, 25), b3 = ipt(0.42, -0.86, 62), b4 = ipt(-0.42, -0.86, 62), b5 = ipt(0.42, -0.86, 54), b6 = ipt(0.42, -0.25, 17);
  s += pg([b6, b2, b3, b5], hx(up, -0.18)) + pg([b1, b2, b3, b4], hx(up, 0.1));
  s += `<polyline points="${pts([ipt(-0.32, -0.35, 30), ipt(-0.32, -0.8, 57)])}" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/>`;
  s += sbox(-0.25, -1.0, 0.5, 0.2, 9, 60, hx(up, -0.05), { hl: 1 });
  s += sbox(0.42, -0.1, 0.1, 0.7, 4, 27, acc);
  if (prem) s += `<polyline points="${pts([ipt(-0.42, 0.9, 25), ipt(0.42, 0.9, 25)])}" stroke="${acc}" stroke-width="3"/>`;
  // doctor unit: arm + tray + handpieces
  const p0 = ipt(0.3, 0.2, 18), p1 = ipt(0.85, 0.35, 34);
  s += `<path d="M${p0[0]},${p0[1]} L${p1[0]},${p1[1]}" stroke="#9aa7b2" stroke-width="5" stroke-linecap="round"/>`;
  s += sbox(0.6, 0.12, 0.62, 0.5, 5, 34, '#e8eef2', { hl: 1 });
  for (let k = 0; k < 3; k++) { const [hx1, hy1] = ipt(0.72 + k * 0.17, 0.18, 39); s += `<path d="M${hx1},${hy1} q-6,14 -2,28" fill="none" stroke="#3c4650" stroke-width="2"/><rect x="${hx1 - 2}" y="${hy1 - 9}" width="4" height="11" rx="2" fill="${['#ffcb3d', '#4fb5e8', '#f28fb5'][k]}" stroke="${OUT}" stroke-width=".8"/>`; }
  // light pole + arm + lamp
  const lp = ipt(-0.82, -0.4, 30), la = ipt(-0.82, -0.4, 116), lh = ipt(0.12, 0.15, 112);
  s += `<path d="M${lp[0]},${lp[1]} L${la[0]},${la[1]} Q${(la[0] + lh[0]) / 2},${la[1] - 18} ${lh[0]},${lh[1]}" fill="none" stroke="#e8eef2" stroke-width="6" stroke-linecap="round"/><path d="M${lp[0]},${lp[1]} L${la[0]},${la[1]} Q${(la[0] + lh[0]) / 2},${la[1] - 18} ${lh[0]},${lh[1]}" fill="none" stroke="#9aa7b2" stroke-width="1.5"/>`;
  s += `<ellipse cx="${lh[0]}" cy="${lh[1] + 4}" rx="19" ry="10" fill="#fff" stroke="${OUT}" stroke-opacity=".7" stroke-width="1.3" transform="rotate(12 ${lh[0]} ${lh[1] + 4})"/><ellipse cx="${lh[0]}" cy="${lh[1] + 7}" rx="12" ry="5" fill="#fff2a6" transform="rotate(12 ${lh[0]} ${lh[1] + 7})"/>`;
  // foot pedal
  const fp = ipt(0.75, 1.1, 0); s += `<ellipse cx="${fp[0]}" cy="${fp[1]}" rx="9" ry="4.5" fill="#3c4650" stroke="${OUT}" stroke-opacity=".6"/>`;
  return s;
}
def('chair_basic', -95, -150, 190, 200, () => chairSvg(false));
def('chair_premium', -95, -150, 190, 200, () => chairSvg(true));

/* ---------- reception desk (anchor = back-left corner) ---------- */
def('desk', -40, -70, 170, 135, () => {
  let s = shadowSvg(48, 44, 92, 26, 0.18);
  s += sbox(0, 0, 3, 0.8, 30, 0, '#7fd6c8', { top: '#fff1d6', hl: 1 });
  s += sbox(0, 0.8, 3, 0.06, 6, 30, '#c98b4f');
  const [tx, ty] = ipt(1.5, 0.86, 15); s += `<g transform="matrix(0.894,0.447,0,1,${tx},${ty})"><rect x="-22" y="-9" width="44" height="18" rx="9" fill="#fff" opacity=".9"/><path d="M-6,-5 q-3,-3 0,-4 q3,1 6,0 q3,-1 3,4 q0,4 -2,7 l-1,5 q-1,2 -2,-1 l-1,-3 l-1,3 q-1,3 -2,1 l-1,-5 q-2,-3 -2,-7" fill="#fff" stroke="#3fb6a8" stroke-width="1.2"/><text x="4" y="4" font-family="Baloo 2,Nunito,sans-serif" font-size="7" font-weight="800" fill="#2a8f83">LỄ TÂN</text></g>`;
  s += sbox(1.0, 0.15, 0.55, 0.12, 22, 30, '#2b2f36', { top: '#3c4650' }) + sbox(1.15, 0.2, 0.25, 0.25, 3, 30, '#6b7280');
  const [sx, sy] = ipt(1.28, 0.28, 46); s += `<polygon points="${pts([ipt(1.02, 0.28, 34), ipt(1.53, 0.28, 34), ipt(1.53, 0.28, 50), ipt(1.02, 0.28, 50)])}" fill="#7fd0f5" opacity=".9"/>`; void sx; void sy;
  s += sbox(1.05, 0.45, 0.5, 0.2, 2, 30, '#e8eef2');
  const [bx, by] = ipt(2.4, 0.45, 30); s += `<ellipse cx="${bx}" cy="${by}" rx="6" ry="3" fill="#c98500"/><path d="M${bx - 6},${by} a6,6 0 0 1 12,0" fill="#ffcb3d" stroke="${OUT}" stroke-width=".8"/><circle cx="${bx}" cy="${by - 7}" r="1.6" fill="#c98500"/>`;
  s += scyl(0.35, 0.4, 0.13, 8, 30, '#e07b4f') + `<g fill="#5aa82f">${[[-5, -48], [3, -50], [-1, -54], [6, -46]].map(([dx, dy]) => { const [px, py] = ipt(0.35, 0.4, 0); return `<ellipse cx="${px + dx}" cy="${py + dy}" rx="3.5" ry="6" transform="rotate(${dx * 6} ${px + dx} ${py + dy})"/>`; }).join('')}</g>`;
  s += sbox(2.0, 0.1, 0.35, 0.25, 10, 30, '#ffffff') + `<g transform="matrix(0.894,0.447,0,1,${ipt(2.02, 0.35, 38)[0]},${ipt(2.02, 0.35, 38)[1]})"><rect x="1" y="0" width="5" height="7" fill="#ec5b4b"/><rect x="8" y="0" width="5" height="7" fill="#4fb5e8"/><rect x="15" y="0" width="5" height="7" fill="#78c443"/></g>`;
  return s;
});

/* ---------- seating ---------- */
def('bench', -50, -55, 85, 85, () => shadowSvg(-4, 8, 40, 16, 0.16) + sbox(-0.4, -0.55, 0.2, 1.1, 34, 0, '#d98e4f', { hl: 1 }) + sbox(-0.2, -0.55, 0.75, 1.1, 8, 4, '#f2b36d', { hl: 1 }) + sbox(-0.2, -0.55, 0.06, 1.1, 4, 0, '#a8692f') + sbox(0.49, -0.55, 0.06, 1.1, 4, 0, '#a8692f'));
def('sofa', -60, -60, 100, 115, () => {
  const c = '#5b8fd8'; let s = shadowSvg(-6, 20, 50, 20, 0.16);
  s += sbox(-0.45, -0.7, 0.25, 2.2, 36, 0, hx(c, -0.08), { hl: 1 }) + sbox(-0.2, -0.7, 0.8, 0.22, 24, 0, hx(c, -0.04)) + sbox(-0.2, 1.28, 0.8, 0.22, 24, 0, hx(c, -0.04), { hl: 1 });
  s += sbox(-0.2, -0.48, 0.78, 0.86, 13, 4, c, { hl: 1 }) + sbox(-0.2, 0.42, 0.78, 0.86, 13, 4, c, { hl: 1 });
  return s;
});

/* ---------- plants ---------- */
def('plant_a', -34, -82, 68, 96, () => {
  let s = shadowSvg(0, 6, 20, 9, 0.2) + scyl(0, 0, 0.27, 18, 0, '#e07b4f', { band: '#c4643b' });
  const leaf = (x, y, a, l, c) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0,0 C${-l * 0.45},${-l * 0.25} ${-l * 0.42},${-l * 0.85} 0,${-l} C${l * 0.42},${-l * 0.85} ${l * 0.45},${-l * 0.25} 0,0 Z" fill="${c}" stroke="${OUT}" stroke-opacity=".5" stroke-width="1"/><path d="M0,-2 L0,${-l * 0.9}" stroke="#2f7a1a" stroke-width="1"/><path d="M${-l * 0.2},${-l * 0.45} l6,2 M${l * 0.2},${-l * 0.6} l-6,2" stroke="#2f7a1a" stroke-width="1"/></g>`;
  s += leaf(-4, -18, -50, 34, '#4f9e2a') + leaf(4, -18, 48, 34, '#4f9e2a') + leaf(0, -18, -12, 44, '#5fb532') + leaf(2, -18, 22, 40, '#6fbe3a') + leaf(-2, -18, -30, 30, '#78c843');
  return s;
});
def('plant_b', -30, -112, 60, 126, () => {
  let s = shadowSvg(0, 6, 18, 8, 0.2) + scyl(0, 0, 0.24, 20, 0, '#f4f1e6', { band: '#3fb6a8' }) + `<path d="M0,-20 L0,-60 M0,-48 L-8,-62 M0,-40 L9,-56" stroke="#8a5a2b" stroke-width="3" stroke-linecap="round"/>`;
  [[0, -78, 20, '#4f9e2a'], [-14, -66, 15, '#5fb532'], [13, -64, 15, '#5fb532'], [-6, -92, 14, '#6fbe3a'], [7, -88, 13, '#78c843'], [0, -102, 9, '#8fd655']].forEach(([x, y, r, c]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${OUT}" stroke-opacity=".35"/>`; });
  return s;
});

/* ---------- wall & equipment ---------- */
def('tank', -40, -90, 100, 120, () => {
  let s = shadowSvg(14, 14, 40, 16, 0.18) + sbox(-0.42, -0.65, 0.85, 1.3, 14, 0, '#8a5a2b', { hl: 1 });
  s += sbox(-0.42, -0.65, 0.85, 1.3, 34, 14, '#7fd0f5', { left: 'rgba(120,205,240,.85)', right: 'rgba(80,170,220,.85)', top: 'rgba(205,240,255,.9)' });
  s += pg([ipt(-0.42, 0.65, 14), ipt(0.43, 0.65, 14), ipt(0.43, 0.65, 20), ipt(-0.42, 0.65, 20)], '#e8d7a8', { ns: 1 });
  [[-0.2, 0.62, 30], [0.25, 0.62, 26]].forEach(([i, j, z]) => { const [x, y] = ipt(i, j, 18); s += `<path d="M${x},${y} q-4,-${z / 2} 0,-${z} M${x + 3},${y} q4,-${z / 2} 0,-${z * 0.8}" stroke="#3f9e3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`; });
  s += `<polyline points="${pts([ipt(-0.42, 0.65, 47), ipt(0.43, 0.65, 47)])}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`;
  return s;
});
def('counter', -45, -100, 150, 140, () => {
  let s = shadowSvg(40, 30, 70, 20, 0.16) + sbox(0, 0, 1.9, 0.55, 36, 0, '#ffffff', { top: '#e8eef2', hl: 1 });
  for (let k = 0; k < 3; k++) s += pg([ipt(0.1 + k * 0.6, 0.56, 4), ipt(0.6 + k * 0.6, 0.56, 4), ipt(0.6 + k * 0.6, 0.56, 30), ipt(0.1 + k * 0.6, 0.56, 30)], '#9fd8c9', { so: 0.4 });
  const [sx, sy] = ipt(0.45, 0.28, 36); s += `<ellipse cx="${sx}" cy="${sy}" rx="13" ry="6" fill="#cfe9f7" stroke="${OUT}" stroke-opacity=".5"/><path d="M${sx + 2},${sy - 4} l0,-12 l7,3" stroke="#9aa7b2" stroke-width="2.5" fill="none"/>`;
  s += sbox(1.0, 0.05, 0.75, 0.45, 26, 36, '#dfe6ea', { hl: 1 });
  const [ax, ay] = ipt(1.38, 0.5, 49); s += `<g transform="matrix(0.894,0.447,0,1,${ax},${ay})"><circle r="9" fill="#9aa7b2" stroke="${OUT}" stroke-opacity=".6"/><circle r="5" fill="#3c4650"/><rect x="-14" y="-15" width="5" height="3" fill="#78c443"/></g>`;
  const [lx, ly] = ipt(1.0, 0.5, 58); s += `<circle cx="${lx + 6}" cy="${ly - 2}" r="2" fill="#78c443"/>`;
  return s;
});
def('shelf', -40, -130, 130, 160, () => {
  let s = shadowSvg(28, 22, 54, 16, 0.16) + sbox(0, 0, 1.6, 0.45, 80, 0, '#c98b4f', { hl: 1 });
  for (let k = 0; k < 3; k++) s += pg([ipt(0.06, 0.46, 6 + k * 25), ipt(1.54, 0.46, 6 + k * 25), ipt(1.54, 0.46, 26 + k * 25), ipt(0.06, 0.46, 26 + k * 25)], '#8a5a2b', { so: 0.4 });
  return s;
});
def('cooler', -24, -96, 48, 108, () => shadowSvg(0, 6, 18, 8, 0.18) + sbox(-0.3, -0.3, 0.6, 0.6, 56, 0, '#f4f7f8', { hl: 1 }) + sbox(-0.12, 0.29, 0.24, 0.04, 8, 30, '#4fb5e8') + scyl(0, 0, 0.22, 26, 56, '#9fe0ff', { top: '#d6f3ff' }));
def('pano', -50, -150, 110, 170, () => {
  let s = shadowSvg(0, 8, 40, 16, 0.2) + sbox(-0.4, -0.4, 0.8, 0.8, 6, 0, '#c9d2dc') + sbox(-0.12, -0.35, 0.24, 0.24, 120, 6, '#f4f7f8', { hl: 1 });
  const a = ipt(0, -0.2, 126); s += `<path d="M${a[0] - 36},${a[1] + 8} q36,-26 72,0 l0,10 q-36,-22 -72,0 Z" fill="#e8eef2" stroke="${OUT}" stroke-opacity=".7"/>`;
  s += `<rect x="${a[0] - 40}" y="${a[1] + 10}" width="10" height="34" rx="4" fill="#4a7fd6" stroke="${OUT}" stroke-opacity=".6"/><rect x="${a[0] + 30}" y="${a[1] + 10}" width="10" height="34" rx="4" fill="#dfe6ea" stroke="${OUT}" stroke-opacity=".6"/>`;
  s += sbox(-0.05, 0.05, 0.4, 0.15, 4, 64, '#9aa7b2') + `<circle cx="${ipt(0.15, 0.13, 72)[0]}" cy="${ipt(0.15, 0.13, 72)[1]}" r="3" fill="#ffcb3d"/>`;
  return s;
});
def('xray_wall', -40, -110, 70, 120, () => {
  let s = ''; const w0 = ipt(0, 0, 60); s += `<g transform="matrix(0.894,0.447,0,1,${w0[0]},${w0[1]})"><rect x="-14" y="-20" width="28" height="40" rx="4" fill="#f4f7f8" stroke="${OUT}" stroke-opacity=".7"/><circle cx="0" cy="-8" r="3" fill="#78c443"/><rect x="-7" y="2" width="14" height="10" rx="2" fill="#3c4650"/></g>`;
  const a = ipt(0.05, 0.1, 70), b = ipt(0.3, 0.6, 92), c = ipt(0.6, 0.9, 74);
  s += `<path d="M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]}" fill="none" stroke="#dfe6ea" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]}" fill="none" stroke="#9aa7b2" stroke-width="1.4"/>`;
  s += `<rect x="${c[0] - 10}" y="${c[1] - 10}" width="20" height="18" rx="5" fill="#f4f7f8" stroke="${OUT}" stroke-opacity=".7"/><path d="M${c[0] - 4},${c[1] + 8} l-3,14 h14 l-3,-14 Z" fill="#e8d27a" stroke="${OUT}" stroke-opacity=".6"/>`;
  return s;
});
def('ac', -60, -40, 120, 60, () => `<g transform="matrix(0.894,0.447,0,1,-44,-22)"><rect x="0" y="0" width="80" height="24" rx="6" fill="#f8fbfc" stroke="${OUT}" stroke-opacity=".7"/><rect x="6" y="16" width="68" height="4" rx="2" fill="#c9d2dc"/><circle cx="72" cy="7" r="2" fill="#78c443"/></g>`);

/* ---------- outdoor ---------- */
def('tree_a', -46, -112, 92, 124, () => {
  let s = shadowSvg(4, 4, 34, 14, 0.22) + `<path d="M-6,0 L-4,-34 L4,-34 L6,0 Z" fill="#8a5a2b" stroke="${OUT}" stroke-opacity=".6"/>`;
  [[0, -60, 30, '#4f9e2a'], [-20, -48, 20, '#5aa82f'], [20, -50, 21, '#5aa82f'], [-8, -78, 21, '#6fbe3a'], [10, -74, 18, '#6fbe3a'], [-2, -92, 13, '#86d24c']].forEach(([x, y, r, c]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${OUT}" stroke-opacity=".3"/>`; });
  s += `<path d="M-14,-86 q10,-12 22,-6" stroke="#b6ec7a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  [[-12, -58], [14, -46], [4, -76], [-22, -44], [18, -66]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="3.4" fill="#ff6f6f" stroke="#c0392b" stroke-width=".8"/>`; });
  return s;
});
def('tree_b', -34, -128, 68, 140, () => {
  let s = shadowSvg(3, 4, 26, 11, 0.22) + `<rect x="-4" y="-22" width="8" height="22" fill="#8a5a2b" stroke="${OUT}" stroke-opacity=".6"/>`;
  [[-30, -20, '#3f8f24'], [-26, -48, '#4f9e2a'], [-21, -74, '#5fb532'], [-15, -98, '#6fbe3a']].forEach(([w, y, c]) => { s += `<path d="M${w},${y} L0,${y - 40} L${-w},${y} Z" fill="${c}" stroke="${OUT}" stroke-opacity=".35" stroke-linejoin="round"/>`; });
  return s;
});
def('bush', -24, -30, 48, 38, () => shadowSvg(0, 2, 20, 8, 0.18) + [[-9, -10, 10, '#5aa82f'], [9, -10, 10, '#5aa82f'], [0, -16, 12, '#6fbe3a'], [-3, -20, 5, '#8fd655']].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${OUT}" stroke-opacity=".3"/>`).join(''));
def('flowerbed', -50, -36, 100, 60, () => {
  let s = sbox(-0.7, -0.3, 1.4, 0.6, 7, 0, '#a8692f', { top: '#6b4423', hl: 1 }); const r = mulberry(11);
  for (let k = 0; k < 14; k++) { const [x, y] = ipt(-0.6 + r() * 1.2, -0.22 + r() * 0.45, 9); s += `<path d="M${x},${y + 4} l0,-6" stroke="#3f8f24" stroke-width="1.4"/><circle cx="${x}" cy="${y - 3}" r="3" fill="${['#ff6f91', '#ffd23f', '#ffffff', '#b48ae6', '#ff9f43'][k % 5]}" stroke="${OUT}" stroke-opacity=".3" stroke-width=".6"/>`; }
  return s;
});
def('lamp', -14, -104, 28, 112, () => shadowSvg(0, 3, 9, 4, 0.2) + `<rect x="-2.5" y="-86" width="5" height="86" fill="#3c4650"/><path d="M-10,-86 L10,-86 L6,-100 L-6,-100 Z" fill="#fff6c9" stroke="#3c4650" stroke-width="2"/><rect x="-8" y="-104" width="16" height="5" rx="2" fill="#3c4650"/>`);
def('mailbox', -10, -42, 20, 46, () => `<rect x="-2" y="-24" width="4" height="24" fill="#8a5a2b"/><rect x="-9" y="-40" width="18" height="17" rx="5" fill="#ec5b4b" stroke="${OUT}" stroke-opacity=".7"/><rect x="5" y="-44" width="3" height="10" fill="#ffcb3d"/>`);
def('scooter', -36, -54, 72, 62, () => {
  const c = '#e85b5b'; let s = shadowSvg(0, 2, 30, 9, 0.2);
  s += `<g transform="matrix(0.894,0.447,0,1,-26,-24)"><circle cx="8" cy="22" r="8" fill="#2b2f36"/><circle cx="8" cy="22" r="3.4" fill="#9aa7b2"/><circle cx="50" cy="22" r="8" fill="#2b2f36"/><circle cx="50" cy="22" r="3.4" fill="#9aa7b2"/><path d="M8,20 Q14,6 30,8 L44,8 Q52,8 54,16 L50,22 L14,22 Z" fill="${c}" stroke="${OUT}" stroke-opacity=".7"/><rect x="18" y="2" width="20" height="7" rx="3.5" fill="#3c2a1a"/><path d="M48,8 L52,-8 L58,-9" stroke="#3c4650" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="54" cy="0" r="2.6" fill="#fff6c9"/></g>`;
  return s;
});
def('sign', -40, -86, 92, 96, () => {
  const p1 = ipt(-0.45, 0, 0), p2 = ipt(0.45, 0, 0);
  return shadowSvg(0, 4, 34, 10, 0.18) + `<rect x="${p1[0] - 2}" y="${p1[1] - 40}" width="4" height="40" fill="#8a5a2b"/><rect x="${p2[0] - 2}" y="${p2[1] - 40}" width="4" height="40" fill="#8a5a2b"/><g transform="matrix(0.894,0.447,0,1,${p1[0] - 8},${p1[1] - 72})"><rect x="0" y="0" width="80" height="36" rx="7" fill="#fff5da" stroke="${OUT}" stroke-width="2.2"/><rect x="4" y="4" width="72" height="28" rx="5" fill="none" stroke="#3fb6a8" stroke-width="1.4" stroke-dasharray="3 2"/></g>`;
});
def('fence_i', -2, -26, 68, 52, () => { let s = ''; for (let k = 0; k <= 4; k++) { const [x, y] = ipt(k * 0.25, 0, 0); s += `<path d="M${x - 2.5},${y} L${x - 2.5},${y - 18} L${x},${y - 22} L${x + 2.5},${y - 18} L${x + 2.5},${y} Z" fill="#fff" stroke="${OUT}" stroke-opacity=".5"/>`; } const a = ipt(0, 0, 8), b = ipt(1, 0, 8), c = ipt(0, 0, 14), d = ipt(1, 0, 14); return s + `<path d="M${a[0]},${a[1]} L${b[0]},${b[1]} M${c[0]},${c[1]} L${d[0]},${d[1]}" stroke="#f4f1e6" stroke-width="2.6"/>`; });
def('truck', -80, -96, 170, 130, () => {
  let s = shadowSvg(4, 18, 72, 22, 0.25);
  s += sbox(-1.3, -0.45, 1.8, 0.9, 46, 8, '#ffffff', { hl: 1 }) + sbox(0.5, -0.45, 0.8, 0.9, 30, 8, '#4fb5e8', { hl: 1 });
  s += pg([ipt(1.3, -0.4, 22), ipt(1.3, 0.4, 22), ipt(1.3, 0.4, 34), ipt(1.3, -0.4, 34)], '#bfe8ff', { ns: 1 });
  s += pg([ipt(0.6, 0.45, 22), ipt(1.2, 0.45, 22), ipt(1.2, 0.45, 34), ipt(0.6, 0.45, 34)], '#bfe8ff', { ns: 1 });
  const t = ipt(-1.25, 0.46, 46); s += `<g transform="matrix(0.894,0.447,0,1,${t[0]},${t[1]})"><rect x="4" y="6" width="104" height="22" rx="4" fill="#3fb6a8"/><text x="10" y="21" font-family="Baloo 2,Nunito,sans-serif" font-size="11" font-weight="800" fill="#fff">VẬT TƯ NHA KHOA</text></g>`;
  [[-0.9, 0.45], [0.9, 0.45]].forEach(([i, j]) => { const [x, y] = ipt(i, j, 8); s += `<g transform="matrix(0.894,0.447,0,1,${x},${y})"><circle r="10" fill="#2b2f36"/><circle r="4.5" fill="#9aa7b2"/></g>`; });
  return s;
});
def('moto', -30, -64, 64, 72, () => {
  let s = shadowSvg(0, 2, 24, 8, 0.2);
  s += `<g transform="matrix(0.894,0.447,0,1,-22,-26)"><circle cx="7" cy="22" r="7" fill="#2b2f36"/><circle cx="42" cy="22" r="7" fill="#2b2f36"/><path d="M7,20 Q12,8 26,9 L38,9 Q44,9 45,16 L42,22 L12,22 Z" fill="#4a7fd6" stroke="${OUT}" stroke-opacity=".6"/><path d="M40,9 L44,-4" stroke="#3c4650" stroke-width="2.2"/></g>`;
  s += `<path d="M-2,-10 l4,10" stroke="#3f5f8f" stroke-width="5" stroke-linecap="round"/><rect x="-7" y="-27" width="13" height="18" rx="5" fill="#f28f3b" stroke="${OUT}" stroke-opacity=".6"/><path d="M4,-22 l10,4" stroke="#f28f3b" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="-35" r="8" fill="#ffcb3d" stroke="${OUT}" stroke-opacity=".7"/><rect x="-1" y="-37" width="9" height="5" rx="2" fill="#3c4650" opacity=".75"/>`;
  return s;
});
