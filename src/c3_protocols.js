/* ================== PROTOCOL LIBRARY: phác đồ điều trị từng bệnh + hình minh họa + bài tự kiểm tra ==================
   Nội dung biên soạn cho mục đích học tập trong game, theo cấu trúc Hướng dẫn chẩn đoán và điều trị một số bệnh
   Răng Hàm Mặt (Bộ Y tế, QĐ 3108/QĐ-BYT, 2015), quy trình kỹ thuật RHM (QĐ 3634/QĐ-BYT, 2025) và các khuyến cáo quốc tế. */
const PROTO_REFS = [
  ['Bộ Y tế (2015). Quyết định 3108/QĐ-BYT: Hướng dẫn chẩn đoán và điều trị một số bệnh về Răng Hàm Mặt.', 'https://luatvietnam.vn/y-te/quyet-dinh-3108-qd-byt-bo-y-te-97081-d1.html'],
  ['Bộ Y tế (2025). Quyết định 3634/QĐ-BYT: Hướng dẫn quy trình kỹ thuật Răng Hàm Mặt, Tập 1.', 'https://luatvietnam.vn/y-te/quyet-dinh-3634-qd-byt-2025-ban-hanh-huong-dan-quy-trinh-ky-thuat-rang-ham-mat-tap-1-419683-d1.html'],
  ['American Association of Endodontists (2009). Consensus Conference Recommended Diagnostic Terminology.', 'https://www.aae.org/specialty/wp-content/uploads/sites/2/2017/07/aaeconsensusconferencerecommendeddiagnosticterminology.pdf'],
  ['Lockhart PB và cs. (2019). Hướng dẫn của ADA về dùng kháng sinh trong đau răng do tủy, vùng quanh chóp và sưng trong miệng. JADA 150(11):906–921.', 'https://pubmed.ncbi.nlm.nih.gov/31668170/'],
];
const SVGW = (b) => `<svg viewBox="0 0 360 170" class="pfig" role="img"><rect width="360" height="170" rx="12" fill="#fffaf0"/>${b}</svg>`;
const TXT = (x, y, t, o = '') => `<text x="${x}" y="${y}" font-family="Nunito,sans-serif" font-size="11" font-weight="800" fill="#4b2a10" ${o}>${t}</text>`;
const PFIG = {
  caries: SVGW(`<path d="M70 40 Q60 20 85 18 Q110 14 120 30 Q130 14 155 18 Q180 20 170 40 Q178 70 165 95 L160 150 Q150 160 140 150 L125 100 L115 100 L100 150 Q90 160 80 150 L75 95 Q62 70 70 40Z" fill="#f3e3c2" stroke="#a99472" stroke-width="2.5"/>
    <path d="M78 42 Q72 26 88 25 Q110 22 120 36 Q130 22 152 25 Q168 26 162 42 Q168 64 158 86 L82 86 Q72 64 78 42Z" fill="#fffdf7" stroke="#e2cfa8" stroke-width="1.5"/>
    <path d="M100 52 Q120 44 140 52 Q146 70 136 82 L104 82 Q94 70 100 52Z" fill="#f2a0a8"/>
    <circle cx="96" cy="30" r="6" fill="#6b4422"/><path d="M128 26 q8 6 4 18 q-6 6 -12 0 q-4 -10 8 -18Z" fill="#4a2c14"/>
    ${TXT(196, 32, 'Sâu men: chỉ ở lớp men')}<path d="M190 29 L104 30" stroke="#6b4422" stroke-width="1.5" stroke-dasharray="3 3"/>
    ${TXT(196, 58, 'Sâu ngà: vào lớp ngà,')}${TXT(196, 72, 'ê buốt, hết ngay')}<path d="M190 55 L136 38" stroke="#4a2c14" stroke-width="1.5" stroke-dasharray="3 3"/>
    ${TXT(196, 100, 'Buồng tủy (tủy răng)')}<path d="M190 97 L132 70" stroke="#c2475b" stroke-width="1.5" stroke-dasharray="3 3"/>
    ${TXT(16, 164, 'Độ sâu lỗ sâu (men → ngà → gần tủy) quyết định triệu chứng', 'font-size="10"')}`),
  pulpitis: SVGW(`${TXT(14, 22, 'Thời gian còn đau sau khi bỏ kích thích lạnh', 'font-size="12"')}
    <path d="M110 34 V138 H348" stroke="#8a5a33" stroke-width="2" fill="none"/>
    ${TXT(14, 58, 'Tủy bình thường')}<rect x="112" y="46" width="14" height="16" rx="4" fill="#78c443"/>${TXT(132, 58, 'thoáng qua, hết ngay')}
    ${TXT(14, 88, 'Có hồi phục')}<rect x="112" y="76" width="34" height="16" rx="4" fill="#e0b72e"/>${TXT(152, 88, 'vài giây, hết khi bỏ kích thích')}
    ${TXT(14, 118, 'Không hồi phục')}<rect x="112" y="106" width="232" height="16" rx="4" fill="#ec5b4b"/>${TXT(120, 118, 'kéo dài, kèm đau tự nhiên, đau đêm', 'fill="#fff"')}
    ${TXT(14, 160, 'Tủy hoại tử: thường không còn cảm giác khi thử tủy', 'font-size="10"')}`),
  apical: SVGW(`<path d="M120 20 Q110 10 140 10 Q170 10 160 24 Q170 60 158 80 L150 140 Q140 150 135 140 L132 90 L128 140 Q122 150 114 140 L110 80 Q100 60 120 20Z" fill="#f3e3c2" stroke="#a99472" stroke-width="2.5"/>
    <path d="M130 34 L131 136" stroke="#7a1a22" stroke-width="5"/>
    <ellipse cx="132" cy="146" rx="22" ry="14" fill="rgba(60,60,60,.35)" stroke="#4b2a10" stroke-dasharray="4 3"/>
    ${TXT(176, 40, 'Tủy hoại tử, nhiễm khuẩn')}<path d="M172 37 L136 60" stroke="#7a1a22" stroke-width="1.5" stroke-dasharray="3 3"/>
    ${TXT(176, 120, 'Vùng thấu quang quanh chóp')}${TXT(176, 134, 'trên phim X-quang')}<path d="M172 124 L152 142" stroke="#4b2a10" stroke-width="1.5" stroke-dasharray="3 3"/>
    ${TXT(16, 166, 'Gõ dọc đau, cảm giác răng trồi; thử tủy thường âm tính', 'font-size="10"')}`),
  calculus: SVGW(`<rect x="0" y="96" width="320" height="74" fill="#efd6b0"/><path d="M0 70 Q80 64 120 76 L200 76 Q240 64 320 70 L320 100 L0 100Z" fill="#e0606f"/>
    <path d="M128 20 Q120 8 160 8 Q200 8 192 20 L190 76 L130 76Z" fill="#f3e3c2" stroke="#a99472" stroke-width="2.5"/><path d="M130 76 L134 150 Q160 160 186 150 L190 76" fill="#e9d6b0" stroke="#a99472" stroke-width="2"/>
    <circle cx="130" cy="72" r="6" fill="#e8d27a" stroke="#a88a2c"/><circle cx="190" cy="72" r="6" fill="#e8d27a" stroke="#a88a2c"/>
    <path d="M200 72 L200 84" stroke="#2b5fd8" stroke-width="3"/>${TXT(206, 84, 'Túi lợi ≤ 3 mm')}
    <circle cx="112" cy="80" r="3" fill="#c3213b"/><circle cx="104" cy="84" r="2.5" fill="#c3213b"/>${TXT(16, 58, 'Lợi đỏ, chảy máu khi thăm khám')}
    ${TXT(16, 122, 'Mào xương còn nguyên, chưa mất bám dính')}${TXT(16, 166, 'Viêm lợi hồi phục hoàn toàn khi loại bỏ mảng bám, cao răng', 'font-size="10"')}`),
  perio: SVGW(`<rect x="0" y="122" width="320" height="48" fill="#efd6b0"/><path d="M0 96 Q80 90 120 104 L200 104 Q240 90 320 96 L320 126 L0 126Z" fill="#d9606f"/>
    <path d="M128 20 Q120 8 160 8 Q200 8 192 20 L190 76 L130 76Z" fill="#f3e3c2" stroke="#a99472" stroke-width="2.5"/><path d="M130 76 L134 150 Q160 160 186 150 L190 76" fill="#e9d6b0" stroke="#a99472" stroke-width="2"/>
    <circle cx="131" cy="90" r="6" fill="#e8d27a" stroke="#a88a2c"/><path d="M200 78 L200 120" stroke="#2b5fd8" stroke-width="3"/>${TXT(206, 104, 'Túi quanh răng ≥ 4 mm')}
    <path d="M120 122 L200 122" stroke="#8a5a33" stroke-width="2" stroke-dasharray="4 3"/>${TXT(206, 140, 'Tiêu xương ổ răng')}
    <path d="M96 40 h-18 M84 34 l-6 6 6 6 M224 40 h18 M236 34 l6 6 -6 6" stroke="#f08a24" stroke-width="2.5" fill="none"/>${TXT(16, 30, 'Lung lay')}
    ${TXT(16, 164, 'Mất bám dính, tiêu xương: cần điều trị và duy trì lâu dài', 'font-size="10"')}`),
  wisdom: SVGW(`<path d="M10 150 Q160 176 310 120 L310 60 Q160 96 10 70Z" fill="#efd6b0" stroke="#c9a77a" stroke-width="2"/>
    <path d="M30 140 Q160 160 300 112" stroke="#d9a400" stroke-width="5" fill="none" stroke-dasharray="1 0"/>${TXT(196, 158, 'Ống thần kinh răng dưới', 'fill="#8a6a00"')}
    <path d="M90 30 Q86 18 112 18 Q138 18 134 30 L132 70 L124 120 L118 72 L112 120 L104 72 L92 70Z" fill="#f3e3c2" stroke="#a99472" stroke-width="2"/>${TXT(98, 14, 'Răng 7')}
    <g transform="translate(190 70) rotate(-45)"><path d="M-22 -14 Q-24 -26 0 -26 Q24 -26 22 -14 L20 18 L12 54 L6 20 L0 54 L-6 20 L-20 18Z" fill="#f3e3c2" stroke="#a99472" stroke-width="2"/></g>${TXT(214, 40, 'Răng 8 lệch gần,')}${TXT(214, 54, 'kẹt dưới cổ răng 7')}
    <path d="M150 52 q8 -10 20 -6" stroke="#ec5b4b" stroke-width="2" fill="none"/>${TXT(16, 28, 'Đánh giá trên phim Panorama')}`),
};
const PROTOCOLS = [
  {
    id: 'caries', title: 'Sâu răng', sub: 'Sâu men, sâu ngà · trám composite', icon: 'hs', game: 'caries',
    sections: [
      ['Định nghĩa & nguyên nhân', '<p>Sâu răng là bệnh nhiễm khuẩn tổ chức cứng của răng: vi khuẩn trong mảng bám lên men đường tạo axit; khi pH mảng bám xuống dưới ngưỡng tới hạn (khoảng 5,5), men răng mất khoáng, lâu dần tạo lỗ sâu.</p><p>Yếu tố nguy cơ: mảng bám, ăn nhiều đường và ăn vặt giữa các bữa, thiếu fluor, nước bọt ít, vệ sinh răng miệng kém.</p>'],
      ['Phân loại', '<ul><li><b>Theo vị trí (Black):</b> loại I hố rãnh; loại II mặt bên răng hàm; loại III mặt bên răng cửa; loại IV mặt bên răng cửa có tổn thương rìa cắn; loại V cổ răng.</li><li><b>Theo mức độ:</b> sâu men (tổn thương chưa tạo lỗ hoặc lỗ nông trong men) và sâu ngà (nông, sâu).</li></ul>'],
      ['Triệu chứng', '<ul><li><b>Cơ năng:</b> sâu men thường chưa có triệu chứng. Sâu ngà: ê buốt khi ăn ngọt, chua, uống nóng lạnh, <b>hết ngay khi bỏ kích thích</b>; không đau tự nhiên.</li><li><b>Thực thể:</b> đốm trắng đục hoặc nâu; lỗ sâu có đáy ngà mềm, <b>thám trâm mắc</b>. Thử lạnh đáp ứng bình thường hoặc ê nhanh hết ngay; gõ không đau.</li><li><b>X-quang:</b> thấu quang trong men, ngà; ước lượng khoảng cách tới buồng tủy. Phim cánh cắn giúp phát hiện sâu mặt bên.</li></ul>'],
      ['Chẩn đoán phân biệt', '<table class="review"><tr><th>Rãnh nhiễm màu</th><td>Đổi màu nâu đen nhưng thám trâm trượt, bề mặt cứng, phim không thấy thấu quang. Không cần trám, theo dõi.</td></tr><tr><th>Thiểu sản, mòn răng</th><td>Bề mặt cứng, nhẵn, không có ngà mềm.</td></tr><tr><th>Viêm tủy</th><td>Đau tự nhiên, đau kéo dài sau kích thích, đau về đêm.</td></tr></table>'],
      ['Điều trị', '<ul><li><b>Nguyên tắc:</b> loại bỏ mô sâu, bảo tồn tối đa mô lành, phục hồi hình thể và chức năng, dự phòng tái phát.</li><li><b>Tổn thương chưa tạo lỗ:</b> tái khoáng bằng fluor tại chỗ, trám bít hố rãnh, hướng dẫn vệ sinh và chế độ ăn.</li><li><b>Đã có lỗ sâu:</b> làm sạch mô sâu, trám composite hoặc GIC. Lỗ sâu sát tủy: cân nhắc che tủy.</li></ul><h5>Quy trình trám composite</h5><ol><li>Kiểm tra khớp cắn, so màu.</li><li>Cô lập răng (đê cao su hoặc cuộn bông, hút nước bọt).</li><li>Mở đường vào, lấy sạch ngà mềm; kiểm tra đáy xoang bằng thám trâm.</li><li>Etching axit phosphoric 37%, rửa sạch, thổi khô nhẹ (không làm khô ngà quá mức).</li><li>Bôi keo dán, chiếu đèn.</li><li>Đắp composite từng lớp không quá 2 mm, chiếu đèn từng lớp.</li><li>Kiểm tra khớp cắn bằng giấy cắn, mài chỉnh, đánh bóng.</li></ol>'],
      ['Thuốc', '<p>Thường không cần thuốc. Sâu ngà với tủy còn sống <b>không có chỉ định kháng sinh</b>.</p>'],
      ['Dặn dò & dự phòng', '<ul><li>Composite đã đông cứng nên có thể ăn nhai ngay.</li><li>Chải răng 2 lần/ngày với kem có fluor, dùng chỉ nha khoa; hạn chế đồ ngọt, nước có đường giữa các bữa.</li><li>Tái khám nếu ê buốt kéo dài hoặc cộm khi cắn; khám định kỳ 6 tháng.</li></ul>'],
    ],
    quiz: [
      { q: 'Rãnh mặt nhai răng 46 màu nâu đen; rê thám trâm thấy trượt, bề mặt cứng; phim không thấy thấu quang. Ghi nhận nào phù hợp?', o: [['Rãnh nhiễm màu, chưa có chỉ định trám', 1], ['Sâu ngà, cần trám ngay', 0], ['Viêm tủy có hồi phục', 0]], why: 'Đổi màu đơn thuần không phải là lỗ sâu. Dấu hiệu quyết định là bề mặt cứng, thám trâm không mắc và phim không có thấu quang.' },
      { q: 'Nồng độ axit phosphoric thường dùng để etching khi trám composite?', o: [['37%', 1], ['10%', 0], ['70%', 0]], why: 'Axit phosphoric 37% tạo vi lưu giữ trên men, ngà để keo dán bám tốt.' },
      { q: 'Mỗi lớp composite đắp vào xoang không nên dày quá bao nhiêu?', o: [['2 mm', 1], ['5 mm', 0], ['Đắp một lần đầy xoang', 0]], why: 'Lớp dày quá 2 mm khó trùng hợp hết và co ngót nhiều, dễ hở bờ, ê buốt sau trám.' },
      { q: 'Bệnh nhân sâu ngà, tủy còn sống, không sưng, không sốt. Có cần kê kháng sinh?', o: [['Không, điều trị tại chỗ là đủ', 1], ['Có, Amoxicillin 7 ngày', 0], ['Có, để phòng viêm tủy', 0]], why: 'Kháng sinh không điều trị được lỗ sâu; dùng không đúng chỉ định gây kháng thuốc và tác dụng phụ.' },
    ],
  },
  {
    id: 'pulpitis', title: 'Viêm tủy răng', sub: 'Có hồi phục, không hồi phục · điều trị tủy', icon: 'niti', game: 'pulpitis',
    sections: [
      ['Nguyên nhân', '<p>Thường gặp nhất là sâu răng tiến triển tới gần tủy. Ngoài ra: chấn thương, mòn răng, sang chấn khớp cắn, thủ thuật mài răng, viêm quanh răng ngược dòng.</p>'],
      ['Phân loại lâm sàng', '<ul><li><b>Viêm tủy có hồi phục:</b> tủy viêm nhẹ, có thể trở lại bình thường khi loại bỏ nguyên nhân.</li><li><b>Viêm tủy không hồi phục:</b> tủy còn sống nhưng không thể lành; có thể có hoặc không có triệu chứng.</li><li><b>Tủy hoại tử:</b> tủy chết, thường không đáp ứng thử tủy.</li></ul>'],
      ['Triệu chứng', '<table class="review"><tr><th>Có hồi phục</th><td>Ê buốt khi có kích thích (lạnh, ngọt), <b>hết nhanh</b> sau khi bỏ kích thích; không đau tự nhiên.</td></tr><tr><th>Không hồi phục</th><td><b>Đau tự nhiên</b> từng cơn, đau tăng về đêm, lan lên tai, thái dương, nửa mặt cùng bên; kích thích làm đau tăng và <b>còn đau kéo dài</b> sau khi bỏ kích thích; bệnh nhân thường khó chỉ đúng răng đau. Lỗ sâu lớn, nhiều ngà mủn, có thể hở tủy; gõ có thể hơi ê.</td></tr><tr><th>Tủy hoại tử</th><td>Thường không đau; không đáp ứng thử tủy; răng có thể đổi màu.</td></tr></table><p><b>X-quang:</b> lỗ sâu sát hoặc thông buồng tủy; vùng quanh chóp bình thường hoặc giãn nhẹ dây chằng.</p>'],
      ['Chẩn đoán phân biệt', '<ul><li><b>Sâu ngà:</b> không đau tự nhiên, ê buốt hết ngay.</li><li><b>Viêm quanh cuống:</b> gõ đau rõ, cảm giác răng trồi cao, thử tủy thường âm tính, phim có thể thấy thấu quang chóp.</li><li><b>Viêm quanh thân răng khôn, đau dây thần kinh V</b> cũng có thể gây đau lan nửa mặt.</li></ul><p><b>Thử lạnh đúng cách:</b> thử một răng lành làm đối chứng trước, rồi mới thử răng nghi ngờ, so sánh cường độ và thời gian đau.</p>'],
      ['Điều trị', '<ul><li><b>Có hồi phục:</b> loại bỏ nguyên nhân (lấy sạch mô sâu), che tủy gián tiếp khi cần, trám kín, theo dõi.</li><li><b>Không hồi phục:</b> lấy tủy toàn bộ, điều trị tủy rồi phục hình (răng hàm thường cần làm chụp).</li></ul><h5>Quy trình điều trị tủy</h5><ol><li>Gây tê (răng hàm dưới: gây tê gai Spix).</li><li>Cô lập bằng đê cao su.</li><li>Mở tủy: lấy hết mô sâu, mở toàn bộ trần buồng tủy.</li><li>Tìm miệng ống tủy (răng hàm lớn dưới thường có 3 ống: 2 ống gần, 1 ống xa).</li><li>Xác định chiều dài làm việc bằng máy định vị chóp, có thể kết hợp phim.</li><li>Sửa soạn, tạo hình ống tủy, bơm rửa NaOCl, kết thúc bằng EDTA.</li><li>Làm khô bằng côn giấy.</li><li>Trám bít bằng gutta-percha và xi măng trám bít, đúng chiều dài làm việc (không thiếu, không quá chóp).</li><li>Trám kín buồng tủy, chụp phim kiểm tra, hẹn phục hình.</li></ol>'],
      ['Thuốc', '<p>Giảm đau: Paracetamol; Ibuprofen nếu không có chống chỉ định. Theo hướng dẫn ADA 2019, <b>không khuyến cáo kháng sinh</b> cho viêm tủy không hồi phục có triệu chứng ở người miễn dịch bình thường; điều trị tại chỗ là chính.</p>'],
      ['Dặn dò', '<ul><li>Tránh nhai mạnh bên răng điều trị cho tới khi phục hình.</li><li>Có thể ê nhẹ vài ngày; uống thuốc giảm đau theo đơn.</li><li>Tái khám làm chụp để tránh vỡ răng.</li></ul>'],
    ],
    quiz: [
      { q: 'Bệnh nhân đau tự nhiên từng cơn, đau về đêm; thử lạnh đau dữ dội và còn đau kéo dài sau khi bỏ lạnh. Chẩn đoán?', o: [['Viêm tủy không hồi phục', 1], ['Viêm tủy có hồi phục', 0], ['Sâu ngà', 0]], why: 'Đau tự nhiên, đau đêm và đau kéo dài sau kích thích là dấu hiệu của viêm tủy không hồi phục.' },
      { q: 'Trước khi thử lạnh răng nghi ngờ, nên làm gì?', o: [['Thử một răng lành làm đối chứng', 1], ['Thử tất cả các răng', 0], ['Gây tê trước', 0]], why: 'Răng đối chứng cho biết đáp ứng bình thường của chính bệnh nhân đó để so sánh.' },
      { q: 'Điều trị phù hợp cho viêm tủy không hồi phục ở răng 36?', o: [['Điều trị tủy, sau đó phục hình', 1], ['Kê kháng sinh rồi hẹn khi hết đau', 0], ['Trám composite ngay', 0]], why: 'Tủy viêm không hồi phục không thể lành; cần lấy tủy và trám bít hệ thống ống tủy.' },
      { q: 'Dung dịch bơm rửa chính để sát khuẩn và hòa tan mô tủy?', o: [['NaOCl (natri hypoclorit)', 1], ['Cồn 70%', 0], ['Nước cất', 0]], why: 'NaOCl vừa sát khuẩn vừa hòa tan mô hữu cơ; EDTA giúp loại bỏ lớp mùn ngà.' },
    ],
  },
  {
    id: 'apical', title: 'Viêm quanh cuống răng', sub: 'Biến chứng của tủy hoại tử · để phân biệt', icon: 'xray', game: null,
    sections: [
      ['Nguyên nhân', '<p>Tủy hoại tử nhiễm khuẩn lan qua lỗ chóp gây viêm vùng quanh chóp; điều trị tủy chưa đạt; chấn thương.</p>'],
      ['Các thể thường gặp', '<table class="review"><tr><th>Viêm quanh cuống có triệu chứng</th><td>Đau khi cắn, gõ dọc đau, cảm giác răng trồi cao; phim có thể chưa thấy tổn thương.</td></tr><tr><th>Áp xe quanh cuống cấp</th><td>Đau nhiều, sưng ngách lợi hoặc sưng mặt, có thể sốt, hạch.</td></tr><tr><th>Viêm quanh cuống mạn</th><td>Ít triệu chứng, có thể có lỗ rò; phim thấy vùng thấu quang quanh chóp.</td></tr></table>'],
      ['Chẩn đoán', '<ul><li>Thử tủy thường âm tính (tủy hoại tử).</li><li>Gõ dọc đau, ấn ngách lợi đau.</li><li>X-quang: dây chằng giãn rộng hoặc vùng thấu quang quanh chóp.</li></ul><p>Phân biệt với viêm tủy (thử tủy còn đáp ứng, đau khi có kích thích nhiệt) và áp xe quanh răng (túi quanh răng sâu, tủy còn sống).</p>'],
      ['Điều trị', '<ul><li>Điều trị tủy: làm sạch, sát khuẩn và trám bít hệ thống ống tủy nhiễm khuẩn.</li><li>Áp xe: dẫn lưu (mở tủy, rạch dẫn lưu khi có ổ mủ).</li><li>Răng không còn giữ được: nhổ răng. Điều trị tủy thất bại có chỉ định: điều trị lại hoặc phẫu thuật cắt chóp.</li></ul>'],
      ['Thuốc', '<p>Giảm đau. Kháng sinh <b>không thay thế</b> điều trị tại chỗ; chỉ dùng khi có dấu hiệu lan rộng toàn thân (sốt, sưng lan, hạch) hoặc khi không thể điều trị tại chỗ ngay. Phác đồ thường dùng theo ADA 2019: Amoxicillin 500 mg × 3 lần/ngày trong 3–7 ngày.</p>'],
    ],
    quiz: [
      { q: 'Răng gõ dọc đau, thử lạnh không có cảm giác, phim có vùng thấu quang quanh chóp. Chẩn đoán gợi ý?', o: [['Viêm quanh cuống răng do tủy hoại tử', 1], ['Viêm tủy có hồi phục', 0], ['Viêm lợi', 0]], why: 'Thử tủy âm tính, gõ đau và thấu quang chóp là bộ ba gợi ý viêm quanh cuống.' },
      { q: 'Áp xe quanh cuống khu trú, không sốt, có thể điều trị tại chỗ ngay. Ưu tiên?', o: [['Dẫn lưu và điều trị tủy; không cần kháng sinh', 1], ['Chỉ kê kháng sinh rồi hẹn lại', 0], ['Chỉ kê thuốc giảm đau', 0]], why: 'Loại bỏ nguồn nhiễm khuẩn tại chỗ là điều trị chính; kháng sinh dành cho trường hợp có biểu hiện toàn thân.' },
    ],
  },
  {
    id: 'calculus', title: 'Viêm lợi', sub: 'Viêm lợi liên quan đến mảng bám răng · lấy cao răng', icon: 'scaler', game: 'calculus',
    sections: [
      ['Nguyên nhân', '<p>Mảng bám vi khuẩn tích tụ ở cổ răng. Yếu tố thuận lợi: cao răng, răng lệch lạc, miếng trám thừa sát lợi, thay đổi nội tiết (dậy thì, thai kỳ), tiểu đường, hút thuốc, một số thuốc.</p>'],
      ['Triệu chứng', '<ul><li>Lợi đỏ, phù nề, bóng, mất điểm lấm tấm da cam.</li><li>Chảy máu khi chải răng và khi thăm khám; hôi miệng.</li><li>Túi lợi nông (thường ≤ 3 mm) do lợi phù nề; <b>không mất bám dính, không tiêu xương</b> trên phim.</li></ul>'],
      ['Chẩn đoán phân biệt', '<table class="review"><tr><th>Viêm quanh răng</th><td>Có mất bám dính, túi quanh răng từ 4 mm, tiêu xương, có thể lung lay.</td></tr><tr><th>Viêm lợi loét hoại tử</th><td>Đau nhiều, loét đỉnh gai lợi, giả mạc, hôi miệng nặng.</td></tr><tr><th>Bệnh toàn thân</th><td>Bệnh máu, tác dụng thuốc có thể gây chảy máu, phì đại lợi.</td></tr></table>'],
      ['Điều trị', '<ul><li>Loại bỏ mảng bám và cao răng trên, dưới lợi; đánh bóng.</li><li>Hướng dẫn vệ sinh răng miệng: chải răng phương pháp Bass, chỉ nha khoa hoặc bàn chải kẽ.</li><li>Loại bỏ yếu tố thuận lợi (miếng trám thừa, răng lệch…).</li><li>Súc miệng Chlorhexidine 0,12% ngắn ngày khi cần.</li><li>Tái khám, lấy cao răng định kỳ (thường 6 tháng).</li></ul><h5>Quy trình lấy cao răng</h5><ol><li>Súc miệng sát khuẩn.</li><li>Lấy cao răng trên lợi bằng máy siêu âm.</li><li>Lấy cao răng dưới lợi, làm nhẵn mặt chân răng bằng cây nạo (Gracey).</li><li>Đánh bóng.</li><li>Hướng dẫn vệ sinh răng miệng.</li></ol>'],
      ['Thuốc', '<p>Không dùng kháng sinh. Có thể súc miệng Chlorhexidine 0,12% tối đa khoảng 2 tuần vì dùng lâu có thể nhuộm màu răng.</p>'],
    ],
    quiz: [
      { q: 'Điểm phân biệt viêm lợi với viêm quanh răng?', o: [['Viêm lợi chưa mất bám dính, chưa tiêu xương', 1], ['Viêm lợi không chảy máu', 0], ['Viêm lợi luôn có răng lung lay', 0]], why: 'Mất bám dính và tiêu xương là dấu hiệu của viêm quanh răng; viêm lợi hồi phục hoàn toàn khi loại bỏ mảng bám.' },
      { q: 'Phương pháp chải răng Bass?', o: [['Lông bàn chải nghiêng 45° về phía lợi, rung nhẹ tại chỗ rồi xoay về mặt nhai', 1], ['Chải ngang thật mạnh', 0], ['Tránh chải vùng lợi đang chảy máu', 0]], why: 'Bass làm sạch rãnh lợi, nơi mảng bám gây viêm. Chải ngang mạnh gây mòn cổ răng, tụt lợi.' },
      { q: 'Bệnh nhân viêm lợi do mảng bám có cần kháng sinh?', o: [['Không', 1], ['Có, Amoxicillin 5 ngày', 0], ['Có, Metronidazole kéo dài', 0]], why: 'Nguyên nhân là mảng bám, cao răng; điều trị cơ học và vệ sinh răng miệng là đủ.' },
    ],
  },
  {
    id: 'perio', title: 'Viêm quanh răng', sub: 'Viêm nha chu · răng lung lay · nhổ răng', icon: 'forceps', game: 'perio',
    sections: [
      ['Nguyên nhân & yếu tố nguy cơ', '<p>Mảng bám vi khuẩn và phản ứng viêm của cơ thể phá hủy dây chằng quanh răng và xương ổ răng. Yếu tố nguy cơ: <b>hút thuốc lá</b>, tiểu đường kiểm soát kém, di truyền, vệ sinh răng miệng kém.</p>'],
      ['Triệu chứng', '<ul><li>Chảy máu lợi, hôi miệng, tụt lợi, có thể chảy mủ.</li><li><b>Túi quanh răng từ 4 mm</b>, mất bám dính.</li><li>Răng lung lay, di lệch, thưa dần.</li><li>X-quang: tiêu xương ổ răng (ngang hoặc chéo).</li></ul>'],
      ['Đánh giá', '<ul><li>Đo túi quanh răng (6 vị trí mỗi răng), mức mất bám dính, chảy máu khi thăm khám.</li><li><b>Độ lung lay:</b> độ I lung lay ngang dưới 1 mm; độ II lung lay ngang trên 1 mm; độ III lung lay cả chiều ngang và chiều đứng.</li><li>Phân loại bệnh quanh răng 2017 theo <b>giai đoạn</b> (mức độ nặng, độ phức tạp) và <b>cấp độ</b> (tốc độ tiến triển, yếu tố nguy cơ).</li></ul>'],
      ['Điều trị', '<ol><li><b>Kiểm soát nguyên nhân:</b> hướng dẫn vệ sinh, hỗ trợ bỏ thuốc lá, phối hợp kiểm soát tiểu đường; lấy cao răng, làm nhẵn chân răng; loại bỏ yếu tố tại chỗ.</li><li><b>Đánh giá lại</b> sau điều trị khởi đầu; phẫu thuật nha chu với các túi sâu còn tồn tại.</li><li><b>Duy trì</b> định kỳ 3–6 tháng.</li><li>Răng tiên lượng xấu (tiêu xương nhiều, lung lay độ III, mất chức năng): <b>nhổ</b>, sau đó phục hình thay thế.</li></ol><h5>Quy trình nhổ răng</h5><ol><li>Sát khuẩn vùng nhổ.</li><li>Gây tê.</li><li>Tách lợi khỏi cổ răng.</li><li>Bẩy làm lung lay, nong rộng ổ răng (nếu cần).</li><li>Kìm nhổ theo trục răng.</li><li>Kiểm tra chân răng đủ, nạo mô viêm, mô hạt.</li><li>Ép hai bản xương ổ răng, cắn gạc 30–60 phút.</li></ol>'],
      ['Thuốc', '<p>Sau nhổ răng đơn giản ở người khỏe: thuốc giảm đau; có thể súc miệng Chlorhexidine. Kháng sinh không dùng thường quy.</p>'],
      ['Dặn dò sau nhổ răng', '<ul><li>Cắn chặt gạc 30–60 phút.</li><li>Không khạc nhổ, không súc miệng mạnh, không dùng ống hút trong 24 giờ đầu (tránh bong cục máu đông).</li><li>Ăn mềm, nguội; chườm lạnh nếu sưng.</li><li>Tái khám nếu chảy máu kéo dài, sốt, sưng tăng.</li></ul>'],
    ],
    quiz: [
      { q: 'Lung lay độ III nghĩa là gì?', o: [['Răng lung lay cả chiều ngang và chiều đứng', 1], ['Lung lay ngang dưới 1 mm', 0], ['Lung lay sinh lý', 0]], why: 'Độ III: răng di động cả chiều đứng (ấn lún được), tiên lượng thường xấu.' },
      { q: 'Yếu tố nguy cơ có thể thay đổi quan trọng nhất của viêm quanh răng?', o: [['Hút thuốc lá', 1], ['Uống cà phê', 0], ['Tuổi tác', 0]], why: 'Hút thuốc làm bệnh nặng hơn và đáp ứng điều trị kém; cai thuốc là một phần của điều trị.' },
      { q: 'Trong 24 giờ đầu sau nhổ răng, bệnh nhân nên:', o: [['Không súc miệng mạnh, không dùng ống hút', 1], ['Súc miệng nước muối thật mạnh', 0], ['Chườm nóng ngay', 0]], why: 'Áp lực âm và súc mạnh làm bong cục máu đông, dễ gây chảy máu và viêm ổ răng khô.' },
    ],
  },
  {
    id: 'wisdom', title: 'Răng khôn mọc lệch', sub: 'Răng 8 hàm dưới · phẫu thuật nhổ', icon: 'surgdrill', game: 'wisdom',
    sections: [
      ['Đặc điểm', '<p>Răng khôn mọc sau cùng (thường 17–25 tuổi), hay thiếu chỗ nên mọc lệch hoặc kẹt. Phân loại theo trục răng (Winter): lệch gần, lệch xa, nằm ngang, thẳng đứng; theo độ sâu và khoảng trống phía sau răng 7 (Pell & Gregory).</p>'],
      ['Biến chứng', '<ul><li><b>Viêm quanh thân răng:</b> lợi trùm sưng đau, có mủ, khít hàm, có thể sốt, hạch dưới hàm.</li><li>Sâu mặt xa răng 7 hoặc chính răng 8; tiêu xương phía xa răng 7.</li><li>Nang thân răng; áp xe vùng má, cơ cắn, dưới hàm; viêm tấy lan tỏa.</li></ul>'],
      ['Cận lâm sàng', '<p><b>Phim Panorama</b> đánh giá trục răng, số chân, độ sâu và liên quan với ống thần kinh răng dưới. Phim cắt lớp (Cone beam CT) khi chân răng sát ống thần kinh.</p>'],
      ['Chỉ định & thời điểm', '<ul><li>Nhổ khi viêm quanh thân răng tái phát, gây sâu hoặc tiêu xương răng 7, có nang, hoặc vì lý do chỉnh nha, phục hình. Hướng dẫn của Bộ Y tế khuyên răng khôn hàm dưới mọc lệch nên nhổ sớm để bảo vệ xương phía xa răng 7.</li><li><b>Đang viêm cấp:</b> điều trị viêm trước (bơm rửa, giảm đau, kháng sinh khi có biểu hiện nhiễm khuẩn), nhổ khi hết viêm cấp.</li><li>Phụ nữ mang thai: hoãn phẫu thuật chọn lọc đến sau sinh, chỉ xử trí cấp cứu khi cần.</li></ul>'],
      ['Quy trình phẫu thuật', '<ol><li>Sát khuẩn.</li><li>Gây tê gai Spix, tê dây lưỡi và dây miệng.</li><li>Rạch, bóc tách vạt niêm mạc – màng xương.</li><li>Mở xương, luôn bơm nước muối làm mát; tránh chạm răng 7.</li><li>Chia cắt răng khi cần, bẩy lấy từng phần.</li><li>Nạo bao răng, bơm rửa ổ răng.</li><li>Khâu đóng vạt, cắn gạc.</li></ol>'],
      ['Thuốc', '<p>Giảm đau, kháng viêm (lưu ý chống chỉ định NSAID). Kháng sinh dùng theo chỉ định: Amoxicillin; dị ứng Penicillin dùng Clindamycin. Có thể súc miệng Chlorhexidine.</p>'],
      ['Dặn dò & biến chứng sau mổ', '<ul><li>Cắn gạc 30–60 phút; chườm lạnh ngoài má trong 24 giờ đầu.</li><li>Không khạc nhổ, súc mạnh, không hút thuốc; ăn mềm.</li><li>Cắt chỉ sau 5–7 ngày.</li><li>Tái khám ngay khi chảy máu kéo dài, sưng đau tăng, sốt, há miệng hạn chế nặng hoặc tê môi kéo dài (tổn thương thần kinh răng dưới).</li></ul>'],
    ],
    quiz: [
      { q: 'Răng 48 đang sưng đau, khít hàm, sốt. Xử trí phù hợp?', o: [['Điều trị viêm cấp trước, phẫu thuật nhổ khi hết viêm', 1], ['Phẫu thuật nhổ ngay trong buổi khám', 0], ['Chỉ dặn súc miệng nước muối', 0]], why: 'Phẫu thuật khi đang viêm cấp tăng nguy cơ lan rộng nhiễm khuẩn và khó gây tê; cần điều trị viêm trước.' },
      { q: 'Phim nên chụp trước khi phẫu thuật răng khôn hàm dưới?', o: [['Phim Panorama', 1], ['Không cần phim', 0], ['Phim cánh cắn', 0]], why: 'Panorama thấy toàn bộ chân răng và ống thần kinh răng dưới để lập kế hoạch phẫu thuật an toàn.' },
      { q: 'Trong 24 giờ đầu sau phẫu thuật, nên chườm gì ngoài má?', o: [['Chườm lạnh', 1], ['Chườm nóng', 0], ['Không chườm gì', 0]], why: 'Chườm lạnh giúp co mạch, giảm sưng và đau trong giai đoạn đầu.' },
    ],
  },
  {
    id: 'special', title: 'Bệnh toàn thân & kê đơn an toàn', sub: 'Tăng huyết áp, Aspirin, dị ứng, thai kỳ…', icon: 'bp', game: null,
    sections: [
      ['Nguyên tắc chung', '<ul><li>Luôn hỏi bệnh toàn thân, dị ứng thuốc, thuốc đang dùng; với phụ nữ trong độ tuổi sinh đẻ, hỏi thai kỳ.</li><li>Kháng sinh chỉ dùng khi có chỉ định: sốt, sưng lan, hạch, bệnh nhân suy giảm miễn dịch, hoặc không thể điều trị tại chỗ.</li></ul>'],
      ['Tăng huyết áp, tim mạch', '<ul><li>Đo huyết áp trước thủ thuật. Huyết áp rất cao (thường lấy mốc từ 180/110 mmHg) nên hoãn điều trị không cấp cứu và chuyển khám nội khoa.</li><li>Hạn chế thuốc co mạch: dùng liều thấp, hút thử trước khi bơm, hoặc dùng Mepivacaine 3% không co mạch.</li><li>Giảm đau, giảm lo lắng tốt để tránh tăng huyết áp do căng thẳng.</li></ul>'],
      ['Đang dùng Aspirin, thuốc chống kết tập tiểu cầu', '<ul><li><b>Không tự ý ngưng</b> thuốc (nguy cơ tắc stent, nhồi máu) với nhổ răng thông thường.</li><li>Cầm máu tại chỗ kỹ: gạc, khâu, vật liệu cầm máu; tránh NSAID.</li></ul>'],
      ['Tiểu đường', '<ul><li>Kiểm tra đường huyết trước phẫu thuật; hẹn buổi sáng, sau bữa ăn.</li><li>Nguy cơ nhiễm trùng và lành thương chậm cao hơn.</li></ul>'],
      ['Dị ứng Penicillin', '<p>Không dùng Amoxicillin và các thuốc nhóm Penicillin. Khi cần kháng sinh có thể thay bằng Clindamycin.</p>'],
      ['Hen phế quản, viêm loét dạ dày', '<ul><li>Hen: một số bệnh nhân nhạy cảm với NSAID (Aspirin, Ibuprofen) có thể lên cơn hen; để sẵn thuốc xịt cắt cơn.</li><li>Viêm loét dạ dày: tránh NSAID; dùng Paracetamol để giảm đau.</li></ul>'],
      ['Phụ nữ mang thai', '<ul><li>Điều trị không cấp cứu thuận lợi nhất ở 3 tháng giữa; điều trị cấp cứu (giảm đau, kiểm soát nhiễm khuẩn) có thể làm bất kỳ lúc nào.</li><li>Chỉ chụp phim khi cần, mặc áo chì che bụng và tuyến giáp.</li><li>Lidocaine dùng được; Paracetamol là thuốc giảm đau ưu tiên; tránh NSAID, đặc biệt 3 tháng cuối.</li><li>Hoãn phẫu thuật chọn lọc (như nhổ răng khôn) đến sau sinh.</li></ul>'],
    ],
    quiz: [
      { q: 'Bệnh nhân dị ứng Amoxicillin (nổi mề đay) cần kháng sinh. Lựa chọn thay thế?', o: [['Clindamycin', 1], ['Ampicillin', 0], ['Tăng liều Amoxicillin', 0]], why: 'Ampicillin cùng nhóm Penicillin với Amoxicillin, có thể gây dị ứng chéo.' },
      { q: 'Bệnh nhân viêm loét dạ dày cần thuốc giảm đau sau nhổ răng:', o: [['Paracetamol', 1], ['Ibuprofen', 0], ['Aspirin', 0]], why: 'NSAID làm tăng nguy cơ loét và xuất huyết tiêu hóa.' },
      { q: 'Bệnh nhân đặt stent mạch vành, đang uống Aspirin, cần nhổ răng:', o: [['Không tự ý ngưng Aspirin, cầm máu tại chỗ kỹ', 1], ['Ngưng Aspirin 7 ngày rồi nhổ', 0], ['Từ chối điều trị', 0]], why: 'Ngưng thuốc chống kết tập tiểu cầu có thể gây biến cố tim mạch nặng; chảy máu sau nhổ răng thường kiểm soát được tại chỗ.' },
    ],
  },
];

/* ---------- viewer (own overlay above dialogs, so it can be opened from anywhere) ---------- */
let protoCur = 'caries';
function initProtocols() { $('protoClose').onclick = () => { Sound.tap(); closeProtocols(); }; $('proto').addEventListener('pointerdown', (e) => { if (e.target === $('proto')) closeProtocols(); }); }
function closeProtocols() { $('proto').hidden = true; if ($('modal').hidden && $('treat').hidden) W.paused = false; }
function openProtocols(id) {
  Sound.tap(); if (id && PROTOCOLS.some((p) => p.id === id)) protoCur = id;
  $('proto').hidden = false; W.paused = true; renderProtocol();
}
function renderProtocol() {
  const P = PROTOCOLS.find((p) => p.id === protoCur) || PROTOCOLS[0];
  $('protoNav').innerHTML = PROTOCOLS.map((p) => { const best = G.quiz[p.id]; return `<button class="pn ${p.id === P.id ? 'on' : ''}" data-p="${p.id}"><span class="pn-ic">${icon(p.icon)}</span><span><b>${esc(p.title)}</b><small>${esc(p.sub)}</small></span>${best != null ? `<em class="${best >= 1 ? 'ok' : ''}">${Math.round(best * 100)}%</em>` : ''}</button>`; }).join('');
  const steps = P.game ? STEPS[CASES[P.game].treat] : null;
  $('protoMain').innerHTML = `<header class="ph"><h3>${esc(P.title)}</h3><p>${esc(P.sub)}</p></header>
    ${PFIG[P.id] ? `<figure>${PFIG[P.id]}</figure>` : ''}
    ${P.sections.map(([h, body], k) => `<details class="psec" ${k < 3 ? 'open' : ''}><summary>${esc(h)}</summary><div class="psec-b">${body}</div></details>`).join('')}
    ${steps ? `<details class="psec"><summary>Thực hành trong game: ${steps.length} bước</summary><div class="psec-b"><ol>${steps.map((s) => `<li><b>${esc(s.title)}</b> <span class="tool-chip">${esc(TOOLS[s.tool][0])}</span><br><small>${esc(s.text)}</small></li>`).join('')}</ol><button class="btn small blue" data-prac="${P.game}">Luyện tập ca này</button></div></details>` : ''}
    <section class="pquiz"><h4 class="sec">Tự kiểm tra</h4>${P.quiz.map((q, i) => `<div class="pq" data-i="${i}"><p><b>${i + 1}. ${esc(q.q)}</b></p>${shuffleSeed(q.o, P.id + i).map((o) => `<label><input type="radio" name="pq${i}" value="${o[1]}"> ${esc(o[0])}</label>`).join('')}<div class="pq-why" hidden></div></div>`).join('')}<div class="row left"><button class="btn small" id="pqSubmit">Nộp bài</button><span class="pq-res" id="pqRes"></span></div></section>
    <section class="prefs"><h4 class="sec">Tài liệu tham khảo</h4><ol>${PROTO_REFS.map(([t, u]) => `<li>${esc(t)} <a href="${u}" target="_blank" rel="noopener">Xem nguồn</a></li>`).join('')}</ol><p class="muted">Nội dung tóm tắt để học trong game, không thay thế tài liệu chuyên môn và chỉ định của bác sĩ.</p></section>`;
  $('protoMain').scrollTop = 0;
  document.querySelectorAll('#protoNav .pn').forEach((b) => b.onclick = () => { protoCur = b.dataset.p; Sound.tap(); renderProtocol(); });
  const pr = document.querySelector('#protoMain [data-prac]'); if (pr) pr.onclick = () => { if (T.p) { toast('Hãy hoàn thành ca đang khám trước.'); return; } closeProtocols(); hideModal(); const p = makePatient(pr.dataset.prac); p.teeth = makeMouth(p.type, p.target); openTreatment(p, true); };
  $('pqSubmit').onclick = () => {
    let right = 0; const n = P.quiz.length, blank = P.quiz.some((q, i) => !document.querySelector(`input[name="pq${i}"]:checked`));
    if (blank) { toast('Hãy trả lời tất cả câu hỏi.', 'bad'); return; }
    P.quiz.forEach((q, i) => { const el = document.querySelector(`.pq[data-i="${i}"]`), v = document.querySelector(`input[name="pq${i}"]:checked`).value === '1'; if (v) right++; el.classList.toggle('right', v); el.classList.toggle('wrong', !v); const w = el.querySelector('.pq-why'); w.hidden = false; w.innerHTML = `${v ? '<b>Đúng.</b>' : `<b>Chưa đúng.</b> Đáp án: ${esc(q.o.find((o) => o[1])[0])}.`} ${esc(q.why)}`; });
    const sc = right / n; G.quiz[P.id] = Math.max(G.quiz[P.id] || 0, sc); saveGame(); questCheck();
    $('pqRes').textContent = `${right}/${n} câu đúng${sc >= 1 ? ' · Xuất sắc!' : ''}`; if (sc >= 1) Sound.good(); else Sound.tap();
    document.querySelectorAll('#protoNav .pn').forEach((b) => { if (b.dataset.p === P.id) { const best = G.quiz[P.id]; let em = b.querySelector('em'); if (!em) { em = document.createElement('em'); b.appendChild(em); } em.className = best >= 1 ? 'ok' : ''; em.textContent = Math.round(best * 100) + '%'; } });
  };
}
function shuffleSeed(arr, seed) { let h = 0; for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) | 0; const r = mulberry(h), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
