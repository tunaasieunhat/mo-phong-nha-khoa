/* ================== TREATMENT CONTROLLER: history → exam → record ================== */
const PHASES = [['hx', 'Hỏi bệnh'], ['exam', 'Khám'], ['rec', 'Bệnh án'], ['tx', 'Điều trị'], ['rx', 'Kê đơn']];
const EXAM_TRAY = ['mirror', 'explorer', 'probe', 'cold', 'perc', 'mob', 'bp', 'xray', 'pano', 'chart'];
function isTargetTooth(n) { const p = T.p; return p.type === 'calculus' ? !!p.teeth[n].tartar : n === p.target; }
function caseOf() { return CASES[T.p.type]; }
const needsPreg = (p) => p.g === 'f' && p.age >= 18 && p.age <= 45;
const qBudget = (p) => Q_BUDGET + (needsPreg(p) ? 1 : 0);
const chairAdd = (k, n = 1) => { T.chairMin = (T.chairMin || 0) + (CHAIR_MIN[k] || 0) * n; };
const optLabel = (code) => (CHART_OPTS.find((x) => x[0] === code) || [0, code])[1];

function openTreatment(p, practice) {
  Sound.init(); W.paused = true; Sound.motorOff();
  Object.assign(T, {
    p, practice: !!practice, phase: 'hx', tool: null, sel: null, findings: [], asked: new Set(), chat: [], tests: {}, apron: false,
    rec: null, recEval: null, recOpts: null, instrOrder: null, cotton: false, washed: false, cured: 0, dam: false, irrigated: false, chamberOpen: false, ex: null, sg: null, waiting: null, traceIdx: 0, trace: 0, tracing: false, quizDone: 0, neighWarn: 0, pts: null, canal: null, seal: [], comfort: 50, pen: { wrong: 0, over: 0, apex: 0, neighbor: 0 }, si: 0, steps: [], cells: [], hold: 0, drag: null, parts: [], gauge: null, gauze: false, faceMood: 'pain', startT: T.t, apexFlash: 0, used: null,
    chart: {}, chartCode: 'caries', qOrder: null, waste: 0, probe: null, exLen: {}, anim: null, coldSeq: [], films: 0, filmCost: 0, chairMin: 0, rev: (T.rev || 0) + 1, wob: null, labels: [], jit: 0, recTimed: false, zooming: false,
  });
  $('treat').hidden = false; $('app').classList.add('in-treat'); $('xray').hidden = true; $('tFloat').hidden = true; $('chartPal').hidden = true;
  resizeTreat(); setView('face'); renderPhases(); openDrawer(true, 'info'); renderInfo(); renderFindings(); buildTray('none');
  setStepUI('Hỏi bệnh', `Chọn câu hỏi ở khung <b>Bệnh nhân</b>. Bạn có <b>${qBudget(p)} lượt hỏi</b>: ưu tiên câu hỏi an toàn và câu hỏi giúp chẩn đoán.`, null);
  setFoot('Bắt đầu khám →', startExam);
  if (G.tut === 3) setTut(4);
  updateGuide();
}
function closeTreatment() { $('treat').hidden = true; $('app').classList.remove('in-treat'); $('chartPal').hidden = true; Sound.motorOff(); W.paused = false; T.p = null; T.anim = null; hideModal(); updateGuide(); }
function leaveForLater() {
  const pr = T.practice, min = T.chairMin;
  if (T.phase === 'tx' && T.used) { for (const k in T.used) G.stock[k] = (G.stock[k] || 0) + T.used[k]; T.used = null; saveGame(); }
  closeTreatment(); if (!pr) { advanceClinic(min); toast('Bệnh nhân vẫn ngồi chờ ở ghế.'); }
}

/* ---------- top bar / drawer / tray ---------- */
function renderPhases() {
  const order = PHASES.map((x) => x[0]), cur = T.phase === 'done' ? 99 : order.indexOf(T.phase);
  $('tPhases').innerHTML = PHASES.map(([k, l], n) => `<span class="phase ${n < cur ? 'done' : n === cur ? 'on' : ''}">${n + 1}. ${l}</span>`).join('');
}
function setStepUI(title, text, prog) {
  $('tTitle').textContent = title; $('tText').innerHTML = text; $('tProg').parentElement.hidden = prog == null; if (prog != null) { const w = Math.round(clamp(prog, 0, 1) * 100) + '%'; if ($('tProg').style.width !== w) $('tProg').style.width = w; }
}
function openDrawer(open, tab) {
  $('tDrawer').classList.toggle('open', open); $('treat').classList.toggle('drawer-open', open);
  if (tab) { document.querySelectorAll('.d-tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab)); document.querySelectorAll('.d-pane').forEach((p) => p.hidden = p.dataset.pane !== tab); }
  setTimeout(resizeTreat, 0);
}
function setFoot(label, fn, disabled) { const b = $('tFootBtn'); b.textContent = label; b.onclick = () => { Sound.tap(); fn(); }; b.disabled = !!disabled; b.hidden = !label; }
function buildTray(kind) {
  const tray = $('tray');
  if (kind === 'none') { tray.innerHTML = '<div class="tray-note">Hỏi bệnh trước khi khám: bệnh sử, bệnh toàn thân, dị ứng, thuốc đang dùng.</div>'; return; }
  const ids = kind === 'exam' ? EXAM_TRAY : T.trayIds;
  tray.innerHTML = ids.map((id) => { const need = TOOLS[id][2], locked = kind === 'exam' && need && !G.equip[need] && !T.practice; return `<button class="tool ${locked ? 'locked' : ''}" data-id="${id}" aria-label="${TOOLS[id][0]}">${icon(id)}<span>${TOOLS[id][0]}</span>${locked ? '<em>Chưa có</em>' : ''}</button>`; }).join('');
  tray.querySelectorAll('.tool').forEach((b) => b.onclick = () => pickTool(b.dataset.id, b));
  markTray();
}
function markTray() { $('tray').querySelectorAll('.tool').forEach((b) => b.classList.toggle('sel', b.dataset.id === T.tool)); }
function pickTool(id, el) {
  const need = TOOLS[id][2];
  if (T.phase === 'exam' && need && !G.equip[need] && !T.practice) { Sound.bad(); toast(`Phòng khám chưa có ${EQUIP[need].name}. Mua ở Cửa hàng → Thiết bị.`, 'bad'); return; }
  if (T.phase === 'exam') {
    if (T.anim) return; T.tool = id; Sound.tap(); markTray(); $('chartPal').hidden = id !== 'chart'; if (id === 'chart') buildChartPal();
    if (id === 'bp') examAction('bp'); if (id === 'pano') examAction('pano'); setExamHint(); updateGuide(); return;
  }
  if (T.phase !== 'tx') return; const st = curStep(); if (!st) return;
  if (id === st.tool) { T.tool = id; Sound.tap(); markTray(); updateStepUI(); return; }
  T.pen.wrong++; T.comfort = clamp(T.comfort - 3, 0, 100); Sound.bad(); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  toast(`${TOOLS[id][0]} chưa phù hợp cho bước “${st.title}”.`, 'bad'); updateComfort();
}
function updateComfort() { const el = $('comfort'); if (el) el.style.width = clamp(T.comfort, 4, 100) + '%'; }

/* ---------- patient info + history taking (giới hạn lượt hỏi) ---------- */
function renderInfo() {
  const p = T.p, B = qBudget(p), left = B - T.asked.size;
  if (!T.qOrder) { const qs = QUESTIONS.filter((q) => !q.female || needsPreg(p)); T.qOrder = { hx: shuffle(qs.filter((q) => q.g === 'hx')).map((q) => q.id), bg: shuffle(qs.filter((q) => q.g === 'bg')).map((q) => q.id) }; }
  const btn = (id) => { const q = QUESTIONS.find((x) => x.id === id), asked = T.asked.has(id); return `<button class="qbtn ${asked ? 'asked' : ''}" data-q="${id}" ${!asked && left <= 0 ? 'disabled' : ''}>${esc(q.q)}</button>`; };
  $('paneInfo').innerHTML = `<div class="pcard"><canvas id="pface" width="128" height="128"></canvas><div><h3>${esc(p.name)}</h3><small>${p.g === 'f' ? 'Nữ' : 'Nam'}, ${p.age} tuổi · ${esc(p.job)}</small></div></div>
    <div class="box"><h5>Lý do đến khám</h5><q>${esc(p.say)}</q></div>
    <div class="box"><h5>Mức thoải mái</h5><div class="meter"><i id="comfort"></i></div></div>
    <div class="box qbox" id="qbox"><div class="qhead"><h5>Hỏi bệnh</h5><span class="qleft ${left <= 1 ? 'low' : ''}">Còn <b>${left}</b>/${B} lượt</span></div>
      <p class="qtip">Mỗi câu tốn 1 lượt. Luôn hỏi <b>bệnh toàn thân, dị ứng, thuốc đang dùng</b>${needsPreg(p) ? ', <b>thai kỳ</b>' : ''}; dùng lượt còn lại cho câu hỏi giúp chẩn đoán.</p>
      <h6>Tiền sử & thông tin chung</h6><div class="qlist">${T.qOrder.bg.map(btn).join('')}</div>
      <h6>Bệnh sử & thói quen</h6><div class="qlist">${T.qOrder.hx.map(btn).join('')}</div></div>
    <div class="box chat" id="chatLog">${T.chat.map((m) => `<p><b>BS:</b> ${esc(m.q)}<br><span>${esc(p.name.split(' ').pop())}: ${esc(m.a)}</span></p>`).join('') || '<p class="muted">Chưa hỏi câu nào.</p>'}</div>`;
  const fc = $('pface').getContext('2d'); fc.setTransform(1, 0, 0, 1, 0, 0); fc.clearRect(0, 0, 128, 128); drawChar(fc, p.look, 64, 168, { scale: 1.75, mood: T.faceMood || 'pain', noShadow: true, pose: 'stand' });
  document.querySelectorAll('.qbtn').forEach((b) => b.onclick = () => askQ(b.dataset.q));
  updateComfort(); const cl = $('chatLog'); cl.scrollTop = cl.scrollHeight;
}
function askQ(id) {
  const p = T.p, q = QUESTIONS.find((x) => x.id === id); if (!q || T.asked.has(id)) return;
  if (T.asked.size >= qBudget(p)) { Sound.bad(); toast('Đã hết lượt hỏi. Hãy chuyển sang khám.', 'bad'); return; }
  const a = q.a ? q.a[p.type] : q.hx === 'preg' ? (p.hx.f.preg ? 'Dạ có, em đang mang thai 20 tuần.' : 'Không ạ.') : q.hx ? p.hx[q.hx] : q.waste;
  if (q.waste) T.waste++;
  T.asked.add(id); T.chat.push({ q: q.q, a }); Sound.tap(); chairAdd('q');
  const fl = $('tFloat'); fl.textContent = a; fl.hidden = false; clearTimeout(T.floatT); T.floatT = setTimeout(() => { fl.hidden = true; }, 3800);
  if (T.phase === 'hx') { T.faceMood = 'calm'; T.rev++; }
  renderInfo();
  if (T.asked.size >= qBudget(p)) toast('Đã dùng hết lượt hỏi. Bấm “Bắt đầu khám”.');
}

/* ---------- exam ---------- */
function startExam() {
  T.phase = 'exam'; renderPhases(); setView('mouth'); buildTray('exam'); T.tool = 'mirror'; markTray(); $('tFloat').hidden = true; T.rev++;
  if (T.cw < 900) openDrawer(false); else openDrawer(true, 'find');
  renderFindings(); setExamHint(); setFoot('Lập bệnh án →', openRecord, !T.findings.length);
  if (G.tut === 4) setTut(5);
}
const EXAM_TIPS = {
  mirror: 'Di chuyển gương trên miệng để soi phóng to. <b>Chạm vào răng</b> để ghi nhận điều quan sát được.',
  explorer: '<b>Giữ và rê</b> đầu thám trâm dọc rãnh mặt nhai răng nghi ngờ. <b>Mắc, đáy mềm</b> là lỗ sâu; <b>trượt, cứng</b> là rãnh nhiễm màu.',
  probe: 'Chạm vào răng để đo túi (mm) và xem có chảy máu khi thăm khám không.',
  cold: 'Thử lạnh <b>một răng lành làm đối chứng trước</b>, rồi tới răng nghi ngờ. Quan sát đồng hồ: cơn ê kéo dài bao lâu?',
  perc: 'Chạm vào răng để gõ dọc, gõ ngang.',
  mob: 'Chạm vào răng để đánh giá độ lung lay (độ 0 – III).',
  xray: 'Chỉ chụp khi có chỉ định: mỗi phim tốn chi phí và thêm liều tia. Chạm vào răng cần chụp.',
  bp: 'Đã đo huyết áp.', pano: 'Đã chụp phim toàn cảnh.',
  chart: 'Chọn tình trạng ở bảng bên trái rồi <b>chạm vào răng</b> để ghi lên sơ đồ. Chạm lại để xóa.',
};
function setExamHint() {
  setStepUI('Khám lâm sàng & cận lâm sàng', `${EXAM_TIPS[T.tool] || ''} <span class="muted">Kéo để di chuyển, cuộn hoặc chụm để phóng to.</span>`, null);
}
function toothText(tool, n) {
  const p = T.p, st = p.teeth[n], c = caseOf(), tg = isTargetTooth(n);
  if (st.missing && !st.impacted) return n % 10 === 8 ? 'Không thấy răng (chưa mọc hoặc đã mất)' : 'Mất răng';
  if (tg && c.find[tool] && !(p.type === 'calculus' && n % 10 > 3 && tool === 'mirror')) return c.find[tool];
  switch (tool) {
    case 'mirror': if (st.caries) return 'Đốm nâu đen nhỏ ở rãnh mặt nhai'; if (st.fissure) return 'Rãnh mặt nhai nhiễm màu nâu đen'; if (st.fill) return `Miếng trám ${st.fill} cũ, bờ kín`; if (st.tartar) return 'Có cao răng ở cổ răng, lợi viền đỏ'; if (st.stain) return 'Vết dính màu nâu ở cổ răng'; return 'Bình thường';
    case 'explorer': if (st.caries) return 'Thám trâm hơi mắc, đáy lỗ mềm (lỗ sâu nhỏ)'; if (st.fissure) return 'Thám trâm trượt, không mắc; rãnh cứng (nhiễm màu)'; if (st.fill) return 'Bờ miếng trám kín, thám trâm không mắc'; if (st.tartar) return 'Cảm nhận cao răng gồ ghề ở cổ răng'; return 'Bề mặt nhẵn, cứng, không mắc';
    case 'probe': return `Túi lợi ${st.pocket} mm, ${st.pocket >= 3 || st.tartar ? 'chảy máu khi thăm khám' : 'không chảy máu'}`;
    case 'cold': if (st.caries) return 'Ê buốt, hết ngay khi bỏ lạnh'; return 'Ê nhẹ thoáng qua, hết ngay (bình thường)';
    case 'perc': return 'Gõ dọc (−), gõ ngang (−)';
    case 'mob': return st.mob ? `Lung lay độ ${['0', 'I', 'II', 'III'][st.mob]}` : 'Không lung lay (độ 0)';
  }
  return '';
}
const TEST_LABEL = { mirror: 'Quan sát', explorer: 'Thám trâm', probe: 'Đo túi', cold: 'Thử lạnh', perc: 'Gõ', mob: 'Lung lay', xray: 'X-quang' };
function addFinding(n, tool, txt) { if (T.findings.some((f) => f.n === n && f.tool === tool)) return; T.findings.push({ n, tool, txt }); renderFindings(); if (T.phase === 'exam') setFoot('Lập bệnh án →', openRecord, false); }
function testDone(tool, n) { (T.tests[tool] = T.tests[tool] || new Set()).add(n); }
function floatLabel(n, text, color) { const g = ARCH[n]; if (!g) return; T.labels.push({ x: g.x + g.nx * (g.d / 2 + 66), y: g.y + g.ny * (g.d / 2 + 66), text, color: color || '#fff', t: 0 }); }

/* findings pane: odontogram + findings list */
const ODO = [[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]];
function odontogram(clickable) {
  const cell = (n) => { const code = T.chart[n], co = CHART_OPTS.find((x) => x[0] === code); return `<button class="odo-c ${code ? 'on' : ''}" ${clickable ? `data-odo="${n}"` : 'tabindex="-1"'} style="${co ? `--c:${co[2]}` : ''}" title="R${n}${co ? ': ' + co[1] : ''}"><span>${n}</span>${co ? `<i>${CHART_LETTER[code]}</i>` : ''}</button>`; };
  return `<div class="odo">${ODO.map((row) => `<div class="odo-r">${row.map(cell).join('')}</div>`).join('')}</div>`;
}
function renderFindings() {
  const list = T.findings.map((f) => `<li><span class="tn">${typeof f.n === 'number' ? 'R' + f.n : f.n}</span><span><b>${esc(TEST_LABEL[f.tool] || '')}${TEST_LABEL[f.tool] ? ':' : ''}</b> ${esc(f.txt)}</span></li>`).join('');
  const charted = Object.keys(T.chart).length;
  $('paneFind').innerHTML = `<div class="box"><h5>Sơ đồ răng <small>(${charted} răng đã ghi)</small></h5>${odontogram(T.phase === 'exam')}<div class="odo-leg">${CHART_OPTS.map((o) => `<span><i style="background:${o[2]}">${CHART_LETTER[o[0]]}</i>${esc(o[1])}</span>`).join('')}</div></div>
    <div class="box"><h5>Phiếu khám</h5><ul class="findings">${list || '<li class="muted">Chưa có ghi nhận. Chọn dụng cụ khám rồi chạm vào răng.</li>'}</ul></div>
    <div class="box exam-meta"><span>Thời gian ghế: <b>${Math.round(T.chairMin)} phút</b></span><span>Phim đã chụp: <b>${T.films}</b>${T.films && !T.practice ? ` (${moneyShort(T.filmCost)})` : ''}</span></div>`;
  document.querySelectorAll('[data-odo]').forEach((b) => b.onclick = () => { if (T.tool !== 'chart') { T.tool = 'chart'; markTray(); $('chartPal').hidden = false; buildChartPal(); setExamHint(); } chartTooth(+b.dataset.odo); });
}
function buildChartPal() {
  $('chartPal').innerHTML = `<b>Ghi sơ đồ</b>${CHART_OPTS.map((o) => `<button class="cp ${T.chartCode === o[0] ? 'on' : ''}" data-cp="${o[0]}"><i style="background:${o[2]}">${CHART_LETTER[o[0]]}</i><span>${esc(o[1])}</span></button>`).join('')}`;
  document.querySelectorAll('[data-cp]').forEach((b) => b.onclick = () => { T.chartCode = b.dataset.cp; Sound.tap(); buildChartPal(); });
}
function chartTooth(n) {
  if (!ARCH[n]) return; const code = T.chartCode;
  if (T.chart[n] === code) delete T.chart[n]; else { T.chart[n] = code; chairAdd('chart'); }
  T.rev++; Sound.tap(); renderFindings();
}

/* ---------- exam actions ---------- */
function examAction(tool, n) {
  const p = T.p, c = caseOf();
  if (tool === 'bp') { if (T.tests.bp) return; testDone('bp', 0); chairAdd('bp'); addFinding('HA', 'bp', `Huyết áp ${p.bp} mmHg, mạch 82 lần/phút`); return; }
  if (tool === 'pano') {
    if (p.hx.f.preg && !T.apron) { askApron(() => examAction('pano')); return; }
    const again = !!T.tests.pano; testDone('pano', 0); drawXrayFilm(p, p.target, 'pano'); showFilm('Phim Panorama', p.type === 'wisdom' ? c.find.pano : p.type === 'perio' ? 'Tiêu xương ổ răng vùng răng cửa dưới, nặng nhất ở răng ' + p.target + '.' : 'Không thấy tổn thương xương hàm. Các răng không có bất thường lớn.', ARCH[p.target].x > 600);
    if (!again) { chairAdd('pano'); payFilm(PANO_COST, 'Phim Panorama'); addFinding('Pano', 'xray', p.type === 'wisdom' ? c.find.pano : 'Panorama: ' + (p.type === 'perio' ? 'tiêu xương vùng răng cửa dưới' : 'không thấy bất thường lớn')); }
    return;
  }
}
function payFilm(cost, label) { T.films++; if (T.practice) return; T.filmCost += cost; addMoney(-cost, label, 'film'); updateHUD(); }
function xrayTooth(n) {
  const p = T.p, c = caseOf();
  if (p.hx.f.preg && !T.apron) { askApron(() => xrayTooth(n)); return; }
  const again = T.tests.xray && T.tests.xray.has(n); testDone('xray', n); drawXrayFilm(p, n, 'pa'); const st = p.teeth[n];
  let txt = st.missing && !st.impacted ? 'Không thấy răng trên phim.' : st.caries ? 'Thấu quang nhỏ ở men – ngà nông, còn xa buồng tủy. Vùng quanh chóp bình thường.' : st.tartar ? 'Có cao răng ở cổ răng. Mào xương ổ răng ' + (st.mob ? 'tiêu nhẹ.' : 'còn nguyên.') : 'Không thấy bất thường.';
  if (isTargetTooth(n)) txt = c.find.xray;
  showFilm('Phim quanh chóp răng ' + n, txt, ARCH[n].x > 600);
  if (!again) { chairAdd('xray'); payFilm(XRAY_COST, 'Phim X-quang R' + n); addFinding(n, 'xray', txt); }
}
function showFilm(title, txt, left) { $('xray').hidden = false; $('xray').classList.toggle('left', !!left); $('xrayText').innerHTML = `<b>${esc(title)}</b><br>${esc(txt)}`; }
function askApron(then) {
  showModal(`<div class="panel-h">Bệnh nhân đang mang thai</div><div class="panel-b"><p>Chỉ chụp phim khi thật cần thiết và phải mặc áo chì che bụng, cổ (áo chì có bảo vệ tuyến giáp).</p><div class="row"><button class="btn" id="apYes">Mặc áo chì rồi chụp</button><button class="btn ghost" id="apNo">Không chụp</button></div></div>`, false);
  $('apYes').onclick = () => { T.apron = true; hideModal(); then(); }; $('apNo').onclick = () => hideModal();
}
function inspect(n) { chairAdd('mirror', T.tests.mirror && T.tests.mirror.has(n) ? 0 : 1); testDone('mirror', n); addFinding(n, 'mirror', toothText('mirror', n)); Sound.tap(); }
function coldSecs(n) { const p = T.p, st = p.teeth[n]; if (isTargetTooth(n) && caseOf().find.coldSec != null) return caseOf().find.coldSec; return st.caries ? 2 : 1; }
/* animated tests: probe depth gauge, cold-test stopwatch, percussion, mobility wobble */
function startAnim(tool, n) {
  const st = T.p.teeth[n]; if (T.anim) return;
  if (st.missing && !st.impacted) { toast('Không có răng ở vị trí này.'); return; }
  T.sel = n; T.rev++;
  if (tool === 'cold') { const L = coldSecs(n); T.anim = { tool, n, t: 0, apply: 0.7, L, dur: 0.7 + Math.max(0.9, L / 12) }; T.coldSeq.push(n); }
  else if (tool === 'probe') T.anim = { tool, n, t: 0, dur: 0.8, depth: isTargetTooth(n) && T.p.type === 'perio' ? 7 : st.pocket, bop: st.pocket >= 3 || !!st.tartar };
  else if (tool === 'perc') T.anim = { tool, n, t: 0, dur: 0.45 };
  else if (tool === 'mob') T.anim = { tool, n, t: 0, dur: 0.7, amp: [0.6, 2.5, 4.5, 8][st.mob || 0] };
  Sound.tap();
}
function finishAnim() {
  const a = T.anim; T.anim = null; T.wob = null; if (!a) return; const n = a.n, tg = isTargetTooth(n), c = caseOf();
  testDone(a.tool, n); chairAdd(a.tool);
  if (a.tool === 'cold') { const txt = (tg ? c.find.cold : toothText('cold', n)) + (a.L > 3 ? ` (kéo dài khoảng ${a.L} giây)` : a.L > 0 ? ' (dưới 3 giây)' : ''); addFinding(n, 'cold', txt); floatLabel(n, a.L > 3 ? `${a.L} giây!` : a.L > 0 ? 'hết ngay' : 'đáp ứng yếu', a.L > 3 ? '#ffb4a8' : '#d6ffb0'); if (G.tut === 6) setTut(7); }
  else addFinding(n, a.tool, toothText(a.tool, n));
  T.rev++;
}
function updateExam(dt) {
  T.labels.forEach((l) => l.t += dt); T.labels = T.labels.filter((l) => l.t < 1.8);
  if (T.jit) T.jit = Math.max(0, T.jit - dt);
  const a = T.anim; if (!a) return; a.t += dt;
  if (a.tool === 'mob') T.wob = { n: a.n, dx: Math.sin(a.t * 38) * a.amp * Math.min(1, (a.dur - a.t) * 4) };
  if (a.tool === 'cold' && a.t >= a.apply && !a.reacted) { a.reacted = true; T.faceMood = a.L > 3 ? 'pain' : 'calm'; if (a.L > 3) { Sound.bad(); buzz(40); } }
  if (a.t >= a.dur) finishAnim();
}
/* explorer: hold and drag over the occlusal surface; real cavities "catch" the tip */
function explorerZone(n, lx, ly) {
  const p = T.p, st = p.teeth[n], g = ARCH[n], tg = isTargetTooth(n), w = g.w, d = g.d, r = Math.hypot(lx, ly);
  if (st.caries && !(st.missing)) { const R = tg && p.type === 'pulpitis' ? w * 0.34 : tg ? w * 0.24 : w * 0.16; if (r < R) return 'catch'; }
  if (st.tartar && Math.abs(ly) > d * 0.26) return 'rough';
  return null;
}
function explorerDown(q) { const n = archHit(q.x, q.y); if (!n) return false; T.probe = { n, lx: q.x, ly: q.y, acc: 0, moved: 0 }; return true; }
function explorerMove(q) {
  const pr = T.probe; if (!pr) return; const n = archHit(q.x, q.y);
  const dd = dist(q.x, q.y, pr.lx, pr.ly); pr.lx = q.x; pr.ly = q.y; if (!n || dd > 50) return;
  if (n !== pr.n) { pr.n = n; pr.acc = 0; }
  const st = T.p.teeth[n]; if (st.missing && !st.impacted) return;
  pr.moved += dd; T.exLen[n] = (T.exLen[n] || 0) + dd;
  const g = ARCH[n], c0 = Math.cos(-g.rot), s0 = Math.sin(-g.rot), dx = q.x - g.x, dy = q.y - g.y, lx = dx * c0 - dy * s0, ly = dx * s0 + dy * c0;
  const z = explorerZone(n, lx, ly);
  if (z) { pr.acc += dd; if (pr.acc > 15) { pr.acc = 0; T.jit = 0.16; if (z === 'catch') { Sound.tick(); buzz(14); } else Sound.rough(); for (let k = 0; k < 3; k++) T.parts.push({ x: q.x, y: q.y, vx: rand(-60, 60), vy: rand(-90, -20), life: 0.3, c: z === 'catch' ? '#ffcb3d' : '#e8d27a', s: 2.4 }); } }
  if (T.exLen[n] >= 70 && !(T.tests.explorer && T.tests.explorer.has(n))) {
    testDone('explorer', n); chairAdd('explorer'); addFinding(n, 'explorer', toothText('explorer', n));
    const caught = st.caries; floatLabel(n, caught ? 'mắc!' : st.tartar ? 'gồ ghề' : 'trượt', caught ? '#ffcb3d' : '#d6efff'); Sound.tap();
    if (G.tut === 5) setTut(6);
  }
}
function explorerUp() { const pr = T.probe; T.probe = null; if (pr && pr.moved < 10) toast('Giữ và rê đầu thám trâm trên mặt răng để dò.'); }
function examTap(x, y) {
  const n = archHit(x, y); if (!n || T.anim) return;
  if (T.tool === 'chart') { chartTooth(n); return; }
  if (T.tool !== 'explorer') { T.sel = n; T.rev++; }
  if (T.tool === 'mirror') inspect(n);
  else if (['probe', 'cold', 'perc', 'mob'].includes(T.tool)) startAnim(T.tool, n);
  else if (T.tool === 'xray') xrayTooth(n);
}
/* exam effects drawn above the cached mouth layer (virtual coordinates) */
function drawExamFx(ctx) {
  const a = T.anim;
  if (a) {
    const g = ARCH[a.n], k = clamp(a.t / a.dur, 0, 1);
    const ox = g.x + g.nx * (g.d / 2 + 70), oy = g.y + g.ny * (g.d / 2 + 70);
    if (a.tool === 'probe') {
      const dep = Math.min(a.depth, a.depth * k * 1.4);
      ctx.save(); ctx.translate(g.x - g.nx * g.d * 0.2, g.y - g.ny * g.d * 0.2); ctx.rotate(Math.atan2(g.ny, g.nx) + Math.PI / 2);
      ctx.strokeStyle = '#55636e'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -12 * dep / 2); ctx.lineTo(0, -120); ctx.stroke();
      for (let m = 1; m <= 10; m++) { ctx.strokeStyle = m === 3 || m === 6 || m === 8 ? '#1d1d24' : '#9aa7b2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5, -m * 6 - 12 * dep / 2 + 6); ctx.lineTo(5, -m * 6 - 12 * dep / 2 + 6); ctx.stroke(); }
      ctx.restore();
      gaugeBubble(ctx, ox, oy, `${Math.round(dep)} mm`, a.bop && k > 0.8 ? 'chảy máu' : '');
      if (a.bop && k > 0.8) { ctx.fillStyle = '#c3213b'; for (let m = 0; m < 3; m++) { ctx.beginPath(); ctx.arc(g.x + Math.cos(m * 2.1) * g.w * 0.45, g.y + Math.sin(m * 2.1) * g.d * 0.45, 4.5, 0, 7); ctx.fill(); } }
    }
    if (a.tool === 'cold') {
      const ap = clamp(a.t / a.apply, 0, 1);
      ctx.save(); ctx.globalAlpha = a.t < a.apply ? 1 : clamp(1 - (a.t - a.apply) * 2, 0, 1); ctx.fillStyle = '#e6f7ff'; ctx.strokeStyle = '#7fd0f5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(g.x, g.y - (1 - ap) * 60, 13, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#bfe8ff'; ctx.lineWidth = 2; for (let m = 0; m < 6; m++) { const an = m / 6 * 6.283 + a.t * 2; ctx.beginPath(); ctx.moveTo(g.x + Math.cos(an) * 16, g.y - (1 - ap) * 60 + Math.sin(an) * 16); ctx.lineTo(g.x + Math.cos(an) * 24, g.y - (1 - ap) * 60 + Math.sin(an) * 24); ctx.stroke(); }
      ctx.restore();
      if (a.t >= a.apply) { const sec = Math.min(a.L, (a.t - a.apply) / Math.max(0.0001, a.dur - a.apply) * a.L * 1.15); stopwatch(ctx, ox, oy, sec, a.L); }
      else gaugeBubble(ctx, ox, oy, 'Đặt bông lạnh…', '');
    }
    if (a.tool === 'perc') { ctx.strokeStyle = '#ffcb3d'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let m = 0; m < 3; m++) { const an = -1.2 + m * 0.6, r0 = 26 + k * 12; ctx.beginPath(); ctx.moveTo(g.x + Math.cos(an) * r0, g.y + Math.sin(an) * r0 - 10); ctx.lineTo(g.x + Math.cos(an) * (r0 + 14), g.y + Math.sin(an) * (r0 + 14) - 10); ctx.stroke(); } gaugeBubble(ctx, ox, oy, 'Gõ dọc · gõ ngang', ''); }
    if (a.tool === 'mob') gaugeBubble(ctx, ox, oy, 'Lay răng…', '');
  }
  for (const l of T.labels) { const al = clamp(1.8 - l.t, 0, 1); ctx.globalAlpha = al; ctx.font = '800 22px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 5; ctx.strokeStyle = '#3a1118'; ctx.strokeText(l.text, l.x, l.y - l.t * 26); ctx.fillStyle = l.color; ctx.fillText(l.text, l.x, l.y - l.t * 26); ctx.globalAlpha = 1; }
}
function gaugeBubble(ctx, x, y, a, b) {
  ctx.save(); ctx.font = '800 17px "Baloo 2",sans-serif'; const w = Math.max(ctx.measureText(a).width, b ? ctx.measureText(b).width : 0) + 26, h = b ? 52 : 34;
  ctx.fillStyle = 'rgba(255,250,240,.96)'; ctx.strokeStyle = '#6e4019'; ctx.lineWidth = 3; rr(ctx, x - w / 2, y - h / 2, w, h, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4b2a10'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a, x, y - (b ? 10 : 0)); if (b) { ctx.fillStyle = '#c3213b'; ctx.font = '800 14px Nunito,sans-serif'; ctx.fillText(b, x, y + 13); }
  ctx.restore();
}
function stopwatch(ctx, x, y, sec, L) {
  ctx.save(); ctx.translate(x, y); const R = 40;
  ctx.fillStyle = 'rgba(255,250,240,.97)'; ctx.strokeStyle = '#6e4019'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#6e4019'; ctx.fillRect(-6, -R - 10, 12, 8);
  const fr = clamp(sec / 60, 0, 1); ctx.strokeStyle = sec > 3 ? '#ec5b4b' : '#78c443'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, R - 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fr); ctx.stroke();
  ctx.fillStyle = '#4b2a10'; ctx.font = '800 22px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(Math.floor(sec) + 's', 0, -2);
  ctx.font = '700 11px Nunito,sans-serif'; ctx.fillStyle = '#8a5a33'; ctx.fillText(L > 3 ? 'vẫn còn đau' : L > 0 ? 'ê buốt' : 'ít cảm giác', 0, 17);
  ctx.restore();
}

/* ---------- evaluation helpers (used by the final score) ---------- */
function testedTarget(t) { const s = T.tests[t]; if (t === 'bp' || t === 'pano') return !!s; return !!s && [...s].some((n) => isTargetTooth(n)); }
const notable = (n) => { const st = T.p.teeth[n]; return !!(st.caries || st.fissure || st.fill || st.tartar || st.mob || st.impacted || st.stain); };
function chartTruth(n) {
  const p = T.p, st = p.teeth[n], c = caseOf();
  if (isTargetTooth(n)) return [p.type === 'calculus' ? 'calculus' : c.chartAs];
  if (st.missing && !st.impacted) return ['missing'];
  const t = []; if (st.caries) t.push('caries'); if (st.fill) t.push('filled'); if (st.tartar) t.push('calculus'); if (st.mob) t.push('mobile'); if (st.fissure || st.stain) t.push('stain');
  if (!t.length || st.fissure || st.stain) t.push('ok');
  return t;
}
function examNeeds() { const c = caseOf(), pr = T.practice; return [...new Set(c.keyT.map((t) => (t === 'pano' && !G.equip.pano && !pr ? 'xray' : t)))].filter((t) => !TOOLS[t][2] || G.equip[TOOLS[t][2]] || pr); }
function hxEval() {
  const p = T.p, c = caseOf(), notes = [];
  const must = ['sys', 'allergy', 'meds'].concat(needsPreg(p) ? ['preg'] : []);
  const gotM = must.filter((q) => T.asked.has(q)).length, gotK = c.keyQ.filter((q) => T.asked.has(q)).length;
  must.filter((q) => !T.asked.has(q)).forEach((q) => notes.push(`Chưa hỏi (bắt buộc): “${QUESTIONS.find((x) => x.id === q).q}”`));
  c.keyQ.filter((q) => !T.asked.has(q)).forEach((q) => notes.push(`Chưa hỏi (giúp chẩn đoán): “${QUESTIONS.find((x) => x.id === q).q}”`));
  if (T.waste) notes.push(`${T.waste} câu hỏi không giúp ích cho chẩn đoán (tốn lượt hỏi).`);
  return { score: clamp(Math.round(7 * gotM / must.length + 8 * gotK / c.keyQ.length - Math.min(3, T.waste)), 0, 15), notes };
}
function examEval() {
  const p = T.p, notes = [], needT = examNeeds();
  const got = needT.filter(testedTarget);
  needT.filter((t) => !testedTarget(t)).forEach((t) => notes.push(`Chưa làm: ${TOOLS[t][0]} trên răng nguyên nhân.`));
  const key = needT.length ? 6 * got.length / needT.length : 6;
  let ctrl = 1;
  if (needT.includes('cold')) {
    const first = T.coldSeq.findIndex((n) => isTargetTooth(n));
    const ok = T.coldSeq.some((n, i) => (first < 0 || i < first) && !isTargetTooth(n) && !p.teeth[n].caries && !p.teeth[n].missing);
    if (!ok) { ctrl = 0; notes.push('Nên thử lạnh một răng lành làm đối chứng trước khi thử răng nghi ngờ.'); }
  }
  const targets = Object.keys(p.teeth).map(Number).filter(isTargetTooth);
  const hit = targets.filter((n) => chartTruth(n).includes(T.chart[n])).length;
  let chartS = 3 * (p.type === 'calculus' ? Math.min(1, hit / Math.max(1, Math.ceil(targets.length / 2))) : hit ? 1 : 0);
  if (!hit) notes.push(`Sơ đồ răng: chưa ghi đúng ${p.type === 'calculus' ? 'các răng có cao răng' : 'răng ' + p.target} (${optLabel(chartTruth(targets[0])[0])}).`);
  let wrong = 0;
  for (const k in T.chart) {
    const n = +k, code = T.chart[k]; if (isTargetTooth(n)) continue; const tr = chartTruth(n);
    if (!tr.includes(code) && ['caries', 'mobile', 'impacted', 'missing', 'calculus'].includes(code)) { const st = p.teeth[n], fis = st.fissure && code === 'caries'; wrong += fis ? 1.5 : 1; notes.push(`Sơ đồ răng: R${n} ghi “${optLabel(code)}” chưa đúng${fis ? ' (chỉ là rãnh nhiễm màu: thám trâm trượt, không mắc)' : ''}.`); }
  }
  chartS += Math.max(0, 2 - wrong);
  let just = 3; const films = T.tests.xray ? [...T.tests.xray] : [];
  const bad = films.filter((n) => !isTargetTooth(n) && !notable(n));
  if (bad.length) { just -= Math.min(2, bad.length); notes.push(`Chụp phim không có chỉ định: ${bad.map((n) => 'R' + n).join(', ')} (tốn chi phí, thêm liều tia).`); }
  if (films.length > 3) { just -= 1; notes.push(`Chụp quá nhiều phim quanh chóp (${films.length} phim).`); }
  if (T.tests.pano && !['wisdom', 'perio'].includes(p.type)) { just -= 1; notes.push('Phim Panorama không cần thiết cho ca này.'); }
  const colds = T.tests.cold ? T.tests.cold.size : 0; if (colds > 4) { just -= 0.5; notes.push(`Thử lạnh quá nhiều răng (${colds} răng).`); }
  return { score: Math.round(clamp(key + ctrl + chartS + clamp(just, 0, 3), 0, 15)), notes, chartOK: hit > 0 };
}

/* ---------- record (bệnh án) ---------- */
function openRecord() {
  if (T.anim) finishAnim();
  if (G.tut >= 4 && G.tut <= 7) setTut(8);
  T.phase = 'rec'; renderPhases(); $('xray').hidden = true; $('chartPal').hidden = true; T.rev++;
  if (!T.recTimed) { T.recTimed = true; chairAdd('rec'); }
  const p = T.p, c = caseOf(), R = T.rec || {}; T.recOpts = T.recOpts || { dx: shuffle(c.dx), plan: shuffle(c.plan), hxs: shuffle(c.hxSum) };
  const hxLine = (id) => T.asked.has(id) ? esc(p.hx[id]) : `<span class="warn">Chưa hỏi</span>`;
  const teethOpts = ['Toàn hàm'].concat(Object.keys(ARCH).sort((a, b) => a - b));
  const sel = (id, opts, val) => `<select id="${id}"><option value="">— Chọn —</option>${opts.map((o) => `<option ${String(val) === String(o) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  const charted = Object.entries(T.chart).sort((a, b) => a[0] - b[0]).map(([n, code]) => `R${n}: ${optLabel(code)}`).join(' · ');
  showModal(`<div class="panel-h">Bệnh án nha khoa</div><div class="panel-b record">
    ${tutNote(8)}<div class="rec-head"><b>${esc(G.profile.clinic)}</b><span>Ngày ${G.day} · Mã BN ${String(1000 + p.id)}</span></div>
    <fieldset><legend>I. Hành chính</legend><div class="kv"><span>Họ tên</span><b>${esc(p.name)}</b><span>Tuổi / giới</span><b>${p.age} · ${p.g === 'f' ? 'Nữ' : 'Nam'}</b><span>Nghề nghiệp</span><b>${esc(p.job)}</b><span>Địa chỉ</span><b>${esc(p.addr)}</b><span>Điện thoại</span><b>${esc(p.phone)}</b></div></fieldset>
    <fieldset><legend>II. Lý do đến khám</legend>${sel('rCC', CC_OPTIONS.map((x) => x[1]), R.cc)}</fieldset>
    <fieldset><legend>III. Bệnh sử</legend><label>Tóm tắt bệnh sử ${sel('rHx', T.recOpts.hxs, R.hxs)}</label><p class="muted">Dựa trên các câu bạn đã hỏi (${T.asked.size} câu).</p></fieldset>
    <fieldset><legend>IV. Tiền sử</legend><div class="kv"><span>Toàn thân</span><b>${hxLine('sys')}</b><span>Dị ứng</span><b>${hxLine('allergy')}</b><span>Thuốc đang dùng</span><b>${hxLine('meds')}</b>${needsPreg(p) ? `<span>Thai kỳ</span><b>${T.asked.has('preg') ? (p.hx.f.preg ? 'Đang mang thai 20 tuần' : 'Không') : '<span class="warn">Chưa hỏi</span>'}</b>` : ''}</div></fieldset>
    <fieldset><legend>V. Khám & cận lâm sàng</legend>${odontogram(false)}<p class="muted">${charted || 'Chưa ghi sơ đồ răng.'}</p><ul class="findings">${T.findings.map((f) => `<li><span class="tn">${typeof f.n === 'number' ? 'R' + f.n : f.n}</span><span><b>${esc(TEST_LABEL[f.tool] || '')}${TEST_LABEL[f.tool] ? ':' : ''}</b> ${esc(f.txt)}</span></li>`).join('')}</ul></fieldset>
    <fieldset><legend>VI. Chẩn đoán</legend><label>Răng nguyên nhân ${sel('rTooth', teethOpts, R.tooth)}</label><label>Chẩn đoán ${sel('rDx', T.recOpts.dx, R.dx)}</label></fieldset>
    <fieldset><legend>VII. Kế hoạch điều trị</legend>${sel('rPlan', T.recOpts.plan, R.plan)}</fieldset>
    <fieldset><legend>VIII. Gây tê</legend><div class="radios">${ANESTH.map(([k, l]) => `<label><input type="radio" name="rAn" value="${k}" ${R.anesth === k ? 'checked' : ''}> ${l}</label>`).join('')}</div></fieldset>
    <fieldset><legend>IX. Lưu ý trước điều trị</legend><div class="checks prec">${PRECAUTIONS.map((x) => `<label><input type="checkbox" value="${x.id}" ${R.prec && R.prec.includes(x.id) ? 'checked' : ''}> ${x.label}</label>`).join('')}</div></fieldset>
    <fieldset><legend>X. Ghi chú của bác sĩ</legend><textarea id="rNote" rows="2" placeholder="Không bắt buộc">${esc(R.note || '')}</textarea></fieldset>
    <label class="consent"><input type="checkbox" id="rConsent" ${R.consent ? 'checked' : ''}> Đã giải thích chẩn đoán, kế hoạch, chi phí dự kiến <b>${money(c.fee + EXAM_FEE)}</b> (gồm phí khám) và bệnh nhân đồng ý điều trị.</label>
    <div class="row"><button class="btn ghost" id="rBack">← Quay lại khám</button><button class="btn" id="rSign">Ký bệnh án</button></div></div>`, false);
  $('rBack').onclick = () => { T.rec = readRec(); hideModal(); T.phase = 'exam'; renderPhases(); renderFindings(); setExamHint(); T.rev++; };
  $('rSign').onclick = () => { const r = readRec(); T.rec = r; const miss = []; if (!r.cc) miss.push('lý do khám'); if (!r.hxs) miss.push('tóm tắt bệnh sử'); if (!r.tooth) miss.push('răng nguyên nhân'); if (!r.dx) miss.push('chẩn đoán'); if (!r.plan) miss.push('kế hoạch'); if (!r.anesth) miss.push('gây tê'); if (!r.consent) miss.push('xác nhận đồng ý'); if (miss.length) { Sound.bad(); toast('Còn thiếu: ' + miss.join(', '), 'bad'); return; } evalRecord(); };
}
function readRec() { return { cc: $('rCC').value, hxs: $('rHx').value, tooth: $('rTooth').value, dx: $('rDx').value, plan: $('rPlan').value, anesth: (document.querySelector('input[name="rAn"]:checked') || {}).value || '', prec: [...document.querySelectorAll('.checks.prec input:checked')].map((i) => i.value), note: $('rNote').value.slice(0, 300), consent: $('rConsent').checked }; }
function rightTooth() { return T.p.type === 'calculus' ? 'Toàn hàm' : String(T.p.target); }
function anesthVerdict(a) {
  const c = caseOf(), f = T.p.hx.f, cv = f.htn || f.cardiac;
  if (c.anesth === 'none') return a === 'none' ? [1, 'Lấy cao răng thường không cần gây tê.'] : [0, 'Lấy cao răng thường không cần gây tê.'];
  if (a === 'none') return c.anesth === 'optional' ? [1, 'Sâu ngà nông có thể trám không cần gây tê.'] : [0, 'Thủ thuật này bắt buộc gây tê.'];
  if (cv && a === 'lido') return [0.5, 'Bệnh nhân tăng huyết áp/tim mạch: ưu tiên Mepivacaine 3% không co mạch, hoặc giới hạn liều co mạch và đo huyết áp trước.'];
  return [1, cv ? 'Đúng: dùng thuốc tê không co mạch cho bệnh nhân tim mạch.' : 'Lidocaine 2% + Epinephrine là lựa chọn chuẩn.'];
}
function evalRecord() {
  const r = T.rec, c = caseOf(), p = T.p, f = p.hx.f, rows = [];
  const ccOK = r.cc === CC_OPTIONS.find((x) => x[0] === p.type)[1], hxOK = r.hxs === c.hxSum[0], dxOK = r.dx === c.dx[0], tOK = r.tooth === rightTooth(), plOK = r.plan === c.plan[0];
  rows.push([ccOK, 'Lý do khám', CC_OPTIONS.find((x) => x[0] === p.type)[1]]);
  rows.push([hxOK, 'Tóm tắt bệnh sử', c.hxSum[0]]);
  rows.push([tOK, 'Răng nguyên nhân', rightTooth()]);
  rows.push([dxOK, 'Chẩn đoán', c.dx[0]]);
  rows.push([plOK, 'Kế hoạch', c.plan[0]]);
  const [anS, anWhy] = anesthVerdict(r.anesth); rows.push([anS >= 1 ? true : anS > 0 ? 'half' : false, 'Gây tê', anWhy]);
  const need = PRECAUTIONS.filter((x) => x.need(f, c)).map((x) => x.id), missP = need.filter((x) => !r.prec.includes(x)), extraP = r.prec.filter((x) => !need.includes(x));
  rows.push([missP.length === 0 && extraP.length <= 1, 'Lưu ý trước điều trị', need.length ? 'Cần: ' + need.map((id) => PRECAUTIONS.find((x) => x.id === id).label).join('; ') : 'Bệnh nhân không có lưu ý đặc biệt']);
  const recScore = (ccOK ? 2 : 0) + (hxOK ? 3 : 0) + (tOK ? 4 : 0) + (dxOK ? 7 : 0) + (plOK ? 4 : 0);
  const precScore = Math.round(5 * anS + Math.max(0, 5 - missP.length * 2.5 - Math.max(0, extraP.length - 1)));
  T.recEval = { recScore, precScore, dxOK, plOK, rows };
  const needEq = T.practice ? [] : c.need.filter((e) => !G.equip[e]);
  showModal(`<div class="panel-h">Nhận xét bệnh án</div><div class="panel-b"><table class="review">${rows.map(([ok, k, v]) => `<tr><td class="${ok === true ? 'ok' : ok === 'half' ? 'half' : 'no'}">${ok === true ? '✓' : ok === 'half' ? '±' : '✗'}</td><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</table>
    <div class="note"><b>Ghi nhớ:</b> ${esc(c.note)} <button class="linkbtn" id="recProto">Xem phác đồ ${esc(c.label.toLowerCase())} →</button></div>
    ${needEq.length ? `<div class="note warnbox">Phòng khám chưa có <b>${needEq.map((e) => EQUIP[e].name).join(', ')}</b> để điều trị ca này.</div><div class="row">${needEq.map((e) => `<button class="btn" data-buyeq="${e}">Mua ${esc(EQUIP[e].name)} · ${moneyShort(EQUIP[e].price)}</button>`).join('')}<button class="btn ghost" id="refer">Chuyển tuyến</button></div>` : `<div class="row"><button class="btn" id="goTx">Chuẩn bị điều trị →</button></div>`}</div>`, false);
  document.querySelectorAll('[data-buyeq]').forEach((b) => b.onclick = () => { const e = b.dataset.buyeq; if (G.level < EQUIP[e].lv) { toast(`Cần đạt cấp ${EQUIP[e].lv}.`, 'bad'); return; } if (G.money < EQUIP[e].price) { toast('Không đủ tiền. Có thể vay vốn ở Hồ sơ → Ngân hàng.', 'bad'); Sound.bad(); return; } addMoney(-EQUIP[e].price, 'Mua ' + EQUIP[e].name, 'equip'); G.equip[e] = true; spawnTruck(); Sound.coin(); updateHUD(); saveGame(); questCheck(); evalRecord(); });
  $('recProto').onclick = () => openProtocols(p.type);
  if ($('refer')) $('refer').onclick = () => referPatient();
  if ($('goTx')) $('goTx').onclick = () => checkSupplies();
}
function procUse() { const u = Object.assign({}, caseOf().use), an = T.rec.anesth === 'none' ? (caseOf().anesth === 'required' ? (T.p.hx.f.htn || T.p.hx.f.cardiac ? 'mepi' : 'lido') : null) : T.rec.anesth; if (u.anest) { if (an) u[an] = (u[an] || 0) + u.anest; delete u.anest; } else if (an && caseOf().anesth === 'optional') u[an] = 1; return u; }
function checkSupplies() {
  if (T.practice) { T.used = {}; hideModal(); startTreatment(); return; }
  const use = procUse(), miss = missingSupplies(use);
  if (!miss.length) { for (const k in use) G.stock[k] -= use[k]; T.used = use; saveGame(); hideModal(); startTreatment(); return; }
  showModal(`<div class="panel-h">Thiếu vật tư</div><div class="panel-b"><p>Ca này cần thêm vật tư sau. Nhập hàng ngay (giao tức thì):</p><table class="review">${miss.map((k) => `<tr><th>${esc(SUPPLIES[k].name)}</th><td>Còn ${G.stock[k] || 0}/${use[k]} ${SUPPLIES[k].unit}</td><td><button class="btn small" data-buy="${k}">+${SUPPLIES[k].pack} · ${moneyShort(SUPPLIES[k].price)}</button></td></tr>`).join('')}</table><div class="row"><button class="btn ghost" id="refer">Chuyển tuyến</button></div></div>`, false);
  document.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => { if (buySupply(b.dataset.buy)) checkSupplies(); });
  $('refer').onclick = () => referPatient();
}
function referPatient() {
  const p = T.p, pr = T.practice, min = T.chairMin; hideModal(); closeTreatment(); G.stats.referred++;
  if (!pr && p.chair) { p.chair.coin = { amount: EXAM_FEE, label: `${p.name}: phí khám (chuyển tuyến)` }; leave(p, 'calm'); advanceClinic(min); }
  toast('Đã viết giấy chuyển tuyến. Bệnh nhân chỉ trả phí khám.'); gainXP(5); saveGame(); updateHUD();
}
