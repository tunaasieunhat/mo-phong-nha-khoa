/* ================== MOUTH VIEW: big odontogram-style open mouth with camera + magnifier ================== */
const T = { cv: null, ctx: null, cw: 0, ch: 0, S: 1, cam: { fx: 600, fy: 430, z: 1 }, p: null, phase: 'hx', view: 'face', tool: null, cells: [], ptr: { x: 0, y: 0, sx: 0, sy: 0, down: false, on: false }, parts: [], t: 0 };
const PT = document.createElement('canvas').getContext('2d');
const inPath = (path, x, y) => PT.isPointInPath(path, x, y);
const MD = { 1: 8.5, 2: 6.6, 3: 7.6, 4: 7.0, 5: 6.8, 6: 10.4, 7: 9.6, 8: 9.0 };
const BL = { 1: 7.0, 2: 6.4, 3: 8.0, 4: 9.0, 5: 9.0, 6: 11.0, 7: 10.5, 8: 10.0 };
const VIEW_BOX = { face: [300, 150, 600, 640], mouth: [190, 50, 820, 760], occl: [150, 110, 700, 520], rct: [190, 120, 620, 560], perio: [220, 110, 560, 580], surg: [150, 150, 700, 620], scaling: [190, 50, 820, 760] };

function buildArch() {
  const k = 5.8, A = 330, B = 220, cx = 600, res = {};
  const pt = (f) => ({ x: A * Math.sin(f), y: B * (1 - Math.cos(f)) });
  const N = 600, tbl = [0]; let prev = pt(0);
  for (let n = 1; n <= N; n++) { const q = pt(n / N * Math.PI / 2); tbl.push(tbl[n - 1] + Math.hypot(q.x - prev.x, q.y - prev.y)); prev = q; }
  for (const upper of [true, false]) {
    const y0 = upper ? 122 : 738, sg = upper ? 1 : -1, ecy = y0 + sg * B; let s = 0;
    for (let t = 1; t <= 8; t++) {
      const w = MD[t] * k; s += w / 2 + 1.4; const sc = s; s += w / 2 + 1.4;
      let n = tbl.findIndex((v) => v >= sc); if (n < 0) n = N; const q = pt(n / N * Math.PI / 2);
      for (const side of [-1, 1]) {
        const quad = upper ? (side < 0 ? 1 : 2) : (side < 0 ? 4 : 3), x = cx + side * q.x, y = y0 + sg * q.y;
        let nx = (x - cx) / (A * A), ny = (y - ecy) / (B * B); const l = Math.hypot(nx, ny); nx /= l; ny /= l;
        res[quad * 10 + t] = { n: quad * 10 + t, x, y, w, d: BL[t] * k, nx, ny, rot: Math.atan2(-nx, ny), type: t, upper };
      }
    }
  }
  return res;
}
const ARCH = buildArch();
const archOrder = (upper) => (upper ? [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] : [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]).map((n) => ARCH[n]);
const localToArch = (g, lx, ly) => { const c = Math.cos(g.rot), s = Math.sin(g.rot); return { x: g.x + lx * c - ly * s, y: g.y + lx * s + ly * c }; };

function toothShape(ctx, g) {
  const w = g.w, d = g.d, t = g.type; ctx.beginPath();
  if (t <= 2) ctx.ellipse(0, d * 0.06, w / 2, d * 0.42, 0, 0, 7);
  else if (t === 3) { ctx.moveTo(0, -d / 2); ctx.quadraticCurveTo(w * 0.55, -d * 0.1, w * 0.42, d * 0.18); ctx.quadraticCurveTo(0, d * 0.62, -w * 0.42, d * 0.18); ctx.quadraticCurveTo(-w * 0.55, -d * 0.1, 0, -d / 2); }
  else if (t <= 5) ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, 7);
  else rr(ctx, -w / 2, -d / 2, w, d, w * 0.34);
  ctx.closePath();
}
function drawArchTooth(ctx, g, st, o = {}) {
  if (st.missing) { ctx.fillStyle = 'rgba(170,60,80,.35)'; ctx.beginPath(); ctx.ellipse(g.x, g.y, g.w * 0.25, g.d * 0.18, g.rot, 0, 7); ctx.fill(); return; }
  ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.rot + (st.impacted ? 0.45 : 0)); if (o.dx) ctx.translate(o.dx, 0); if (st.impacted) ctx.scale(0.86, 0.86);
  const w = g.w, d = g.d;
  if (st.mob >= 3) { ctx.fillStyle = '#c2475b'; ctx.beginPath(); ctx.ellipse(0, d * 0.05, w * 0.62, d * 0.62, 0, 0, 7); ctx.fill(); }
  if (o.hl) { ctx.save(); ctx.scale(1.28, 1.28); toothShape(ctx, g); ctx.fillStyle = 'rgba(255,203,61,.6)'; ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.translate(0, 3); toothShape(ctx, g); ctx.fillStyle = 'rgba(90,20,30,.25)'; ctx.fill(); ctx.restore();
  toothShape(ctx, g); const gr = ctx.createRadialGradient(-w * 0.18, -d * 0.2, 2, 0, 0, Math.max(w, d) * 0.72); gr.addColorStop(0, '#fffef8'); gr.addColorStop(0.6, '#f6ecd4'); gr.addColorStop(1, '#e2cfa8'); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = '#a99472'; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.strokeStyle = 'rgba(150,120,80,.55)'; ctx.lineWidth = 1.6; ctx.beginPath();
  if (g.type >= 6) { ctx.moveTo(-w * 0.3, 0); ctx.bezierCurveTo(-w * 0.1, -d * 0.05, w * 0.1, d * 0.05, w * 0.3, 0); ctx.moveTo(-w * 0.08, 0); ctx.lineTo(-w * 0.14, -d * 0.3); ctx.moveTo(w * 0.1, 0); ctx.lineTo(w * 0.16, d * 0.3); ctx.moveTo(w * 0.05, 0); ctx.lineTo(w * 0.12, -d * 0.28); }
  else if (g.type >= 4) { ctx.moveTo(-w * 0.22, 0); ctx.lineTo(w * 0.22, 0); }
  else if (g.type <= 2) { ctx.moveTo(-w * 0.32, d * 0.02); ctx.quadraticCurveTo(0, -d * 0.08, w * 0.32, d * 0.02); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-w * 0.18, -d * 0.18, w * 0.12, d * 0.06, -0.4, 0, 7); ctx.fill();
  if (st.fill === 'amalgam') { ctx.fillStyle = '#8e98a3'; ctx.strokeStyle = '#5f6872'; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.22, d * 0.18, 0.2, 0, 7); ctx.fill(); ctx.stroke(); }
  if (st.fill === 'composite') { ctx.strokeStyle = 'rgba(190,165,120,.8)'; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.ellipse(0, 0, w * 0.22, d * 0.17, 0.2, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  if (st.fissure) { ctx.strokeStyle = '#4a2c14'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); if (g.type >= 6) { ctx.moveTo(-w * 0.26, 0); ctx.bezierCurveTo(-w * 0.1, -d * 0.05, w * 0.1, d * 0.05, w * 0.26, 0); ctx.moveTo(-w * 0.08, 0); ctx.lineTo(-w * 0.13, -d * 0.26); ctx.moveTo(w * 0.1, 0); ctx.lineTo(w * 0.15, d * 0.26); } else { ctx.moveTo(-w * 0.2, 0); ctx.lineTo(w * 0.2, 0); } ctx.stroke(); ctx.fillStyle = '#3a2210'; ctx.beginPath(); ctx.arc(w * 0.02, 0, w * 0.06, 0, 7); ctx.fill(); }
  if (st.caries && !o.treated) { const r = st.caries === 2 ? 0.28 : 0.15; ctx.fillStyle = st.caries === 2 ? '#2e1a0e' : '#5a3a1c'; ctx.beginPath(); for (let a = 0; a < 8; a++) { const ang = a / 8 * Math.PI * 2, rad = w * r * (0.8 + 0.3 * Math.sin(a * 2.3 + g.n)); ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.9); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(120,80,30,.5)'; ctx.lineWidth = 3; ctx.stroke(); }
  if (o.treated) { ctx.fillStyle = '#f5ecd6'; ctx.strokeStyle = 'rgba(190,165,120,.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, w * (o.treated === 'rootcanal' ? 0.3 : 0.22), d * (o.treated === 'rootcanal' ? 0.26 : 0.2), 0, 0, 7); ctx.fill(); ctx.stroke(); }
  if (st.stain && !o.noDeposits) { ctx.strokeStyle = 'rgba(150,100,40,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, d * 0.06, w * 0.42, d * 0.36, 0, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  if (st.tartar && !o.noDeposits) { ctx.fillStyle = '#e8d27a'; ctx.strokeStyle = '#b89a3c'; ctx.lineWidth = 1.2; const yy = g.n === 16 || g.n === 26 ? d * 0.5 : -d * 0.46; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.arc(k * w * 0.25, yy, 6.5, 0, 7); ctx.fill(); ctx.stroke(); } }
  if (st.impacted) { ctx.fillStyle = 'rgba(214,82,102,.88)'; ctx.beginPath(); ctx.ellipse(w * 0.15, -d * 0.1, w * 0.46, d * 0.52, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,240,180,.8)'; ctx.beginPath(); ctx.arc(w * 0.1, d * 0.05, 3, 0, 7); ctx.fill(); }
  if (st.mob >= 3) { ctx.fillStyle = 'rgba(255,240,180,.9)'; ctx.beginPath(); ctx.arc(w * 0.3, -d * 0.45, 3.2, 0, 7); ctx.fill(); }
  ctx.restore();
  if (o.chart) { const co = CHART_OPTS.find((x) => x[0] === o.chart); if (co) { ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.rot); ctx.strokeStyle = co[2]; ctx.lineWidth = 4.5; ctx.setLineDash([9, 5]); ctx.beginPath(); ctx.ellipse(0, 0, g.w * 0.66, g.d * 0.66, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); const mx = g.x + g.nx * (g.d / 2 + 44), my = g.y + g.ny * (g.d / 2 + 44); ctx.fillStyle = co[2]; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(mx, my, 11, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = '800 13px Nunito,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(CHART_LETTER[o.chart] || '?', mx, my + 0.5); } }
}
const CHART_LETTER = { ok: '✓', caries: 'S', stain: 'N', filled: 'T', calculus: 'C', mobile: 'L', impacted: 'M', missing: 'X' };
function drawMouthView(ctx, p, o = {}) {
  const sk = p.look ? p.look.skin : '#efc29a'; ctx.fillStyle = sk; ctx.fillRect(-3000, -3000, 7200, 7000);
  ctx.save(); ctx.beginPath(); ctx.ellipse(600, 430, 505, 420, 0, 0, 7); ctx.fillStyle = '#c44a5c'; ctx.fill();
  ctx.lineWidth = 34; ctx.strokeStyle = '#d9707e'; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.ellipse(600, 430, 488, 404, 0, 0, 7); ctx.clip();
  const g = ctx.createRadialGradient(600, 430, 80, 600, 430, 520); g.addColorStop(0, '#5a1822'); g.addColorStop(1, '#2a0a10'); ctx.fillStyle = g; ctx.fillRect(80, 0, 1040, 880);
  for (const upper of [true, false]) {
    const ord = archOrder(upper);
    ctx.beginPath(); ord.forEach((q, k) => (k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fillStyle = upper ? '#e98896' : '#d9606f'; ctx.fill();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ord.forEach((q, k) => (k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.strokeStyle = '#c95a6c'; ctx.lineWidth = 92; ctx.stroke(); ctx.strokeStyle = '#f39aa6'; ctx.lineWidth = 80; ctx.stroke();
    for (const q of ord) { const st = p.teeth[q.n]; if (st.missing) continue; ctx.fillStyle = st.tartar || st.mob ? '#e2687b' : '#f6a9b4'; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.w * 0.66, q.d * 0.66, q.rot, 0, 7); ctx.fill(); }
    if (upper) { ctx.strokeStyle = 'rgba(200,90,105,.6)'; ctx.lineWidth = 4; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(600 - 80 + k * 6, 200 + k * 24); ctx.quadraticCurveTo(600, 214 + k * 24, 680 - k * 6, 200 + k * 24); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(600, 186); ctx.lineTo(600, 330); ctx.stroke(); }
    else { ctx.fillStyle = '#e57585'; ctx.beginPath(); ctx.ellipse(600, 618, 170, 88, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(560, 595, 70, 26, -0.2, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(180,70,90,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(600, 550); ctx.lineTo(600, 680); ctx.stroke(); }
  }
  for (const n in ARCH) {
    const gg = ARCH[n], st = p.teeth[n];
    drawArchTooth(ctx, gg, st, { hl: o.sel === +n, chart: o.chart && o.chart[n], treated: o.treated && o.treated.n === +n ? o.treated.kind : null, noDeposits: o.noDeposits, dx: o.wob && o.wob.n === +n ? o.wob.dx : 0 });
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(80,30,40,.75)'; ctx.font = '800 17px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const n in ARCH) { const gg = ARCH[n]; ctx.fillStyle = o.sel === +n ? '#b27500' : 'rgba(255,235,238,.92)'; ctx.fillText(n, gg.x + gg.nx * (gg.d / 2 + 20), gg.y + gg.ny * (gg.d / 2 + 20)); }
  ctx.fillStyle = 'rgba(80,30,40,.7)'; ctx.font = '800 18px Nunito,sans-serif'; ctx.fillText('PHẢI', 150, 430); ctx.fillText('TRÁI', 1050, 430); ctx.font = '700 13px Nunito,sans-serif'; ctx.fillText('bệnh nhân', 150, 450); ctx.fillText('bệnh nhân', 1050, 450);
}
function drawMouthCells(ctx, cells) {
  ctx.save(); ctx.beginPath(); ctx.ellipse(600, 430, 488, 404, 0, 0, 7); ctx.clip();
  for (const c of cells) { if (c.removed) continue; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); if (c.kind === 'tartar') { ctx.fillStyle = '#e8d27a'; ctx.fill(); ctx.strokeStyle = '#a88a2c'; ctx.lineWidth = 1.6; ctx.stroke(); } else if (c.kind === 'sub') { ctx.fillStyle = '#3e230f'; ctx.fill(); ctx.strokeStyle = '#e8d27a'; ctx.lineWidth = 1.2; ctx.stroke(); } else { ctx.fillStyle = 'rgba(186,128,62,.72)'; ctx.fill(); } }
  ctx.restore();
}
function archHit(x, y) { let best = null, bd = 1e9; for (const n in ARCH) { const g = ARCH[n], dd = dist(x, y, g.x, g.y); if (dd < Math.max(g.w, g.d) * 0.62 + 8 && dd < bd) { bd = dd; best = +n; } } return best; }

/* ---------- patient face (history taking) ---------- */
function drawFaceView(ctx, p) {
  const g = ctx.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, '#e6f7f2'); g.addColorStop(1, '#fbf6ea'); ctx.fillStyle = g; ctx.fillRect(-3000, -3000, 7200, 7000);
  ctx.fillStyle = '#9fd8c9'; ctx.fillRect(-3000, 640, 7200, 3000); ctx.fillStyle = '#8ccdbd'; ctx.fillRect(-3000, 640, 7200, 10);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#6e4019'; ctx.lineWidth = 4; rr(ctx, -40, 120, 230, 170, 10); ctx.fill(); ctx.stroke(); const w = ctx.createLinearGradient(0, 130, 0, 280); w.addColorStop(0, '#9fdcff'); w.addColorStop(1, '#e4f6ff'); ctx.fillStyle = w; ctx.fillRect(-28, 132, 206, 146); ctx.fillStyle = '#fff'; ctx.fillRect(72, 132, 6, 146);
  ctx.fillStyle = '#fff'; rr(ctx, 1000, 150, 170, 210, 8); ctx.fill(); ctx.stroke(); toothIcon(ctx, 1085, 230, 4, '#fffdf5'); ctx.fillStyle = '#4fb5e8'; ctx.fillRect(1020, 310, 130, 10); ctx.fillRect(1020, 330, 90, 10);
  ctx.fillStyle = '#36a596'; rr(ctx, 455, 250, 290, 330, 120); ctx.fill(); ctx.fillStyle = '#3fb6a8'; rr(ctx, 410, 470, 380, 230, 70); ctx.fill(); ctx.fillStyle = '#2f9a8c'; rr(ctx, 520, 200, 160, 70, 34); ctx.fill();
  drawChar(ctx, p.look, 600, 770, { scale: 4.3, pose: 'sit', mood: T.faceMood || 'pain', noShadow: true });
}

/* ---------- camera ---------- */
function setView(v) {
  T.view = v; const b = VIEW_BOX[v] || VIEW_BOX.mouth; T.box = b; T.cam = { fx: b[0] + b[2] / 2, fy: b[1] + b[3] / 2, z: 1 }; layoutTreat();
  $('zoomBar').hidden = !(v === 'mouth');
}
function layoutTreat() { if (!T.cv) return; const b = T.box || VIEW_BOX.mouth; T.S = Math.min(T.cw / b[2], T.ch / b[3]) * 0.98; }
function v2s(x, y) { const k = T.S * T.cam.z; return { x: T.cw / 2 + k * (x - T.cam.fx), y: T.ch / 2 + k * (y - T.cam.fy) }; }
function s2v(x, y) { const k = T.S * T.cam.z; return { x: T.cam.fx + (x - T.cw / 2) / k, y: T.cam.fy + (y - T.ch / 2) / k }; }
function camPreset(kind) {
  const b = VIEW_BOX.mouth;
  if (kind === 'all') T.cam = { fx: b[0] + b[2] / 2, fy: b[1] + b[3] / 2, z: 1 };
  if (kind === 'up') T.cam = { fx: 600, fy: 240, z: 1.75 };
  if (kind === 'down') T.cam = { fx: 600, fy: 620, z: 1.75 };
  if (kind === 'in') T.cam.z = clamp(T.cam.z * 1.3, 1, 3);
  if (kind === 'out') T.cam.z = clamp(T.cam.z / 1.3, 1, 3);
  clampCamT();
}
function clampCamT() { const b = T.box || VIEW_BOX.mouth, hw = b[2] / 2 * (1 - 1 / T.cam.z), hh = b[3] / 2 * (1 - 1 / T.cam.z); T.cam.fx = clamp(T.cam.fx, b[0] + b[2] / 2 - hw - 40, b[0] + b[2] / 2 + hw + 40); T.cam.fy = clamp(T.cam.fy, b[1] + b[3] / 2 - hh - 40, b[1] + b[3] / 2 + hh + 40); }

/* ---------- x-ray films ---------- */
function drawPano(ctx, p) {
  ctx.fillStyle = '#060606'; ctx.fillRect(0, 0, 400, 300);
  ctx.save(); ctx.translate(200, 150);
  ctx.fillStyle = '#3c3c3c'; ctx.beginPath(); ctx.ellipse(0, 10, 185, 120, 0, 0.08 * Math.PI, 0.92 * Math.PI); ctx.lineTo(-170, -40); ctx.quadraticCurveTo(0, -70, 170, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#151515'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-160, 40); ctx.quadraticCurveTo(-120, 92, 0, 98); ctx.quadraticCurveTo(120, 92, 160, 40); ctx.stroke();
  for (let row = 0; row < 2; row++) for (let k = -8; k <= 8; k++) {
    if (k === 0) continue; const side = k < 0 ? -1 : 1, idx = Math.abs(k), quad = row === 0 ? (side < 0 ? 1 : 2) : (side < 0 ? 4 : 3), n = quad * 10 + idx, st = p.teeth[n];
    if (!st || st.missing) continue; const x = side * (idx - 0.5) * 20, y = row === 0 ? -18 : 22, wd = idx >= 6 ? 17 : 12;
    ctx.save(); ctx.translate(x, y); if (st.impacted) { ctx.translate(side * 4, 6); ctx.rotate(side * -0.8); }
    ctx.fillStyle = '#cfcfcf'; rr(ctx, -wd / 2, row === 0 ? -20 : 0, wd, 20, 5); ctx.fill(); ctx.fillStyle = '#a9a9a9'; ctx.fillRect(-wd / 4, row === 0 ? -48 : 20, wd / 2, 28);
    if (st.fill === 'amalgam') { ctx.fillStyle = '#fff'; ctx.fillRect(-4, row === 0 ? -12 : 4, 8, 6); }
    if (st.caries) { ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(0, row === 0 ? -6 : 6, st.caries * 3, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore(); const vg = ctx.createRadialGradient(200, 150, 90, 200, 150, 260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = '#ddd'; ctx.font = '700 13px Nunito,sans-serif'; ctx.fillText('PANORAMA', 12, 22); ctx.fillText('P', 14, 290); ctx.fillText('T', 378, 290);
}
function drawXrayFilm(p, tooth, kind) {
  const c = $('xc'), ctx = c.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'pano') { drawPano(ctx, p); return; }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 400, 300);
  const st = p.teeth[tooth], upper = tooth < 30, t = tooth % 10, isT = isTargetTooth(tooth);
  ctx.setTransform(0.5, 0, 0, upper ? -0.5 : 0.5, -50, upper ? 330 : -30);
  const o = { xray: true, incisor: t <= 5 && tooth !== 14 && tooth !== 24 };
  if (isT && p.type === 'caries') o.decay = 1;
  if (isT && p.type === 'pulpitis') o.decay = 2;
  if (isT && p.type === 'calculus') o.calculus = true;
  if (isT && p.type === 'perio') o.boneTop = 540;
  if (isT && p.type === 'wisdom') { o.xf = (cx) => { cx.translate(500, 430); cx.rotate(-0.55); cx.scale(0.9, 0.9); cx.translate(-500, -380); }; o.onlyLeft = true; }
  if (kind === 'post') o.obturated = true;
  if (st.fill === 'amalgam') o.after = (cx) => { cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(500, 196, 46, 22, 0, 0, 7); cx.fill(); };
  if (st.missing && !st.impacted) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0, 150, 400, 150); }
  else drawXsec(ctx, o);
  ctx.setTransform(1, 0, 0, 1, 0, 0); const vg = ctx.createRadialGradient(200, 150, 80, 200, 150, 260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = '#ddd'; ctx.font = '700 14px Nunito,sans-serif'; ctx.fillText('R' + tooth + (kind === 'post' ? ' · sau trám bít' : ''), 12, 22);
}
