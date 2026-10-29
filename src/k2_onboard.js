/* ================== UI 2: onboarding, tutorial guide, handbook, settings, loop, boot ================== */
function showWelcome() {
  showModal(`<div class="panel-h">Mô Phỏng Nha Khoa</div><div class="panel-b center"><div class="hero-ic">${icon('mirror')}</div>
    <p class="lead">Bạn vừa tốt nghiệp bác sĩ Răng Hàm Mặt và mở phòng khám đầu tiên với số vốn nhỏ.</p>
    <p>Đón bệnh nhân, hỏi bệnh, khám, lập bệnh án, điều trị đúng quy trình, kê đơn an toàn. Mỗi ca tốn vật tư và thời gian ghế; hãy làm chuẩn để bệnh nhân hài lòng, rồi tích lũy để mua thiết bị và mở rộng phòng khám.</p>
    <div class="row"><button class="btn" id="wStart">Bắt đầu</button></div></div>`, false);
  $('wStart').onclick = () => { Sound.init(); Sound.tap(); showProfileForm(true); };
}
function showProfileForm(first) {
  const P = G.profile, schools = ['Trường ĐH Y Hà Nội', 'Trường ĐH Y Dược TP.HCM', 'Trường ĐH Y Dược Huế', 'Trường ĐH Y Dược Hải Phòng', 'Trường ĐH Y Dược Cần Thơ', 'Khác'];
  showModal(`<div class="panel-h">Hồ sơ bác sĩ</div><div class="panel-b"><form id="pf" class="form" novalidate>
    <label>Họ và tên bác sĩ <input id="pfName" maxlength="28" placeholder="Ví dụ: Nguyễn Minh Anh" value="${esc(P.name.replace(/^BS\.\s*/, ''))}" autocomplete="off"></label>
    <div class="radios"><span>Giới tính</span><label><input type="radio" name="pfG" value="m" ${P.g !== 'f' ? 'checked' : ''}> Nam</label><label><input type="radio" name="pfG" value="f" ${P.g === 'f' ? 'checked' : ''}> Nữ</label></div>
    <label>Tên phòng khám <input id="pfClinic" maxlength="26" value="${esc(P.clinic || 'Nha Khoa Nụ Cười')}" autocomplete="off"></label>
    <label>Nơi đào tạo <select id="pfSchool">${schools.map((s) => `<option ${P.school === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
    <p class="muted">Tên của bạn sẽ in trên bằng tốt nghiệp treo tường, tên phòng khám in trên biển hiệu.</p>
    <div class="row"><button class="btn" type="submit">${first ? 'Mở phòng khám' : 'Lưu hồ sơ'}</button></div></form></div>`, !first);
  $('pfName').focus();
  $('pf').onsubmit = (e) => {
    e.preventDefault(); const name = $('pfName').value.trim(); if (!name) { toast('Hãy nhập họ tên bác sĩ.', 'bad'); $('pfName').focus(); return; }
    P.name = 'BS. ' + name.replace(/^(BS\.?|Bác sĩ)\s*/i, ''); P.g = document.querySelector('input[name="pfG"]:checked').value; P.clinic = $('pfClinic').value.trim() || 'Nha Khoa Nụ Cười'; P.school = $('pfSchool').value; P.set = true;
    saveGame(); updateHUD(); worldDirty(); Sound.good(); if (first) showMentor(0); else hideModal();
  };
}
const MENTOR = [
  ['Vòng chơi', 'Phòng khám mở cửa 8:00–17:00. Bệnh nhân làm thủ tục ở quầy lễ tân rồi ngồi chờ. Bạn mời bệnh nhân lên ghế, khám và điều trị, rồi chạm vào túi tiền trên ghế để thu phí. Mỗi ca tốn thời gian ghế: khám càng lan man, càng ít bệnh nhân được phục vụ.'],
  ['Chuẩn y khoa', 'Mỗi ca gồm: hỏi bệnh (có giới hạn lượt hỏi) → khám bằng dụng cụ, ghi sơ đồ răng, chụp phim khi có chỉ định → lập bệnh án → điều trị đúng quy trình → kê đơn và dặn dò. Điểm của ca chấm theo cả 7 phần.'],
  ['Tiền và quản lý', 'Vốn ban đầu chỉ 5 triệu. Bệnh nhân trả nhiều hay ít tùy mức hài lòng; biến chứng làm giảm phí và uy tín. Cuối ngày trừ tiền mặt bằng, điện nước, lương, bảo trì và lãi vay. Có thể vay ngân hàng nhưng phải trả lãi mỗi ngày.'],
  ['Học tập', 'Nút “Phác đồ” có phác đồ điều trị từng bệnh, hình minh họa và bài tự kiểm tra. Bảng hướng dẫn tân thủ có thể thu gọn hoặc tắt bằng nút ở góc bảng.'],
];
function showMentor(k) {
  const [t, x] = MENTOR[k];
  showModal(`<div class="panel-h">${t}</div><div class="panel-b"><div class="mentor"><canvas id="mentorFace" width="140" height="140"></canvas><div class="bubble-txt"><b>PGS. Lan</b> · người hướng dẫn<p>${esc(x)}</p></div></div><div class="dots">${MENTOR.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</div><div class="row"><button class="btn" id="mNext">${k < MENTOR.length - 1 ? 'Tiếp' : 'Vào việc!'}</button></div></div>`, false);
  const c = $('mentorFace').getContext('2d'); drawChar(c, Object.assign({}, STAFF.doc_f, { id: 'doc_f' }), 70, 190, { scale: 1.9, mood: 'happy', noShadow: true });
  $('mNext').onclick = () => { Sound.tap(); if (k < MENTOR.length - 1) showMentor(k + 1); else { hideModal(); setTut(1); } };
}

/* ---------- tutorial guide (collapsible, can be turned off) ---------- */
const TUT_LAST = 13, TUT_TX = new Set([4, 5, 6, 7, 8, 9, 10]);
const TUT = {
  1: () => ['Bệnh nhân đầu tiên', `Chào ${esc(G.profile.name)}! Bệnh nhân đầu tiên đang làm thủ tục ở <b>quầy lễ tân</b>. Đợi một chút để bệnh nhân ra <b>ghế chờ</b>.`],
  2: () => ['Mời vào ghế', '<b>Chạm vào bệnh nhân</b> đang ngồi chờ (có mũi tên vàng) để mời vào ghế nha khoa.'],
  3: () => ['Bắt đầu khám', 'Bệnh nhân đã lên ghế (bong bóng <b>!</b>). <b>Chạm vào bệnh nhân</b> để mở màn khám.'],
  4: () => ['Bước 1 · Hỏi bệnh', 'Bạn có <b>7 lượt hỏi</b> ở khung <b>Bệnh nhân</b> bên phải.<ol><li>Hỏi 3 câu an toàn: <b>bệnh toàn thân, dị ứng thuốc, thuốc đang dùng</b>.</li><li>Dùng lượt còn lại hỏi <b>tính chất cơn đau</b>: đau tự nhiên hay khi có kích thích, kéo dài bao lâu.</li><li>Bấm <b>Bắt đầu khám</b>.</li></ol>'],
  5: () => ['Bước 2 · Soi và dò', '<ol><li>Với <b>Gương</b>, rê trên miệng để phóng to, tìm răng có đốm nâu đen.</li><li>Chọn <b>Thám trâm</b>, <b>giữ và rê</b> trên mặt nhai răng đó: thám trâm <b>mắc</b> là lỗ sâu thật, <b>trượt</b> là rãnh nhiễm màu.</li></ol>'],
  6: () => ['Bước 3 · Thử lạnh', 'Chọn <b>Thử lạnh</b>: thử <b>một răng lành trước</b> làm đối chứng, rồi thử răng nghi ngờ. Xem đồng hồ: ê buốt <b>hết ngay</b> là tủy còn sống khỏe; cơn đau <b>kéo dài</b> sau khi bỏ lạnh gợi ý viêm tủy.'],
  7: () => ['Bước 4 · Ghi sơ đồ răng', 'Chọn <b>Ghi sơ đồ răng</b>, chọn tình trạng (ví dụ <b>Sâu răng</b>) rồi chạm vào răng bệnh. Răng chỉ nhiễm màu thì ghi “Nhiễm màu”. Xong bấm <b>Lập bệnh án</b>.'],
  8: () => ['Bước 5 · Bệnh án', 'Điền từng mục theo những gì đã hỏi và khám được, rồi bấm <b>Ký bệnh án</b>.'],
  9: () => ['Bước 6 · Điều trị', 'Làm lần lượt từng bước trên thanh trên cùng. Chọn đúng dụng cụ ở <b>khay bên dưới</b> (dụng cụ gợi ý nhấp nháy), rồi rê, chạm hoặc giữ trên răng.'],
  10: () => ['Bước 7 · Kê đơn', 'Kê đơn an toàn theo tiền sử (dị ứng, dạ dày, thai kỳ…) và chọn những lời dặn đúng.'],
  11: () => ['Thu phí', 'Xong ca đầu tiên! <b>Chạm vào túi tiền</b> trên ghế để thu phí. Đồng hồ phòng khám đã chạy thêm đúng bằng thời gian ghế của ca vừa rồi.'],
  12: () => ['Kho vật tư', 'Mở <b>Kho</b> ở góc dưới để xem vật tư. Mỗi ca tiêu hao vật tư; hết vật tư thì không điều trị được.'],
  13: () => ['Nhiệm vụ & Phác đồ', 'Mở <b>Nhiệm vụ</b> để nhận thưởng. Nút <b>Phác đồ</b> có phác đồ điều trị từng bệnh và bài tự kiểm tra để học.'],
};
function setTut(n) { if (n <= G.tut) return; G.tut = n; saveGame(); updateGuide(); }
const guideOn = () => G.settings.guide !== false && G.tut >= 1 && G.tut <= TUT_LAST;
function tutNote(n) { if (!guideOn() || G.tut !== n || !TUT[n]) return ''; const [t, x] = TUT[n](); return `<div class="note tutnote"><b>${t}:</b> ${x}</div>`; }
function updateGuide() {
  const n = G.tut, on = guideOn(), inTx = !!T.p, txStep = TUT_TX.has(n);
  const showW = on && !inTx && !txStep, showT = on && inTx && txStep;
  const gEl = $('guide'), cEl = $('tCoach'); gEl.hidden = !showW; cEl.hidden = !showT;
  const el = showW ? gEl : showT ? cEl : null;
  if (el) {
    const [title, text] = TUT[n]();
    el.classList.toggle('min', !!G.guideMin);
    el.innerHTML = G.guideMin ? `<button class="g-open" data-g="open" aria-label="Mở hướng dẫn"><b>?</b> ${title}</button>`
      : `<div class="g-head">${showW ? '<canvas class="doc" width="84" height="84" id="guideFace"></canvas>' : ''}<div class="g-tt"><small>Hướng dẫn tân thủ · ${n}/${TUT_LAST}</small><b>${title}</b></div><button class="g-btn" data-g="min" aria-label="Thu gọn hướng dẫn" title="Thu gọn">–</button><button class="g-btn" data-g="off" aria-label="Tắt hướng dẫn" title="Tắt hướng dẫn">✕</button></div><div class="g-body">${text}</div><div class="g-confirm" hidden>Tắt hướng dẫn tân thủ? Có thể bật lại trong Cài đặt. <button class="btn small red" data-g="offyes">Tắt</button><button class="btn small ghost" data-g="offno">Không</button></div>`;
    el.querySelectorAll('[data-g]').forEach((b) => b.onclick = (e) => {
      e.stopPropagation(); Sound.tap(); const a = b.dataset.g;
      if (a === 'open') { G.guideMin = false; saveGame(); updateGuide(); }
      if (a === 'min') { G.guideMin = true; saveGame(); updateGuide(); }
      if (a === 'off') { el.querySelector('.g-confirm').hidden = false; }
      if (a === 'offno') { el.querySelector('.g-confirm').hidden = true; }
      if (a === 'offyes') { G.settings.guide = false; saveGame(); updateGuide(); toast('Đã tắt hướng dẫn. Bật lại trong Cài đặt.'); }
    });
    const f = $('guideFace'); if (f) { const c = f.getContext('2d'); c.clearRect(0, 0, 84, 84); drawChar(c, STAFF.doc_f, 42, 118, { scale: 1.15, mood: 'happy', noShadow: true }); }
  }
  $('btnStock').classList.toggle('ping', on && n === 12); $('btnQuests').classList.toggle('ping', on && n === 13); $('btnProto').classList.toggle('ping', on && n === 13);
  if (inTx) {
    document.querySelectorAll('.tool.tut').forEach((b) => b.classList.remove('tut'));
    const hl = on ? { 5: [T.tool === 'explorer' ? null : T.tool === 'mirror' ? 'explorer' : 'mirror'], 6: ['cold'], 7: ['chart'] }[n] : null;
    if (hl && T.phase === 'exam') hl.forEach((id) => { const b = id && document.querySelector(`.tool[data-id="${id}"]`); if (b) b.classList.add('tut'); });
    const q = $('qbox'); if (q) q.classList.toggle('tut', on && n === 4);
    $('tFootBtn').classList.toggle('tut', on && ((n === 4 && T.asked.size >= 4) || (n === 7 && Object.keys(T.chart || {}).length > 0)));
  }
}
function tutArrow() {
  if (T.p || !guideOn()) return null;
  if (G.tut === 2) { const p = W.patients.find((q) => q.state === 'waiting'); if (p) { const s = iso(p.i, p.j); return { x: s.x, y: s.y - 104 }; } }
  if (G.tut === 3) { const p = W.patients.find((q) => q.state === 'ready'); if (p) { const s = iso(p.i, p.j); return { x: s.x, y: s.y - 112 }; } }
  if (G.tut === 11) { const c = CHAIRS.find((q) => q.coin); if (c) { const s = iso(c.cI, c.cJ); return { x: s.x, y: s.y - 146 }; } }
  return null;
}

/* ---------- handbook ---------- */
function openBook(tab = 'play') {
  Sound.tap(); let b = '';
  if (tab === 'play') b = `<h4 class="sec">Một ngày làm việc</h4><ol class="book"><li>Phòng khám mở 8:00–17:00. Đồng hồ dừng khi bạn mở bảng hoặc đang khám, nhưng <b>mỗi ca tính thời gian ghế</b> (hỏi, khám, chụp phim, điều trị). Khi bạn quay lại, đồng hồ chạy bù và bệnh nhân đang chờ sẽ sốt ruột hơn.</li><li>Bệnh nhân làm thủ tục ở quầy lễ tân rồi ngồi chờ. Vòng màu quanh bong bóng là độ kiên nhẫn; hết kiên nhẫn bệnh nhân bỏ về và uy tín giảm.</li><li>Chạm bệnh nhân đang chờ để mời lên ghế trống, chạm bệnh nhân trên ghế để khám.</li><li>Xong ca, chạm túi tiền trên ghế để thu phí. Cuối ngày có báo cáo lãi lỗ và trừ chi phí cố định.</li></ol>
    <h4 class="sec">Điều khiển</h4><ul class="book"><li>Kéo để di chuyển (thả tay khi đang kéo để lướt), cuộn chuột hoặc chụm hai ngón để phóng to.</li><li>Màn khám: nút Toàn hàm / Hàm trên / Hàm dưới để phóng to; gương nha khoa có kính phóng đại.</li><li>Thám trâm: giữ và rê trên mặt răng (không phải chạm một lần).</li><li>Khi điều trị: chọn dụng cụ ở khay rồi rê, chạm, giữ hoặc kéo theo hướng dẫn trên thanh trên cùng.</li></ul>
    <h4 class="sec">Cách chấm điểm mỗi ca (100 điểm)</h4><table class="review"><tr><th>Hỏi bệnh</th><td>15</td><td>Câu hỏi an toàn bắt buộc (7) + câu hỏi giúp chẩn đoán (8); trừ điểm câu hỏi lan man.</td></tr><tr><th>Khám & cận lâm sàng</th><td>15</td><td>Test cần thiết trên răng nguyên nhân (6), răng đối chứng khi thử lạnh (1), sơ đồ răng (5), chỉ định phim hợp lý (3).</td></tr><tr><th>Bệnh án & chẩn đoán</th><td>20</td><td>Lý do khám, tóm tắt bệnh sử, răng nguyên nhân, chẩn đoán, kế hoạch.</td></tr><tr><th>Gây tê & lưu ý</th><td>10</td><td></td></tr><tr><th>Thao tác điều trị</th><td>30</td><td>Đúng dụng cụ, không mài lố, không vượt chóp.</td></tr><tr><th>Kê đơn</th><td>5</td><td></td></tr><tr><th>Dặn dò</th><td>5</td><td></td></tr></table><p class="muted">85 điểm trở lên: 3 sao. 65–84: 2 sao. 1 sao: bệnh nhân xin giảm 20% phí.</p>`;
  if (tab === 'exam') b = `<ol class="book"><li><b>Hỏi bệnh (giới hạn ${Q_BUDGET} lượt, thêm 1 lượt với phụ nữ 18–45 tuổi):</b> luôn hỏi bệnh toàn thân, dị ứng thuốc, thuốc đang dùng (và thai kỳ). Dùng lượt còn lại cho câu hỏi giúp chẩn đoán dựa trên lý do đến khám.</li><li><b>Soi:</b> gương nha khoa phóng to bề mặt răng. Đốm nâu đen ở rãnh có thể là lỗ sâu hoặc chỉ là nhiễm màu.</li><li><b>Dò bằng thám trâm:</b> giữ và rê dọc rãnh. Mắc, đáy mềm: lỗ sâu. Trượt, cứng: nhiễm màu, không cần trám.</li><li><b>Thử lạnh:</b> thử răng lành đối chứng trước. Ê buốt hết ngay khi bỏ lạnh: tủy bình thường hoặc viêm tủy có hồi phục. Đau kéo dài sau khi bỏ lạnh: viêm tủy không hồi phục. Không cảm giác: nghi tủy hoại tử.</li><li><b>Đo túi, gõ, lung lay</b> theo triệu chứng; đo huyết áp với bệnh nhân tim mạch.</li><li><b>Phim:</b> chỉ chụp khi có chỉ định (mỗi phim tốn chi phí, thêm liều tia). Răng khôn nên chụp Panorama. Phụ nữ có thai chỉ chụp khi cần và phải mặc áo chì.</li><li><b>Ghi sơ đồ răng</b> rồi lập bệnh án.</li></ol>
    <div class="row left"><button class="btn small blue" id="bookProto">Mở thư viện phác đồ</button></div>`;
  if (tab === 'tools') b = `<div class="tool-grid">${Object.entries(TOOLS).map(([k, t]) => `<div class="tg"><div class="tg-ic">${icon(k)}</div><div><b>${esc(t[0])}</b><small>${esc(t[1])}</small></div></div>`).join('')}</div>`;
  if (tab === 'meds') b = `<ul class="book"><li><b>Kháng sinh chỉ dùng khi có chỉ định.</b> Sâu ngà, viêm tủy không hồi phục, viêm lợi không cần kháng sinh; điều trị tại chỗ là chính.</li><li>Dị ứng Penicillin: không dùng Amoxicillin; thay bằng Clindamycin khi cần kháng sinh.</li><li>Tránh NSAID (Ibuprofen) khi viêm loét dạ dày, hen phế quản, có thai, đang dùng Aspirin hoặc thuốc chống đông. Paracetamol là lựa chọn an toàn hơn.</li><li>Bệnh nhân tăng huyết áp, tim mạch: đo huyết áp trước, ưu tiên thuốc tê không co mạch (Mepivacaine 3%) hoặc giới hạn liều co mạch.</li><li>Đang dùng Aspirin: không tự ý ngưng thuốc; cầm máu tại chỗ kỹ (gạc, khâu).</li></ul><div class="tbl-wrap"><table class="review">${MEDS.filter((m) => m.id !== 'none').map((m) => `<tr><th>${esc(m.name)}</th><td>${esc(m.desc)}</td></tr>`).join('')}</table></div>`;
  if (tab === 'manage') b = `<ul class="book"><li><b>Doanh thu:</b> phí khám ${moneyShort(EXAM_FEE)} + phí điều trị. Bệnh nhân chưa hài lòng (1 sao) xin giảm 20%; biến chứng (vượt chóp, chạm răng bên cạnh) bị giảm phí và mất uy tín.</li><li><b>Giá vốn:</b> mỗi ca tiêu hao vật tư (găng, thuốc tê, vật liệu…), phim X-quang ${moneyShort(XRAY_COST)}/phim, Panorama ${moneyShort(PANO_COST)}. Bảng kết quả cho biết lãi thật của từng ca.</li><li><b>Chi phí cố định mỗi ngày:</b> mặt bằng ${moneyShort(DAILY.rent)}, điện nước ${moneyShort(DAILY.power)}, lễ tân ${moneyShort(DAILY.recep)}, cộng sự ${moneyShort(ASSOC.wage)}/người, bảo trì ${DAILY.upkeep * 100}% giá trị thiết bị/ngày.</li><li><b>Ngân hàng:</b> vay tối đa ${moneyShort(BANK.perLevel)} × cấp phòng khám, lãi ${BANK.rate * 100}%/ngày; số dư âm bị tính thêm ${BANK.overdraft * 100}%/ngày.</li><li><b>Thiết bị</b> mở khóa ca bệnh: Bộ nội nha + X-quang (điều trị tủy), Bộ kìm & bẩy (nhổ răng), Bộ phẫu thuật + X-quang (răng khôn), Panorama.</li><li><b>Ghế & cộng sự:</b> mua thêm ghế rồi thuê bác sĩ cộng sự; họ tự điều trị ca lấy cao răng, trám răng (sau đào tạo: cả nội nha và nhổ răng).</li><li><b>Trang trí</b> giúp bệnh nhân chờ lâu hơn; uy tín cao thì bệnh nhân đến đông hơn.</li></ul>`;
  showModal(`<div class="panel-h">Sổ tay hướng dẫn</div><div class="panel-b">${tabs('bookTabs', [['play', 'Cách chơi'], ['exam', 'Quy trình khám'], ['tools', 'Dụng cụ'], ['meds', 'Thuốc'], ['manage', 'Quản lý']], tab)}<div class="book-body">${b}</div></div>`, true, true);
  wireTabs('bookTabs', (k) => openBook(k));
  if ($('bookProto')) $('bookProto').onclick = () => openProtocols();
}

/* ---------- settings ---------- */
function openSettings() {
  Sound.tap(); const gf = G.settings.gfx || 'auto';
  showModal(`<div class="panel-h">Cài đặt</div><div class="panel-b"><div class="kvrow"><span>Âm thanh</span><button class="btn small ${G.settings.sound ? '' : 'ghost'}" id="sSound">${G.settings.sound ? 'Đang bật' : 'Đang tắt'}</button></div>
    <div class="kvrow"><span>Hướng dẫn tân thủ</span><button class="btn small ${G.settings.guide !== false ? '' : 'ghost'}" id="sGuide">${G.settings.guide !== false ? 'Đang bật' : 'Đang tắt'}</button></div>
    <div class="kvrow"><span>Học lại hướng dẫn từ đầu</span><button class="btn small blue" id="sTutReset">Bắt đầu lại</button></div>
    <div class="kvrow"><span>Gợi ý dụng cụ ở mọi ca</span><button class="btn small ${G.settings.hints ? '' : 'ghost'}" id="sHint">${G.settings.hints ? 'Đang bật' : 'Chỉ ca tân thủ'}</button></div>
    <div class="kvrow"><span>Chất lượng đồ họa</span><span class="seg">${[['auto', 'Tự động'], ['high', 'Cao'], ['low', 'Tiết kiệm']].map(([k, l]) => `<button class="btn small ${gf === k ? '' : 'ghost'}" data-gfx="${k}">${l}</button>`).join('')}</span></div>
    <div class="kvrow"><span>Hồ sơ bác sĩ</span><button class="btn small blue" id="sProf">Sửa</button></div>
    <div class="kvrow"><span>Chơi lại từ đầu</span><button class="btn small ghost" id="sReset">Xóa tiến trình</button></div></div>`);
  $('sSound').onclick = () => { G.settings.sound = !G.settings.sound; if (!G.settings.sound) Sound.motorOff(); saveGame(); openSettings(); };
  $('sGuide').onclick = () => { G.settings.guide = G.settings.guide === false; if (G.settings.guide) G.guideMin = false; saveGame(); updateGuide(); openSettings(); };
  $('sTutReset').onclick = () => { G.tut = 1; G.settings.guide = true; G.guideMin = false; saveGame(); hideModal(); updateGuide(); toast('Hướng dẫn tân thủ sẽ chạy lại từ đầu.', 'good'); };
  $('sHint').onclick = () => { G.settings.hints = !G.settings.hints; saveGame(); openSettings(); };
  document.querySelectorAll('[data-gfx]').forEach((b) => b.onclick = () => { setGfx(b.dataset.gfx); openSettings(); });
  $('sProf').onclick = () => showProfileForm(false);
  const r = $('sReset'); r.onclick = () => { if (r.dataset.sure) { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); } else { r.dataset.sure = 1; r.textContent = 'Bấm lần nữa để xóa'; r.classList.add('red'); } };
}

/* ---------- render quality (adaptive resolution) ---------- */
function applyQuality() { resizeWorld(); resizeTreat(); worldDirty(); }
function setGfx(mode) { G.settings.gfx = mode; Q.scale = mode === 'low' ? 0.6 : 1; Q.slow = Q.fast = 0; applyQuality(); saveGame(); }
function qualityTick(ms) {
  if ((G.settings.gfx || 'auto') !== 'auto' || ms > 250 || document.hidden) return;
  Q.ema = lerp(Q.ema, ms, 0.06); Q.evalT += ms; if (Q.evalT < 1500) return; Q.evalT = 0;
  if (Q.ema > 25 && Q.scale > 0.56) { Q.fast = 0; if (++Q.slow >= 2) { Q.scale = Math.max(0.55, Q.scale - 0.15); Q.slow = 0; applyQuality(); } }
  else if (Q.ema < 14 && Q.scale < 1) { Q.slow = 0; if (++Q.fast >= 5) { Q.scale = Math.min(1, Q.scale + 0.15); Q.fast = 0; applyQuality(); } }
  else { Q.slow = 0; Q.fast = 0; }
}

/* ---------- loop + boot ---------- */
function checkRotate() { const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 760; $('rotate').hidden = !(portrait && !G.portraitOK); }
let lastT = performance.now(), hudT = 0;
function frame(now) {
  const ms = now - lastT, dt = Math.min(0.05, ms / 1000); lastT = now;
  try {
    if (!$('treat').hidden && T.p) { updateTreat(dt); drawTreat(); } else tickWorld(dt);
    hudT -= dt; if (hudT <= 0) { hudT = 0.5; updateDayPill(); }
  } catch (err) { console.error(err); }
  qualityTick(ms);
  requestAnimationFrame(frame);
}
async function boot() {
  loadGame(); if (G.settings.gfx === 'low') Q.scale = 0.6;
  await loadAllAssets((f) => { $('loadBar').style.width = Math.round(f * 100) + '%'; });
  $('loading').hidden = true;
  initWorld(); initTreatInput();
  $('btnShop').onclick = () => openShop(); $('btnRecords').onclick = () => openRecords(); $('btnStock').onclick = openStock; $('btnQuests').onclick = openQuests; $('btnBook').onclick = () => openBook(); $('btnSettings').onclick = openSettings; $('btnProto').onclick = () => openProtocols();
  $('tLater').onclick = () => { Sound.tap(); leaveForLater(); }; $('tBook').onclick = () => openProtocols(T.p ? T.p.type : null); $('tDrawerBtn').onclick = () => { Sound.tap(); openDrawer(!$('tDrawer').classList.contains('open')); };
  $('xrayClose').onclick = () => { Sound.tap(); $('xray').hidden = true; };
  $('tHint').onclick = () => { const st = T.phase === 'tx' ? curStep() : null; if (!st) { toast(T.phase === 'exam' ? 'Gợi ý: soi bằng gương, dò răng nghi ngờ bằng thám trâm, làm các test cần thiết, ghi sơ đồ răng rồi lập bệnh án.' : 'Gợi ý: hỏi đủ câu an toàn (bệnh toàn thân, dị ứng, thuốc) và câu hỏi về tính chất cơn đau.'); return; } const el = document.querySelector(`.tool[data-id="${st.tool}"]`); if (el) { el.classList.add('hint'); el.scrollIntoView({ inline: 'center', block: 'nearest' }); } toast(`Bước này dùng: ${TOOLS[st.tool][0]}`); };
  document.querySelectorAll('.d-tab').forEach((b) => b.onclick = () => { Sound.tap(); openDrawer(true, b.dataset.tab); });
  $('btnPortrait').onclick = () => { G.portraitOK = true; saveGame(); checkRotate(); resizeWorld(); };
  $('modal').addEventListener('pointerdown', (e) => { if (e.target === $('modal') && $('mClose')) hideModal(); });
  window.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!$('proto').hidden) closeProtocols(); else if (!$('modal').hidden && $('mClose')) hideModal(); });
  window.addEventListener('resize', () => { resizeWorld(); resizeTreat(); checkRotate(); });
  initProtocols();
  updateHUD(); checkRotate(); questCheck();
  if (!G.profile.set) showWelcome(); else updateGuide();
  requestAnimationFrame(frame);
}
boot();
