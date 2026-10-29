/* ================== DATA: clinical content + economy ==================
   Thuật ngữ bệnh theo Hướng dẫn chẩn đoán và điều trị một số bệnh về Răng Hàm Mặt (Bộ Y tế, QĐ 3108/QĐ-BYT, 28/07/2015). */
const CC_OPTIONS = [
  ['caries', 'Ê buốt răng khi ăn ngọt, uống lạnh'],
  ['pulpitis', 'Đau nhức dữ dội từng cơn, đau cả về đêm'],
  ['calculus', 'Chảy máu chân răng khi chải, hôi miệng'],
  ['perio', 'Răng lung lay, ăn nhai khó'],
  ['wisdom', 'Sưng đau vùng răng khôn tái đi tái lại'],
];
const CHART_OPTS = [
  ['ok', 'Bình thường', '#78c443'], ['caries', 'Sâu răng', '#d23c3c'], ['stain', 'Nhiễm màu, không sâu', '#a8692f'], ['filled', 'Miếng trám cũ', '#7b8a96'],
  ['calculus', 'Cao răng', '#e0b72e'], ['mobile', 'Lung lay', '#f08a24'], ['impacted', 'Mọc lệch / ngầm', '#8a5cd6'], ['missing', 'Mất răng', '#3c4650'],
];

const CASES = {
  caries: {
    label: 'Sâu răng', treat: 'filling', minLevel: 1, fee: 450000, xp: 30, need: [], surgical: false, anesth: 'optional', chartAs: 'caries',
    teeth: [16, 17, 26, 27, 36, 37, 46, 47],
    say: ['Răng hàm của em hay ê buốt khi ăn đồ ngọt hay uống nước đá, bỏ ra là hết ngay.', 'Có lỗ đen ở răng hàm, hay giắt thức ăn, uống lạnh thì ê.'],
    keyQ: ['trigger', 'duration'], keyT: ['explorer', 'cold'],
    find: {
      mirror: 'Rãnh giữa mặt nhai có vùng đổi màu nâu đen, nghi có lỗ nhỏ',
      explorer: 'Thám trâm mắc vào rãnh, đáy lỗ mềm',
      cold: 'Ê buốt nhanh, hết ngay khi bỏ kích thích', coldSec: 2, perc: 'Gõ dọc (−), gõ ngang (−)',
      probe: 'Túi lợi 1–2 mm, không chảy máu', mob: 'Không lung lay (độ 0)',
      xray: 'Thấu quang trong lớp ngà, còn cách buồng tủy hơn 1 mm. Vùng quanh chóp bình thường.',
    },
    hxSum: ['Ê buốt khi có kích thích, hết ngay khi bỏ kích thích, không đau tự phát', 'Đau tự phát từng cơn, kéo dài sau kích thích, đau về đêm', 'Đau liên tục khi nhai, cảm giác răng trồi cao', 'Chảy máu lợi khi chải răng, không đau'],
    dx: ['Sâu ngà (S2), tủy còn sống', 'Viêm tủy răng không hồi phục', 'Viêm quanh cuống răng mạn', 'Sâu men (S1)'],
    plan: ['Trám composite xoang I', 'Điều trị tủy rồi phục hình', 'Nhổ răng', 'Theo dõi, bôi fluor'],
    meds: { need: [], ok: ['none', 'para'], no: ['amox', 'clinda', 'metro'], why: 'Sâu ngà, tủy còn sống: không có chỉ định kháng sinh; thường không cần thuốc.' },
    instr: [
      ['Có thể ăn nhai bình thường ngay vì composite đã đông cứng', true],
      ['Chải răng 2 lần/ngày với kem có fluor, dùng chỉ nha khoa, hạn chế đồ ngọt', true],
      ['Tái khám nếu ê buốt kéo dài hoặc vướng cộm khi cắn', true],
      ['Kiêng ăn nhai bên trám 24 giờ', false],
      ['Súc miệng nước muối đặc 5 lần/ngày để miếng trám bền', false],
    ],
    use: { gloves: 1, etch: 1, bond: 1, comp: 1, bur: 1 },
    note: 'Sâu ngà: ê buốt khi có kích thích và hết ngay khi bỏ kích thích, nên tủy còn sống. Trám composite xoang I: cô lập → mở đường vào → lấy sạch ngà mềm → kiểm tra bằng thám trâm → etching 37% → rửa, thổi khô nhẹ → bond, chiếu đèn → đắp composite từng lớp ≤ 2 mm, chiếu đèn mỗi lớp → kiểm tra khớp cắn → đánh bóng.',
  },
  calculus: {
    label: 'Viêm lợi – cao răng', treat: 'scaling', minLevel: 1, fee: 350000, xp: 24, need: [], surgical: false, anesth: 'none', chartAs: 'calculus',
    teeth: [31, 41],
    say: ['Mỗi lần đánh răng là chảy máu chân răng, hơi thở có mùi.', 'Lợi em hay sưng đỏ, chải răng là chảy máu.'],
    keyQ: ['bleeding', 'brush'], keyT: ['probe'],
    find: {
      mirror: 'Cao răng bám cổ răng mặt trong răng cửa dưới, lợi viền đỏ, phù nề',
      explorer: 'Cảm nhận cao răng gồ ghề dưới lợi ở cổ răng, không có lỗ sâu',
      probe: 'Túi lợi 3 mm, chảy máu khi thăm khám, không mất bám dính',
      cold: 'Ê nhẹ thoáng qua, hết ngay (bình thường)', coldSec: 1, perc: 'Gõ dọc (−), gõ ngang (−)', mob: 'Không lung lay (độ 0)',
      xray: 'Có cao răng dạng gai ở cổ răng. Mào xương ổ răng còn nguyên, chưa tiêu xương.',
    },
    hxSum: ['Chảy máu lợi khi chải răng, hôi miệng, không đau; chải răng chưa đúng cách', 'Răng lung lay tăng dần, chảy mủ, tiêu xương nhiều', 'Đau tự phát từng cơn về đêm', 'Ê buốt cổ răng khi uống lạnh, hết ngay'],
    dx: ['Viêm lợi liên quan đến mảng bám răng', 'Viêm quanh răng (viêm nha chu) nặng', 'Sâu cổ răng', 'Viêm tủy có hồi phục'],
    plan: ['Lấy cao răng, đánh bóng, hướng dẫn vệ sinh răng miệng', 'Nhổ các răng chảy máu', 'Trám cổ răng', 'Kê kháng sinh 7 ngày, chưa cần lấy cao răng'],
    meds: { need: [], ok: ['none', 'chx'], no: ['amox', 'clinda', 'metro'], why: 'Viêm lợi do mảng bám: loại bỏ mảng bám, cao răng là chính; có thể súc miệng Chlorhexidine 0,12% ngắn ngày, không dùng kháng sinh.' },
    instr: [
      ['Chải răng 2 lần/ngày theo phương pháp Bass', true],
      ['Làm sạch kẽ răng bằng chỉ nha khoa hoặc bàn chải kẽ', true],
      ['Lấy cao răng định kỳ 6 tháng/lần', true],
      ['Tránh chải vùng lợi chảy máu cho đến khi hết chảy', false],
      ['Dùng nước súc miệng Chlorhexidine lâu dài thay chải răng', false],
    ],
    use: { gloves: 1, chx: 1, paste: 1 },
    note: 'Viêm lợi liên quan đến mảng bám: lợi đỏ, phù nề, chảy máu khi thăm khám, túi lợi nông, chưa mất bám dính và chưa tiêu xương. Điều trị: súc miệng sát khuẩn → lấy cao răng trên và dưới lợi → đánh bóng → hướng dẫn vệ sinh răng miệng.',
  },
  pulpitis: {
    label: 'Viêm tủy', treat: 'rootcanal', minLevel: 2, fee: 2200000, xp: 55, need: ['endo', 'xray'], surgical: false, anesth: 'required', chartAs: 'caries',
    teeth: [36, 46, 37, 47],
    say: ['Răng đau nhức dữ dội từng cơn, đau cả về đêm, lan lên thái dương.', 'Uống nước lạnh là đau buốt kéo dài cả phút, tối qua không ngủ được.'],
    keyQ: ['trigger', 'duration', 'night'], keyT: ['explorer', 'cold', 'xray'],
    find: {
      mirror: 'Lỗ sâu lớn mặt nhai, nhiều ngà mủn sẫm màu',
      explorer: 'Thám trâm lọt sâu vào ngà mủn, bệnh nhân đau nhói',
      cold: 'Đau dữ dội, còn đau kéo dài sau khi đã bỏ kích thích', coldSec: 45, perc: 'Gõ dọc (±), hơi ê',
      probe: 'Túi lợi 2 mm, không chảy máu', mob: 'Không lung lay (độ 0)',
      xray: 'Thấu quang lớn từ mặt nhai sát buồng tủy. Dây chằng quanh chóp giãn nhẹ, chưa có tổn thương quanh chóp.',
    },
    hxSum: ['Đau tự phát từng cơn, kéo dài sau kích thích lạnh, đau về đêm, lan lên thái dương', 'Ê buốt thoáng qua khi ăn ngọt, hết ngay', 'Không đau, chỉ thấy răng đổi màu', 'Chảy máu lợi khi chải răng'],
    dx: ['Viêm tủy răng không hồi phục', 'Viêm tủy răng có hồi phục', 'Sâu ngà (S2), tủy còn sống', 'Tủy hoại tử, viêm quanh cuống cấp'],
    plan: ['Điều trị tủy, sau đó phục hình chụp', 'Trám composite', 'Che tủy gián tiếp, theo dõi', 'Kê kháng sinh, hẹn lại khi hết đau'],
    meds: { need: ['analgesic'], ok: ['para', 'ibu'], no: ['amox', 'clinda', 'metro'], why: 'Viêm tủy không hồi phục: điều trị là lấy tủy; dùng thuốc giảm đau, không chỉ định kháng sinh thường quy.' },
    instr: [
      ['Tránh nhai mạnh bên răng điều trị cho đến khi làm chụp', true],
      ['Hẹn làm chụp răng (mão) để bảo vệ răng đã điều trị tủy', true],
      ['Có thể ê nhẹ vài ngày, uống thuốc giảm đau theo đơn', true],
      ['Răng đã chết tủy nên không cần phục hình thêm', false],
      ['Ngậm đá lạnh liên tục 3 ngày', false],
    ],
    use: { gloves: 1, anest: 2, bur: 1, niti: 1, irrig: 1, obtu: 1, gic: 1 },
    note: 'Viêm tủy không hồi phục: đau tự phát, đau về đêm, đau kéo dài sau kích thích lạnh. Điều trị tủy: gây tê → đặt đê cao su → mở tủy → tìm miệng ống tủy (răng hàm lớn dưới thường có 3 ống: 2 gần, 1 xa) → xác định chiều dài làm việc → sửa soạn và bơm rửa NaOCl → làm khô bằng côn giấy → trám bít gutta-percha + xi măng → trám kín buồng tủy → chụp phim kiểm tra.',
  },
  perio: {
    label: 'Răng lung lay', treat: 'extraction', minLevel: 2, fee: 500000, xp: 35, need: ['extract'], surgical: true, anesth: 'required', chartAs: 'mobile',
    teeth: [31, 41, 32, 42],
    say: ['Răng cửa dưới lung lay cả năm nay, giờ cắn thức ăn rất khó.', 'Răng dưới lung lay nhiều, lợi hay có mủ, hôi miệng.'],
    keyQ: ['onset', 'bleeding', 'smoke'], keyT: ['probe', 'mob', 'xray'],
    find: {
      mirror: 'Lợi viền đỏ sẫm, tụt lợi lộ chân răng, có cao răng',
      explorer: 'Không có lỗ sâu; cao răng dưới lợi gồ ghề',
      probe: 'Túi quanh răng 7 mm, chảy máu, có mủ khi ấn',
      mob: 'Lung lay độ III (lung lay cả chiều đứng)',
      cold: 'Đáp ứng yếu', coldSec: 0, perc: 'Gõ dọc (+) nhẹ',
      xray: 'Tiêu xương ổ răng hơn 2/3 chiều dài chân răng.',
    },
    hxSum: ['Răng lung lay tăng dần, chảy máu, có mủ, hôi miệng; hút thuốc lá nhiều', 'Chảy máu lợi, không lung lay, chưa tiêu xương', 'Đau tự phát dữ dội về đêm', 'Răng bị va đập, gãy ngang thân răng'],
    dx: ['Viêm quanh răng (viêm nha chu) nặng, răng lung lay độ III', 'Viêm lợi liên quan đến mảng bám răng', 'Gãy chân răng', 'Viêm tủy răng không hồi phục'],
    plan: ['Nhổ răng, sau đó phục hình thay thế', 'Lấy cao răng, theo dõi', 'Điều trị tủy', 'Nẹp răng lâu dài'],
    meds: { need: ['analgesic'], ok: ['para', 'ibu', 'chx'], no: ['amox', 'clinda', 'metro'], why: 'Nhổ răng đơn giản ở người khỏe mạnh: thuốc giảm đau, có thể súc miệng Chlorhexidine; không cần kháng sinh thường quy.' },
    instr: [
      ['Cắn chặt gạc 30–60 phút', true],
      ['Không khạc nhổ, không súc miệng mạnh trong 24 giờ đầu', true],
      ['Ăn đồ mềm, nguội trong ngày đầu', true],
      ['Chườm nóng ngay sau nhổ cho mau lành', false],
      ['Dùng ống hút để uống nước trong ngày đầu', false],
    ],
    use: { gloves: 1, anest: 1, gauze: 2 },
    note: 'Viêm quanh răng nặng: túi quanh răng sâu, tiêu xương nhiều, răng lung lay độ III, tiên lượng xấu nên có chỉ định nhổ. Quy trình: sát khuẩn → gây tê → tách lợi → bẩy → kìm nhổ → kiểm tra chân răng, nạo ổ → ép ổ răng → cắn gạc. Sau đó điều trị viêm quanh răng các răng còn lại và phục hình.',
  },
  wisdom: {
    label: 'Răng khôn', treat: 'surgery', minLevel: 3, fee: 2800000, xp: 65, need: ['surgery', 'xray'], surgical: true, anesth: 'required', chartAs: 'impacted',
    teeth: [38, 48],
    say: ['Răng khôn hàm dưới sưng đau đi đau lại mấy đợt rồi, đợt trước uống thuốc mới đỡ.', 'Chỗ răng khôn hay giắt thức ăn, cứ vài tháng lại sưng đau một lần.'],
    keyQ: ['onset', 'swelling'], keyT: ['pano'],
    find: {
      mirror: 'Răng khôn mọc một phần, nghiêng về phía răng 7; lợi trùm phía xa hơi nề, không có mủ',
      explorer: 'Giắt thức ăn dưới lợi trùm; mặt xa răng 7 không có lỗ sâu',
      probe: 'Túi quanh thân răng sâu, chảy máu nhẹ', mob: 'Không lung lay',
      cold: 'Ê nhẹ thoáng qua, hết ngay (bình thường)', coldSec: 1, perc: 'Gõ dọc (−), gõ ngang (−)',
      xray: 'Phim quanh chóp: răng khôn mọc lệch gần, kẹt dưới cổ răng 7. Phim chưa thấy hết chóp chân răng.',
      pano: 'Răng khôn mọc lệch gần khoảng 45°, kẹt dưới cổ răng 7. Hai chân răng, chóp cách ống thần kinh răng dưới.',
    },
    hxSum: ['Viêm quanh thân răng khôn tái phát nhiều đợt, hiện không sưng, há miệng bình thường', 'Đang sưng má, sốt, khít hàm (viêm cấp)', 'Ê buốt khi uống lạnh, hết ngay', 'Đau tự phát dữ dội về đêm ở răng 7'],
    dx: ['Răng khôn mọc lệch gần, viêm quanh thân răng tái phát', 'Viêm tủy răng 7', 'Viêm lợi liên quan đến mảng bám răng', 'Nang thân răng'],
    plan: ['Phẫu thuật nhổ răng khôn', 'Trám răng 7', 'Cắt lợi trùm, giữ răng khôn', 'Chỉ kê kháng sinh, theo dõi'],
    meds: { need: ['analgesic'], ok: ['para', 'ibu', 'amox', 'clinda', 'metro', 'chx'], no: [], why: 'Sau phẫu thuật răng khôn: thuốc giảm đau, kháng viêm; kháng sinh dùng khi cần (Amoxicillin; dị ứng Penicillin dùng Clindamycin); có thể súc miệng Chlorhexidine.' },
    instr: [
      ['Cắn chặt gạc 30–60 phút', true],
      ['Chườm lạnh ngoài má trong 24 giờ đầu', true],
      ['Không khạc nhổ, súc miệng mạnh, không hút thuốc', true],
      ['Hẹn cắt chỉ sau 5–7 ngày', true],
      ['Chườm nóng ngay trong ngày đầu cho đỡ sưng', false],
      ['Có thể tập thể thao mạnh ngay tối hôm đó', false],
    ],
    use: { gloves: 1, anest: 3, blade: 1, bur: 1, suture: 1, gauze: 2 },
    note: 'Răng khôn hàm dưới mọc lệch gây viêm quanh thân răng tái phát là chỉ định nhổ, thực hiện khi không còn viêm cấp. Nên chụp Panorama để đánh giá ống thần kinh răng dưới. Phẫu thuật: sát khuẩn → gây tê gai Spix + tê dây lưỡi, dây miệng → rạch tạo vạt → bóc tách vạt → mở xương (bơm nước muối làm mát) → chia cắt răng → bẩy lấy từng phần → nạo, bơm rửa ổ răng → khâu vạt → cắn gạc.',
  },
};

/* ---------- history taking (giới hạn số câu hỏi) ---------- */
const Q_BUDGET = 7;
/* chair time (game minutes) used by each action: thorough work costs clinic time */
const CHAIR_MIN = { q: 0.5, mirror: 0.2, explorer: 0.4, probe: 0.4, cold: 1, perc: 0.2, mob: 0.2, bp: 2, xray: 3, pano: 5, chart: 0.1, rec: 3, rx: 2 };
const TX_MIN = { filling: 25, scaling: 30, rootcanal: 60, extraction: 20, surgery: 45 };
const QUESTIONS = [
  { id: 'onset', g: 'hx', q: 'Anh/chị bị khó chịu từ khi nào?', a: { caries: 'Khoảng 2 tuần nay, thỉnh thoảng thôi.', pulpitis: 'Ba ngày nay, đau ngày càng nhiều.', calculus: 'Mấy tháng nay rồi.', perio: 'Răng lung lay cả năm nay, dạo này nặng hơn.', wisdom: 'Gần một năm, cứ vài tháng lại sưng một đợt. Đợt gần nhất cách đây 3 tuần.' } },
  { id: 'trigger', g: 'hx', q: 'Đau tự nhiên hay chỉ khi có kích thích như ăn, uống lạnh?', a: { caries: 'Chỉ khi ăn ngọt hoặc uống lạnh, bỏ ra là hết.', pulpitis: 'Tự nhiên cũng đau, uống lạnh càng đau hơn.', calculus: 'Không đau, chỉ chảy máu khi chải răng.', perio: 'Không đau nhiều, chủ yếu lung lay.', wisdom: 'Lúc sưng thì đau âm ỉ, giờ chỉ hơi vướng.' } },
  { id: 'duration', g: 'hx', q: 'Mỗi cơn đau kéo dài bao lâu?', a: { caries: 'Vài giây là hết.', pulpitis: 'Kéo dài cả chục phút, có cơn cả tiếng.', calculus: 'Không có cơn đau.', perio: 'Không đau thành cơn.', wisdom: 'Mỗi đợt sưng đau chừng 4–5 ngày.' } },
  { id: 'night', g: 'hx', q: 'Có đau về đêm hay đau lan lên tai, thái dương không?', a: { caries: 'Không ạ.', pulpitis: 'Có, đêm qua đau không ngủ được, lan lên thái dương.', calculus: 'Không ạ.', perio: 'Không ạ.', wisdom: 'Lúc sưng có đau lan lên tai, giờ thì không.' } },
  { id: 'swelling', g: 'hx', q: 'Có sưng mặt, sốt hay khó há miệng không?', a: { caries: 'Không.', pulpitis: 'Không sưng.', calculus: 'Không.', perio: 'Không, thỉnh thoảng lợi có mủ.', wisdom: 'Đợt trước sưng má, khó há miệng, uống thuốc thì khỏi. Hiện không sưng, há miệng bình thường.' } },
  { id: 'bleeding', g: 'hx', q: 'Có chảy máu chân răng khi chải răng không?', a: { caries: 'Không ạ.', pulpitis: 'Không ạ.', calculus: 'Có, gần như lần nào chải cũng chảy máu.', perio: 'Có, và hay hôi miệng.', wisdom: 'Chỉ vùng trong cùng hay chảy máu.' } },
  { id: 'brush', g: 'hx', q: 'Anh/chị chải răng mấy lần một ngày, chải thế nào?', a: { caries: 'Ngày 2 lần, kem có fluor.', pulpitis: 'Ngày 2 lần.', calculus: 'Sáng chải một lần, chải ngang cho nhanh, không dùng chỉ nha khoa.', perio: 'Chải qua loa, không dùng chỉ nha khoa.', wisdom: 'Ngày 2 lần, vùng trong cùng khó chải.' } },
  { id: 'smoke', g: 'hx', q: 'Anh/chị có hút thuốc lá không?', a: { caries: 'Không ạ.', pulpitis: 'Không ạ.', calculus: 'Không ạ.', perio: 'Có, gần một bao mỗi ngày, hơn 20 năm rồi.', wisdom: 'Thỉnh thoảng hút vài điếu.' } },
  { id: 'prev', g: 'hx', q: 'Răng này đã từng điều trị gì chưa?', a: { caries: 'Chưa từng chữa.', pulpitis: 'Chưa, định để tự khỏi.', calculus: 'Hai năm chưa lấy cao răng.', perio: 'Chưa điều trị nha chu bao giờ.', wisdom: 'Lần trước đau đi khám, được kê thuốc.' } },
  { id: 'sys', g: 'bg', q: 'Anh/chị có bệnh lý toàn thân nào không (tim mạch, huyết áp, tiểu đường, hen...)?', hx: 'sys' },
  { id: 'allergy', g: 'bg', q: 'Anh/chị có dị ứng thuốc nào không?', hx: 'allergy' },
  { id: 'meds', g: 'bg', q: 'Hiện anh/chị có đang dùng thuốc gì không?', hx: 'meds' },
  { id: 'preg', g: 'bg', q: 'Chị có đang mang thai không?', hx: 'preg', female: true },
  { id: 'job', g: 'bg', q: 'Anh/chị làm nghề gì?', waste: 'Dạ, em đã ghi ở phiếu tiếp nhận rồi ạ.' },
  { id: 'paste', g: 'hx', q: 'Anh/chị dùng kem đánh răng hãng nào?', waste: 'Hãng nào rẻ thì mua thôi ạ… cái đó có liên quan không bác sĩ?' },
  { id: 'coffee', g: 'hx', q: 'Anh/chị có hay uống cà phê không?', waste: 'Sáng nào cũng một ly ạ.' },
  { id: 'sport', g: 'hx', q: 'Anh/chị có tập thể dục thường xuyên không?', waste: 'Cuối tuần thì có chạy bộ ạ.' },
  { id: 'family', g: 'bg', q: 'Bố mẹ anh/chị có răng tốt không?', waste: 'Chắc cũng bình thường ạ.' },
  { id: 'travel', g: 'hx', q: 'Gần đây anh/chị có đi du lịch xa không?', waste: 'Dạ không ạ.' },
];
const MEDHX = [
  { key: 'none', w: 48, sys: 'Không có bệnh lý toàn thân.', allergy: 'Không dị ứng thuốc gì.', meds: 'Không dùng thuốc gì.', f: {} },
  { key: 'htn', w: 12, sys: 'Bị tăng huyết áp 5 năm nay.', allergy: 'Không dị ứng.', meds: 'Uống Amlodipine 5 mg mỗi sáng.', f: { htn: 1 } },
  { key: 'dm', w: 8, sys: 'Bị tiểu đường type 2.', allergy: 'Không dị ứng.', meds: 'Đang uống Metformin.', f: { dm: 1 } },
  { key: 'pen', w: 10, sys: 'Không có bệnh gì.', allergy: 'Có, uống Amoxicillin bị nổi mề đay khắp người.', meds: 'Không dùng thuốc gì.', f: { pen: 1 } },
  { key: 'stent', w: 6, sys: 'Hai năm trước đặt stent mạch vành.', allergy: 'Không dị ứng.', meds: 'Uống Aspirin 81 mg mỗi ngày.', f: { cardiac: 1, antiplt: 1 } },
  { key: 'asthma', w: 5, sys: 'Bị hen phế quản từ nhỏ.', allergy: 'Không dị ứng.', meds: 'Xịt Ventolin khi khó thở.', f: { asthma: 1 } },
  { key: 'ulcer', w: 6, sys: 'Bị viêm loét dạ dày.', allergy: 'Không dị ứng.', meds: 'Đang uống Omeprazole.', f: { ulcer: 1 } },
  { key: 'preg', w: 5, sys: 'Không có bệnh gì.', allergy: 'Không dị ứng.', meds: 'Chỉ uống vitamin bầu.', f: { preg: 1 }, female: true },
];
const PRECAUTIONS = [
  { id: 'bp', label: 'Đo huyết áp trước khi gây tê', need: (f) => f.htn || f.cardiac },
  { id: 'noEpi', label: 'Hạn chế thuốc co mạch (ưu tiên Mepivacaine 3%)', need: (f) => f.htn || f.cardiac },
  { id: 'noPen', label: 'Không dùng kháng sinh nhóm Penicillin', need: (f) => f.pen },
  { id: 'noNsaid', label: 'Tránh thuốc kháng viêm NSAID (Ibuprofen)', need: (f) => f.asthma || f.ulcer || f.preg || f.antiplt },
  { id: 'bleed', label: 'Cầm máu tại chỗ kỹ, không tự ý ngưng Aspirin', need: (f, c) => f.antiplt && c.surgical },
  { id: 'glucose', label: 'Kiểm tra đường huyết trước can thiệp', need: (f, c) => f.dm && c.surgical },
  { id: 'apron', label: 'Mặc áo chì khi chụp phim, hạn chế chụp', need: (f) => f.preg },
];
const ANESTH = [
  ['none', 'Không gây tê'],
  ['lido', 'Lidocaine 2% + Epinephrine 1:100.000'],
  ['mepi', 'Mepivacaine 3% (không co mạch)'],
];
const MEDS = [
  { id: 'none', name: 'Không cần thuốc', desc: 'Không kê đơn.' },
  { id: 'para', name: 'Paracetamol 500 mg', desc: 'Giảm đau, hạ sốt. 1 viên khi đau, cách ≥ 4–6 giờ, tối đa 4 g/ngày.', cls: 'analgesic' },
  { id: 'ibu', name: 'Ibuprofen 400 mg', desc: 'Giảm đau, kháng viêm (NSAID), uống sau ăn. Tránh khi viêm loét dạ dày, hen, có thai, đang dùng Aspirin/chống đông.', cls: 'analgesic', nsaid: true },
  { id: 'amox', name: 'Amoxicillin 500 mg', desc: 'Kháng sinh nhóm Penicillin. Chống chỉ định khi dị ứng Penicillin.', cls: 'antibiotic', pen: true },
  { id: 'clinda', name: 'Clindamycin 300 mg', desc: 'Kháng sinh thay thế khi dị ứng Penicillin.', cls: 'antibiotic' },
  { id: 'metro', name: 'Metronidazole 250 mg', desc: 'Kháng sinh diệt vi khuẩn kỵ khí, thường phối hợp. Không uống rượu khi dùng.', cls: 'antibiotic2' },
  { id: 'chx', name: 'Súc miệng Chlorhexidine 0,12%', desc: '2 lần/ngày, dùng ngắn ngày (≤ 2 tuần) vì có thể nhuộm màu răng.' },
];

/* ---------- people ---------- */
const NAMES_M = ['Anh Tuấn', 'Chú Bình', 'Anh Khoa', 'Bác Lộc', 'Anh Dũng', 'Chú Phúc', 'Anh Huy', 'Anh Long', 'Anh Quân', 'Chú Hải', 'Anh Nam', 'Bác Thành'];
const NAMES_F = ['Chị Mai', 'Cô Hạnh', 'Chị Thảo', 'Em Vy', 'Chị Ngọc', 'Cô Lan', 'Chị Trang', 'Bà Sáu', 'Chị Hương', 'Cô Thu', 'Chị Linh', 'Em Trâm'];
const JOBS = ['Giáo viên', 'Kỹ sư', 'Nhân viên văn phòng', 'Sinh viên', 'Kinh doanh', 'Nội trợ', 'Tài xế', 'Công nhân', 'Hưu trí', 'Điều dưỡng', 'Lập trình viên', 'Nông dân'];
const ADDRS = ['Cầu Giấy, Hà Nội', 'Quận 3, TP.HCM', 'Ninh Kiều, Cần Thơ', 'Hải Châu, Đà Nẵng', 'TP. Huế', 'Thủ Đức, TP.HCM', 'Đống Đa, Hà Nội', 'Biên Hòa, Đồng Nai', 'TP. Vinh, Nghệ An', 'Lê Chân, Hải Phòng'];

/* ---------- economy (giá quy đổi cho game, gần với mặt bằng phòng khám tư) ---------- */
const START_MONEY = 5000000, EXAM_FEE = 100000, XRAY_COST = 20000, PANO_COST = 60000;
const SUPPLIES = {
  gloves: { name: 'Găng tay & khẩu trang', unit: 'bộ', pack: 50, price: 400000 },
  lido: { name: 'Thuốc tê Lidocaine 2% + Epinephrine', unit: 'ống', pack: 50, price: 750000 },
  mepi: { name: 'Thuốc tê Mepivacaine 3%', unit: 'ống', pack: 50, price: 900000 },
  etch: { name: 'Axit etching phosphoric 37%', unit: 'lần', pack: 20, price: 160000 },
  bond: { name: 'Keo dán (bond)', unit: 'lần', pack: 40, price: 1000000 },
  comp: { name: 'Composite màu A2', unit: 'lần', pack: 8, price: 640000 },
  bur: { name: 'Bộ mũi khoan', unit: 'ca', pack: 15, price: 750000 },
  paste: { name: 'Sò đánh bóng', unit: 'lần', pack: 40, price: 200000 },
  chx: { name: 'Chlorhexidine 0,12% súc miệng', unit: 'lần', pack: 30, price: 150000 },
  niti: { name: 'Trâm NiTi máy', unit: 'ca', pack: 4, price: 1200000 },
  irrig: { name: 'Bơm rửa NaOCl 3% & EDTA 17%', unit: 'ca', pack: 15, price: 450000 },
  obtu: { name: 'Gutta-percha, côn giấy & xi măng trám bít', unit: 'ca', pack: 8, price: 960000 },
  gic: { name: 'Xi măng GIC trám kín', unit: 'lần', pack: 20, price: 600000 },
  gauze: { name: 'Gạc vô trùng', unit: 'miếng', pack: 50, price: 200000 },
  blade: { name: 'Lưỡi dao mổ số 15', unit: 'lưỡi', pack: 20, price: 300000 },
  suture: { name: 'Chỉ khâu tự tiêu 4-0', unit: 'sợi', pack: 12, price: 1080000 },
};
const START_STOCK = { gloves: 12, lido: 6, mepi: 3, etch: 6, bond: 6, comp: 4, bur: 5, paste: 6, chx: 6, niti: 0, irrig: 0, obtu: 0, gic: 0, gauze: 6, blade: 0, suture: 0 };
const unitCost = (k) => SUPPLIES[k].price / SUPPLIES[k].pack;
const EQUIP = {
  xray: { name: 'Máy X-quang quanh chóp', price: 12000000, lv: 1, desc: 'Chụp phim quanh chóp: chẩn đoán sâu răng, viêm tủy, tiêu xương.' },
  bp: { name: 'Máy đo huyết áp', price: 800000, lv: 1, desc: 'Đo huyết áp trước khi gây tê cho bệnh nhân tăng huyết áp, tim mạch.' },
  endo: { name: 'Bộ nội nha (định vị chóp + motor)', price: 25000000, lv: 2, desc: 'Bắt buộc để điều trị tủy.' },
  extract: { name: 'Bộ kìm & bẩy nhổ răng', price: 3000000, lv: 2, desc: 'Bắt buộc để nhổ răng thông thường.' },
  surgery: { name: 'Bộ phẫu thuật răng khôn', price: 18000000, lv: 3, desc: 'Tay khoan phẫu thuật, cây bóc tách, kìm kẹp kim. Bắt buộc để phẫu thuật răng khôn.' },
  pano: { name: 'Máy X-quang Panorama', price: 60000000, lv: 3, desc: 'Phim toàn cảnh: đánh giá răng khôn và ống thần kinh răng dưới.' },
};
const CHAIR_SLOTS = [{ price: 0, lv: 1 }, { price: 35000000, lv: 2 }, { price: 60000000, lv: 3 }];
const CHAIR_UP_PRICE = 15000000;
const ASSOC = { hire: 4000000, wage: 1000000, train: 10000000, names: ['BS. Hòa', 'BS. Ngân', 'BS. Khải'] };
const DECOR = {
  plant: { name: 'Chậu cây xanh', price: 400000, lv: 1, max: 4, desc: 'Bệnh nhân kiên nhẫn hơn 6% mỗi chậu.' },
  tv: { name: 'Tivi phòng chờ', price: 5000000, lv: 1, max: 1, desc: 'Chiếu phim hướng dẫn chải răng. Kiên nhẫn +15%.' },
  tank: { name: 'Bể cá cảnh', price: 7000000, lv: 2, max: 1, desc: 'Thư giãn trước khi khám. Kiên nhẫn +15%.' },
  sofa: { name: 'Sofa phòng chờ', price: 8000000, lv: 2, max: 1, desc: 'Thêm 2 chỗ ngồi chờ.' },
  ac: { name: 'Máy lạnh', price: 14000000, lv: 3, max: 1, desc: 'Kiên nhẫn +20%, uy tín tăng nhanh hơn.' },
};
const DAILY = { rent: 1000000, power: 300000, recep: 400000, upkeep: 0.001 };
const BANK = { perLevel: 20000000, rate: 0.01, overdraft: 0.02 };
const AUTO_TIME = { calculus: 28, caries: 36, pulpitis: 60, perio: 30, wisdom: 0 };

/* ---------- newbie quests ---------- */
const QUESTS = [
  { id: 'first', t: 'Điều trị bệnh nhân đầu tiên', money: 300000, xp: 10, ok: () => G.stats.treated >= 1 },
  { id: 'hx', t: 'Hỏi đủ bệnh toàn thân, dị ứng và thuốc đang dùng', money: 200000, xp: 10, ok: () => G.stats.fullHx >= 1 },
  { id: 'chart', t: 'Ghi phiếu khám đúng răng nguyên nhân', money: 200000, xp: 10, ok: () => G.stats.chartRight >= 1 },
  { id: 'stock', t: 'Nhập vật tư lần đầu', money: 100000, xp: 5, ok: () => G.stats.orders >= 1 },
  { id: 'star3', t: 'Hoàn thành một ca đạt 3 sao', money: 300000, xp: 15, ok: () => G.stats.perfect >= 1 },
  { id: 'xray', t: 'Mua máy X-quang quanh chóp', money: 1000000, xp: 15, ok: () => G.equip.xray },
  { id: 'day', t: 'Kết thúc ngày làm việc đầu tiên', money: 300000, xp: 10, ok: () => G.day >= 2 },
  { id: 'study', t: 'Làm bài tự kiểm tra trong Phác đồ đạt điểm tối đa', money: 300000, xp: 15, ok: () => Object.values(G.quiz || {}).some((v) => v >= 1) },
  { id: 'lv2', t: 'Đạt cấp 2', money: 500000, xp: 0, ok: () => G.level >= 2 },
  { id: 'chair', t: 'Mua ghế nha khoa thứ 2', money: 1500000, xp: 20, ok: () => G.chairs >= 2 },
  { id: 'assoc', t: 'Thuê bác sĩ cộng sự', money: 500000, xp: 20, ok: () => G.assoc.some(Boolean) },
];
