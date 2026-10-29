/* ================== PRESCRIPTION, POST-OP INSTRUCTIONS, SCORING, PAYMENT ================== */
function openRx() {
  if (G.tut >= 4 && G.tut <= 9) setTut(10);
  T.phase = 'rx'; renderPhases(); const c = caseOf(), p = T.p; T.instrOrder = T.instrOrder || shuffle(c.instr.map((x, i) => i));
  const hxNote = T.asked.has('allergy') || T.asked.has('sys') ? `<div class="note"><b>Tiền sử:</b> ${esc(p.hx.sys)} ${esc(p.hx.allergy)} ${esc(p.hx.meds)}</div>` : '<div class="note warnbox">Bạn chưa hỏi tiền sử bệnh và dị ứng thuốc của bệnh nhân.</div>';
  showModal(`<div class="panel-h">Kê đơn & dặn dò</div><div class="panel-b">${tutNote(10)}${hxNote}
    <h4 class="sec">Đơn thuốc</h4><div class="checks meds">${MEDS.map((m) => `<label><input type="checkbox" value="${m.id}"> <b>${esc(m.name)}</b><small>${esc(m.desc)}</small></label>`).join('')}</div>
    <h4 class="sec">Dặn dò bệnh nhân <small class="muted">(chọn tất cả ý đúng)</small></h4><div class="checks instr">${T.instrOrder.map((i) => `<label><input type="checkbox" value="${i}"> ${esc(c.instr[i][0])}</label>`).join('')}</div>
    <div class="row"><button class="btn" id="rxDone">Hoàn tất ca điều trị</button></div></div>`, false);
  $('rxDone').onclick = () => {
    const meds = new Set([...document.querySelectorAll('.meds input:checked')].map((i) => i.value)), ins = new Set([...document.querySelectorAll('.instr input:checked')].map((i) => +i.value));
    if (!meds.size) { toast('Hãy chọn thuốc, hoặc chọn “Không cần thuốc”.', 'bad'); return; }
    finishCase(evalRx(meds, ins));
  };
}
function evalRx(meds, ins) {
  const c = caseOf(), f = T.p.hx.f, notes = []; let rx = 5;
  const chosen = [...meds].filter((x) => x !== 'none'), cls = (id) => (MEDS.find((m) => m.id === id) || {}).cls;
  if (c.meds.need.includes('analgesic') && !chosen.some((id) => cls(id) === 'analgesic')) { rx -= 2; notes.push('Thiếu thuốc giảm đau.'); }
  chosen.forEach((id) => { if (c.meds.no.includes(id)) { rx -= 2; notes.push(`${MEDS.find((m) => m.id === id).name}: không có chỉ định trong ca này.`); } });
  if (f.pen && chosen.includes('amox')) { rx -= 4; notes.push('Bệnh nhân dị ứng Penicillin: không được kê Amoxicillin!'); }
  if ((f.asthma || f.ulcer || f.preg || f.antiplt) && chosen.includes('ibu')) { rx -= 3; notes.push('Ibuprofen (NSAID) cần tránh ở bệnh nhân này; dùng Paracetamol.'); }
  if (chosen.includes('metro') && !chosen.some((id) => id === 'amox' || id === 'clinda')) notes.push('Metronidazole thường phối hợp với kháng sinh chính, ít khi dùng đơn độc.');
  if (meds.has('none') && chosen.length) notes.push('Vừa chọn “Không cần thuốc” vừa kê thuốc.');
  const right = c.instr.map((x, i) => (x[1] ? i : -1)).filter((i) => i >= 0), picked = [...ins];
  const good = picked.filter((i) => c.instr[i][1]).length, bad = picked.filter((i) => !c.instr[i][1]).length;
  const instr = clamp(5 * (good - bad) / right.length, 0, 5);
  c.instr.forEach((x, i) => { if (!x[1] && ins.has(i)) notes.push(`Dặn sai: “${x[0]}”.`); if (x[1] && !ins.has(i)) notes.push(`Thiếu dặn: “${x[0]}”.`); });
  return { rx: Math.max(0, rx), instr, notes, why: c.meds.why };
}
function finishCase(rxEval) {
  const p = T.p, c = caseOf(), practice = T.practice;
  chairAdd('rx'); T.chairMin += TX_MIN[c.treat] || 20;
  const hx = hxEval(), ex = examEval(), re = T.recEval || { recScore: 0, precScore: 0, rows: [], plOK: true };
  const tech = Math.max(0, Math.round(30 - Math.min(T.pen.wrong * 3, 12) - Math.min(T.pen.over * 0.5, 10) - Math.min(T.pen.apex * 5, 15) - (T.pen.neighbor > 0.4 ? 5 : 0)));
  const parts = [['Hỏi bệnh', hx.score, 15], ['Khám & cận lâm sàng', ex.score, 15], ['Bệnh án & chẩn đoán', re.recScore, 20], ['Gây tê & lưu ý', re.precScore, 10], ['Thao tác điều trị', tech, 30], ['Kê đơn', Math.round(rxEval.rx), 5], ['Dặn dò', Math.round(rxEval.instr), 5]];
  const total = parts.reduce((s, x) => s + x[1], 0), stars = total >= 85 ? 3 : total >= 65 ? 2 : 1;
  const notes = [...hx.notes, ...ex.notes];
  re.rows.filter((r) => r[0] !== true).forEach((r) => notes.push(`${r[1]}: ${r[2]}`));
  if (T.pen.wrong) notes.push(`Chọn sai dụng cụ ${T.pen.wrong} lần.`); if (T.pen.over) notes.push(`Mài lố vào mô răng lành ${T.pen.over} ô.`); if (T.pen.apex) notes.push(`Dụng cụ/vật liệu vượt quá chóp ${T.pen.apex} lần.`); if (T.pen.neighbor > 0.4) notes.push('Khoan chạm vào răng bên cạnh.');
  notes.push(...rxEval.notes);
  /* payment depends on satisfaction and complications */
  const base = c.fee + EXAM_FEE, adj = []; let factor = 1, compl = 0;
  if (stars === 1) { factor -= 0.2; adj.push(['Bệnh nhân chưa hài lòng, xin giảm giá', -0.2]); }
  if (T.pen.apex) { factor -= 0.15; compl++; adj.push(['Biến chứng: đau sau điều trị do vượt chóp, phải tái khám miễn phí', -0.15]); }
  if (T.pen.neighbor > 0.4) { factor -= 0.15; compl++; adj.push(['Biến chứng: tổn thương răng 7 khi mở xương', -0.15]); }
  if (T.pen.over > 10) { factor -= 0.1; adj.push(['Mài lố nhiều mô răng lành', -0.1]); }
  if (re.plOK === false) { factor -= 0.1; adj.push(['Kế hoạch ghi trong bệnh án không khớp điều trị, bệnh nhân băn khoăn', -0.1]); }
  factor = Math.max(0.4, factor);
  const fee = Math.round(base * factor / 1000) * 1000;
  const supplyCost = Math.round(Object.entries(T.used || {}).reduce((s, [k, n]) => s + unitCost(k) * n, 0));
  const profit = fee - supplyCost - T.filmCost, chairMin = T.chairMin;
  const xp = Math.round(c.xp * (0.6 + 0.2 * stars) * (practice ? 0.5 : 1));
  T.phase = 'done'; renderPhases(); Sound.good();
  G.stats.treated++; G.stats.byType[p.type] = (G.stats.byType[p.type] || 0) + 1; if (re.dxOK) G.stats.dxRight++; if (stars === 3) G.stats.perfect++; if (ex.chartOK) G.stats.chartRight++; G.stats.wasteQ += T.waste; G.stats.compl += compl;
  if (['sys', 'allergy', 'meds'].every((q) => T.asked.has(q))) G.stats.fullHx++;
  if (!practice) { G.today.patients++; G.rep = clamp(G.rep + (stars - 2) * 0.12 + 0.04 + (G.decor.ac ? 0.02 : 0) - compl * 0.08, 0, 5); G.newbie++; }
  G.log.unshift({ d: G.day, name: p.name, age: p.age, type: p.type, tooth: p.target, stars, score: total, practice, note: T.rec ? T.rec.note : '', profit: practice ? null : profit, min: Math.round(chairMin) }); if (G.log.length > 40) G.log.pop();
  const STAR = (on) => `<svg viewBox="0 0 24 24" class="${on ? '' : 'off'}"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 9.3l7-.8z" fill="#ffcb3d" stroke="#c98500" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  const moneyTbl = practice ? '<p class="muted center">Luyện tập: không tính tiền, không tốn vật tư.</p>' : `<table class="review fin"><tr><th>Phí khám + điều trị</th><td class="num">${money(base)}</td></tr>${adj.map(([t, k]) => `<tr><th>${esc(t)}</th><td class="num neg">${Math.round(k * 100)}%</td></tr>`).join('')}<tr><th>Bệnh nhân thanh toán</th><td class="num pos">+${money(fee)}</td></tr><tr><th>Vật tư đã dùng</th><td class="num neg">−${money(supplyCost)}</td></tr>${T.filmCost ? `<tr><th>Phim X-quang (${T.films} phim)</th><td class="num neg">−${money(T.filmCost)}</td></tr>` : ''}<tr class="tot"><th>Lãi ca này</th><td class="num ${profit < 0 ? 'neg' : 'pos'}">${profit >= 0 ? '+' : ''}${money(profit)}</td></tr><tr><th>Thời gian ghế</th><td class="num">${Math.round(chairMin)} phút</td></tr></table>`;
  showModal(`<div class="panel-h">${stars === 3 ? 'Xuất sắc!' : stars === 2 ? 'Hoàn thành tốt' : 'Cần cố gắng thêm'}</div><div class="panel-b">
    <p class="muted center">${esc(p.name)} · ${esc(c.label)} · răng ${p.type === 'calculus' ? 'toàn hàm' : p.target}</p>
    <div class="stars">${[1, 2, 3].map((k) => STAR(k <= stars)).join('')}</div>
    <div class="reward">${practice ? '' : `<span><b class="ico-coin">đ</b>+${moneyShort(fee)}</span>`}<span><b class="ico-coin xp">KN</b>+${xp}</span></div>
    <table class="score">${parts.map(([k, v, m]) => `<tr><th>${k}</th><td><i style="width:${Math.round(v / m * 100)}%"></i></td><td>${v}/${m}</td></tr>`).join('')}<tr class="tot"><th>Tổng điểm</th><td></td><td>${total}/100</td></tr></table>
    <h4 class="sec">Thu chi ca bệnh</h4>${moneyTbl}
    ${notes.length ? `<details ${stars < 3 ? 'open' : ''}><summary>Nhận xét chi tiết (${notes.length})</summary><ul class="notes">${notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></details>` : '<p class="center"><b>Không mắc lỗi nào. Thao tác rất chuẩn!</b></p>'}
    <div class="note"><b>Kê đơn:</b> ${esc(rxEval.why)} <button class="linkbtn" id="resProto">Ôn lại phác đồ →</button></div>
    <div class="row"><button class="btn" id="btnDone">${practice ? 'Xong' : 'Tiễn bệnh nhân'}</button></div></div>`, false);
  const done = () => {
    Sound.tap(); hideModal(); closeTreatment();
    if (!practice && p.chair) { const ch = p.chair; ch.coin = { amount: fee, label: `${p.name}: ${c.label}` }; leave(p, stars >= 2 ? 'happy' : 'calm'); const s = iso(ch.cI, ch.cJ); W.floats.push({ x: s.x, y: s.y - 150, text: `+${xp} KN`, color: '#b8f07a', t: 0 }); advanceClinic(chairMin); if (G.tut >= 4 && G.tut <= 10) setTut(11); }
    else if (practice) toast(`Luyện tập xong: +${xp} kinh nghiệm`, 'good');
    updateHUD(); saveGame(); gainXP(xp); questCheck();
  };
  $('btnDone').onclick = done;
  $('resProto').onclick = () => openProtocols(p.type);
}
