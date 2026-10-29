/* ================== WORLD 3: rendering + per-frame tick ==================
   Performance: ground + all static props are rendered once into cached layers (LayerCache) and re-used while the camera
   pans. Each frame only the regions around moving things (patients, staff, vehicles…) are recomposed: ground from the
   cache, then every static/dynamic item touching that region in depth order. */
const TREES = [[1.5, 2.2, 'tree_a'], [2.2, 8, 'tree_b'], [1.2, 12.8, 'tree_a'], [18.6, 2.4, 'tree_b'], [19.2, 8.3, 'tree_a'], [18.4, 12.6, 'tree_b'], [7.5, 0.6, 'tree_a'], [13.2, 0.5, 'tree_b'], [-1, 5, 'tree_a'], [21, 15, 'tree_a'], [2.5, 19.2, 'tree_b'], [16, 19.4, 'tree_a'], [-2, 10, 'tree_b'], [4.5, -0.6, 'tree_b'], [17, -0.2, 'tree_a']];
function toothIcon(ctx, x, y, s, fill) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = fill || '#fff'; ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-7, -6); ctx.quadraticCurveTo(-8, -10, -4, -10); ctx.quadraticCurveTo(0, -9, 4, -10); ctx.quadraticCurveTo(8, -10, 7, -6);
  ctx.quadraticCurveTo(7, 0, 5, 3); ctx.lineTo(4, 9); ctx.quadraticCurveTo(2, 10, 1.5, 6); ctx.lineTo(0, 2); ctx.lineTo(-1.5, 6); ctx.quadraticCurveTo(-2, 10, -4, 9); ctx.lineTo(-5, 3); ctx.quadraticCurveTo(-7, 0, -7, -6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function bubble(ctx, x, y, kind, frac, t) {
  const r = 15; ctx.save(); ctx.translate(x, y - (kind === 'ready' ? Math.abs(Math.sin(t * 4)) * 4 : 0));
  ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(80,45,15,.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0.65 * Math.PI, 0.35 * Math.PI); ctx.lineTo(0, r + 7); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (frac != null) { ctx.lineWidth = 3.5; ctx.strokeStyle = kind === 'auto' ? '#4fb5e8' : frac > 0.5 ? '#6cc23a' : frac > 0.25 ? '#ffb020' : '#ec5b4b'; ctx.beginPath(); ctx.arc(0, 0, r + 3.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke(); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (kind === 'pain') { toothIcon(ctx, -1, 1, 0.95); ctx.strokeStyle = '#ec5b4b'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(9, -9); ctx.lineTo(4, -2); ctx.lineTo(8, -2); ctx.lineTo(3, 6); ctx.stroke(); }
  else if (kind === 'ready') { ctx.fillStyle = '#ffb020'; ctx.font = '800 22px "Baloo 2",sans-serif'; ctx.fillText('!', 0, 2); }
  else if (kind === 'auto') toothIcon(ctx, 0, 1, 0.95, '#e6f7ff');
  else if (kind === 'supply') { ctx.fillStyle = '#ec5b4b'; ctx.font = '800 11px Nunito,sans-serif'; ctx.fillText('HẾT', 0, -3); ctx.fillText('VT', 0, 7); }
  else if (kind === 'dots') { ctx.fillStyle = '#8a5a33'; for (let k = 0; k < 3; k++) { ctx.globalAlpha = 0.35 + 0.65 * ((Math.floor(t * 3) % 3) === k); ctx.beginPath(); ctx.arc(-7 + k * 7, 0, 2.6, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  else if (kind === 'heart') { ctx.fillStyle = '#ec5b4b'; ctx.beginPath(); ctx.moveTo(0, 7); ctx.bezierCurveTo(-12, -2, -6, -12, 0, -5); ctx.bezierCurveTo(6, -12, 12, -2, 0, 7); ctx.fill(); }
  else if (kind === 'angry') { ctx.strokeStyle = '#ec5b4b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(6, -6); ctx.lineTo(-6, 6); ctx.stroke(); }
  ctx.restore();
}
function coinBag(ctx, x, y, amount, t) {
  const b = Math.sin(t * 3) * 3; ctx.save(); ctx.translate(x, y + b);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(80,45,15,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 19, 0.65 * Math.PI, 0.35 * Math.PI); ctx.lineTo(0, 27); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffcb3d'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#fff3a6'; ctx.beginPath(); ctx.arc(-4, -4, 4, 0, 7); ctx.fill(); ctx.strokeStyle = '#b27500'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.stroke();
  ctx.fillStyle = '#b27500'; ctx.font = '800 13px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('đ', 0, 1);
  ctx.lineWidth = 3.5; ctx.strokeStyle = '#6e4019'; ctx.strokeText('+' + moneyShort(amount), 0, -30); ctx.fillStyle = '#ffe27a'; ctx.fillText('+' + moneyShort(amount), 0, -30);
  ctx.restore();
}
function drawLockedSign(ctx, c, t) {
  const p = iso(c.cI, c.cJ + 0.2), k = c.k, lv = CHAIR_SLOTS[k].lv > G.level;
  ctx.save(); ctx.translate(p.x, p.y - 26 - Math.sin(t * 2) * 2);
  ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-2, 0, 4, 24); ctx.fillStyle = lv ? '#e9dfcf' : '#fff5da'; ctx.strokeStyle = '#6e4019'; ctx.lineWidth = 2.5; rr(ctx, -44, -22, 88, 30, 9); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4b2a10'; ctx.font = '800 12px "Baloo 2",sans-serif';
  ctx.fillText(lv ? `Cần cấp ${CHAIR_SLOTS[k].lv}` : 'Mua ghế mới', 0, -13); ctx.fillStyle = '#b27500'; ctx.fillText(moneyShort(CHAIR_SLOTS[k].price), 0, -1); ctx.restore();
}
const shelfN = () => { const tot = Object.keys(SUPPLIES).reduce((s, k) => s + Math.min(1, (G.stock[k] || 0) / (SUPPLIES[k].pack * 0.5)), 0); return Math.round(tot / Object.keys(SUPPLIES).length * 18); };
function drawShelfStock(ctx) {
  const n = shelfN(), cols = ['#4fb5e8', '#ec5b4b', '#78c443', '#ffcb3d', '#b48ae6', '#ffffff'];
  onWallJ(ctx, 14.36, 8.76, 0, (c) => { for (let k = 0; k < n; k++) { const row = Math.floor(k / 6), col = k % 6; c.fillStyle = cols[(k * 7) % cols.length]; c.strokeStyle = 'rgba(91,56,24,.6)'; c.lineWidth = 1; const x = 3 + col * 8.6, y = -(26 + row * 25); c.fillRect(x, y + 6, 7, 12); c.strokeRect(x, y + 6, 7, 12); } });
}

/* ---------- draw items: { k: depth, o: tie order, bb: [x0, y0, x1, y1], draw(ctx) } ---------- */
function assetBB(key, x, y, pad = 1) { const a = ASSETS[key]; if (!a) return [x, y, x, y]; return [x + a.x0 - pad, y + a.y0 - pad, x + a.x0 + a.w + pad, y + a.y0 + a.h + pad]; }
function boxBB(i, j, w, d, h, z) { const P = [iso(i, j), iso(i + w, j), iso(i + w, j + d), iso(i, j + d)]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of P) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y - z - h); y1 = Math.max(y1, p.y - z); } return [x0 - 2, y0 - 2, x1 + 2, y1 + 2]; }
function charBB(x, y, o = {}) { const s = o.scale || 0.62, z = o.z || 0, bob = Math.abs(o.bob || 0), dir = Math.abs(o.dir || 0), hw = Math.max(32 * s, 24 * s + dir, 14); return [x - hw - 2, y - z - 98 * s - bob * 2 - 4, x + hw + 2, y + 7]; }
const unionBB = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
const hitBB = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const byDepth = (a, b) => a.k - b.k || a.o - b.o;
function buildStatics() {
  const L = []; let o = 0; const add = (k, bb, draw) => L.push({ k, o: o++, bb, draw });
  const spr = (key, i, j, k) => { const p = iso(i, j); add(k == null ? i + j : k, assetBB(key, p.x, p.y), (c) => drawAsset(c, key, p.x, p.y)); };
  const behind = (i, j) => (i < 3.9 && j > 1.5 && j < 13.6) || (j < 2.9 && i > 2.5 && i < 16.6);
  TREES.forEach(([i, j, a]) => { if (!behind(i, j)) spr(a, i, j); });
  [5, 6.2, 7.4, 12.6, 13.8, 15].forEach((i) => spr('bush', i, 13.9));
  [3.5, 6.5, 9.5, 12.5].forEach((j) => spr('bush', 17, j));
  for (let i = 0; i < 20; i++) if (!behind(i, 0.4)) spr('fence_i', i, 0.4);
  [[8.3, 14.5, 'flowerbed'], [11.9, 14.5, 'flowerbed'], [8.7, 15.3, 'lamp'], [11.4, 15.3, 'lamp'], [12.9, 14.7, 'mailbox'], [13.7, 15.05, 'scooter'], [14.6, 15.15, 'scooter']].forEach(([i, j, a]) => spr(a, i, j));
  { const p = iso(7.6, 14.3); add(7.6 + 14.3, (() => { const b = assetBB('sign', p.x, p.y); return [b[0] - 12, b[1] - 6, b[2] + 30, b[3]]; })(), (c) => { drawAsset(c, 'sign', p.x, p.y); const q = iso(7.15, 14.3); c.save(); c.translate(q.x - 8, q.y - 72); c.transform(0.894, 0.447, 0, 1, 0, 0); c.fillStyle = '#2a8f83'; c.font = '800 10px "Baloo 2",sans-serif'; c.textBaseline = 'middle'; c.fillText('NHA KHOA', 8, 12); c.fillStyle = '#c0504d'; c.font = '800 8px Nunito,sans-serif'; c.fillText((G.profile.clinic || 'Nụ Cười').replace(/^Nha Khoa\s*/i, '').slice(0, 14), 8, 25); c.restore(); }); }
  spr('counter', 4.3, 3.05, 4.3 + 3.4);
  spr('cooler', 6.65, 3.45, 6.65 + 3.45);
  { const p = iso(14.3, 8.3); add(14.3 + 8.6, assetBB('shelf', p.x, p.y, 4), (c) => { drawAsset(c, 'shelf', p.x, p.y); drawShelfStock(c); }); }
  SEATS.forEach((s) => spr('bench', s.i, s.j, s.i + s.j - 0.5));
  if (G.decor.sofa) spr('sofa', 4.85, 10.4, 4.85 + 10.9);
  if (G.decor.tank) spr('tank', 6.68, 11.95, 6.68 + 12.2);
  PLANT_SLOTS.slice(0, G.decor.plant).forEach(([i, j], k) => spr(k % 2 ? 'plant_b' : 'plant_a', i, j));
  if (G.equip.pano) spr('pano', 8.1, 11.85, 8.1 + 11.85);
  [10.1, 13.1].forEach((i) => add(i + 4.8, boxBB(i, 3, 0.1, 3.2, 52, 0), (c) => cbox(c, i, 3, 0.1, 3.2, 52, 0, '#bfe8ff', { top: 'rgba(230,248,255,.9)', left: 'rgba(170,220,245,.55)', right: 'rgba(140,200,235,.55)' })));
  CHAIRS.forEach((ch, k) => { if (k < G.chairs) spr(G.chairLv[k] >= 2 ? 'chair_premium' : 'chair_basic', ch.cI, ch.cJ, ch.cI + ch.cJ); });
  spr('desk', 11.3, 10.6, 12.8 + 11.2);
  add(4 + 13.3, boxBB(4, 12.85, 5.4, 0.15, 18, 0), (c) => cbox(c, 4, 12.85, 5.4, 0.15, 18, 0, '#fff3df'));
  add(10.6 + 15.3, boxBB(10.6, 12.85, 5.4, 0.15, 18, 0), (c) => cbox(c, 10.6, 12.85, 5.4, 0.15, 18, 0, '#fff3df'));
  add(16 + 8.5, boxBB(15.85, 3, 0.15, 10, 18, 0), (c) => cbox(c, 15.85, 3, 0.15, 10, 18, 0, '#f6e2c4'));
  return L.sort(byDepth);
}
function buildDynamics(t) {
  const L = []; let o = 100000; const add = (k, bb, draw) => L.push({ k, o: o++, bb, draw });
  { const p = iso(6.6, 3.01); add(-1, [p.x - 11, p.y - 74 - 15, p.x + 11, p.y - 74 + 15], (c) => drawClockHands(c)); }
  if (G.decor.tv) { const p = iso(4.03, 6.4); add(-1, [p.x - 62, p.y - 78 + 2, p.x - 4, p.y - 78 + 64], (c) => drawTvDot(c, t)); }
  if (G.decor.tank) { const p = iso(6.68, 11.95); add(6.68 + 12.2 + 0.001, assetBB('tank', p.x, p.y), (c) => { for (let k = 0; k < 3; k++) { const fp = iso(6.68 + Math.sin(t * 0.7 + k * 2) * 0.25, 11.95 + ((t * 0.18 + k * 0.33) % 1) - 0.5); c.fillStyle = ['#ff8a3d', '#ffd23f', '#ff6f91'][k]; c.beginPath(); c.ellipse(fp.x, fp.y - 28 - k * 5, 4, 2.4, 0, 0, 7); c.fill(); } }); }
  CHAIRS.forEach((ch, k) => {
    if (k >= G.chairs) { const p = iso(ch.cI, ch.cJ + 0.2); add(ch.cI + ch.cJ + 0.5, [p.x - 47, p.y - 26 - 26, p.x + 47, p.y + 2], (c) => drawLockedSign(c, ch, t)); return; }
    const look = k === 0 ? STAFF[G.profile.g === 'f' ? 'doc_f' : 'doc_m'] : G.assoc[k] ? STAFF.assoc : null;
    if (look) { const p = iso(ch.cI + 0.95, ch.cJ + 0.45), o2 = { mood: 'happy', bob: Math.sin(t * 2 + k) * 0.6 }; add(ch.cI + 0.95 + ch.cJ + 0.45, charBB(p.x, p.y, o2), (c) => drawChar(c, look, p.x, p.y, o2)); }
  });
  { const p = iso(12.7, 10.05), o2 = { mood: 'happy', bob: Math.sin(t * 2) * 0.6 }; add(12.7 + 10.0, charBB(p.x, p.y, o2), (c) => drawChar(c, STAFF.recep, p.x, p.y, o2)); }
  for (const p of W.patients) {
    const s = iso(p.i, p.j), moving = p.path.length > 0, ph = (p.walkT * 2.3) % 1;
    const pose = moving ? 'w' + Math.floor(ph * 8) : (p.state === 'waiting' || p.state === 'ready' || p.state === 'auto') ? 'sit' : 'stand';
    const o2 = { pose, z: seatZ(p), mood: p.mood, dir: p.dir, noShadow: p.state === 'ready' || p.state === 'auto', bob: moving ? Math.abs(Math.sin(ph * Math.PI * 2)) * 1.6 : 0 };
    add(p.i + p.j + (p.state === 'ready' || p.state === 'auto' ? 0.35 : 0.05), charBB(s.x, s.y, o2), (c) => drawChar(c, p.look, s.x, s.y, o2));
  }
  if (W.truck) { const p = iso(W.truck.i, W.truck.j); add(W.truck.i + W.truck.j, assetBB('truck', p.x, p.y), (c) => drawAsset(c, 'truck', p.x, p.y)); }
  W.motos.forEach((m) => { const p = iso(m.i, m.j); add(m.i + m.j, assetBB('moto', p.x, p.y), (c) => drawAsset(c, 'moto', p.x, p.y)); });
  return L.sort(byDepth);
}

/* ---------- cached layers ---------- */
const WTILES = new TileLayer(512, 2, 3);
const WR = { statics: [], skey: '', rev: 0 };
const worldDirty = () => { WR.rev++; };
function worldKey() { return [WR.rev, G.chairs, G.chairLv.join(''), G.decor.plant, G.decor.tv, G.decor.tank, G.decor.sofa, G.decor.ac, G.equip.xray, G.equip.pano, G.profile.name, G.profile.clinic, shelfN()].join('|'); }
const BEHIND = (i, j) => (i < 3.9 && j > 1.5 && j < 13.6) || (j < 2.9 && i > 2.5 && i < 16.6);
let BEHIND_LIST = null;
function renderWorldTile([g, s], tile, rect) {
  drawGround(g);
  if (!BEHIND_LIST) { BEHIND_LIST = []; TREES.forEach(([i, j, a]) => { if (BEHIND(i, j)) BEHIND_LIST.push([i + j, a, i, j]); }); for (let i = 0; i < 20; i++) if (BEHIND(i, 0.4)) BEHIND_LIST.push([i + 0.4, 'fence_i', i, 0.4]); BEHIND_LIST.sort((a, b) => a[0] - b[0]); }
  for (const [, a, i, j] of BEHIND_LIST) { const p = iso(i, j); if (hitBB(assetBB(a, p.x, p.y), rect)) drawAsset(g, a, p.x, p.y); }
  drawBackWalls(g);
  s.save(); s.setTransform(1, 0, 0, 1, 0, 0); s.drawImage(tile.cv[0], 0, 0); s.restore();
  for (const it of WR.statics) if (hitBB(it.bb, rect)) it.draw(s);
}
function drawWorld() {
  const ctx = W.ctx, d = DPR(), t = W.t, sc = d * W.zoom;
  const v = { s: sc, tx: Math.round(d * W.camX), ty: Math.round(d * W.camY), wpx: W.cv.width, hpx: W.cv.height };
  const key = worldKey(); if (WR.skey !== key) { WR.statics = buildStatics(); WR.skey = key; }
  WTILES.prepare(v, key, renderWorldTile, !W.zooming);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (WTILES.holes) { ctx.fillStyle = '#90d24f'; ctx.fillRect(0, 0, v.wpx, v.hpx); }
  const scaled = WTILES.sets.length > 1 || (WTILES.sets[0] && Math.abs(WTILES.sets[0].s - v.s) > 1e-6 * v.s);
  ctx.imageSmoothingEnabled = !scaled || !W.zooming;
  WTILES.blit(ctx, v, 1);
  ctx.setTransform(sc, 0, 0, sc, v.tx, v.ty);
  /* recompose the regions around moving things */
  const dyn = buildDynamics(t), vx0 = -v.tx / sc, vy0 = -v.ty / sc, view = [vx0, vy0, vx0 + v.wpx / sc, vy0 + v.hpx / sc];
  for (const D of dyn) {
    const R0 = [D.bb[0] - 2, D.bb[1] - 2, D.bb[2] + 2, D.bb[3] + 2]; if (!hitBB(R0, view)) continue;
    /* snap the region to whole device pixels so the clip has no anti-aliased edge (avoids faint seams) */
    const R = [(Math.floor(R0[0] * sc + v.tx) - v.tx) / sc, (Math.floor(R0[1] * sc + v.ty) - v.ty) / sc, (Math.ceil(R0[2] * sc + v.tx) - v.tx) / sc, (Math.ceil(R0[3] * sc + v.ty) - v.ty) / sc];
    ctx.save(); ctx.beginPath(); ctx.rect(R[0], R[1], R[2] - R[0], R[3] - R[1]); ctx.clip();
    if (WTILES.holes) { ctx.fillStyle = '#90d24f'; ctx.fillRect(R[0], R[1], R[2] - R[0], R[3] - R[1]); }
    WTILES.blitWorld(ctx, 0, R);
    const items = []; for (const it of WR.statics) if (hitBB(it.bb, R)) items.push(it); for (const it of dyn) if (hitBB(it.bb, R)) items.push(it);
    items.sort(byDepth); for (const it of items) it.draw(ctx);
    ctx.restore();
  }
  ctx.imageSmoothingEnabled = true;
  drawWorldOverlays(ctx, d, t);
}
function drawWorldOverlays(ctx, d, t) {
  if (W.truck && W.truck.phase === 'stop') { for (let k = 0; k < 3; k++) { const f = clamp((W.truck.t - k * 0.3) / 1.2, 0, 1), a = iso(W.truck.i, 16.0), b = iso(10, 13.3); const x = lerp(a.x, b.x, f), y = lerp(a.y, b.y, f) - Math.sin(f * Math.PI) * 40; if (f > 0 && f < 1) { ctx.fillStyle = '#d9a86c'; ctx.strokeStyle = '#6e4019'; ctx.lineWidth = 1.5; ctx.fillRect(x - 7, y - 14, 14, 11); ctx.strokeRect(x - 7, y - 14, 14, 11); } } }
  for (const p of W.patients) {
    const s = iso(p.i, p.j), by = s.y - seatZ(p) - 78, fr = clamp(p.patience / p.maxPat, 0, 1);
    if (p.state === 'checkin') bubble(ctx, s.x, by, 'dots', null, t);
    else if (p.state === 'waiting' || p.state === 'queue') bubble(ctx, s.x, by, 'pain', fr, t);
    else if (p.state === 'ready') bubble(ctx, s.x, by, p.supplyMiss ? 'supply' : 'ready', fr, t);
    else if (p.state === 'auto') bubble(ctx, s.x, by, 'auto', 1 - p.timer / p.timerMax, t);
    else if (p.state === 'leaving') bubble(ctx, s.x, by, p.mood === 'angry' ? 'angry' : 'heart', null, t);
  }
  CHAIRS.forEach((c) => { if (c.coin) { const p = iso(c.cI, c.cJ); coinBag(ctx, p.x, p.y - 118, c.coin.amount, t); } });
  for (const f of W.floats) { ctx.globalAlpha = clamp(1.6 - f.t, 0, 1); ctx.font = '800 16px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#4b2a10'; ctx.strokeText(f.text, f.x, f.y - f.t * 30); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y - f.t * 30); ctx.globalAlpha = 1; }
  if (W.arrow) { const a = W.arrow, b = Math.abs(Math.sin(t * 5)) * 10; ctx.save(); ctx.translate(a.x, a.y - b); ctx.fillStyle = '#ffcb3d'; ctx.strokeStyle = '#6e4019'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, -18); ctx.lineTo(-6, -18); ctx.lineTo(-6, -38); ctx.lineTo(6, -38); ctx.lineTo(6, -18); ctx.lineTo(14, -18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.setTransform(d, 0, 0, d, 0, 0);
  const eve = clamp((G.time - 930) / 90, 0, 1); if (eve > 0) { ctx.fillStyle = `rgba(255,140,60,${(0.16 * eve).toFixed(3)})`; ctx.fillRect(0, 0, W.w, W.h); }
  for (const f of W.flyers) { if (f.t < 0) continue; const k = Math.min(1, f.t / 0.7), e = k * k; const x = lerp(f.x, f.tx, e), y = lerp(f.y, f.ty, e) - Math.sin(k * Math.PI) * 60; ctx.fillStyle = '#ffcb3d'; ctx.strokeStyle = '#b27500'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); ctx.stroke(); }
}
function tickWorld(dt) {
  W.t += dt; updateCamera(dt);
  if (!W.paused) { updatePatients(dt); updateDay(dt); }
  updateTraffic(dt);
  W.floats.forEach((f) => f.t += dt); W.floats = W.floats.filter((f) => f.t < 1.6);
  W.flyers.forEach((f) => f.t += dt); W.flyers = W.flyers.filter((f) => f.t < 0.7);
  W.arrow = tutArrow();
  drawWorld();
}
function initWorld() { W.cv = $('world'); W.ctx = W.cv.getContext('2d'); W.paths = buildPaths(); resizeWorld(); initWorldInput(); }
