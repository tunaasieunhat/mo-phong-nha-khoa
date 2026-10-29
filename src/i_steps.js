/* ================== TREATMENT STEPS: protocols + mechanics ================== */
const STEPS = {
  filling: [
    { tool: 'cotton', kind: 'points', title: 'Cô lập răng', text: 'Đặt cuộn bông hai bên răng (chạm vào 2 vòng tròn) và đặt ống hút nước bọt.', pts: [{ x: 500, y: 118 }, { x: 500, y: 602 }], flag: 'cotton' },
    { tool: 'hs', kind: 'rub', title: 'Mở đường vào lỗ sâu', text: 'Dùng tay khoan nhanh mở lớp men che phủ phía trên lỗ sâu (vùng bóng mờ quanh lỗ đen).', target: 'roof', r: 22 },
    { tool: 'ls', kind: 'rub', title: 'Lấy sạch ngà mềm', text: 'Dùng tay khoan chậm, mũi tròn lấy hết ngà sâu màu nâu. Tránh mài vào mô lành.', target: 'decay', r: 22 },
    { tool: 'explorer', kind: 'tap', title: 'Kiểm tra đáy xoang', text: 'Chạm thám trâm vào đáy xoang để kiểm tra: ngà cứng, không còn mô sâu.', zone: 'cavity', msg: 'Ngà cứng, thám trâm không mắc. Xoang đã sạch.' },
    { tool: 'etch', kind: 'rub', title: 'Etching axit 37%', text: 'Bôi axit phủ toàn bộ xoang trám và bờ men, để 15 giây.', target: 'etch', r: 30, wait: 2.2, waitText: 'Để axit tác dụng 15 giây…' },
    { tool: 'air', kind: 'hold', title: 'Rửa & thổi khô nhẹ', text: 'Giữ tay xịt trên răng: rửa sạch axit rồi thổi khô nhẹ, không làm khô ngà quá mức.', secs: 1.8, flag: 'washed' },
    { tool: 'bond', kind: 'rub', title: 'Bôi keo dán', text: 'Bôi bond phủ đều thành và đáy xoang, thổi nhẹ cho lớp bond mỏng.', target: 'bond', r: 30 },
    { tool: 'light', kind: 'hold', title: 'Chiếu đèn lớp bond', text: 'Giữ đèn quang trên răng 10–20 giây.', secs: 1.4 },
    { tool: 'comp', kind: 'rub', title: 'Đắp composite lớp 1', text: 'Đắp lớp thứ nhất dày không quá 2 mm ở đáy xoang.', target: 'fill1', r: 28 },
    { tool: 'light', kind: 'hold', title: 'Chiếu đèn lớp 1', text: 'Chiếu đèn 20 giây cho lớp thứ nhất.', secs: 1.4, flag: 'cure1' },
    { tool: 'comp', kind: 'rub', title: 'Đắp composite lớp 2', text: 'Đắp lớp cuối, tạo lại hình thể múi và rãnh mặt nhai.', target: 'fill2', r: 28 },
    { tool: 'light', kind: 'hold', title: 'Chiếu đèn lớp 2', text: 'Chiếu đèn 20 giây.', secs: 1.4, flag: 'cure2' },
    { tool: 'paper', kind: 'tap', title: 'Kiểm tra khớp cắn', text: 'Đặt giấy cắn lên răng, cho bệnh nhân cắn để tìm điểm chạm sớm.', zone: 'tooth', after: 'marks' },
    { tool: 'finish', kind: 'rub', title: 'Mài chỉnh khớp cắn', text: 'Mài nhẹ các điểm chạm sớm màu xanh trên miếng trám.', target: 'marks', r: 22 },
    { tool: 'polish', kind: 'rub', title: 'Đánh bóng', text: 'Đánh bóng miếng trám cho láng mịn.', target: 'polish', r: 34 },
  ],
  rootcanal: [
    { tool: 'syringe', kind: 'hold', title: 'Gây tê gai Spix', text: 'Gây tê vùng gai Spix và tê dây miệng: giữ bơm tiêm ở điểm tiêm.', secs: 2, at: { x: 330, y: 352, r: 44 }, flag: 'numb' },
    { tool: 'dam', kind: 'tap', title: 'Đặt đê cao su', text: 'Chạm vào răng để đặt kẹp và đê cao su cách ly.', zone: 'tooth', flag: 'dam' },
    { tool: 'hs', kind: 'rub', title: 'Mở tủy', text: 'Lấy hết mô sâu và mở toàn bộ trần buồng tủy.', target: 'access', r: 24 },
    { tool: 'dg16', kind: 'points', title: 'Tìm miệng ống tủy', text: 'Dùng cây thăm dò DG16 tìm 3 miệng ống tủy: gần ngoài (MB), gần trong (ML), xa (D).', pts: 'orifices' },
    { tool: 'apex', kind: 'canal', mode: 'wl', title: 'Xác định chiều dài làm việc', text: 'Đưa trâm K15 xuống từng ống tủy và nhả tay khi máy báo 0.5 (vạch xanh). Không để máy báo APEX.' },
    { tool: 'niti', kind: 'canal', mode: 'shape', title: 'Sửa soạn ống tủy', text: 'Tạo hình từng ống tủy bằng trâm NiTi đến đúng chiều dài làm việc.' },
    { tool: 'irrig', kind: 'hold', title: 'Bơm rửa', text: 'Bơm rửa NaOCl, kết thúc bằng EDTA 17% để loại bỏ lớp mùn ngà.', secs: 2, at: { x: 500, y: 292, r: 64 }, flag: 'irrigated' },
    { tool: 'ppoint', kind: 'canal', mode: 'dry', title: 'Làm khô ống tủy', text: 'Dùng côn giấy thấm khô từng ống tủy.' },
    { tool: 'gp', kind: 'canal', mode: 'gp', title: 'Trám bít ống tủy', text: 'Đặt côn gutta-percha phủ xi măng trám bít vào từng ống tủy, đúng chiều dài làm việc.' },
    { tool: 'plugger', kind: 'points', title: 'Cắt côn & lèn chặt', text: 'Dùng cây lèn nóng cắt côn ở miệng ống tủy và lèn chặt cả 3 ống.', pts: 'orifices' },
    { tool: 'gic', kind: 'rub', title: 'Trám kín buồng tủy', text: 'Trám kín buồng tủy và lỗ mở tủy bằng GIC.', target: 'seal', r: 28 },
    { tool: 'xray', kind: 'tap', title: 'Chụp phim kiểm tra', text: 'Chụp phim quanh chóp kiểm tra chất lượng trám bít.', zone: 'tooth', after: 'postxray' },
  ],
  scaling: [
    { tool: 'rinse', kind: 'tap', title: 'Súc miệng sát khuẩn', text: 'Cho bệnh nhân súc miệng Chlorhexidine 0,12% trong 30 giây (chạm vào miệng).', zone: 'any' },
    { tool: 'scaler', kind: 'rub', title: 'Lấy cao răng trên lợi', text: 'Rê đầu máy cạo vôi lên các mảng cao răng màu vàng.', target: 'tartar', r: 30 },
    { tool: 'gracey', kind: 'rub', title: 'Lấy cao răng dưới lợi', text: 'Dùng cây nạo Gracey lấy cao răng dưới lợi (đốm nâu sẫm ở cổ răng) và làm láng chân răng.', target: 'sub', r: 24 },
    { tool: 'pbrush', kind: 'rub', title: 'Đánh bóng', text: 'Đánh bóng các vết dính màu nâu bằng chổi và sò đánh bóng.', target: 'stain', r: 28 },
    { tool: 'brush', kind: 'quiz', title: 'Hướng dẫn vệ sinh răng miệng', text: 'Chạm vào miệng để hướng dẫn bệnh nhân chải răng.', quiz: { q: 'Phương pháp chải răng Bass được hướng dẫn như thế nào?', opts: [['Lông bàn chải nghiêng 45° về phía lợi, rung nhẹ tại chỗ rồi xoay về phía mặt nhai', true], ['Chải ngang thật mạnh qua lại cho sạch', false], ['Chỉ chải mặt nhai, tránh vùng lợi để khỏi chảy máu', false]], why: 'Phương pháp Bass làm sạch mảng bám ở rãnh lợi, nơi gây viêm lợi. Chải ngang mạnh gây mòn cổ răng và tụt lợi.' } },
  ],
  extraction: [
    { tool: 'swab', kind: 'rub', title: 'Sát khuẩn', text: 'Sát khuẩn vùng răng nhổ bằng bông tẩm Povidone iodine.', target: 'swab', r: 30 },
    { tool: 'syringe', kind: 'hold', title: 'Gây tê', text: 'Gây tê cận chóp mặt ngoài và mặt trong răng cửa dưới.', secs: 2, at: { x: 372, y: 352, r: 40 }, flag: 'numb' },
    { tool: 'periosteal', kind: 'rub', title: 'Tách lợi', text: 'Tách lợi khỏi cổ răng ở cả hai phía.', target: 'cerv', r: 22 },
    { tool: 'elevator', kind: 'wiggle', title: 'Bẩy lung lay', text: 'Kéo qua lại (trái ↔ phải) trên răng để nong rộng ổ răng.', obj: 'ex' },
    { tool: 'forceps', kind: 'pull', title: 'Nhổ răng bằng kìm', text: 'Kẹp kìm vào thân răng và kéo lên theo trục răng.', obj: 'ex' },
    { tool: 'curette', kind: 'rub', title: 'Nạo ổ răng', text: 'Nạo sạch mô viêm, mô hạt trong ổ răng.', target: 'gran', r: 24 },
    { tool: 'gauze', kind: 'hold', title: 'Ép ổ răng & cắn gạc', text: 'Ép nhẹ hai bản xương ổ răng rồi đặt gạc cho bệnh nhân cắn.', secs: 1.6, at: { x: 500, y: 350, r: 80 }, flag: 'gauze' },
  ],
  surgery: [
    { tool: 'swab', kind: 'rub', title: 'Sát khuẩn', text: 'Sát khuẩn vùng phẫu thuật bằng Povidone iodine.', target: 'swab', r: 30 },
    { tool: 'syringe', kind: 'hold', title: 'Gây tê gai Spix', text: 'Gây tê gai Spix và tê dây miệng (vòng tròn minh họa điểm tiêm).', secs: 2, at: { x: 790, y: 345, r: 44 }, flag: 'numb' },
    { tool: 'scalpel', kind: 'trace', title: 'Rạch tạo vạt', text: 'Rạch theo đường chấm dọc mào sống hàm, bắt đầu từ phía xa răng 7.', path: 'incision', flag: 'incised' },
    { tool: 'periosteal', kind: 'rub', title: 'Bóc tách vạt', text: 'Bóc tách vạt niêm mạc – màng xương để bộc lộ xương và thân răng.', target: 'flap', r: 26 },
    { tool: 'surgdrill', kind: 'rub', title: 'Mở xương', text: 'Mở xương phía mặt nhai và phía xa răng khôn, luôn bơm nước muối làm mát. Tránh chạm răng 7.', target: 'bone', r: 24 },
    { tool: 'zekrya', kind: 'trace', title: 'Chia cắt răng', text: 'Cắt ngang cổ răng theo đường chấm để tách thân và chân răng.', path: 'section', flag: 'cut' },
    { tool: 'elevator', kind: 'wiggle', title: 'Làm lung lay', text: 'Kéo qua lại để làm lung lay phần thân răng đã chia cắt.', obj: 'sg' },
    { tool: 'elevator', kind: 'pull', title: 'Lấy thân răng', text: 'Bẩy và kéo phần thân răng lên.', obj: 'crown' },
    { tool: 'elevator', kind: 'pull', title: 'Lấy chân răng', text: 'Bẩy lấy phần chân răng còn lại.', obj: 'roots' },
    { tool: 'curette', kind: 'rub', title: 'Nạo ổ răng', text: 'Nạo sạch bao răng và mô hạt trong ổ răng.', target: 'gran', r: 26 },
    { tool: 'saline', kind: 'hold', title: 'Bơm rửa', text: 'Bơm rửa ổ răng bằng nước muối sinh lý.', secs: 1.6, at: { x: 560, y: 540, r: 80 } },
    { tool: 'needle', kind: 'points', title: 'Khâu vạt', text: 'Khâu đóng vạt bằng 3 mũi chỉ rời.', pts: 'sutures' },
    { tool: 'gauze', kind: 'hold', title: 'Cắn gạc', text: 'Đặt gạc cho bệnh nhân cắn chặt 30–60 phút.', secs: 1.6, at: { x: 520, y: 330, r: 80 }, flag: 'gauze' },
  ],
};
const DISTRACT = { filling: ['file', 'scaler', 'forceps', 'gp'], rootcanal: ['forceps', 'scaler', 'etch', 'comp'], scaling: ['hs', 'forceps', 'etch', 'gic'], extraction: ['hs', 'comp', 'scaler', 'gp'], surgery: ['comp', 'scaler', 'gp', 'forceps'] };
const curStep = () => (T.steps ? T.steps[T.si] : null);

function startTreatment() {
  const p = T.p, kind = caseOf().treat; T.phase = 'tx'; renderPhases(); T.si = 0; T.tool = null; T.hold = 0; $('xray').hidden = true; $('chartPal').hidden = true; T.sel = null; T.anim = null; T.rev++;
  T.steps = STEPS[kind].map((s) => Object.assign({}, s));
  if (kind === 'filling' && T.rec && T.rec.anesth !== 'none') T.steps.unshift({ tool: 'syringe', kind: 'hold', title: 'Gây tê', text: 'Gây tê cận chóp/gai Spix: giữ bơm tiêm ở điểm tiêm.', secs: 2, at: { x: 215, y: 585, r: 40 }, flag: 'numb' });
  if (kind === 'filling') { setView('occl'); setupOccl(p); }
  if (kind === 'rootcanal') { setView('rct'); setupRCT(); }
  if (kind === 'scaling') { setView('scaling'); setupScaling(p); }
  if (kind === 'extraction') { setView('perio'); setupPerio(); }
  if (kind === 'surgery') { setView('surg'); setupSurg(); }
  T.trayIds = shuffle([...new Set(T.steps.map((s) => s.tool))].concat(DISTRACT[kind].filter((d) => TOOLS[d] && !T.steps.some((s) => s.tool === d))));
  buildTray('tx'); openDrawer(false); setFoot('', () => { }); beginStep(); updateStepUI();
  if (G.tut >= 4 && G.tut <= 8) setTut(9);
}
function setupScaling(p) {
  T.cells = [];
  const addAt = (n, lx, ly, kind, r) => { const q = localToArch(ARCH[n], lx, ly); T.cells.push({ x: q.x, y: q.y, kind, hp: 1, removed: false, r }); };
  for (const n in p.teeth) {
    const st = p.teeth[n], g = ARCH[n];
    if (st.tartar) { const b = +n === 16 || +n === 26; for (let k = -1; k <= 1; k++) addAt(+n, k * g.w * 0.26, b ? g.d * 0.52 : -g.d * 0.48, 'tartar', rand(8, 11)); }
    if (st.sub) for (const k of [-1, 1]) addAt(+n, k * g.w * 0.32, -g.d * 0.6, 'sub', 6);
    if (st.stain) for (let k = -1; k <= 1; k++) addAt(+n, k * g.w * 0.22, g.d * 0.36, 'stain', 8);
  }
}
function beginStep() {
  const st = curStep(); if (!st) return; T.hold = 0; T.trace = 0; T.traceIdx = 0; T.tracing = false; T.drag = null; T.gauge = null;
  if (st.kind === 'points') { const src = st.pts === 'orifices' ? CANALS.map((c) => ({ x: c.x0, y: c.y0 })) : st.pts === 'sutures' ? T.sutureAt : st.pts; T.pts = src.map((q) => ({ x: q.x, y: q.y, done: false })); }
  if (st.kind === 'trace') { const raw = T.paths[st.path], pts = []; for (let k = 0; k < raw.length - 1; k++) { const a = raw[k], b = raw[k + 1], n = Math.ceil(dist(a.x, a.y, b.x, b.y) / 8); for (let m = 0; m < n; m++) pts.push({ x: lerp(a.x, b.x, m / n), y: lerp(a.y, b.y, m / n) }); } pts.push(raw[raw.length - 1]); T.tracePts = pts; }
  if (G.settings.hints && (G.newbie < 2 || T.practice)) { const el = document.querySelector(`.tool[data-id="${st.tool}"]`); if (el) el.classList.add('hint'); }
}
function updateStepUI() {
  const st = curStep(); if (!st) return; const n = T.steps.length;
  setStepUI(`Bước ${T.si + 1}/${n} · ${st.title}`, st.text + (T.tool === st.tool ? '' : ' <i class="muted">Chọn dụng cụ phù hợp ở khay bên dưới.</i>'), stepProgress());
}
function stepProgress() {
  const st = curStep(); if (!st) return 1;
  if (st.kind === 'rub') { const s = targetCells(st); return s.length ? s.filter((c) => cellDone(st, c)).length / s.length : 1; }
  if (st.kind === 'hold') return T.hold / st.secs;
  if (st.kind === 'points') return T.pts && T.pts.length ? T.pts.filter((q) => q.done).length / T.pts.length : 0;
  if (st.kind === 'trace') return T.trace;
  if (st.kind === 'canal') { if (!T.canal) return 0; const key = st.mode === 'wl' ? null : st.mode; return T.canal.reduce((s, c) => s + (key ? Math.min(1, c[key] / 0.94) : c.wl ? 1 : 0), 0) / T.canal.length; }
  if (st.kind === 'wiggle') return (st.obj === 'ex' ? T.ex : T.sg).lux;
  if (st.kind === 'pull') return clamp(-pullOff(st.obj) / 140, 0, 1);
  return 0;
}
const pullOff = (obj) => (obj === 'ex' ? T.ex.off : obj === 'crown' ? T.sg.crownOff : T.sg.rootOff);
function targetCells(st) {
  const t = st.target, C = T.cells;
  switch (t) {
    case 'roof': return C.filter((c) => c.lesion && !c.openStart);
    case 'decay': return C.filter((c) => c.lesion);
    case 'etch': case 'bond': case 'fill1': case 'fill2': case 'polish': return C.filter((c) => c.removed);
    case 'marks': return C.filter((c) => c.markSet);
    case 'access': return C;
    case 'seal': return C.concat(T.seal);
    default: return C.filter((c) => c.kind === t);
  }
}
function cellDone(st, c) {
  const t = st.target;
  if (t === 'roof') return c.open; if (t === 'decay' || t === 'access') return c.removed; if (t === 'fill1') return c.fill >= 1; if (t === 'fill2') return c.fill >= 2; if (t === 'marks') return !c.mark; if (t === 'seal') return c.fill >= 1;
  if (t === 'etch' || t === 'bond' || t === 'polish') return c[t] >= 1;
  return c.removed;
}
function rubAt(x, y, dt) {
  const st = curStep(), R = st.r || 28, t = st.target; let hit = false;
  if (t === 'roof' || t === 'decay') {
    for (const c of T.cells) {
      if (dist(x, y, c.x, c.y) > R || c.removed) continue; hit = true;
      if (c.lesion) { if (t === 'roof' && !c.open) { c.hpRoof -= dt * 3; if (c.hpRoof <= 0) c.open = true; } else if (t === 'decay' && c.open) { c.hp -= dt * 3.2; if (c.hp <= 0) c.removed = true; } }
      else { c.hp -= dt * (t === 'roof' ? 1.0 : 0.9); if (c.hp <= 0) { c.removed = true; T.pen.over++; T.comfort = clamp(T.comfort - 0.6, 0, 100); } }
    }
  } else {
    for (const c of targetCells(st)) {
      if (dist(x, y, c.x, c.y) > R + (c.r || 0) * 0.5) continue; hit = true;
      if (t === 'etch' || t === 'bond' || t === 'polish') c[t] = Math.min(1, (c[t] || 0) + dt * 4.2);
      else if (t === 'fill1') c.fill = Math.min(1, c.fill + dt * 4);
      else if (t === 'fill2') { if (c.fill >= 1) c.fill = Math.min(2, c.fill + dt * 4); }
      else if (t === 'marks') { c.mtime = (c.mtime || 0) + dt; if (c.mtime > 0.25) c.mark = false; }
      else if (t === 'seal') c.fill = Math.min(1, (c.fill || 0) + dt * 4);
      else if (t === 'gran' && (T.view === 'surg' ? !(T.sg.crownOut && T.sg.rootOut) : !T.ex.out)) continue;
      else { if (c.removed) continue; c.hp -= dt * (t === 'bone' ? 2.4 : t === 'tartar' ? 2.6 : 3.2); if (c.hp <= 0) c.removed = true; }
    }
    if (t === 'bone' && x < 330 && y > 300) { T.pen.neighbor += dt; if (T.pen.neighbor > 0.4 && !T.neighWarn) { T.neighWarn = 1; toast('Cẩn thận: đang khoan vào răng 7!', 'bad'); Sound.bad(); } }
  }
  if (hit && Math.random() < 0.6) spawnParts(x, y, st.tool);
}
function spawnParts(x, y, tool) {
  const col = { hs: ['#fff', '#d6ab7e'], ls: ['#6b4a2a', '#d6ab7e'], scaler: ['#9fe0ff', '#e8d27a'], gracey: ['#5b3a1c'], air: ['#cfefff'], etch: ['#6fb7ea'], polish: ['#f28fb5', '#fff'], pbrush: ['#f6b6cf', '#fff'], periosteal: ['#ef8d9a'], comp: ['#f3ead6'], bond: ['#fff4b8'], surgdrill: ['#9fe0ff', '#efd6b0'], swab: ['#b5651d'], curette: ['#b8323f'], saline: ['#9fe0ff'], irrig: ['#cfefff'], finish: ['#fff'] }[tool] || ['#fff'];
  T.parts.push({ x, y, vx: rand(-120, 120), vy: rand(-160, 20), life: 0.45, c: pick(col), s: rand(2, 4) });
}
function completeStep() {
  const st = curStep();
  if (st.kind === 'rub') targetCells(st).forEach((c) => { const t = st.target; if (t === 'roof') c.open = true; else if (t === 'decay' || t === 'access') c.removed = true; else if (t === 'fill1') c.fill = Math.max(1, c.fill); else if (t === 'fill2') c.fill = 2; else if (t === 'marks') c.mark = false; else if (t === 'seal') c.fill = 1; else if (['etch', 'bond', 'polish'].includes(t)) c[t] = 1; else c.removed = true; });
  if (st.target === 'access') T.chamberOpen = true;
  if (st.flag === 'washed') T.washed = true; if (st.flag === 'cure1') T.cured = 1; if (st.flag === 'cure2') T.cured = 2; if (st.flag === 'cotton') T.cotton = true;
  if (st.flag === 'numb') T.comfort = clamp(T.comfort + 25, 0, 100); if (st.flag === 'dam') T.dam = true; if (st.flag === 'irrigated') T.irrigated = true; if (st.flag === 'gauze') T.gauze = true;
  if (st.flag === 'incised') T.sg.incised = true; if (st.flag === 'cut') T.sg.cut = true;
  if (st.kind === 'pull') { if (st.obj === 'ex') T.ex.out = true; if (st.obj === 'crown') T.sg.crownOut = true; if (st.obj === 'roots') T.sg.rootOut = true; }
  T.comfort = clamp(T.comfort + 3, 0, 100); updateComfort(); Sound.motorOff(); Sound.step(); T.hold = 0; T.drag = null; T.gauge = null;
  for (let k = 0; k < 14; k++) T.parts.push({ x: T.ptr.x, y: T.ptr.y, vx: rand(-220, 220), vy: rand(-260, 60), life: 0.8, c: pick(['#ffcb3d', '#78c443', '#4fb5e8', '#fff']), s: rand(3, 6) });
  document.querySelectorAll('.tool.hint').forEach((b) => b.classList.remove('hint'));
  T.si++; T.tool = null; markTray();
  if (T.si >= T.steps.length) { setStepUI('Hoàn tất điều trị', 'Kê đơn và dặn dò bệnh nhân.', 1); setTimeout(openRx, 600); }
  else { beginStep(); updateStepUI(); }
}
function stepTap(q) {
  const st = curStep();
  if (st.kind === 'tap') {
    const ok = st.zone === 'any' || (st.zone === 'cavity' ? T.cells.some((c) => c.removed && dist(q.x, q.y, c.x, c.y) < 30) : (T.view === 'scaling' ? !!archHit(q.x, q.y) || dist(q.x, q.y, 600, 430) < 420 : dist(q.x, q.y, 500, 340) < 240));
    if (!ok) { toast(st.zone === 'cavity' ? 'Chạm vào trong xoang trám.' : 'Chạm vào răng đang điều trị.'); return; }
    if (st.msg) toast(st.msg, 'good');
    if (st.after === 'marks') { const filled = shuffle(T.cells.filter((c) => c.removed)).slice(0, 3); filled.forEach((c) => { c.mark = true; c.markSet = true; }); toast('Giấy cắn đánh dấu 3 điểm chạm sớm.', ''); }
    if (st.after === 'postxray') { drawXrayFilm(T.p, T.p.target, 'post'); showFilm('Phim sau trám bít', 'Ống tủy được trám bít kín, đến cách chóp khoảng 0,5–1 mm. Đạt yêu cầu.', false); }
    completeStep(); return;
  }
  if (st.kind === 'points') {
    const q2 = T.pts.find((pp) => !pp.done && dist(q.x, q.y, pp.x, pp.y) < 30); if (!q2) { toast('Chạm đúng vào các vòng tròn đánh dấu.'); return; }
    q2.done = true; Sound.beep(1200); const idx = T.pts.indexOf(q2);
    if (st.tool === 'dg16') T.canal[idx].found = true; if (st.tool === 'plugger') T.canal[idx].plug = true; if (st.tool === 'needle') T.sg.sutures.push({ x: q2.x, y: q2.y });
    if (T.pts.every((pp) => pp.done)) completeStep(); return;
  }
  if (st.kind === 'quiz') { showQuiz(st); return; }
}
function showQuiz(st) {
  const qz = st.quiz, opts = shuffle(qz.opts);
  showModal(`<div class="panel-h">${esc(st.title)}</div><div class="panel-b"><p><b>${esc(qz.q)}</b></p><div class="dx-list">${opts.map((o, k) => `<button class="dx-opt" data-k="${k}">${esc(o[0])}</button>`).join('')}</div><div id="qzNote"></div></div>`, false);
  document.querySelectorAll('.dx-opt').forEach((b) => b.onclick = () => {
    const o = opts[+b.dataset.k]; if (T.quizDone) return; T.quizDone = 1;
    document.querySelectorAll('.dx-opt').forEach((x) => { if (opts[+x.dataset.k][1]) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
    if (!o[1]) { T.pen.wrong++; Sound.bad(); } else Sound.good();
    $('qzNote').innerHTML = `<div class="note">${esc(qz.why)}</div><div class="row"><button class="btn" id="qzOk">Tiếp tục</button></div>`;
    $('qzOk').onclick = () => { hideModal(); T.quizDone = 0; completeStep(); };
  });
}
