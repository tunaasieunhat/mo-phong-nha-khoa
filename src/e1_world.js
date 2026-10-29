/* ================== WORLD 1: isometric engine, layout, ground, walls, camera ================== */
const TW = 64, TH = 32, MAP_W = 22, MAP_H = 18;
const iso = (i, j) => ({ x: (i - j) * TW / 2, y: (i + j) * TH / 2 });
const W = { cv: null, ctx: null, w: 0, h: 0, zoom: 1, camX: 0, camY: 0, t: 0, paused: false, patients: [], floats: [], flyers: [], spawnT: 0.5, spawned: 0, paths: null, arrow: null, motos: [], motoT: 3, truck: null, zoomSet: false };
const SEATS = [5.7, 6.8, 7.9, 9.0].map((j) => ({ i: 4.8, j, occ: null }));
const SOFA_SEATS = [10.35, 11.25].map((j) => ({ i: 4.85, j, occ: null, sofa: true }));
const seatList = () => (G.decor.sofa ? SEATS.concat(SOFA_SEATS) : SEATS);
const CHAIRS = [8.6, 11.6, 14.6].map((cI, k) => ({ k, cI, cJ: 5.0, occ: null, coin: null, auto: null }));
const PLANT_SLOTS = [[6.85, 5.0], [15.5, 7.6], [9.0, 12.45], [11.0, 12.45]];
const CHECKIN = { i: 12.7, j: 12.3 }, DOOR_IN = { i: 10, j: 12.3 }, WALK_J = 12.75, AISLE_I = 6.0, ROW_J = 7.3;

function cpoly(ctx, p, fill, stroke, lw) { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let k = 1; k < p.length; k++) ctx.lineTo(p[k].x, p[k].y); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.2; ctx.stroke(); } }
const upz = (p, z) => ({ x: p.x, y: p.y - z });
function cbox(ctx, i, j, w, d, h, z, color, o = {}) {
  const a = iso(i, j), b = iso(i + w, j), c = iso(i + w, j + d), e = iso(i, j + d), st = o.stroke || 'rgba(91,56,24,.55)';
  cpoly(ctx, [upz(e, z), upz(c, z), upz(c, z + h), upz(e, z + h)], o.left || color, st);
  cpoly(ctx, [upz(c, z), upz(b, z), upz(b, z + h), upz(c, z + h)], o.right || hx(color, -0.14), st);
  cpoly(ctx, [upz(a, z + h), upz(b, z + h), upz(c, z + h), upz(e, z + h)], o.top || hx(color, 0.16), st);
}
const shadowAt = (ctx, x, y, rx, ry, a = 0.18) => { ctx.fillStyle = `rgba(30,50,10,${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); };
function tilePath(p, i, j, w = 1, d = 1) { const a = iso(i, j), b = iso(i + w, j), c = iso(i + w, j + d), e = iso(i, j + d); p.moveTo(a.x, a.y); p.lineTo(b.x, b.y); p.lineTo(c.x, c.y); p.lineTo(e.x, e.y); p.closePath(); }

/* ---------- cached ground ---------- */
function buildPaths() {
  const P = { grassAlt: new Path2D(), tufts: new Path2D(), road: new Path2D(), dash: new Path2D(), curb: new Path2D(), stones: new Path2D(), floorA: new Path2D(), floorB: new Path2D(), woodA: new Path2D(), woodB: new Path2D(), planks: new Path2D(), grout: new Path2D(), flowers: [] };
  const rnd = mulberry(7);
  for (let i = -6; i < MAP_W + 4; i++) for (let j = -6; j < MAP_H + 4; j++) {
    if ((i + j) % 2 === 0) tilePath(P.grassAlt, i, j);
    if (rnd() < 0.22) { const c = iso(i + rnd(), j + rnd()); P.tufts.moveTo(c.x - 3, c.y); P.tufts.lineTo(c.x - 1, c.y - 5); P.tufts.lineTo(c.x + 1, c.y); P.tufts.lineTo(c.x + 3, c.y - 4); P.tufts.lineTo(c.x + 4, c.y); }
  }
  tilePath(P.road, -8, 15.8, MAP_W + 14, 1.6); tilePath(P.curb, -8, 15.62, MAP_W + 14, 0.18);
  for (let i = -8; i < MAP_W + 6; i += 1.2) tilePath(P.dash, i, 16.55, 0.6, 0.08);
  for (let j = 13; j < 15.7; j += 0.62) { tilePath(P.stones, 9.55 + rnd() * 0.1, j, 0.4, 0.45); tilePath(P.stones, 10.05 + rnd() * 0.1, j + 0.25, 0.4, 0.45); }
  for (let i = 4; i < 16; i++) for (let j = 3; j < 13; j++) { const wood = i < 7, alt = (i + j) % 2 === 0; tilePath(wood ? (alt ? P.woodA : P.woodB) : (alt ? P.floorA : P.floorB), i, j); if (!wood) tilePath(P.grout, i, j); }
  for (let i = 4; i <= 7; i += 0.25) { const a = iso(i, 3), b = iso(i, 13); P.planks.moveTo(a.x, a.y); P.planks.lineTo(b.x, b.y); }
  const fcol = ['#ff6f91', '#ffd23f', '#ffffff', '#b48ae6', '#ff9f43'];
  [[2.5, 13.2], [17.4, 10.5], [17.2, 5], [3, 1.6], [11, 1.3]].forEach(([fi, fj]) => { for (let k = 0; k < 7; k++) P.flowers.push({ ...iso(fi + rnd() * 1.4, fj + rnd() * 0.9), c: fcol[Math.floor(rnd() * fcol.length)] }); });
  return P;
}
function drawGround(ctx) {
  const P = W.paths;
  ctx.fillStyle = '#90d24f'; ctx.fillRect(-2500, -1800, 5000, 4200);
  ctx.fillStyle = '#86c947'; ctx.fill(P.grassAlt);
  ctx.strokeStyle = 'rgba(70,130,30,.55)'; ctx.lineWidth = 1.4; ctx.stroke(P.tufts);
  ctx.fillStyle = '#8b8f99'; ctx.fill(P.road); ctx.fillStyle = '#d9d4c7'; ctx.fill(P.curb);
  ctx.fillStyle = '#f4f1e6'; ctx.fill(P.dash);
  ctx.fillStyle = '#e8dcc0'; ctx.fill(P.stones); ctx.strokeStyle = '#b9a986'; ctx.lineWidth = 1.2; ctx.stroke(P.stones);
  for (const f of P.flowers) { ctx.fillStyle = f.c; ctx.beginPath(); ctx.arc(f.x, f.y - 2, 2.6, 0, 7); ctx.fill(); }
  const f0 = iso(4, 13), f1 = iso(16, 13), f2 = iso(16, 3);
  cpoly(ctx, [f0, f1, upz(f1, -8), upz(f0, -8)], '#c9b48e'); cpoly(ctx, [f1, f2, upz(f2, -8), upz(f1, -8)], '#b39c74');
  ctx.fillStyle = '#eef8f5'; ctx.fill(P.floorA); ctx.fillStyle = '#ddf1eb'; ctx.fill(P.floorB);
  ctx.strokeStyle = 'rgba(150,190,180,.35)'; ctx.lineWidth = 1; ctx.stroke(P.grout);
  ctx.fillStyle = '#f2d4a3'; ctx.fill(P.woodA); ctx.fillStyle = '#ebc994'; ctx.fill(P.woodB);
  ctx.strokeStyle = 'rgba(160,110,60,.22)'; ctx.lineWidth = 1; ctx.stroke(P.planks);
  const rug = new Path2D(); tilePath(rug, 5.55, 5.6, 0.35, 5.2); ctx.fillStyle = '#f6a07b'; ctx.fill(rug);
  const mat = new Path2D(); tilePath(mat, 9.3, 12.1, 1.4, 0.85); ctx.fillStyle = '#c0504d'; ctx.fill(mat);
  CHAIRS.forEach((c, k) => { if (k < G.chairs) return; const p = new Path2D(); tilePath(p, c.cI - 1.1, c.cJ - 1.6, 2.2, 3.2); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill(p); ctx.setLineDash([7, 6]); ctx.strokeStyle = '#7aa89c'; ctx.lineWidth = 2; ctx.stroke(p); ctx.setLineDash([]); });
}
function wallJ(ctx, i0, i1, j, z0, z1, fill, st) { cpoly(ctx, [upz(iso(i0, j), z0), upz(iso(i1, j), z0), upz(iso(i1, j), z1), upz(iso(i0, j), z1)], fill, st, 1.2); }
function wallI(ctx, j0, j1, i, z0, z1, fill, st) { cpoly(ctx, [upz(iso(i, j0), z0), upz(iso(i, j1), z0), upz(iso(i, j1), z1), upz(iso(i, j0), z1)], fill, st, 1.2); }
function onWallJ(ctx, i, j, z, fn) { const p = iso(i, j); ctx.save(); ctx.translate(p.x, p.y - z); ctx.transform(0.894, 0.447, 0, 1, 0, 0); fn(ctx); ctx.restore(); }
function onWallI(ctx, i, j, z, fn) { const p = iso(i, j); ctx.save(); ctx.translate(p.x, p.y - z); ctx.transform(0.894, -0.447, 0, 1, 0, 0); fn(ctx); ctx.restore(); }
function drawBackWalls(ctx) {
  const H = 84, st = 'rgba(110,64,25,.6)';
  wallJ(ctx, 4, 16, 3, 0, H, '#fff3df', st); wallI(ctx, 3, 13, 4, 0, H, '#f6e2c4', st);
  wallJ(ctx, 4, 16, 3, 0, 10, '#9fd8c9'); wallI(ctx, 3, 13, 4, 0, 10, '#8ccdbd');
  wallJ(ctx, 4, 16, 3, 40, 43, '#e9d2ad'); wallI(ctx, 3, 13, 4, 40, 43, '#dcc39b');
  cpoly(ctx, [upz(iso(3.8, 2.8), H), upz(iso(16.2, 2.8), H), upz(iso(16, 3), H), upz(iso(4, 3), H)], '#c48a52', st);
  cpoly(ctx, [upz(iso(3.8, 2.8), H), upz(iso(4, 3), H), upz(iso(4, 13), H), upz(iso(3.8, 13), H)], '#b07a45', st);
  for (const i0 of [7.6, 10.6, 13.6]) {
    onWallJ(ctx, i0, 3.01, 66, (c) => {
      const w = 1.6 * 35.8; c.fillStyle = '#fff'; c.strokeStyle = '#6e4019'; c.lineWidth = 1.6; rr(c, -3, -3, w + 6, 40, 3); c.fill(); c.stroke();
      const g = c.createLinearGradient(0, 0, 0, 34); g.addColorStop(0, '#9fdcff'); g.addColorStop(1, '#e4f6ff'); c.fillStyle = g; c.fillRect(0, 0, w, 34);
      c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(w * 0.3, 10, 9, 4, 0, 0, 7); c.ellipse(w * 0.38, 8, 7, 4, 0, 0, 7); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, 34); c.stroke();
      c.fillStyle = '#f6a07b'; c.beginPath(); c.moveTo(-4, -4); c.quadraticCurveTo(6, 14, 2, 36); c.lineTo(-4, 36); c.fill(); c.beginPath(); c.moveTo(w + 4, -4); c.quadraticCurveTo(w - 6, 14, w - 2, 36); c.lineTo(w + 4, 36); c.fill();
    });
  }
  onWallI(ctx, 4.02, 4.0, 70, (c) => { c.fillStyle = '#fff'; c.strokeStyle = '#6e4019'; c.lineWidth = 2; rr(c, -52, -6, 46, 34, 4); c.fill(); c.stroke(); c.fillStyle = '#4b2a10'; c.font = '800 6px Nunito,sans-serif'; c.textAlign = 'center'; c.fillText('BẰNG BÁC SĨ', -29, 4); c.fillText('RĂNG HÀM MẶT', -29, 11); c.fillStyle = '#c0504d'; c.font = '800 5.5px Nunito,sans-serif'; c.fillText((G.profile.name || 'Bác sĩ').slice(0, 18), -29, 20); c.fillStyle = '#ffcb3d'; c.beginPath(); c.arc(-12, 22, 3, 0, 7); c.fill(); });
  onWallJ(ctx, 6.6, 3.01, 74, (c) => { c.fillStyle = '#fff'; c.strokeStyle = '#6e4019'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.stroke(); });
  onWallI(ctx, 4.02, 10.4, 72, (c) => { c.fillStyle = '#fff'; c.strokeStyle = '#6e4019'; c.lineWidth = 2; rr(c, -40, -4, 36, 46, 3); c.fill(); c.stroke(); c.fillStyle = '#e6f7ff'; c.fillRect(-36, 0, 28, 24); c.fillStyle = '#fffdf5'; c.strokeStyle = '#7a5a3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(-28, 6); c.quadraticCurveTo(-22, 2, -16, 6); c.lineTo(-17, 18); c.lineTo(-20, 20); c.lineTo(-22, 13); c.lineTo(-24, 20); c.lineTo(-27, 18); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#4fb5e8'; c.fillRect(-36, 28, 28, 3); c.fillRect(-36, 34, 20, 3); });
  if (G.decor.tv) onWallI(ctx, 4.03, 6.4, 78, (c) => { c.fillStyle = '#2b2f36'; rr(c, -70, -4, 66, 40, 4); c.fill(); const g = c.createLinearGradient(-66, 0, -8, 0); g.addColorStop(0, '#6ad1ff'); g.addColorStop(1, '#a6f0c6'); c.fillStyle = g; c.fillRect(-66, 0, 58, 32); });
  if (G.decor.ac) { const p = iso(9.25, 3.0); drawAsset(ctx, 'ac', p.x + 6, p.y - 62); }
  if (G.equip.xray) { const p = iso(7.25, 3.0); drawAsset(ctx, 'xray_wall', p.x, p.y); }
}

function drawClockHands(ctx) { onWallJ(ctx, 6.6, 3.01, 74, (c) => { const m = G.time % 60, h = (G.time / 60) % 12; c.strokeStyle = '#6e4019'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(m / 60 * 6.283) * 6, -Math.cos(m / 60 * 6.283) * 6); c.moveTo(0, 0); c.lineTo(Math.sin(h / 12 * 6.283) * 4, -Math.cos(h / 12 * 6.283) * 4); c.stroke(); }); }
function drawTvDot(ctx, t) { onWallI(ctx, 4.03, 6.4, 78, (c) => { c.save(); c.translate(-37 + Math.sin(t * 2) * 12, 16); c.fillStyle = '#fffdf5'; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill(); c.fillStyle = '#4b2a10'; c.fillRect(-3, -2, 2, 2); c.fillRect(1, -2, 2, 2); c.restore(); }); }

/* ---------- camera + input (drag with inertia, smooth wheel zoom) ---------- */
function resizeWorld() {
  const r = W.cv.getBoundingClientRect(), d = DPR(); W.w = r.width; W.h = r.height; const w2 = Math.max(1, Math.round(r.width * d)), h2 = Math.max(1, Math.round(r.height * d)); if (W.cv.width !== w2 || W.cv.height !== h2) { W.cv.width = w2; W.cv.height = h2; }
  if (!W.zoomSet) { W.zoom = clamp(Math.min(W.w / 840, W.h / 560), 0.5, 1.6); W.zoomSet = true; centerCam(); }
  clampCam();
}
function centerCam() { W.camX = W.w / 2 - W.zoom * 64; W.camY = W.h / 2 - W.zoom * 262 + 22; }
function clampCam() { const z = W.zoom; W.camX = clamp(W.camX, W.w / 2 - z * 560, W.w / 2 + z * 460); W.camY = clamp(W.camY, W.h / 2 - z * 580, W.h / 2 - z * 10); }
function toWorld(sx, sy) { return { x: (sx - W.camX) / W.zoom, y: (sy - W.camY) / W.zoom }; }
function zoomAt(sx, sy, nz) { nz = clamp(nz, 0.5, 2.2); if (nz !== W.zoom) { W.zooming = true; W.zoomT = W.t; } const w = toWorld(sx, sy); W.zoom = nz; W.camX = sx - w.x * nz; W.camY = sy - w.y * nz; clampCam(); }
function updateCamera(dt) {
  if (W.zt != null) { const nz = W.zoom + (W.zt - W.zoom) * (1 - Math.exp(-16 * dt)); if (Math.abs(W.zt - nz) < 0.002) { zoomAt(W.za.x, W.za.y, W.zt); W.zt = null; } else zoomAt(W.za.x, W.za.y, nz); }
  if (W.fling) { const f = W.fling; W.camX += f.x * dt; W.camY += f.y * dt; clampCam(); const k = Math.exp(-5.5 * dt); f.x *= k; f.y *= k; if (Math.hypot(f.x, f.y) < 12) W.fling = null; }
  if (W.zooming && W.t - (W.zoomT || 0) > 0.25) W.zooming = false;
}
function initWorldInput() {
  const cv = W.cv, ptrs = new Map(); let start = null, pinch = null;
  cv.addEventListener('pointerdown', (e) => {
    Sound.init(); cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY }); W.fling = null; W.zt = null;
    if (ptrs.size === 1) start = { x: e.offsetX, y: e.offsetY, cx: W.camX, cy: W.camY, moved: false, lx: e.offsetX, ly: e.offsetY, lt: performance.now(), vx: 0, vy: 0 };
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: dist(a.x, a.y, b.x, b.y), z: W.zoom }; if (start) start.moved = true; }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    if (ptrs.size === 2 && pinch) { const [a, b] = [...ptrs.values()]; zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch.z * dist(a.x, a.y, b.x, b.y) / pinch.d); return; }
    if (start) {
      const dx = e.offsetX - start.x, dy = e.offsetY - start.y; if (!start.moved && Math.hypot(dx, dy) > 7) { start.moved = true; cv.classList.add('dragging'); }
      if (start.moved) { W.camX = start.cx + dx; W.camY = start.cy + dy; clampCam(); }
      const now = performance.now(), ddt = Math.max(1, now - start.lt) / 1000; start.vx = lerp(start.vx, (e.offsetX - start.lx) / ddt, 0.35); start.vy = lerp(start.vy, (e.offsetY - start.ly) / ddt, 0.35); start.lx = e.offsetX; start.ly = e.offsetY; start.lt = now;
    }
  });
  const end = (e) => { if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (ptrs.size === 0) { if (start && !start.moved && e.type === 'pointerup') worldTap(e.offsetX, e.offsetY); else if (start && start.moved && performance.now() - start.lt < 80 && Math.hypot(start.vx, start.vy) > 120) W.fling = { x: clamp(start.vx, -2600, 2600), y: clamp(start.vy, -2600, 2600) }; start = null; cv.classList.remove('dragging'); } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('wheel', (e) => { e.preventDefault(); W.zt = clamp((W.zt != null ? W.zt : W.zoom) * Math.exp(-e.deltaY * 0.0015), 0.5, 2.2); W.za = { x: e.offsetX, y: e.offsetY }; }, { passive: false });
}
