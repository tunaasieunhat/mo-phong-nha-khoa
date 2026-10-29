/* ================== TREATMENT: input, per-frame update, drawing ================== */
function resizeTreat() {
  const cv = $('tc'); if (!cv || $('treat').hidden) return; const r = cv.getBoundingClientRect(), d = DPR();
  const w2 = Math.max(1, Math.round(r.width * d)), h2 = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w2 || cv.height !== h2) { cv.width = w2; cv.height = h2; }
  T.cv = cv; T.ctx = cv.getContext('2d'); T.cw = r.width; T.ch = r.height; layoutTreat();
}
function projSeg(c, x, y) { const dx = c.x1 - c.x0, dy = c.y1 - c.y0, L = dx * dx + dy * dy; const t = Math.max(0, ((x - c.x0) * dx + (y - c.y0) * dy) / L); return { t, d: dist(x, y, c.x0 + dx * t, c.y0 + dy * t) }; }
const objOf = (o) => (o === 'ex' ? T.ex : T.sg);
const zoomable = () => T.view === 'mouth' || T.view === 'scaling';
function initTreatInput() {
  const cv = $('tc'), ptrs = new Map(); let st0 = null, pinch = null;
  cv.addEventListener('pointerdown', (e) => {
    Sound.init(); cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    const q = s2v(e.offsetX, e.offsetY); Object.assign(T.ptr, q, { sx: e.offsetX, sy: e.offsetY, down: true, on: true });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: dist(a.x, a.y, b.x, b.y), z: T.cam.z }; st0 = null; T.probe = null; return; }
    st0 = { x: e.offsetX, y: e.offsetY, fx: T.cam.fx, fy: T.cam.fy, moved: false, probing: false };
    if (T.phase === 'exam' && T.tool === 'explorer' && !T.anim) st0.probing = explorerDown(q);
    if (T.phase === 'tx') txDown(q);
  });
  const coach = $('tCoach'); let cr = null, crT = 0;
  const coachFade = (e) => { if (coach.hidden) return; const now = performance.now(); if (!cr || now - crT > 500) { cr = coach.getBoundingClientRect(); crT = now; } const over = e.clientX > cr.left - 24 && e.clientX < cr.right + 24 && e.clientY > cr.top - 24 && e.clientY < cr.bottom + 24; if (coach.classList.contains('fade') !== over) coach.classList.toggle('fade', over); };
  cv.addEventListener('pointerleave', () => coach.classList.remove('fade'));
  cv.addEventListener('pointermove', (e) => {
    coachFade(e);
    const q = s2v(e.offsetX, e.offsetY); Object.assign(T.ptr, q, { sx: e.offsetX, sy: e.offsetY, on: true });
    if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    if (ptrs.size === 2 && pinch) { const [a, b] = [...ptrs.values()]; if (zoomable()) { T.cam.z = clamp(pinch.z * dist(a.x, a.y, b.x, b.y) / pinch.d, 1, 3); clampCamT(); T.zooming = true; T.zoomT = T.t; } return; }
    if (T.phase === 'exam' && st0) {
      if (st0.probing) { explorerMove(q); return; }
      const dx = e.offsetX - st0.x, dy = e.offsetY - st0.y; if (!st0.moved && Math.hypot(dx, dy) > 8) st0.moved = true;
      if (st0.moved && T.cam.z > 1.01) { const k = T.S * T.cam.z; T.cam.fx = st0.fx - dx / k; T.cam.fy = st0.fy - dy / k; clampCamT(); }
      return;
    }
    if (T.phase === 'tx' && T.ptr.down) txMove(q);
  });
  const up = (e) => {
    if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null;
    if (ptrs.size) return;
    if (T.phase === 'exam' && st0) { if (st0.probing) explorerUp(); else if (!st0.moved && e.type === 'pointerup') examTap(T.ptr.x, T.ptr.y); }
    if (T.phase === 'tx') txUp();
    st0 = null; T.ptr.down = false; Sound.motorOff();
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', () => { T.ptr.on = false; });
  cv.addEventListener('wheel', (e) => {
    e.preventDefault(); if (!zoomable()) return;
    const before = s2v(e.offsetX, e.offsetY); T.cam.z = clamp(T.cam.z * Math.exp(-e.deltaY * 0.0015), 1, 3); const after = s2v(e.offsetX, e.offsetY);
    T.cam.fx += before.x - after.x; T.cam.fy += before.y - after.y; clampCamT(); T.zooming = true; T.zoomT = T.t;
  }, { passive: false });
  document.querySelectorAll('#zoomBar button').forEach((b) => b.onclick = () => { Sound.tap(); camPreset(b.dataset.z); });
}
function txDown(q) {
  const st = curStep(); if (!st) return;
  if (T.tool !== st.tool) { toast('Hãy chọn dụng cụ phù hợp ở khay bên dưới trước.'); return; }
  if (st.kind === 'tap' || st.kind === 'points' || st.kind === 'quiz') { stepTap(q); return; }
  if (st.kind === 'canal') {
    for (let k = 0; k < CANALS.length; k++) { const r = projSeg(CANALS[k], q.x, q.y), cv = T.canal[k]; const doneK = st.mode === 'wl' ? cv.wl : cv[st.mode] >= (st.mode === 'dry' ? 0.9 : 0.94); if (r.d < 26 && r.t < 0.3 && !doneK) { T.drag = { k, over: false }; break; } }
    if (!T.drag) toast('Đặt dụng cụ vào miệng ống tủy chưa làm (đầu trên của ống).');
  }
  if (st.kind === 'wiggle') objOf(st.obj).wig.lastX = q.x;
  if (st.kind === 'pull') {
    if (st.obj === 'ex') { if (dist(q.x, q.y, 500, 250) < 150) T.ex.pull = { y0: q.y }; }
    else { const c = st.obj === 'crown' ? surgPt(500, 230) : surgPt(500, 470); if (dist(q.x, q.y, c.x, c.y) < 150) T.sg.pull = { y0: q.y }; }
    if (!(T.ex && T.ex.pull) && !(T.sg && T.sg.pull)) toast('Đặt dụng cụ lên phần răng cần lấy.');
  }
  if (st.kind === 'trace') { const i0 = T.traceIdx || 0, p0 = T.tracePts[i0]; if (dist(q.x, q.y, p0.x, p0.y) < 34) T.tracing = true; else toast(i0 ? 'Đặt dao tiếp tục từ chỗ đã rạch.' : 'Bắt đầu từ đầu đường chấm (phía răng 7).'); }
  if (['hs', 'ls', 'scaler', 'surgdrill', 'finish', 'polish', 'pbrush', 'air', 'niti'].includes(st.tool)) Sound.motorOn(st.tool);
}
function txMove(q) {
  const st = curStep(); if (!st || T.tool !== st.tool) return;
  if (st.kind === 'canal' && T.drag) {
    const k = T.drag.k, r = projSeg(CANALS[k], q.x, q.y); if (r.d > 60) { T.drag = null; T.gauge = null; return; }
    if (st.mode === 'wl') { T.gauge = r.t; if (r.t > 1.02 && !T.drag.over) { T.drag.over = true; T.pen.apex++; T.comfort = clamp(T.comfort - 6, 0, 100); updateComfort(); T.apexFlash = 0.6; Sound.tone(2400, 0.3, 'square', 0.05); toast('Máy báo APEX: trâm đã ra khỏi chóp! Rút lại.', 'bad'); } else if (r.t > 0.93 && r.t <= 1.02 && Math.random() < 0.15) Sound.beep(1800); }
    else { const c = T.canal[k]; c[st.mode] = Math.max(c[st.mode], Math.min(r.t, 1)); if (r.t > 1.05 && !T.drag.over) { T.drag.over = true; T.pen.apex++; T.comfort = clamp(T.comfort - 6, 0, 100); updateComfort(); T.apexFlash = 0.6; Sound.bad(); toast(st.mode === 'gp' ? 'Trám bít quá chóp!' : 'Vượt quá chóp răng! Dừng ở chiều dài làm việc.', 'bad'); } }
  }
  if (st.kind === 'wiggle') {
    const o = objOf(st.obj), w = o.wig, dx = q.x - (w.lastX ?? q.x); w.lastX = q.x; const sg = Math.sign(dx);
    if (sg && sg !== w.dir) { if (w.acc > 22) { o.lux = Math.min(1, o.lux + (st.obj === 'ex' ? 0.25 : 0.13)); Sound.tone(150 + o.lux * 120, 0.12, 'triangle', 0.08); } w.dir = sg; w.acc = 0; }
    w.acc += Math.abs(dx); o.wob = clamp(o.wob + dx * 0.0016, -0.07, 0.07);
  }
  if (st.kind === 'pull') { const o = st.obj === 'ex' ? T.ex : T.sg; if (o.pull) { const dy = clamp(q.y - o.pull.y0, -260, 0); if (st.obj === 'ex') T.ex.off = dy; else if (st.obj === 'crown') T.sg.crownOff = dy; else T.sg.rootOff = dy; } }
  if (st.kind === 'trace' && T.tracing) {
    const P = T.tracePts; let i = T.traceIdx || 0, moved = false;
    for (let k = i + 1; k <= Math.min(i + 8, P.length - 1); k++) if (dist(q.x, q.y, P[k].x, P[k].y) < 26) { i = k; moved = true; }
    if (!moved && dist(q.x, q.y, P[i].x, P[i].y) > 46) { T.tracing = false; toast('Đi lệch khỏi đường rạch. Đặt lại dụng cụ ở chỗ đang dở.'); }
    T.traceIdx = i; T.trace = i / (P.length - 1); if (moved && Math.random() < 0.5) spawnParts(q.x, q.y, st.tool === 'zekrya' ? 'surgdrill' : 'periosteal');
  }
}
function txUp() {
  const st = curStep();
  if (st && st.kind === 'canal' && st.mode === 'wl' && T.drag) {
    const t = T.gauge || 0, c = T.canal[T.drag.k];
    if (t >= 0.93 && t <= 1.02 && !T.drag.over) { c.wl = true; Sound.beep(1500); toast(`Ống ${CANALS[T.drag.k].n}: chiều dài làm việc ${(19.5 + t * 2).toFixed(1)} mm`, 'good'); }
    else if (!T.drag.over) toast('Chưa tới chiều dài làm việc: đưa trâm sâu hơn tới vạch 0.5.');
  }
  T.drag = null; T.gauge = null; T.tracing = false; if (T.ex) T.ex.pull = null; if (T.sg) T.sg.pull = null;
}
let lastProg = '';
function updateTreat(dt) {
  T.t += dt; if (T.apexFlash) T.apexFlash = Math.max(0, T.apexFlash - dt);
  if (T.zooming && T.t - (T.zoomT || 0) > 0.22) T.zooming = false;
  T.parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.life -= dt; }); T.parts = T.parts.filter((p) => p.life > 0);
  if (T.phase === 'exam' || T.labels.length) updateExam(dt);
  const st = T.phase === 'tx' ? curStep() : null;
  if (T.ex) { if (!T.ptr.down) T.ex.wob *= 0.9; if (T.ex.out) T.ex.off -= dt * 900; else if (!T.ex.pull && T.ex.off < 0) T.ex.off *= 0.85; }
  if (T.sg) { if (!T.ptr.down) T.sg.wob *= 0.9; if (T.sg.crownOut) T.sg.crownOff -= dt * 900; else if (!T.sg.pull && T.sg.crownOff < 0) T.sg.crownOff *= 0.85; if (T.sg.rootOut) T.sg.rootOff -= dt * 900; else if (!T.sg.pull && T.sg.rootOff < 0) T.sg.rootOff *= 0.85; }
  if (!st) return;
  if (T.waiting != null) { T.waiting -= dt; if (T.waiting <= 0) { T.waiting = null; completeStep(); } return; }
  if (T.ptr.down && T.tool === st.tool) {
    if (st.kind === 'rub') rubAt(T.ptr.x, T.ptr.y, dt);
    if (st.kind === 'hold') { const a = st.at, ok = a ? dist(T.ptr.x, T.ptr.y, a.x, a.y) < a.r + 12 : true; if (ok) { T.hold += dt; if (Math.random() < 0.5) spawnParts(T.ptr.x, T.ptr.y, st.tool); } }
  }
  if (st.target === 'decay') { const s = targetCells(st), left = s.filter((c) => !c.removed && c.open).length, closed = s.filter((c) => !c.open).length; if (!closed && left > 0 && left <= 2) s.forEach((c) => c.removed = true); }
  const pr = stepProgress(), w = Math.round(clamp(pr, 0, 1) * 100) + '%'; if (w !== lastProg) { lastProg = w; const bar = $('tProg'); if (bar) bar.style.width = w; }
  let need = 1; if (st.kind === 'rub') need = st.target === 'decay' ? 1 : 0.95; if (st.kind === 'trace') need = 0.95;
  if (st.kind === 'canal') { const ok = T.canal.every((c) => (st.mode === 'wl' ? c.wl : c[st.mode] >= (st.mode === 'dry' ? 0.9 : 0.94))); if (ok) completeStep(); return; }
  if (pr >= need) { if (st.wait) { T.waiting = st.wait; setStepUI(`Bước ${T.si + 1}/${T.steps.length} · ${st.title}`, st.waitText, 1); Sound.motorOff(); } else completeStep(); }
}

/* ---------- drawing: cached static layer + dynamic layer + overlays ---------- */
const TCACHE = new LayerCache(1, 6e6);
function drawSceneStatic(ctx) {
  const p = T.p;
  if (T.view === 'face') drawFaceView(ctx, p);
  else if (T.view === 'mouth' || T.view === 'scaling') drawMouthView(ctx, p, { sel: T.phase === 'exam' ? T.sel : null, chart: T.phase === 'exam' || T.phase === 'rec' ? T.chart : null, noDeposits: T.view === 'scaling', wob: T.wob });
  else if (T.view === 'occl') drawOcclStatic(ctx);
  else if (T.view === 'rct') drawRCTStatic(ctx);
  else if (T.view === 'perio') drawPerioStatic(ctx);
  else if (T.view === 'surg') drawSurgStatic(ctx);
}
function drawSceneDynamic(ctx) {
  if (T.view === 'scaling') drawMouthCells(ctx, T.cells);
  else if (T.view === 'mouth') drawExamFx(ctx);
  else if (T.view === 'occl') drawOcclDynamic(ctx);
  else if (T.view === 'rct') drawRCTDynamic(ctx);
  else if (T.view === 'perio') drawPerioDynamic(ctx);
  else if (T.view === 'surg') drawSurgDynamic(ctx);
}
function staticSig() {
  const v = T.view, id = T.p ? T.p.id : 0;
  if (v === 'face') return `f|${id}|${T.faceMood}`;
  if (v === 'mouth' || v === 'scaling') return `${v}|${id}|${T.phase}|${T.sel}|${T.rev}|${T.wob ? T.wob.n + ':' + T.wob.dx.toFixed(1) : ''}`;
  if (v === 'occl') return `o|${id}|${T.cotton}|${T.crownType}`;
  if (v === 'rct') return `r|${id}|${T.chamberOpen}|${T.irrigated}|${T.dam}`;
  return v + '|' + id;
}
function treatView(z, fx, fy, cx, cy) { const d = DPR(), k = T.S * z * d; return { s: k, tx: Math.round(d * cx - k * fx), ty: Math.round(d * cy - k * fy), wpx: Math.round(T.cw * d), hpx: Math.round(T.ch * d) }; }
function applyCam(ctx, d, z, fx, fy, cx, cy) { const k = T.S * z; ctx.setTransform(d * k, 0, 0, d * k, d * (cx - k * fx), d * (cy - k * fy)); }
function drawTreat() {
  const ctx = T.ctx; if (!ctx || !T.p) return; const d = DPR();
  const v = treatView(T.cam.z, T.cam.fx, T.cam.fy, T.cw / 2, T.ch / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  TCACHE.ensure(v, staticSig(), ([c]) => drawSceneStatic(c), T.zooming);
  TCACHE.blit(ctx, v);
  ctx.setTransform(v.s, 0, 0, v.s, v.tx, v.ty);
  drawSceneDynamic(ctx);
  const st = T.phase === 'tx' ? curStep() : null;
  if (st && st.kind === 'hold' && st.at) { const a = st.at; ctx.strokeStyle = 'rgba(127,208,245,.95)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(a.x, a.y, a.r * (0.85 + 0.12 * Math.sin(T.t * 5)), 0, 7); ctx.stroke(); if (T.hold > 0) { ctx.strokeStyle = '#78c443'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(a.x, a.y, a.r + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(T.hold / st.secs, 0, 1)); ctx.stroke(); } }
  else if (st && st.kind === 'hold' && T.hold > 0) { ctx.strokeStyle = '#78c443'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(T.ptr.x, T.ptr.y, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(T.hold / st.secs, 0, 1)); ctx.stroke(); }
  if (st && st.kind === 'points' && T.pts) for (const q of T.pts) { ctx.lineWidth = 3; ctx.strokeStyle = q.done ? '#78c443' : 'rgba(255,255,255,.95)'; ctx.fillStyle = q.done ? 'rgba(120,196,67,.45)' : 'rgba(255,203,61,.35)'; ctx.beginPath(); ctx.arc(q.x, q.y, 16 + (q.done ? 0 : Math.sin(T.t * 6) * 3), 0, 7); ctx.fill(); ctx.stroke(); }
  if (st && st.kind === 'trace' && T.tracePts) { const P = T.tracePts, i = T.traceIdx || 0; ctx.setLineDash([8, 7]); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 3; ctx.beginPath(); P.forEach((q, k) => (k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = '#ffcb3d'; ctx.lineWidth = 5; ctx.beginPath(); P.slice(0, i + 1).forEach((q, k) => (k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke(); ctx.fillStyle = '#ffcb3d'; ctx.beginPath(); ctx.arc(P[i].x, P[i].y, 9 + Math.sin(T.t * 6) * 2, 0, 7); ctx.fill(); }
  if (st && st.kind === 'pull') { const c = st.obj === 'ex' ? { x: 500, y: 200 } : st.obj === 'crown' ? surgPt(500, 200, T.sg.crownOff) : surgPt(500, 470, T.sg.rootOff); const b = Math.sin(T.t * 5) * 6; ctx.fillStyle = 'rgba(255,203,61,.92)'; ctx.beginPath(); ctx.moveTo(c.x, c.y - 90 + b); ctx.lineTo(c.x - 22, c.y - 60 + b); ctx.lineTo(c.x + 22, c.y - 60 + b); ctx.closePath(); ctx.fill(); }
  if (st && st.kind === 'wiggle') { const c = st.obj === 'ex' ? { x: 500, y: 200 } : surgPt(500, 220); const b = Math.sin(T.t * 6) * 10; ctx.strokeStyle = 'rgba(255,203,61,.92)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(c.x - 70 + b, c.y - 90); ctx.lineTo(c.x + 70 + b, c.y - 90); ctx.stroke(); }
  for (const p of T.parts) { ctx.globalAlpha = clamp(p.life * 2, 0, 1); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  if (T.ptr.on && T.tool && (T.phase === 'tx' || T.phase === 'exam')) { const j = T.jit ? (Math.random() - 0.5) * 7 : 0; drawToolCursor(ctx, T.tool, T.ptr.x + j, T.ptr.y + j * 0.6, T.ptr.down, st); }
  if (T.phase === 'exam' && T.tool === 'mirror' && T.ptr.on && T.view === 'mouth') {
    const R = 72, lx = T.ptr.sx - 80 < R + 4 ? T.ptr.sx + 80 : T.ptr.sx - 80, ly = T.ptr.sy - 80 < R + 4 ? T.ptr.sy + 80 : T.ptr.sy - 80;
    ctx.save(); ctx.setTransform(d, 0, 0, d, 0, 0); ctx.beginPath(); ctx.arc(lx, ly, R, 0, 7); ctx.clip();
    applyCam(ctx, d, T.cam.z * 2.3, T.ptr.x, T.ptr.y, lx, ly); drawSceneStatic(ctx); drawSceneDynamic(ctx); ctx.restore();
    ctx.save(); ctx.setTransform(d, 0, 0, d, 0, 0); ctx.strokeStyle = '#9aa7b2'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(lx, ly, R, 0, 7); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = '#9aa7b2'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(lx + R * 0.7, ly + R * 0.7); ctx.lineTo(lx + R * 1.25, ly + R * 1.25); ctx.stroke(); ctx.restore();
  }
}
function drawToolCursor(ctx, id, x, y, down, st) {
  if (st && st.kind === 'rub' && id === st.tool) { ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, st.r || 28, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  if (id === 'gauze') { ctx.fillStyle = 'rgba(255,255,255,.9)'; rr(ctx, x - 34, y - 22, 68, 44, 10); ctx.fill(); return; }
  if (id === 'cotton') { ctx.fillStyle = 'rgba(255,255,255,.9)'; rr(ctx, x - 40, y - 10, 80, 20, 10); ctx.fill(); return; }
  if ((id === 'mirror' || id === 'chart') && T.phase === 'exam') { if (id === 'chart') { const co = CHART_OPTS.find((o) => o[0] === T.chartCode); ctx.fillStyle = co ? co[2] : '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill(); ctx.stroke(); } return; }
  if (id === 'light' && down) { const g = ctx.createRadialGradient(x, y, 4, x, y, 90); g.addColorStop(0, 'rgba(120,150,255,.75)'); g.addColorStop(1, 'rgba(120,150,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 90, 0, 7); ctx.fill(); }
  const handle = { hs: '#c9d3db', ls: '#3fb6a8', scaler: '#eef2f4', etch: '#2b7fb0', bond: '#f2a03d', comp: '#e9dcc0', light: '#3c4650', polish: '#9aa7b2', air: '#9aa7b2', syringe: '#cfeefb', apex: '#ffcb3d', niti: '#4a7fd6', gp: '#f08a24', irrig: '#e6f7ff', ppoint: '#fffdf5', periosteal: '#9aa7b2', elevator: '#ffcb3d', forceps: '#7b8a96', surgdrill: '#c9d3db', zekrya: '#c9a227', scalpel: '#7b8a96', needle: '#7b8a96', curette: '#7b8a96', gracey: '#4fb5e8', pbrush: '#9aa7b2', swab: '#e8d7a8', saline: '#f4fbff', plugger: '#3c4650', gic: '#ffffff', dg16: '#ffcb3d', explorer: '#7b8a96', paper: '#4a7fd6', finish: '#c9d3db', dam: '#7fd6a0', xray: '#f4f7f8', probe: '#7b8a96', cold: '#bfe8ff', perc: '#7b8a96', mob: '#7b8a96', brush: '#4fb5e8', rinse: '#e6f7ff' }[id] || '#9aa7b2';
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.62);
  ctx.strokeStyle = 'rgba(40,20,10,.5)'; ctx.lineWidth = 17; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, -170); ctx.stroke();
  ctx.strokeStyle = handle; ctx.lineWidth = 13; ctx.stroke();
  ctx.strokeStyle = '#7b8a96'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, 0); ctx.stroke();
  if (id === 'explorer') { ctx.strokeStyle = '#55636e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(14, -16, 2, 0); ctx.stroke(); }
  if (id === 'hs' || id === 'ls' || id === 'surgdrill' || id === 'finish') { ctx.fillStyle = '#9aa7b2'; rr(ctx, -10, -30, 20, 20, 6); ctx.fill(); ctx.fillStyle = id === 'ls' ? '#c9a227' : '#ffcb3d'; ctx.beginPath(); ctx.arc(0, 0, id === 'ls' ? 6 : 4, 0, 7); ctx.fill(); if (down) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 2, 7 + Math.random() * 3, 0, 7); ctx.stroke(); } }
  if (id === 'polish' || id === 'pbrush') { ctx.save(); ctx.rotate(T.t * 20); ctx.fillStyle = '#f28fb5'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(11, 0); ctx.stroke(); ctx.restore(); }
  if (id === 'etch' || id === 'bond' || id === 'comp' || id === 'gic') { ctx.fillStyle = { etch: '#6fb7ea', bond: '#fff4b8', comp: '#f3ead6', gic: '#eef2f4' }[id]; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill(); }
  if (id === 'forceps') { ctx.strokeStyle = '#55636e'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-12, -30); ctx.quadraticCurveTo(-16, -6, -8, 6); ctx.moveTo(12, -30); ctx.quadraticCurveTo(16, -6, 8, 6); ctx.stroke(); }
  if (id === 'scalpel') { ctx.fillStyle = '#c9d3db'; ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(12, -8, 0, 4); ctx.lineTo(-3, -24); ctx.fill(); }
  if (id === 'gp' || id === 'ppoint' || id === 'niti' || id === 'apex') { ctx.strokeStyle = id === 'gp' ? '#f08a24' : id === 'ppoint' ? '#fffdf5' : '#9aa7b2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, 10); ctx.stroke(); }
  ctx.restore();
}
