/* ================== CLOSE-UP VIEWS: occlusal (filling), sections (root canal, perio, surgery) ================== */
const XP = {
  tooth: new Path2D('M385 340 C352 300 350 220 372 182 C384 160 405 148 425 150 C450 152 468 172 500 182 C532 172 550 152 575 150 C595 148 616 160 628 182 C650 220 648 300 615 340 C626 400 622 520 592 636 C584 652 566 652 560 632 C548 560 536 470 500 432 C464 470 452 560 440 632 C434 652 416 652 408 636 C378 520 374 400 385 340 Z'),
  crown: new Path2D('M385 340 C352 300 350 220 372 182 C384 160 405 148 425 150 C450 152 468 172 500 182 C532 172 550 152 575 150 C595 148 616 160 628 182 C650 220 648 300 615 340'),
  chamber: new Path2D('M446 330 C436 300 440 250 452 238 C462 228 472 252 500 254 C528 252 538 228 548 238 C560 250 564 300 554 330 Z'),
  incisor: new Path2D('M440 340 C428 280 440 200 470 160 C490 146 510 146 530 160 C560 200 572 280 560 340 C566 440 540 560 506 640 C502 648 498 648 494 640 C460 560 434 440 440 340 Z'),
};
const CANALS = [{ n: 'MB', x0: 452, y0: 330, x1: 420, y1: 628 }, { n: 'ML', x0: 467, y0: 333, x1: 433, y1: 624 }, { n: 'D', x0: 542, y0: 330, x1: 576, y1: 628 }];
const BONE = (() => { const r = mulberry(3), a = []; for (let k = 0; k < 170; k++) a.push([r() * 1200 - 100, 380 + r() * 330, 4 + r() * 10, r() * 3]); return a; })();
function canalPoly(ctx, c, t0, t1, w0 = 12, w1 = 4) {
  const x = (t) => lerp(c.x0, c.x1, t), y = (t) => lerp(c.y0, c.y1, t), w = (t) => lerp(w0, w1, t) / 2;
  ctx.beginPath(); ctx.moveTo(x(t0) - w(t0), y(t0)); ctx.lineTo(x(t1) - w(t1), y(t1)); ctx.lineTo(x(t1) + w(t1), y(t1)); ctx.lineTo(x(t0) + w(t0), y(t0)); ctx.closePath();
}
function drawXsec(ctx, o = {}) {
  const X = o.xray, k = (c, xc) => (X ? xc : c), boneTop = o.boneTop || 378, part = o.part || 'all', SP = part !== 'dynamic', DP = part !== 'static';
  if (SP) {
  ctx.fillStyle = k('#3a1118', '#0b0b0b'); ctx.fillRect(-3000, -3000, 7000, 7000);
  ctx.fillStyle = k('#efd6b0', '#4a4a4a'); ctx.beginPath(); ctx.moveTo(-3000, 378); ctx.lineTo(370, 378); ctx.lineTo(430, boneTop); ctx.lineTo(570, boneTop); ctx.lineTo(630, 378); ctx.lineTo(4000, 378); ctx.lineTo(4000, 4000); ctx.lineTo(-3000, 4000); ctx.closePath(); ctx.fill();
  for (const [bx, by, r, a] of BONE) { if (by < boneTop && bx > 400 && bx < 600) continue; ctx.fillStyle = k('rgba(200,160,110,.35)', 'rgba(0,0,0,.35)'); ctx.beginPath(); ctx.ellipse(bx, by, r, r * 0.6, a, 0, 7); ctx.fill(); }
  if (!X && boneTop > 400) { ctx.fillStyle = '#c94a5a'; ctx.beginPath(); ctx.moveTo(420, 360); ctx.lineTo(430, boneTop); ctx.lineTo(570, boneTop); ctx.lineTo(580, 360); ctx.closePath(); ctx.fill(); }
  if (!X) { ctx.fillStyle = o.gum || '#ef8d9a'; ctx.beginPath(); ctx.moveTo(-3000, 300); ctx.lineTo(-400, 300); ctx.quadraticCurveTo(200, 290, 360, 318); ctx.lineTo(640, 318); ctx.quadraticCurveTo(800, 290, 1600, 300); ctx.lineTo(4000, 300); ctx.lineTo(4000, 395); ctx.lineTo(-3000, 395); ctx.closePath(); ctx.fill(); }
  }
  const tooth = o.incisor ? XP.incisor : XP.tooth;
  const drawOne = (dx, alpha, main) => {
    ctx.save(); ctx.translate(dx, 0); ctx.globalAlpha = alpha;
    if (main && o.xf) o.xf(ctx);
    if (main && o.clip) o.clip(ctx);
    ctx.fillStyle = k('#f3e3c2', '#bdbdbd'); ctx.fill(tooth);
    ctx.save(); ctx.clip(tooth); ctx.strokeStyle = k('#fffdf7', '#f2f2f2'); ctx.lineWidth = 26; ctx.stroke(o.incisor ? XP.incisor : XP.crown); ctx.restore();
    if (!o.incisor) { ctx.fillStyle = k(main && o.inflamed ? '#d23c4a' : '#f2a0a8', '#5a5a5a'); ctx.fill(XP.chamber); for (const c of (main && o.canals3 ? CANALS : [CANALS[0], CANALS[2]])) { canalPoly(ctx, c, 0, 1); ctx.fill(); } }
    else { ctx.fillStyle = k('#f2a0a8', '#5a5a5a'); ctx.beginPath(); ctx.moveTo(492, 220); ctx.lineTo(508, 220); ctx.lineTo(502, 630); ctx.lineTo(498, 630); ctx.closePath(); ctx.fill(); }
    if (main && o.obturated) { ctx.fillStyle = '#ffffff'; for (const c of CANALS) { canalPoly(ctx, c, 0, 0.97, 10, 4); ctx.fill(); } ctx.fill(XP.chamber); }
    if (main && o.decay) { ctx.save(); ctx.clip(tooth); ctx.fillStyle = k('#4a2c14', '#2a2a2a'); ctx.beginPath(); const R = o.decay === 2 ? [52, 48, 214] : [34, 24, 192]; for (let a = 0; a < 12; a++) { const ang = a / 12 * Math.PI * 2, r2 = 1 + 0.18 * Math.sin(a * 2.7); ctx.lineTo(500 + Math.cos(ang) * R[0] * r2, R[2] + Math.sin(ang) * R[1] * r2); } ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (main && o.calculus) { ctx.fillStyle = k('#d9b45a', '#e6e6e6'); [[442, 330], [438, 345], [560, 332], [564, 346], [446, 380], [556, 392]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 7, 0, 7); ctx.fill(); }); }
    ctx.strokeStyle = k('rgba(120,80,40,.6)', 'rgba(20,20,20,.7)'); ctx.lineWidth = 3; ctx.stroke(tooth);
    if (main && o.after) o.after(ctx);
    ctx.restore();
  };
  const gap = o.incisor ? 210 : 340;
  if (SP && !o.noNeighbors) { drawOne(-gap, 0.92, false); if (!o.onlyLeft) drawOne(gap, 0.92, false); }
  if (!DP) return;
  if (o.beforeMain) o.beforeMain(ctx);
  if (!o.hideMain) drawOne(0, 1, true);
  if (!X && !o.noPap) { ctx.fillStyle = o.gum || '#ef8d9a'; const L = o.incisor ? [[425, 440, 318], [575, 560, 318]] : [[340, 372, 312], [660, 628, 312]]; for (const [a, b, c] of L) { ctx.beginPath(); ctx.moveTo(a, 395); ctx.lineTo(b, 340); ctx.quadraticCurveTo((a + b) / 2, c, a, 318); ctx.closePath(); ctx.fill(); } }
}

/* ---------- occlusal close-up (class I composite) ---------- */
function occlCrown(type) { const p = new Path2D(); if (type >= 6) { if (p.roundRect) p.roundRect(290, 170, 420, 380, 150); else p.ellipse(500, 360, 210, 190, 0, 0, 7); } else p.ellipse(500, 360, 160, 185, 0, 0, Math.PI * 2); return p; }
function setupOccl(p) {
  const type = p.target % 10; T.crown = occlCrown(type); T.crownType = type; T.cells = []; T.washed = false; T.cured = 0;
  const bx = 500 + rand(-24, 24), by = 360 + rand(-16, 16), R = type >= 6 ? 84 : 66, ph = rand(0, 6);
  for (let y = 152; y <= 570; y += 15) for (let x = 268; x <= 732; x += 15) {
    if (!inPath(T.crown, x, y)) continue; const a = Math.atan2(y - by, x - bx), r = dist(x, y, bx, by);
    const lesion = r < R * (1 + 0.22 * Math.sin(3 * a + ph) + 0.1 * Math.sin(5 * a));
    if (!lesion && r > R * 1.8) continue;
    const op = lesion && r < R * 0.32; T.cells.push({ x, y, lesion, open: op, openStart: op, hp: lesion ? 1 : 3.6, hpRoof: 0.8, removed: false, etch: 0, bond: 0, fill: 0, polish: 0, mark: false, v: Math.random() });
  }
}
function drawOccl(ctx) { drawOcclStatic(ctx); drawOcclDynamic(ctx); }
function drawOcclStatic(ctx) {
  const g = ctx.createRadialGradient(500, 360, 80, 500, 360, 620); g.addColorStop(0, '#f08f9a'); g.addColorStop(1, '#b9485c'); ctx.fillStyle = g; ctx.fillRect(-3000, -3000, 7000, 7000);
  const nb = occlCrown(T.crownType); for (const dx of T.crownType >= 6 ? [-455, 455] : [-350, 350]) { ctx.save(); ctx.translate(dx, 0); ctx.fillStyle = '#eadbb9'; ctx.fill(nb); ctx.strokeStyle = '#b9a685'; ctx.lineWidth = 3; ctx.stroke(nb); ctx.restore(); }
  if (T.cotton) { for (const yy of [118, 602]) { ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#c9d3db'; ctx.lineWidth = 3; rr(ctx, 300, yy - 22, 400, 44, 22); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(200,210,220,.7)'; for (let x = 320; x < 690; x += 18) { ctx.beginPath(); ctx.moveTo(x, yy - 18); ctx.lineTo(x + 6, yy + 18); ctx.stroke(); } } }
  ctx.save(); ctx.shadowColor = 'rgba(80,20,30,.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const tg = ctx.createRadialGradient(440, 290, 30, 500, 360, 290); tg.addColorStop(0, '#fffef8'); tg.addColorStop(1, '#e8d7b2'); ctx.fillStyle = tg; ctx.fill(T.crown); ctx.restore();
  ctx.strokeStyle = '#a99472'; ctx.lineWidth = 3; ctx.stroke(T.crown);
  const cusps = T.crownType >= 6 ? [[400, 270], [600, 270], [400, 450], [600, 450], [500, 470]] : [[500, 255], [500, 470]];
  for (const [cx, cy] of cusps) { const cg = ctx.createRadialGradient(cx - 15, cy - 15, 5, cx, cy, 90); cg.addColorStop(0, 'rgba(255,255,255,.55)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 90, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(140,105,60,.6)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
  if (T.crownType >= 6) { ctx.moveTo(360, 360); ctx.bezierCurveTo(430, 340, 560, 380, 640, 358); ctx.moveTo(470, 352); ctx.lineTo(450, 250); ctx.moveTo(545, 368); ctx.lineTo(565, 470); ctx.moveTo(600, 362); ctx.lineTo(640, 440); } else { ctx.moveTo(420, 360); ctx.lineTo(580, 360); }
  ctx.stroke();
}
function drawOcclDynamic(ctx) {
  const dot = (c, r) => { ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, 7); ctx.fill(); };
  for (const c of T.cells) if (c.lesion && !c.removed) { if (c.open) { ctx.fillStyle = c.v < 0.5 ? '#4a2c14' : '#5e3a1a'; dot(c, 11); } else { ctx.fillStyle = 'rgba(110,80,50,.28)'; dot(c, 10.5); } }
  for (const c of T.cells) if (c.removed) { ctx.fillStyle = c.fill >= 2 ? 'rgba(205,188,150,.85)' : '#9c6a3c'; dot(c, 12.5); }
  for (const c of T.cells) {
    if (!c.removed) continue; let col = c.v < 0.5 ? '#d9b085' : '#d2a679';
    if (c.fill >= 1) col = c.fill >= 2 ? (T.cured >= 2 ? '#f6eedc' : '#efe2c6') : (T.cured >= 1 ? '#efe4cc' : '#e8d9b8');
    else if (c.etch >= 1 && !T.washed) col = '#6fb7ea'; else if (T.washed) col = c.bond >= 1 ? '#fbf1cf' : '#f4ecdf';
    ctx.fillStyle = col; dot(c, 10);
    if (c.fill === 1) { ctx.fillStyle = 'rgba(160,120,80,.25)'; dot(c, 4); }
  }
  for (const c of T.cells) if (c.mark) { ctx.fillStyle = '#2b5fd8'; dot(c, 7); }
  for (const c of T.cells) if (c.polish >= 1 && (Math.floor(c.v * 10 + T.t * 2) % 6) === 0) { ctx.fillStyle = 'rgba(255,255,255,.95)'; dot(c, 2.6); }
}

/* ---------- root canal (lower molar, 3 canals) ---------- */
function setupRCT() {
  T.cells = []; T.seal = []; T.canal = CANALS.map(() => ({ found: false, wl: false, len: 0, shape: 0, dry: 0, gp: 0, plug: false }));
  T.chamberOpen = false; T.irrigated = false; T.dam = false;
  for (let y = 156; y <= 256; y += 11) for (let x = 434; x <= 566; x += 11) if (inPath(XP.tooth, x, y) && !inPath(XP.chamber, x, y)) { const dec = ((x - 500) / 52) ** 2 + ((y - 214) / 48) ** 2 < 1; T.cells.push({ x, y, hp: dec ? 0.7 : 1.6, removed: false, fill: 0 }); }
  for (let y = 236; y <= 330; y += 11) for (let x = 440; x <= 560; x += 11) if (inPath(XP.chamber, x, y)) T.seal.push({ x, y, fill: 0 });
}
function drawRCT(ctx) { drawRCTStatic(ctx); drawRCTDynamic(ctx); }
function drawRCTStatic(ctx) {
  drawXsec(ctx, { inflamed: !T.irrigated, decay: 2, canals3: true, after: (c) => { if (T.chamberOpen) { c.fillStyle = T.irrigated ? '#f1dcc0' : '#7a1520'; c.fill(XP.chamber); } } });
  if (T.dam) { ctx.fillStyle = 'rgba(80,190,120,.85)'; ctx.fillRect(-3000, 292, 3372, 40); ctx.fillRect(628, 292, 3400, 40); ctx.fillStyle = '#9aa7b2'; ctx.strokeStyle = '#55636e'; ctx.lineWidth = 2; for (const x of [366, 622]) { rr(ctx, x - 6, 300, 12, 34, 4); ctx.fill(); ctx.stroke(); } }
}
function drawRCTDynamic(ctx) {
  const c = ctx;
  for (const cell of T.cells) if (cell.removed && cell.fill < 1) { c.fillStyle = T.irrigated ? '#f1dcc0' : '#5b0f18'; c.fillRect(cell.x - 6, cell.y - 6, 12, 12); }
  const st = curStep();
  CANALS.forEach((cn, k) => {
    const s = T.canal[k];
    if (s.shape > 0) { canalPoly(c, cn, 0, s.shape, 14, 6); c.fillStyle = T.irrigated ? '#fbf3e4' : '#f3dcc4'; c.fill(); }
    if (s.gp > 0) { canalPoly(c, cn, 0, s.gp, 12, 5); c.fillStyle = s.plug ? '#e07a14' : '#f08a24'; c.fill(); c.strokeStyle = '#b55d0d'; c.lineWidth = 1; c.stroke(); }
    if (T.chamberOpen && !s.found) { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2.5; c.beginPath(); c.arc(cn.x0, cn.y0, 9 + Math.sin(T.t * 6 + k) * 2, 0, 7); c.stroke(); }
    if (s.found) { c.fillStyle = '#ffcb3d'; c.font = '800 13px Nunito,sans-serif'; c.textAlign = 'center'; c.fillText(cn.n, cn.x0 + (k === 2 ? 22 : k === 0 ? -20 : 0), cn.y0 - (k === 1 ? 16 : 6)); }
    if (st && st.kind === 'canal') { const x = lerp(cn.x0, cn.x1, 0.96), y = lerp(cn.y0, cn.y1, 0.96); c.strokeStyle = s.wl ? '#ffcb3d' : 'rgba(255,203,61,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x + 12, y); c.stroke(); }
  });
  if (T.apexFlash) { c.fillStyle = `rgba(236,91,75,${T.apexFlash})`; CANALS.forEach((cn) => { c.beginPath(); c.arc(cn.x1, cn.y1 + 12, 24, 0, 7); c.fill(); }); }
  for (const s of T.seal) if (s.fill >= 1) { c.fillStyle = '#eef2f4'; c.fillRect(s.x - 6, s.y - 6, 12, 12); }
  for (const cell of T.cells) if (cell.fill >= 1) { c.fillStyle = '#eef2f4'; c.fillRect(cell.x - 6, cell.y - 6, 12, 12); }
  if (T.gauge != null) { const x = 740, y = 200; ctx.fillStyle = '#2b2f36'; rr(ctx, x - 70, y - 50, 140, 100, 12); ctx.fill(); ctx.fillStyle = '#a6f0c6'; rr(ctx, x - 58, y - 38, 116, 56, 6); ctx.fill(); const v = T.gauge; ctx.fillStyle = v > 1.02 ? '#ec5b4b' : v >= 0.93 ? '#2f8a57' : '#3c4650'; ctx.font = '800 26px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(v > 1.02 ? 'APEX!' : (Math.max(0, (1 - v) * 3.2 + 0.5)).toFixed(1), x, y - 2); ctx.font = '700 12px Nunito,sans-serif'; ctx.fillStyle = '#e8eef2'; ctx.fillText('Định vị chóp', x, y + 38); for (let k = 0; k < 10; k++) { ctx.fillStyle = k / 10 < v ? (k >= 9 ? '#ec5b4b' : '#2f8a57') : 'rgba(47,138,87,.25)'; ctx.fillRect(x - 54 + k * 11, y + 8, 9, 6); } }
}

/* ---------- periodontal extraction (lower incisor) ---------- */
function setupPerio() {
  T.ex = { lux: 0, off: 0, wob: 0, out: false, pull: null, wig: { lastX: null, dir: 0, acc: 0 } };
  T.cells = [];
  for (let x = 300; x <= 700; x += 22) T.cells.push({ x, y: 330 + Math.sin(x) * 4, kind: 'swab', hp: 1, removed: false, r: 16 });
  for (let y = 350; y <= 410; y += 15) { T.cells.push({ x: 444, y, kind: 'cerv', hp: 1, removed: false, r: 11 }); T.cells.push({ x: 556, y, kind: 'cerv', hp: 1, removed: false, r: 11 }); }
  for (let y = 430; y <= 610; y += 18) for (const x of [482, 500, 518]) if (Math.abs(x - 500) < 24 - (y - 430) * 0.06) T.cells.push({ x, y, kind: 'gran', hp: 1, removed: false, r: 12 });
}
const PERIO_X = { incisor: true, boneTop: 520, calculus: false, gum: '#e0606f' };
function drawPerio(ctx) { drawPerioStatic(ctx); drawPerioDynamic(ctx); }
function drawPerioStatic(ctx) { drawXsec(ctx, Object.assign({ part: 'static' }, PERIO_X)); }
function drawPerioDynamic(ctx) {
  const e = T.ex;
  drawXsec(ctx, Object.assign({
    part: 'dynamic',
    beforeMain: (c) => { if (e.off < -6 || e.out) { c.save(); c.beginPath(); c.rect(-400, 330, 2000, 700); c.clip(); c.fillStyle = '#7a1a22'; c.fill(XP.incisor); c.restore(); } },
    xf: (c) => { c.translate(500, 400 + e.off); c.rotate(e.wob); c.translate(-500, -400); },
    hideMain: e.out && e.off < -700,
    after: (c) => { c.fillStyle = '#c9a24a'; [[446, 360], [444, 378], [556, 368], [558, 392], [447, 400]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 6, 0, 7); c.fill(); }); },
  }, PERIO_X));
  for (const c of T.cells) {
    if (c.kind === 'swab') { if (c.removed) { ctx.fillStyle = 'rgba(170,95,30,.22)'; ctx.beginPath(); ctx.arc(c.x, c.y, 24, 0, 7); ctx.fill(); } }
    else if (c.kind === 'cerv' && !c.removed) { ctx.fillStyle = '#e0606f'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.fill(); }
    else if (c.kind === 'gran' && !c.removed && (e.out || e.off < -60)) { ctx.fillStyle = '#b8323f'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.fill(); }
  }
  if (T.gauze) gauzeAt(ctx, 500, 336);
}
function gauzeAt(ctx, x, y) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#c9d3db'; ctx.lineWidth = 2; rr(ctx, -80, -38, 160, 76, 14); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#e6ecef'; for (let k = -60; k <= 60; k += 20) { ctx.beginPath(); ctx.moveTo(k, -36); ctx.lineTo(k, 36); ctx.stroke(); } ctx.restore(); }

/* ---------- surgical removal of impacted lower third molar ---------- */
const SURG_C = { x: 520, y: 540 }, SURG_ROT = -0.5, SURG_K = 0.82;
function surgPt(lx, ly, off = 0) { const a = SURG_ROT, x = (lx - 500) * SURG_K, y = (ly - 380) * SURG_K; return { x: SURG_C.x + x * Math.cos(a) - y * Math.sin(a), y: SURG_C.y + off + x * Math.sin(a) + y * Math.cos(a) }; }
function setupSurg() {
  T.sg = { lux: 0, wob: 0, crownOff: 0, rootOff: 0, crownOut: false, rootOut: false, cut: false, incised: false, pull: null, wig: { lastX: null, dir: 0, acc: 0 }, sutures: [] };
  T.cells = [];
  for (let x = 240; x <= 780; x += 24) T.cells.push({ x, y: 322, kind: 'swab', hp: 1, removed: false, r: 16 });
  for (let y = 312; y <= 372; y += 16) for (let x = 400; x <= 740; x += 16) T.cells.push({ x, y, kind: 'flap', hp: 1, removed: false, r: 11 });
  const bonePts = [];
  for (const off of [18, 38]) { for (let lx = 372; lx <= 640; lx += 20) bonePts.push(surgPt(lx, 165 - off)); for (let ly = 190; ly <= 340; ly += 20) bonePts.push(surgPt(645 + off, ly)); }
  for (const q of bonePts) if (q.y >= 384 && !inToothSurg(q.x, q.y) && !T.cells.some((c) => c.kind === 'bone' && dist(c.x, c.y, q.x, q.y) < 12)) T.cells.push({ x: q.x, y: q.y, kind: 'bone', hp: 1.2, removed: false, r: 12 });
  for (let y = 420; y <= 720; y += 18) for (let x = 400; x <= 660; x += 18) if (inToothSurg(x, y, true)) T.cells.push({ x, y, kind: 'gran', hp: 1, removed: false, r: 11 });
  T.paths = {
    incision: [[310, 316], [420, 318], [520, 322], [620, 320], [730, 314]].map(([x, y]) => ({ x, y })),
    section: [surgPt(352, 318), surgPt(430, 324), surgPt(500, 328), surgPt(570, 324), surgPt(648, 318)],
  };
  T.sutureAt = [{ x: 420, y: 318 }, { x: 540, y: 322 }, { x: 660, y: 318 }];
}
function inToothSurg(x, y, rootOnly) { const a = -SURG_ROT, dx = x - SURG_C.x, dy = y - SURG_C.y; const lx = (dx * Math.cos(a) - dy * Math.sin(a)) / SURG_K + 500, ly = (dx * Math.sin(a) + dy * Math.cos(a)) / SURG_K + 380; return inPath(XP.tooth, lx, ly) && (!rootOnly || ly > 300); }
function drawSurg(ctx) { drawSurgStatic(ctx); drawSurgDynamic(ctx); }
function drawSurgStatic(ctx) { drawXsec(ctx, { onlyLeft: true, noPap: true, gum: '#ef8d9a', hideMain: true, part: 'static' }); }
function drawSurgDynamic(ctx) {
  const s = T.sg;
  const xfPiece = (off) => (c) => { c.translate(SURG_C.x, SURG_C.y + off); c.rotate(SURG_ROT + s.wob); c.scale(SURG_K, SURG_K); c.translate(-500, -380); };
  drawXsec(ctx, {
    onlyLeft: true, noPap: true, gum: '#ef8d9a', part: 'dynamic',
    beforeMain: (c) => { if (s.crownOff < -6 || s.crownOut || s.rootOff < -6 || s.rootOut) { c.save(); c.beginPath(); c.rect(-400, 352, 2000, 700); c.clip(); c.translate(SURG_C.x, SURG_C.y); c.rotate(SURG_ROT); c.scale(SURG_K, SURG_K); c.translate(-500, -380); c.fillStyle = '#7a1a22'; c.fill(XP.tooth); c.restore(); } },
    hideMain: true,
  });
  const drawPiece = (off, clipFn, hide) => { if (hide) return; ctx.save(); xfPiece(off)(ctx); clipFn(ctx); ctx.fillStyle = '#f3e3c2'; ctx.fill(XP.tooth); ctx.save(); ctx.clip(XP.tooth); ctx.strokeStyle = '#fffdf7'; ctx.lineWidth = 26; ctx.stroke(XP.crown); ctx.restore(); ctx.fillStyle = '#f2a0a8'; ctx.fill(XP.chamber); for (const cn of [CANALS[0], CANALS[2]]) { canalPoly(ctx, cn, 0, 1); ctx.fill(); } ctx.strokeStyle = 'rgba(120,80,40,.6)'; ctx.lineWidth = 3; ctx.stroke(XP.tooth); ctx.restore(); };
  if (!s.cut) drawPiece(s.crownOff, () => { }, s.crownOut && s.crownOff < -700);
  else { drawPiece(s.rootOff, (c) => { c.beginPath(); c.rect(0, 324, 1000, 600); c.clip(); }, s.rootOut && s.rootOff < -700); drawPiece(s.crownOff, (c) => { c.beginPath(); c.rect(0, 0, 1000, 324); c.clip(); }, s.crownOut && s.crownOff < -700); }
  if (s.cut) { const a = T.paths.section; ctx.strokeStyle = 'rgba(60,30,20,.6)'; ctx.lineWidth = 3; ctx.beginPath(); a.forEach((q, k) => (k ? ctx.lineTo(q.x, q.y + s.crownOff * 0) : ctx.moveTo(q.x, q.y))); ctx.stroke(); }
  for (const c of T.cells) {
    if (c.removed && c.kind === 'bone') { ctx.fillStyle = '#8a3a3e'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r + 1, 0, 7); ctx.fill(); continue; }
    if (c.removed && c.kind !== 'swab') continue;
    if (c.kind === 'swab') { if (c.removed) { ctx.fillStyle = 'rgba(170,95,30,.22)'; ctx.beginPath(); ctx.arc(c.x, c.y, 26, 0, 7); ctx.fill(); } }
    else if (c.kind === 'flap') { ctx.fillStyle = '#ef8d9a'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.fill(); }
    else if (c.kind === 'bone') { ctx.fillStyle = '#e9cfa6'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.fill(); }
    else if (c.kind === 'gran' && (s.crownOut && s.rootOut)) { ctx.fillStyle = '#b8323f'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.fill(); }
  }
  if (T.cells.some((c) => c.kind === 'flap' && c.removed)) { ctx.fillStyle = '#e57585'; ctx.beginPath(); ctx.ellipse(780, 300, 60, 22, -0.2, 0, 7); ctx.fill(); }
  if (s.incised && !T.cells.some((c) => c.kind === 'flap' && c.removed)) { ctx.strokeStyle = '#9b1c2c'; ctx.lineWidth = 3; ctx.beginPath(); T.paths.incision.forEach((q, k) => (k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke(); }
  for (const q of s.sutures) { ctx.strokeStyle = '#3b5bd8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(q.x - 8, q.y - 12); ctx.lineTo(q.x + 8, q.y + 12); ctx.moveTo(q.x + 8, q.y - 12); ctx.lineTo(q.x - 8, q.y + 12); ctx.stroke(); }
  if (T.gauze) gauzeAt(ctx, 520, 320);
}
