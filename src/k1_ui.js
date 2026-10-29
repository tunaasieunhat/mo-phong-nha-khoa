/* ================== UI 1: HUD, modals, shop, stock, staff, records, bank, quests, day report ================== */
function updateHUD() {
  setText($('moneyText'), moneyShort(G.money)); $('moneyText').parentElement.classList.toggle('neg', G.money < 0);
  const debt = $('debtText'); if (debt) { debt.hidden = !G.loan; setText(debt, G.loan ? 'nợ ' + moneyShort(G.loan) : ''); }
  setText($('repText'), G.rep.toFixed(1)); setText($('lvNum'), String(G.level)); setText($('clinicName'), G.profile.clinic || 'Nha Khoa');
  const need = xpNeed(G.level); $('xpFill').style.width = clamp(G.xp / need * 100, 0, 100) + '%'; setText($('xpText'), `${G.xp} / ${need} KN`);
  updateDayPill();
  const q = QUESTS.filter((x) => G.quests[x.id] === 'done').length; setText($('questBadge'), String(q)); $('questBadge').hidden = !q;
  const low = ['gloves', 'lido', 'etch', 'bond', 'comp', 'bur', 'paste', 'chx', 'gauze'].filter((k) => (G.stock[k] || 0) <= 2).length; $('stockBadge').hidden = !low;
}
function updateDayPill() { setText($('dayText'), `Ngày ${G.day} · ${clock(G.time)}`); setText($('dayState'), G.time >= 1020 ? 'Hết giờ làm việc' : G.time >= 990 ? 'Sắp đóng cửa' : 'Đang mở cửa'); }
function showModal(html, closable = true, wide) {
  $('modalPanel').innerHTML = html + (closable ? '<button class="x" id="mClose" aria-label="Đóng">✕</button>' : '');
  $('modalPanel').classList.toggle('wide', !!wide); $('modal').hidden = false; W.paused = true;
  if (closable) $('mClose').onclick = () => { Sound.tap(); hideModal(); };
}
function hideModal() { $('modal').hidden = true; $('modalPanel').innerHTML = ''; if ($('treat').hidden && $('proto').hidden) W.paused = false; }
function tabs(id, list, cur) {
  return `<div class="tabs" id="${id}">${list.map(([k, l]) => `<button class="tab ${k === cur ? 'on' : ''}" data-k="${k}">${l}</button>`).join('')}</div>`;
}
function wireTabs(id, fn) { document.querySelectorAll(`#${id} .tab`).forEach((b) => b.onclick = () => { Sound.tap(); fn(b.dataset.k); }); }

/* ---------- level ---------- */
const UNLOCKS = { 2: ['Ca bệnh mới: Viêm tủy → Điều trị tủy (cần Bộ nội nha và máy X-quang)', 'Ca bệnh mới: Răng lung lay do viêm quanh răng → Nhổ răng (cần Bộ kìm & bẩy)', 'Mua ghế thứ 2, thuê bác sĩ cộng sự', 'Hạn mức vay ngân hàng tăng'], 3: ['Ca bệnh mới: Răng khôn mọc lệch → Phẫu thuật (cần Bộ phẫu thuật và X-quang)', 'Máy X-quang Panorama, ghế thứ 3, máy lạnh'], 4: ['Bệnh nhân đến đông hơn khi uy tín cao'] };
let lvQueue = [];
function gainXP(n) {
  G.xp += n; const ups = [];
  while (G.xp >= xpNeed(G.level)) { G.xp -= xpNeed(G.level); G.level++; ups.push(G.level); }
  updateHUD(); saveGame(); if (!ups.length) return;
  const lv = ups[ups.length - 1], bonus = 300000 * (lv - 1); addMoney(bonus, `Thưởng lên cấp ${lv}`); updateHUD(); saveGame(); Sound.good(); questCheck();
  lvQueue.push({ lv, bonus }); setTimeout(showLevelUp, 300);
}
function showLevelUp() {
  if (!lvQueue.length) return;
  if (!$('modal').hidden || !$('treat').hidden) { setTimeout(showLevelUp, 800); return; }
  const { lv, bonus } = lvQueue.shift();
  showModal(`<div class="panel-h">Lên cấp ${lv}!</div><div class="panel-b center"><div class="lvl big"><svg viewBox="0 0 60 60"><path d="M30 3l8 17 18 2-13 13 4 19-17-9-17 9 4-19L4 22l18-2z" fill="#ffcb3d" stroke="#c98500" stroke-width="3" stroke-linejoin="round"/></svg><span>${lv}</span></div>
    <p>Phòng khám ngày càng có tiếng! Thưởng <b>${money(bonus)}</b>.</p>${(UNLOCKS[lv] || ['Tiếp tục nâng cấp phòng khám nhé!']).map((u) => `<div class="note left"><b>Mở khóa:</b> ${esc(u)}</div>`).join('')}<div class="row"><button class="btn" id="lvOk">Tuyệt vời!</button></div></div>`, false);
  $('lvOk').onclick = () => { Sound.tap(); hideModal(); };
}

/* ---------- shop ---------- */
function card(o) { return `<div class="card ${o.cls || ''}"><div class="card-ic">${o.icon}</div><h4>${esc(o.name)}</h4><p>${esc(o.desc)}</p>${o.foot}</div>`; }
function priceBtn(attr, price, label) { return `<button class="btn small" ${attr}><span class="price"><b class="ico-coin">đ</b>${moneyShort(price)}</span>${label ? ' ' + label : ''}</button>`; }
function spriteIcon(key, scale = 0.55) { const a = ASSETS[key]; return a ? `<img alt="" src="${a.url || ''}" style="width:${Math.round(a.w * scale)}px;max-width:100%">` : ''; }
function pay(price, label, kind) { if (G.money < price) { Sound.bad(); toast(`Không đủ tiền: cần ${money(price)}. Có thể vay vốn ở Hồ sơ → Ngân hàng.`, 'bad'); return false; } addMoney(-price, label, kind); Sound.coin(); return true; }
function openShop(tab = 'equip') {
  Sound.tap(); let body = '';
  if (tab === 'equip') body = Object.entries(EQUIP).map(([k, e]) => card({ icon: icon(EQUIP_ICON[k]), name: e.name, desc: e.desc + ` Bảo trì khoảng ${moneyShort(e.price * DAILY.upkeep)}/ngày.`, foot: G.equip[k] ? '<span class="tag ok">Đã có</span>' : G.level < e.lv ? `<span class="tag lock">Cần cấp ${e.lv}</span>` : priceBtn(`data-eq="${k}"`, e.price) })).join('');
  if (tab === 'chairs') {
    body = CHAIR_SLOTS.map((s, k) => { const owned = k < G.chairs; return card({ icon: spriteIcon(G.chairLv[k] >= 2 ? 'chair_premium' : 'chair_basic', 0.45), name: `Ghế nha khoa #${k + 1}`, desc: owned ? (G.chairLv[k] >= 2 ? 'Ghế cao cấp: bệnh nhân thoải mái hơn, cộng sự làm nhanh hơn 22%.' : 'Ghế cơ bản. Nâng cấp lên ghế cao cấp để tăng tốc độ và sự thoải mái.') : 'Khám nhiều bệnh nhân cùng lúc. Cần thuê bác sĩ cộng sự để dùng ghế này hiệu quả.', foot: owned ? (G.chairLv[k] >= 2 ? '<span class="tag ok">Ghế cao cấp</span>' : priceBtn(`data-up="${k}"`, CHAIR_UP_PRICE, 'Nâng cấp')) : (k !== G.chairs ? '<span class="tag lock">Mua ghế trước đó</span>' : G.level < s.lv ? `<span class="tag lock">Cần cấp ${s.lv}</span>` : priceBtn(`data-ch="${k}"`, s.price)) }); }).join('');
  }
  if (tab === 'staff') {
    body = [1, 2].map((k) => { const a = G.assoc[k], has = k < G.chairs; return card({ icon: icon('mirror'), name: a ? `${a.name} · ghế #${k + 1}` : `Bác sĩ cộng sự · ghế #${k + 1}`, desc: a ? (a.skill >= 2 ? 'Làm được: lấy cao răng, trám, điều trị tủy, nhổ răng.' : 'Làm được: lấy cao răng, trám răng. Đào tạo thêm để làm nội nha, nhổ răng.') + ` Lương ${moneyShort(ASSOC.wage)}/ngày.` : `Tự điều trị các ca đơn giản ở ghế #${k + 1}. Phí tuyển ${moneyShort(ASSOC.hire)}, lương ${moneyShort(ASSOC.wage)}/ngày.`, foot: !has ? '<span class="tag lock">Cần mua ghế này</span>' : a ? (a.skill < 2 ? priceBtn(`data-train="${k}"`, ASSOC.train, 'Đào tạo') : '<span class="tag ok">Đã đào tạo</span>') + ` <button class="btn small ghost" data-fire="${k}">Cho nghỉ</button>` : priceBtn(`data-hire="${k}"`, ASSOC.hire, 'Thuê') }); }).join('');
  }
  if (tab === 'decor') body = Object.entries(DECOR).map(([k, d]) => card({ icon: k === 'plant' ? spriteIcon('plant_a', 0.7) : k === 'tv' ? icon('tv') : k === 'tank' ? spriteIcon('tank', 0.6) : k === 'sofa' ? spriteIcon('sofa', 0.6) : spriteIcon('ac', 0.6), name: d.name + (d.max > 1 ? ` (${G.decor[k]}/${d.max})` : ''), desc: d.desc, foot: G.decor[k] >= d.max ? '<span class="tag ok">Đã có</span>' : G.level < d.lv ? `<span class="tag lock">Cần cấp ${d.lv}</span>` : priceBtn(`data-dec="${k}"`, d.price) })).join('');
  showModal(`<div class="panel-h">Cửa hàng</div><div class="panel-b">${tabs('shopTabs', [['equip', 'Thiết bị'], ['chairs', 'Ghế & nâng cấp'], ['staff', 'Nhân sự'], ['decor', 'Trang trí']], tab)}<p class="muted">Số dư: <b>${money(G.money)}</b>${G.loan ? ` · Đang nợ: <b class="neg">${money(G.loan)}</b>` : ''}</p><div class="grid-cards">${body}</div></div>`, true, true);
  wireTabs('shopTabs', (k) => openShop(k));
  document.querySelectorAll('[data-eq]').forEach((b) => b.onclick = () => { const k = b.dataset.eq; if (pay(EQUIP[k].price, 'Mua ' + EQUIP[k].name, 'equip')) { G.equip[k] = true; spawnTruck(); after(`Đã mua ${EQUIP[k].name}!`, tab); } });
  document.querySelectorAll('[data-ch]').forEach((b) => b.onclick = () => { const k = +b.dataset.ch; if (pay(CHAIR_SLOTS[k].price, `Mua ghế #${k + 1}`, 'equip')) { G.chairs = k + 1; G.chairLv[k] = 1; spawnTruck(); after(`Đã mua ghế #${k + 1}!`, tab); } });
  document.querySelectorAll('[data-up]').forEach((b) => b.onclick = () => { const k = +b.dataset.up; if (pay(CHAIR_UP_PRICE, `Nâng cấp ghế #${k + 1}`, 'equip')) { G.chairLv[k] = 2; after('Đã nâng cấp ghế!', tab); } });
  document.querySelectorAll('[data-hire]').forEach((b) => b.onclick = () => { const k = +b.dataset.hire; if (pay(ASSOC.hire, 'Tuyển bác sĩ cộng sự', 'staff')) { G.assoc[k] = { name: ASSOC.names[k], skill: 1 }; after(`${ASSOC.names[k]} đã nhận việc ở ghế #${k + 1}.`, tab); } });
  document.querySelectorAll('[data-train]').forEach((b) => b.onclick = () => { const k = +b.dataset.train; if (pay(ASSOC.train, 'Đào tạo bác sĩ cộng sự', 'staff')) { G.assoc[k].skill = 2; after('Đào tạo xong: làm được nội nha và nhổ răng.', tab); } });
  document.querySelectorAll('[data-fire]').forEach((b) => b.onclick = () => { const k = +b.dataset.fire; if (b.dataset.sure) { G.assoc[k] = null; after('Đã cho nghỉ việc.', tab); } else { b.dataset.sure = 1; b.textContent = 'Bấm lần nữa'; } });
  document.querySelectorAll('[data-dec]').forEach((b) => b.onclick = () => { const k = b.dataset.dec; if (pay(DECOR[k].price, 'Mua ' + DECOR[k].name, 'decor')) { G.decor[k]++; W.patients.forEach((p) => { const m = maxPatience(); p.patience += m - p.maxPat; p.maxPat = m; }); after(`Đã mua ${DECOR[k].name}!`, tab); } });
  function after(msg, t) { toast(msg, 'good'); updateHUD(); saveGame(); questCheck(); worldDirty(); openShop(t); }
}

/* ---------- stock ---------- */
function buySupply(k, silent) {
  const s = SUPPLIES[k]; if (G.money < s.price) { Sound.bad(); toast(`Không đủ tiền nhập ${s.name}.`, 'bad'); return false; }
  addMoney(-s.price, `Nhập ${s.name}`, 'supply'); G.stock[k] = (G.stock[k] || 0) + s.pack; G.stats.orders++; Sound.coin();
  if (!W.truck) spawnTruck(); if (!silent) toast(`Đã nhập ${s.pack} ${s.unit} ${s.name}.`, 'good');
  updateHUD(); saveGame(); questCheck(); worldDirty(); if (G.tut === 12) setTut(13); return true;
}
function openStock() {
  Sound.tap(); if (G.tut === 12) setTut(13);
  const rows = Object.entries(SUPPLIES).map(([k, s]) => { const n = G.stock[k] || 0; return `<tr class="${n <= 2 ? 'low' : ''}"><td class="ic">${icon(SUP_ICON[k])}</td><th>${esc(s.name)}<small>Gói ${s.pack} ${s.unit} · ${moneyShort(unitCost(k))}/${s.unit}</small></th><td class="num">${n} ${s.unit}</td><td>${priceBtn(`data-buy="${k}"`, s.price, 'Nhập')}</td></tr>`; }).join('');
  showModal(`<div class="panel-h">Kho vật tư</div><div class="panel-b"><p class="muted">Vật tư được trừ khi bắt đầu điều trị; giá vốn mỗi ca hiện trên bảng kết quả. Số dư: <b>${money(G.money)}</b></p><div class="row left"><button class="btn blue small" id="buyBasic">Nhập đủ vật tư cơ bản</button></div><div class="tbl-wrap"><table class="stock">${rows}</table></div></div>`, true, true);
  document.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => { if (buySupply(b.dataset.buy)) openStock(); });
  $('buyBasic').onclick = () => { let n = 0; for (const k of ['gloves', 'lido', 'etch', 'bond', 'comp', 'bur', 'paste', 'chx', 'gauze']) if ((G.stock[k] || 0) < 5 && buySupply(k, true)) n++; toast(n ? `Đã nhập ${n} loại vật tư.` : 'Vật tư cơ bản vẫn còn đủ.', n ? 'good' : ''); openStock(); };
}

/* ---------- bank ---------- */
const creditLimit = () => BANK.perLevel * G.level;
function borrow(amount) { const room = creditLimit() - G.loan; amount = Math.min(amount, room); if (amount <= 0) { toast('Đã hết hạn mức vay. Lên cấp để tăng hạn mức.', 'bad'); Sound.bad(); return; } G.loan += amount; addMoney(amount, 'Vay ngân hàng', 'loan'); Sound.coin(); toast(`Đã vay ${money(amount)}. Lãi ${Math.round(BANK.rate * 1000) / 10}%/ngày, tính cuối ngày.`, 'good'); updateHUD(); saveGame(); }
function repay(amount) { amount = Math.min(amount, G.loan, Math.max(0, G.money)); if (amount <= 0) { toast(G.loan ? 'Không đủ tiền để trả nợ.' : 'Bạn không có khoản nợ nào.', 'bad'); return; } G.loan -= amount; addMoney(-amount, 'Trả nợ ngân hàng', 'loan'); Sound.coin(); toast(`Đã trả ${money(amount)}.`, 'good'); updateHUD(); saveGame(); }
function bankBody() {
  const lim = creditLimit(), room = Math.max(0, lim - G.loan), interest = Math.round(G.loan * BANK.rate);
  return `<div class="stats"><div class="stat"><b>${moneyShort(G.money)}</b><small>Số dư</small></div><div class="stat"><b class="${G.loan ? 'neg' : ''}">${moneyShort(G.loan)}</b><small>Dư nợ</small></div><div class="stat"><b>${moneyShort(room)}</b><small>Còn được vay (hạn mức ${moneyShort(lim)})</small></div><div class="stat"><b>${moneyShort(interest)}</b><small>Lãi phải trả mỗi ngày</small></div></div>
    <p class="muted">Lãi vay <b>${Math.round(BANK.rate * 1000) / 10}%/ngày</b> trên dư nợ, trừ vào cuối ngày. Nếu số dư bị âm, ngân hàng tính thêm lãi thấu chi <b>${Math.round(BANK.overdraft * 100)}%/ngày</b>. Hạn mức vay tăng theo cấp phòng khám.</p>
    <div class="row left">${room <= 0 ? '<button class="btn small" disabled>Đã hết hạn mức</button>' : `<button class="btn small" data-borrow="${Math.min(5e6, room)}">Vay ${moneyShort(Math.min(5e6, room))}</button>${room > 5e6 ? `<button class="btn small" data-borrow="${room}">Vay tối đa ${moneyShort(room)}</button>` : ''}`}<button class="btn small blue" data-repay="5000000" ${!G.loan ? 'disabled' : ''}>Trả ${moneyShort(Math.min(5e6, G.loan || 5e6))}</button><button class="btn small blue" data-repay="all" ${!G.loan ? 'disabled' : ''}>Trả hết</button></div>`;
}

/* ---------- records ---------- */
function openRecords(tab = 'log') {
  Sound.tap(); let body = '';
  if (tab === 'log') body = G.log.length ? `<div class="tbl-wrap"><table class="loglist"><tr><th>Ngày</th><th>Bệnh nhân</th><th>Ca</th><th>Điểm</th><th>Lãi</th><th></th></tr>${G.log.map((l) => `<tr><td>${l.d}</td><td>${esc(l.name)}, ${l.age}t</td><td>${esc(CASES[l.type].label)} · ${l.type === 'calculus' ? 'toàn hàm' : 'R' + l.tooth}${l.by ? `<small> (${esc(l.by)})</small>` : ''}${l.practice ? '<small> (luyện tập)</small>' : ''}${l.min ? `<small>${l.min} phút ghế</small>` : ''}${l.note ? `<small>Ghi chú: ${esc(l.note)}</small>` : ''}</td><td>${l.score}</td><td class="num ${l.profit < 0 ? 'neg' : ''}">${l.profit == null ? '—' : moneyShort(l.profit)}</td><td>${'★'.repeat(l.stars)}<span class="dim">${'★'.repeat(3 - l.stars)}</span></td></tr>`).join('')}</table></div>` : '<p class="muted">Chưa có ca nào. Hãy khám bệnh nhân đầu tiên!</p>';
  if (tab === 'fin') { const t = G.today; body = `<div class="stats"><div class="stat"><b>${moneyShort(t.revenue)}</b><small>Thu hôm nay</small></div><div class="stat"><b>${moneyShort(t.supply)}</b><small>Vật tư, phim</small></div><div class="stat"><b>${moneyShort(t.other)}</b><small>Mua sắm, nhân sự</small></div><div class="stat"><b>${moneyShort(dailyFixed().total)}</b><small>Chi phí cố định cuối ngày</small></div></div><div class="tbl-wrap"><table class="loglist">${G.fin.map((f) => `<tr><td>N${f.d} ${f.t}</td><td>${esc(f.label)}</td><td class="num ${f.amount < 0 ? 'neg' : 'pos'}">${f.amount > 0 ? '+' : ''}${money(f.amount)}</td></tr>`).join('') || '<tr><td>Chưa có giao dịch.</td></tr>'}</table></div>`; }
  if (tab === 'bank') body = bankBody();
  if (tab === 'stats') { const s = G.stats, acc = s.treated ? Math.round(s.dxRight / s.treated * 100) : 0; body = `<div class="stats"><div class="stat"><b>${s.treated}</b><small>Ca đã điều trị</small></div><div class="stat"><b>${acc}%</b><small>Chẩn đoán đúng</small></div><div class="stat"><b>${s.perfect}</b><small>Ca 3 sao</small></div><div class="stat"><b>${G.rep.toFixed(1)} ★</b><small>Uy tín</small></div><div class="stat"><b>${s.compl || 0}</b><small>Biến chứng</small></div><div class="stat"><b>${s.referred}</b><small>Chuyển tuyến</small></div><div class="stat"><b>${G.day}</b><small>Ngày làm việc</small></div></div>${Object.entries(CASES).map(([k, c]) => `<div class="kvrow"><span>${esc(c.label)}</span><b>${s.byType[k] || 0} ca</b></div>`).join('')}`; }
  if (tab === 'prac') body = `<p class="muted">Luyện tập từng ca bất kỳ lúc nào: không cần thiết bị, không tốn vật tư và thời gian phòng khám, chỉ nhận một nửa kinh nghiệm.</p><div class="grid-cards">${Object.entries(CASES).map(([k, c]) => card({ icon: icon({ caries: 'hs', calculus: 'scaler', pulpitis: 'niti', perio: 'forceps', wisdom: 'surgdrill' }[k]), name: c.label, desc: c.dx[0] + ' → ' + c.plan[0], foot: `<button class="btn blue small" data-prac="${k}">Luyện tập</button>` })).join('')}</div>`;
  showModal(`<div class="panel-h">Hồ sơ phòng khám</div><div class="panel-b">${tabs('recTabs', [['log', 'Sổ khám bệnh'], ['fin', 'Thu chi'], ['bank', 'Ngân hàng'], ['stats', 'Thống kê'], ['prac', 'Luyện tập']], tab)}${body}</div>`, true, true);
  wireTabs('recTabs', (k) => openRecords(k));
  document.querySelectorAll('[data-prac]').forEach((b) => b.onclick = () => { hideModal(); const p = makePatient(b.dataset.prac); p.teeth = makeMouth(p.type, p.target); openTreatment(p, true); });
  document.querySelectorAll('[data-borrow]').forEach((b) => b.onclick = () => { borrow(+b.dataset.borrow); openRecords('bank'); });
  document.querySelectorAll('[data-repay]').forEach((b) => b.onclick = () => { repay(b.dataset.repay === 'all' ? G.loan : +b.dataset.repay); openRecords('bank'); });
}

/* ---------- quests ---------- */
function questCheck() { let ch = false; for (const q of QUESTS) if (!G.quests[q.id] && q.ok()) { G.quests[q.id] = 'done'; ch = true; toast(`Hoàn thành nhiệm vụ: ${q.t}`, 'good'); } if (ch) { saveGame(); updateHUD(); } }
function openQuests() {
  Sound.tap(); if (G.tut === 13) setTut(14);
  showModal(`<div class="panel-h">Nhiệm vụ tân thủ</div><div class="panel-b"><p class="muted">Hoàn thành để nhận thưởng nhỏ. Nguồn thu chính vẫn là điều trị tốt và quản lý chi phí.</p><ul class="quests">${QUESTS.map((q) => { const s = G.quests[q.id]; return `<li class="${s || ''}"><span class="qc">${s ? '✓' : ''}</span><div><b>${esc(q.t)}</b><small>Thưởng ${moneyShort(q.money)}${q.xp ? ` · ${q.xp} KN` : ''}</small></div>${s === 'done' ? `<button class="btn small" data-claim="${q.id}">Nhận</button>` : s === 'claimed' ? '<span class="tag ok">Đã nhận</span>' : ''}</li>`; }).join('')}</ul></div>`);
  document.querySelectorAll('[data-claim]').forEach((b) => b.onclick = () => { const q = QUESTS.find((x) => x.id === b.dataset.claim); G.quests[q.id] = 'claimed'; addMoney(q.money, 'Thưởng nhiệm vụ: ' + q.t); Sound.coin(); updateHUD(); saveGame(); if (q.xp) gainXP(q.xp); openQuests(); });
}

/* ---------- day report ---------- */
function equipValue() { let v = 0; for (const k in EQUIP) if (G.equip[k]) v += EQUIP[k].price; for (let k = 1; k < G.chairs; k++) v += CHAIR_SLOTS[k].price; G.chairLv.forEach((l) => { if (l >= 2) v += CHAIR_UP_PRICE; }); return v; }
function dailyFixed() {
  const wages = G.assoc.filter(Boolean).length * ASSOC.wage, upkeep = Math.round(equipValue() * DAILY.upkeep / 1000) * 1000, interest = Math.round(G.loan * BANK.rate), od = G.money < 0 ? Math.round(-G.money * BANK.overdraft) : 0;
  return { wages, upkeep, interest, od, total: DAILY.rent + DAILY.power + DAILY.recep + wages + upkeep + interest + od };
}
function showDayReport() {
  if (!$('treat').hidden || !$('modal').hidden || !$('proto').hidden) { setTimeout(showDayReport, 1500); return; }
  const t = G.today, F = dailyFixed(), net = t.revenue - t.supply - t.other - F.total;
  const row = (k, v) => v ? `<tr><th>${k}</th><td class="num neg">−${money(v)}</td></tr>` : '';
  showModal(`<div class="panel-h">Kết thúc ngày ${G.day}</div><div class="panel-b"><div class="stats"><div class="stat"><b>${t.patients}</b><small>Bệnh nhân đã điều trị</small></div><div class="stat"><b>${t.angry}</b><small>Bỏ về vì chờ lâu</small></div><div class="stat"><b>${G.rep.toFixed(1)} ★</b><small>Uy tín</small></div></div>
    <table class="review fin"><tr><th>Doanh thu</th><td class="num pos">+${money(t.revenue)}</td></tr>${row('Vật tư, phim X-quang', t.supply)}${row('Mua sắm, nhân sự', t.other)}${row('Thuê mặt bằng', DAILY.rent)}${row('Điện nước', DAILY.power)}${row('Lương lễ tân', DAILY.recep)}${row('Lương bác sĩ cộng sự', F.wages)}${row('Bảo trì thiết bị', F.upkeep)}${row('Lãi vay ngân hàng', F.interest)}${row('Lãi thấu chi (số dư âm)', F.od)}<tr class="tot"><th>Lãi / lỗ trong ngày</th><td class="num ${net < 0 ? 'neg' : 'pos'}">${net >= 0 ? '+' : ''}${money(net)}</td></tr></table>
    ${G.money - F.total < 0 ? '<div class="note warnbox">Sau khi trừ chi phí, số dư sẽ âm. Hãy nhận thêm bệnh nhân, cắt giảm chi phí hoặc vay vốn có kế hoạch.</div>' : ''}
    <div class="row"><button class="btn" id="newDay">Bắt đầu ngày ${G.day + 1}</button></div></div>`, false);
  $('newDay').onclick = () => {
    addMoney(-(F.total - F.interest - F.od), `Chi phí cố định ngày ${G.day}`, 'fixed'); if (F.interest + F.od) addMoney(-(F.interest + F.od), `Lãi ngân hàng ngày ${G.day}`, 'interest');
    G.day++; G.time = 480; G.dayDone = false; G.today = { patients: 0, revenue: 0, supply: 0, other: 0, angry: 0 }; W.spawnT = 2;
    hideModal(); updateHUD(); saveGame(); questCheck(); toast(`Ngày ${G.day}: phòng khám mở cửa!`, 'good');
  };
}
