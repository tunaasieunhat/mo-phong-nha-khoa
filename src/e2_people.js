/* ================== WORLD 2: patients, associates, day cycle, traffic, rendering ================== */
let PID = 0;
function makeMouth(type, target) {
  const teeth = {};
  for (const q of [1, 2, 3, 4]) for (let k = 1; k <= 8; k++) teeth[q * 10 + k] = { n: q * 10 + k, missing: false, fill: null, caries: 0, tartar: 0, sub: 0, stain: 0, fissure: false, impacted: false, mob: 0, pocket: 2, decoy: false };
  [18, 28, 38, 48].forEach((n) => { if (n !== target && Math.random() < 0.5) teeth[n].missing = true; });
  const molars = [16, 17, 26, 27, 36, 37, 46, 47].filter((n) => n !== target && Math.abs(n - target) > 1);
  shuffle(molars).slice(0, randi(0, 2)).forEach((n) => { teeth[n].fill = Math.random() < 0.5 ? 'amalgam' : 'composite'; });
  /* decoys: stained fissures look like caries until probed with the explorer */
  const post = [14, 15, 16, 17, 24, 25, 26, 27, 34, 35, 36, 37, 44, 45, 46, 47].filter((n) => n !== target && !teeth[n].fill);
  const nStain = type === 'caries' || type === 'pulpitis' ? randi(1, 2) : randi(0, 1);
  shuffle(post).slice(0, nStain).forEach((n) => { teeth[n].fissure = true; });
  if (type === 'caries') teeth[target].caries = 1;
  if (type === 'pulpitis') {
    teeth[target].caries = 2;
    if (Math.random() < 0.6) { const d = shuffle(post.filter((n) => !teeth[n].fissure && Math.abs(n - target) > 1 && n % 10 >= 6))[0]; if (d) { teeth[d].caries = 1; teeth[d].decoy = true; } }
  }
  if (type === 'calculus') { [31, 32, 33, 41, 42, 43].forEach((n) => { teeth[n].tartar = 1; teeth[n].sub = 1; teeth[n].pocket = 3; }); [16, 26].forEach((n) => { teeth[n].tartar = 1; teeth[n].pocket = 3; }); [11, 21, 12, 22, 31, 41].forEach((n) => teeth[n].stain = 1); }
  if (type === 'perio') { [31, 32, 41, 42].forEach((n) => { teeth[n].tartar = 1; teeth[n].sub = 1; teeth[n].pocket = 4; teeth[n].mob = 1; }); teeth[target].pocket = 7; teeth[target].mob = 3; }
  if (type === 'wisdom') { teeth[target].impacted = true; teeth[target].missing = false; teeth[target].fissure = false; }
  teeth[target].fissure = false;
  return teeth;
}
function makePatient(type) {
  const c = CASES[type], g = type === 'wisdom' ? (Math.random() < 0.5 ? 'm' : 'f') : (Math.random() < 0.5 ? 'm' : 'f');
  const range = { caries: [14, 58], pulpitis: [20, 62], calculus: [22, 66], perio: [48, 75], wisdom: [18, 32] }[type];
  const age = randi(range[0], range[1]); const old = age >= 55;
  const base = pick(g === 'f' ? NAMES_F : NAMES_M).split(' ').slice(1).join(' ');
  const title = age < 22 ? 'Em' : g === 'f' ? (age >= 65 ? 'Bà' : age >= 50 ? 'Cô' : 'Chị') : (age >= 65 ? 'Ông' : age >= 50 ? 'Chú' : 'Anh');
  const name = title + ' ' + base;
  const hxPool = MEDHX.filter((h) => !h.female || (g === 'f' && age >= 20 && age <= 40 && type !== 'wisdom'));
  const hx = wpick(hxPool);
  const looks = CHAR.looks.filter((L) => L.g === g && L.old === old);
  const look = looks.length ? pick(looks) : pick(CHAR.looks.filter((L) => L.g === g));
  const bpv = hx.f.htn ? '152/96' : hx.f.cardiac ? '138/86' : age > 50 ? '132/82' : '118/76';
  return { id: ++PID, name, g, age, type, target: pick(c.teeth), job: age < 22 ? 'Học sinh, sinh viên' : old && Math.random() < 0.6 ? 'Hưu trí' : pick(JOBS), addr: pick(ADDRS), phone: `09${randi(1, 9)}• ••• ${randi(100, 999)}`, hx, bp: bpv, say: pick(c.say), look, teeth: null };
}
function newWorldPatient(type) {
  const p = makePatient(type); p.teeth = makeMouth(type, p.target);
  Object.assign(p, { i: 3.5, j: 16.5, path: [{ i: 10, j: 16.5 }, { i: 10, j: 13.4 }, DOOR_IN, CHECKIN], state: 'walkIn', timer: 0, maxPat: maxPatience(), seat: null, chair: null, mood: 'pain', walkT: Math.random() * 5, dir: 0 });
  p.patience = p.maxPat; W.patients.push(p); return p;
}
const maxPatience = () => 110 * (1 + 0.06 * G.decor.plant + 0.15 * G.decor.tv + 0.15 * G.decor.tank + 0.2 * G.decor.ac);
const routeTo = (p, pts) => { p.path = pts.map((q) => ({ i: q.i, j: q.j })); };
const capacity = () => seatList().length + G.chairs;
function chooseCase() {
  if (G.newbie === 0 && W.spawned === 0) return 'caries';
  if (G.newbie <= 1 && W.spawned === 1) return 'calculus';
  const pool = Object.keys(CASES).filter((k) => G.level >= CASES[k].minLevel).map((k) => ({ k, w: CASES[k].need.every((e) => G.equip[e]) ? (G.stats.byType[k] ? 1 : 2.5) : 0.3 }));
  return wpick(pool).k;
}

/* ---------- patient AI ---------- */
function updatePatients(dt) {
  const open = G.time < 990;
  W.spawnT -= dt;
  if (open && W.spawnT <= 0) {
    if (W.patients.filter((p) => p.state !== 'leaving').length < capacity()) { newWorldPatient(chooseCase()); W.spawned++; }
    W.spawnT = (W.spawned < 2 ? 12 : clamp(30 - G.rep * 3 - (G.level - 1) * 1.5, 12, 30)) * rand(0.85, 1.2);
  }
  for (const p of W.patients) {
    p.walkT += dt;
    if (p.path.length) {
      const q = p.path[0], di = q.i - p.i, dj = q.j - p.j, d = Math.hypot(di, dj), sp = 3.0 * dt;
      if (d <= sp) { p.i = q.i; p.j = q.j; p.path.shift(); if (!p.path.length) arrive(p); }
      else { p.i += di / d * sp; p.j += dj / d * sp; p.dir = (di - dj) > 0.01 ? 1.5 : (di - dj) < -0.01 ? -1.5 : 0; }
    }
    if (p.state === 'checkin') { p.timer -= dt; if (p.timer <= 0) seatPatient(p); }
    if (p.state === 'queue' && seatList().some((s) => !s.occ)) seatPatient(p);
    if (p.state === 'auto') { p.timer -= dt; if (p.timer <= 0) finishAuto(p); }
    if (['waiting', 'queue', 'toSeat', 'ready', 'toChair'].includes(p.state)) {
      p.patience -= dt * (p.state === 'ready' || p.state === 'toChair' ? 0.45 : 1);
      if (p.patience <= 0) leaveAngry(p);
    }
  }
  W.patients = W.patients.filter((p) => !(p.state === 'leaving' && !p.path.length));
}
function seatPatient(p) {
  const s = seatList().find((x) => !x.occ);
  if (!s) { p.state = 'queue'; return; }
  s.occ = p; p.seat = s; p.state = 'toSeat'; routeTo(p, [{ i: p.i, j: WALK_J }, { i: AISLE_I, j: WALK_J }, { i: AISLE_I, j: s.j }, { i: s.i, j: s.j }]);
}
function arrive(p) {
  if (p.state === 'walkIn') { p.state = 'checkin'; p.timer = 1.1; }
  else if (p.state === 'toSeat') { p.state = 'waiting'; if (G.tut === 1) setTut(2); }
  else if (p.state === 'toChair') {
    const k = p.chair.k;
    if (G.assoc[k] && canAuto(p, k, true)) { p.state = 'auto'; p.timer = AUTO_TIME[p.type] * (G.chairLv[k] >= 2 ? 0.78 : 1); p.timerMax = p.timer; p.mood = 'calm'; }
    else { p.state = 'ready'; Sound.pop(); if (G.tut === 2) setTut(3); }
  }
}
function autoUse(p) { const u = Object.assign({}, CASES[p.type].use); if (u.anest) { u[p.hx.f.htn || p.hx.f.cardiac ? 'mepi' : 'lido'] = u.anest; delete u.anest; } return u; }
function missingSupplies(use) { return Object.keys(use).filter((k) => (G.stock[k] || 0) < use[k]); }
function canAuto(p, k, warn) {
  const a = G.assoc[k]; if (!a) return false;
  const ok = ['calculus', 'caries'].includes(p.type) || (a.skill >= 2 && ['pulpitis', 'perio'].includes(p.type));
  if (!ok || !CASES[p.type].need.every((e) => G.equip[e])) { if (warn) toast(`${a.name} chưa làm được ca ${CASES[p.type].label.toLowerCase()}. Bạn hãy tự điều trị ca này.`); return false; }
  const miss = missingSupplies(autoUse(p)); if (miss.length) { if (warn) toast(`${a.name}: thiếu vật tư (${miss.map((m) => SUPPLIES[m].name).join(', ')}). Hãy nhập thêm ở Kho.`, 'bad'); p.supplyMiss = true; return false; }
  return true;
}
function finishAuto(p) {
  const ch = p.chair, use = autoUse(p), c = CASES[p.type];
  for (const k in use) G.stock[k] = Math.max(0, G.stock[k] - use[k]);
  G.stats.treated++; G.stats.byType[p.type] = (G.stats.byType[p.type] || 0) + 1; G.today.patients++;
  G.rep = clamp(G.rep + 0.02, 0, 5);
  G.log.unshift({ d: G.day, name: p.name, age: p.age, type: p.type, tooth: p.target, stars: 2, score: 75, by: G.assoc[ch.k].name }); if (G.log.length > 40) G.log.pop();
  ch.coin = { amount: c.fee + EXAM_FEE, label: `${p.name}: ${c.label} (${G.assoc[ch.k].name})` }; leave(p, 'happy');
  gainXP(Math.round(c.xp * 0.4)); saveGame(); updateHUD();
}
function freeChair(pref) { const list = CHAIRS.filter((c, k) => k < G.chairs && !c.occ && !c.coin); return list.find((c) => c.k === pref) || list[0]; }
function sendToChair(p, chair) {
  const c = chair || freeChair(0);
  if (!c) { toast(CHAIRS.slice(0, G.chairs).some((x) => x.coin) ? 'Thu tiền trên ghế để dọn ghế cho bệnh nhân mới.' : 'Chưa có ghế trống. Mua thêm ghế ở Cửa hàng nhé!', 'bad'); Sound.bad(); return; }
  const fromQueue = p.state === 'queue';
  if (p.seat) { p.seat.occ = null; p.seat = null; }
  c.occ = p; p.chair = c; p.state = 'toChair'; Sound.pop();
  routeTo(p, (fromQueue ? [{ i: p.i, j: WALK_J }, { i: AISLE_I, j: WALK_J }] : [{ i: AISLE_I, j: p.j }]).concat([{ i: AISLE_I, j: ROW_J }, { i: c.cI, j: ROW_J }, { i: c.cI, j: c.cJ + 0.15 }]));
}
function leave(p, mood) {
  if (p.seat) { p.seat.occ = null; p.seat = null; }
  if (p.chair && p.chair.occ === p) p.chair.occ = null;
  const pts = []; if (p.chair) pts.push({ i: p.chair.cI, j: ROW_J }, { i: 10, j: ROW_J }); else pts.push({ i: AISLE_I, j: p.j }, { i: AISLE_I, j: WALK_J }, { i: 10, j: WALK_J });
  pts.push({ i: 10, j: 13.4 }, { i: 10, j: 16.5 }, { i: -3, j: 16.5 });
  p.chair = null; p.state = 'leaving'; p.mood = mood; routeTo(p, pts);
}
function leaveAngry(p) { leave(p, 'angry'); G.rep = clamp(G.rep - 0.25, 0, 5); G.today.angry++; updateHUD(); saveGame(); toast(`${p.name} chờ lâu quá nên đã bỏ về. Uy tín giảm.`, 'bad'); }

/* ---------- chair time: a case takes clinic time; the world catches up when the doctor comes back ---------- */
function advanceClinic(min) {
  if (!(min > 0)) return; const sec = min / 2, t0 = G.time;
  G.time = Math.min(1020, G.time + min);
  for (const p of W.patients) {
    if (p.state === 'waiting' || p.state === 'queue' || p.state === 'toSeat') p.patience -= sec * 0.35;
    else if (p.state === 'ready' || p.state === 'toChair') p.patience -= sec * 0.15;
    else if (p.state === 'auto') p.timer -= sec;
  }
  W.spawnT -= sec * 0.6;
  toast(`Thời gian ghế: ${Math.round(min)} phút (${clock(t0)} → ${clock(G.time)})`);
}

/* ---------- day cycle ---------- */
function updateDay(dt) {
  if (G.dayDone) return;
  G.time = Math.min(1020, G.time + dt * 2);
  if (G.time >= 1020 && !W.patients.some((p) => p.state !== 'leaving')) { G.dayDone = true; saveGame(); setTimeout(showDayReport, 600); }
}

/* ---------- traffic + delivery truck ---------- */
function spawnTruck() { W.truck = { i: -5, j: 16.25, phase: 'in', t: 0 }; Sound.horn(); }
function updateTraffic(dt) {
  W.motoT -= dt; if (W.motoT <= 0) { W.motos.push({ i: -6, j: 16.95, sp: rand(3, 4.5) }); W.motoT = rand(5, 11); }
  W.motos.forEach((m) => m.i += m.sp * dt); W.motos = W.motos.filter((m) => m.i < 28);
  const tr = W.truck; if (!tr) return; tr.t += dt;
  if (tr.phase === 'in') { tr.i += 5 * dt; if (tr.i >= 9.2) { tr.i = 9.2; tr.phase = 'stop'; tr.t = 0; } }
  else if (tr.phase === 'stop') { if (tr.t > 1.6) { tr.phase = 'out'; } }
  else { tr.i += 6 * dt; if (tr.i > 28) W.truck = null; }
}

/* ---------- tap handling ---------- */
function personHit(p, wx, wy) { const s = iso(p.i, p.j), z = seatZ(p); return Math.abs(wx - s.x) < 16 && wy < s.y - z + 4 && wy > s.y - z - 72; }
const seatZ = (p) => (p.state === 'waiting' ? 10 : (p.state === 'ready' || p.state === 'auto') ? 18 : 0);
function worldTap(sx, sy) {
  if (W.paused) return; const { x, y } = toWorld(sx, sy);
  for (const c of CHAIRS) if (c.coin) { const p = iso(c.cI, c.cJ); if (dist(x, y, p.x, p.y - 118) < 30) { collectCoin(c, sx, sy); return; } }
  const sorted = W.patients.slice().sort((a, b) => (b.i + b.j) - (a.i + a.j));
  for (const p of sorted) if (personHit(p, x, y)) { tapPatient(p); return; }
  for (const c of CHAIRS) { const p = iso(c.cI, c.cJ + 0.3); if (Math.abs(x - p.x) < 50 && y < p.y + 22 && y > p.y - 90) { tapChair(c); return; } }
  const sh = iso(15.1, 8.5); if (Math.abs(x - sh.x) < 50 && y < sh.y + 10 && y > sh.y - 90) { openStock(); return; }
  const dk = iso(12.8, 11.0); if (Math.abs(x - dk.x) < 60 && y < dk.y + 20 && y > dk.y - 70) { openRecords(); return; }
}
function tapPatient(p) {
  if (p.state === 'waiting' || p.state === 'queue') sendToChair(p);
  else if (p.state === 'ready') openTreatment(p);
  else if (p.state === 'auto') toast(`${G.assoc[p.chair.k].name} đang điều trị cho ${p.name}.`);
  else if (p.state === 'walkIn' || p.state === 'checkin') toast(`${p.name} đang làm thủ tục ở quầy lễ tân.`);
  else if (p.state === 'toChair') toast(`${p.name} đang đi vào ghế.`);
}
function tapChair(c) {
  if (c.k >= G.chairs) { openShop('chairs'); return; }
  if (c.coin) { const p = iso(c.cI, c.cJ); collectCoin(c, p.x * W.zoom + W.camX, (p.y - 118) * W.zoom + W.camY); return; }
  if (c.occ && c.occ.state === 'ready') { if (G.assoc[c.k] && canAuto(c.occ, c.k, true)) { const p = c.occ; p.state = 'auto'; p.timer = AUTO_TIME[p.type]; p.timerMax = p.timer; p.mood = 'calm'; p.supplyMiss = false; return; } openTreatment(c.occ); return; }
  if (!c.occ) { const wp = W.patients.filter((p) => p.state === 'waiting' || p.state === 'queue').sort((a, b) => a.patience - b.patience)[0]; if (wp) sendToChair(wp, c); else toast('Chưa có bệnh nhân nào đang chờ.'); }
}
function collectCoin(c, sx, sy) {
  const amt = c.coin.amount; addMoney(amt, c.coin.label || 'Thu phí điều trị'); c.coin = null; Sound.coin();
  const tgt = $('moneyText').getBoundingClientRect(), r = W.cv.getBoundingClientRect();
  for (let k = 0; k < 8; k++) W.flyers.push({ x: sx + rand(-14, 14), y: sy + rand(-14, 14), tx: tgt.left - r.left - 10, ty: tgt.top - r.top + 10, t: -k * 0.05 });
  updateHUD(); saveGame(); if (G.tut === 11) setTut(12); questCheck();
}
