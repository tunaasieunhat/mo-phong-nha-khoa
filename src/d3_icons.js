/* ================== ASSETS 3: instrument / supply icons (48 x 48 SVG) + tool metadata ================== */
const I = (b) => `<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const ST = '#55636e', ST2 = '#7b8a96', MET = '#c9d3db';
const ICONS = {
  mirror: I(`<path d="M19 19L41 41" stroke="${ST2}" stroke-width="4.5"/><circle cx="13" cy="13" r="9" fill="#d6effa" stroke="${ST}" stroke-width="3"/><path d="M9 10a5 5 0 0 1 4-3" stroke="#fff" stroke-width="2.5"/><path d="M29 7c4 0 5 4 2 6L43 44" stroke="${ST}" stroke-width="2.5"/>`),
  probe: I(`<path d="M8 42L30 20" stroke="${ST2}" stroke-width="5"/><path d="M30 20L36 14Q40 10 41 5" stroke="${ST}" stroke-width="2.5"/><path d="M37.5 11l2 1.2M39 8l2 1" stroke="#1d1d24" stroke-width="2.6"/>`),
  cold: I(`<path d="M16 6v24M5 18h22M8 9l16 18M24 9L8 27" stroke="#4fb5e8" stroke-width="3"/><circle cx="34" cy="34" r="8" fill="#e6f7ff" stroke="#4fb5e8" stroke-width="2.5"/><path d="M30 33l3 3 5-5" stroke="#4fb5e8" stroke-width="2"/>`),
  perc: I(`<path d="M10 40L30 20" stroke="${ST2}" stroke-width="5"/><circle cx="34" cy="16" r="6" fill="#d6effa" stroke="${ST}" stroke-width="2.6"/><path d="M8 18l-4-2M10 12L7 8M15 9l-1-4" stroke="#ec5b4b" stroke-width="2.4"/>`),
  mob: I(`<path d="M17 10q7-4 14 0q5 3 3 12l-2 16q-1 4-3 1l-2-9-2 9q-2 3-3-1l-2-16q-2-9 0-12z" fill="#fff" stroke="${ST}" stroke-width="2.4"/><path d="M4 24h7M8 20l-4 4 4 4M44 24h-7M40 20l4 4-4 4" stroke="#ffb020" stroke-width="2.6"/>`),
  bp: I(`<rect x="4" y="16" width="24" height="16" rx="6" fill="#4a7fd6" stroke="${ST}" stroke-width="2.4"/><circle cx="35" cy="14" r="9" fill="#fff" stroke="${ST}" stroke-width="2.4"/><path d="M35 14l4-4" stroke="#ec5b4b" stroke-width="2"/><path d="M28 26q8 0 8 10" stroke="${ST}" stroke-width="2"/><ellipse cx="37" cy="40" rx="5" ry="4" fill="#3c4650"/>`),
  xray: I(`<rect x="6" y="9" width="36" height="30" rx="4" fill="#2a2f36" stroke="${ST}" stroke-width="3"/><path d="M17 15c-3 0-4 4-3 9 1 4 1 9 3 9 2 0 2-5 3-6 1 1 1 6 3 6 2 0 2-5 3-9 1-5 0-9-3-9-2 0-2 1-3 1s-1-1-3-1z" fill="#e8eef2"/><circle cx="34" cy="17" r="3" fill="#ffe28a"/>`),
  pano: I(`<rect x="20" y="8" width="8" height="36" rx="2" fill="#f4f7f8" stroke="${ST}" stroke-width="2.4"/><path d="M8 12q16-10 32 0v6q-16-9-32 0z" fill="#e8eef2" stroke="${ST}" stroke-width="2.4"/><rect x="6" y="16" width="5" height="14" rx="2" fill="#4a7fd6"/><rect x="37" y="16" width="5" height="14" rx="2" fill="#dfe6ea" stroke="${ST}"/><rect x="12" y="42" width="24" height="4" rx="2" fill="${MET}"/>`),
  cotton: I(`<rect x="5" y="10" width="24" height="9" rx="4.5" fill="#fff" stroke="#c9d3db" stroke-width="2.4"/><rect x="5" y="23" width="24" height="9" rx="4.5" fill="#fff" stroke="#c9d3db" stroke-width="2.4"/><path d="M33 40q6-14 10-30" stroke="#7fd0f5" stroke-width="5"/>`),
  hs: I(`<path d="M8 42L30 20" stroke="${MET}" stroke-width="6"/><path d="M8 42L30 20" stroke="${ST2}" stroke-width="1.5"/><path d="M28 18l8-4 2 4-6 6z" fill="#9aa7b2" stroke="${ST}" stroke-width="2"/><path d="M37 12l5-5" stroke="#ffcb3d" stroke-width="2.6"/>`),
  ls: I(`<path d="M8 42L26 24" stroke="#3fb6a8" stroke-width="8"/><path d="M26 24l10-10" stroke="${ST2}" stroke-width="5"/><path d="M36 14l3-3" stroke="${ST}" stroke-width="2"/><circle cx="41" cy="9" r="3" fill="#c9a227" stroke="${ST}" stroke-width="1.2"/>`),
  explorer: I(`<path d="M10 38L34 14" stroke="${ST2}" stroke-width="4"/><path d="M34 14q6-6 3-10q-3-1-4 3" stroke="${ST}" stroke-width="2.2"/><path d="M10 38q-5 4-3 7" stroke="${ST}" stroke-width="2.2"/>`),
  etch: I(`<path d="M12 40l18-18" stroke="#2b7fb0" stroke-width="9"/><path d="M30 22l9-9" stroke="${ST2}" stroke-width="3"/><circle cx="41" cy="11" r="3.5" fill="#4fb5e8"/><path d="M12 40l18-18" stroke="#7fd0f5" stroke-width="4"/>`),
  air: I(`<path d="M6 42l16-16" stroke="${ST2}" stroke-width="6"/><path d="M22 26l10-10" stroke="${ST}" stroke-width="3"/><path d="M35 9c2 1 2 3 0 4M39 6c3 2 3 7 0 9M43 4c4 3 4 9 0 12" stroke="#4fb5e8" stroke-width="2.5"/>`),
  bond: I(`<rect x="6" y="20" width="14" height="20" rx="4" fill="#fff4b8" stroke="#d89a12" stroke-width="2.4"/><rect x="9" y="15" width="8" height="6" rx="2" fill="#d89a12"/><path d="M24 40l14-24" stroke="#f2a03d" stroke-width="3"/><circle cx="39" cy="14" r="3.5" fill="#fff4b8" stroke="#d89a12" stroke-width="2"/>`),
  light: I(`<path d="M6 40l18-18" stroke="#3c4650" stroke-width="7"/><path d="M24 22c4-6 10-10 16-10" stroke="${ST}" stroke-width="5"/><circle cx="42" cy="9" r="4" fill="#5b7cff"/><path d="M38 4l-2-3M46 6l2-3" stroke="#5b7cff" stroke-width="2"/>`),
  comp: I(`<rect x="6" y="17" width="26" height="14" rx="4" fill="#f6eedb" stroke="#a8692f" stroke-width="2.5"/><path d="M32 24h7l4-3" stroke="${ST}" stroke-width="3"/><path d="M12 24h12" stroke="#d9c7a3" stroke-width="3"/><text x="10" y="14" font-size="8" font-weight="800" fill="#a8692f" font-family="Nunito,sans-serif">A2</text>`),
  paper: I(`<rect x="18" y="6" width="12" height="30" rx="2" fill="#4a7fd6" stroke="${ST}" stroke-width="2"/><path d="M18 22h12" stroke="#ec5b4b" stroke-width="6"/><path d="M22 36l-6 8M26 36l6 8" stroke="${ST2}" stroke-width="3"/>`),
  finish: I(`<path d="M10 40L30 20" stroke="${MET}" stroke-width="6"/><path d="M30 20l8-8" stroke="${ST}" stroke-width="3.4"/><path d="M33 17l3 3" stroke="#ec5b4b" stroke-width="3"/><path d="M38 12l4-4" stroke="#c9a227" stroke-width="3.5"/>`),
  polish: I(`<path d="M8 40l20-20" stroke="${ST2}" stroke-width="6"/><path d="M28 20l6-6" stroke="${ST}" stroke-width="3"/><circle cx="37" cy="11" r="6" fill="#f28fb5" stroke="#b5446f" stroke-width="2.5"/><path d="M42 20l2 2M44 16h3" stroke="#ffcb3d" stroke-width="2"/>`),
  syringe: I(`<path d="M30 6l12 12M36 12l-6 6" stroke="${ST}" stroke-width="3"/><rect x="14" y="14" width="10" height="24" rx="2" fill="#cfeefb" stroke="${ST}" stroke-width="2.5" transform="rotate(45 19 26)"/><path d="M13 35L4 44" stroke="${ST2}" stroke-width="2"/><path d="M17 26l6 6" stroke="#4fb5e8" stroke-width="4"/>`),
  dam: I(`<rect x="7" y="7" width="34" height="34" rx="6" fill="#7fd6a0" stroke="#2f8a57" stroke-width="3"/><circle cx="24" cy="24" r="5" fill="#fff" stroke="#2f8a57" stroke-width="2.5"/><path d="M16 18l-3-3M32 18l3-3M18 24h-4M30 24h4" stroke="${ST}" stroke-width="3"/>`),
  dg16: I(`<path d="M6 42L42 6" stroke="${ST2}" stroke-width="3.4"/><path d="M42 6l3-1M6 42l-3 1" stroke="${ST}" stroke-width="2"/><rect x="18" y="18" width="12" height="12" rx="3" transform="rotate(-45 24 24)" fill="#ffcb3d" stroke="${ST}" stroke-width="2"/>`),
  apex: I(`<rect x="4" y="8" width="26" height="22" rx="4" fill="#3c4650" stroke="${ST}" stroke-width="2.4"/><rect x="8" y="12" width="18" height="10" rx="2" fill="#a6f0c6"/><path d="M10 20v-4M14 20v-6M18 20v-3M22 20v-5" stroke="#2f8a57" stroke-width="2"/><path d="M36 6v36" stroke="${ST2}" stroke-width="2.4"/><rect x="32" y="4" width="8" height="6" rx="2" fill="#ffcb3d"/><path d="M30 26q4 0 6 4" stroke="#ec5b4b" stroke-width="1.6"/>`),
  niti: I(`<path d="M10 40L28 22" stroke="#4a7fd6" stroke-width="8"/><path d="M28 22l6-6" stroke="${ST}" stroke-width="4"/><path d="M34 16l8-8" stroke="${ST2}" stroke-width="2"/><path d="M36 14l2 2M38 12l2 2M40 10l2 2" stroke="${ST}" stroke-width="1.4"/><rect x="31" y="15" width="5" height="4" fill="#ec5b4b" transform="rotate(-45 33 17)"/>`),
  irrig: I(`<rect x="8" y="10" width="24" height="10" rx="2" fill="#e6f7ff" stroke="${ST}" stroke-width="2.5"/><path d="M12 15h14" stroke="#9fe0ff" stroke-width="4"/><path d="M32 15h6l5 6" stroke="${ST}" stroke-width="2"/><path d="M3 15h5" stroke="${ST}" stroke-width="3"/><circle cx="40" cy="30" r="2.5" fill="#9fe0ff"/><circle cx="36" cy="37" r="2" fill="#9fe0ff"/><circle cx="43" cy="39" r="1.6" fill="#9fe0ff"/>`),
  ppoint: I(`<path d="M16 6l2 34M24 4l1 38M32 6l-1 34" stroke="#fffdf5" stroke-width="4"/><path d="M16 6l2 34M24 4l1 38M32 6l-1 34" stroke="#d9c7a3" stroke-width="1"/>`),
  gp: I(`<path d="M24 6l2 36h-4z" fill="#f08a24" stroke="#b55d0d" stroke-width="2"/><rect x="18" y="4" width="12" height="5" rx="2" fill="#f08a24" stroke="#b55d0d" stroke-width="2"/><path d="M33 12l2 26M14 14l1 22" stroke="#f6b26b" stroke-width="3"/>`),
  plugger: I(`<path d="M8 40L30 18" stroke="#3c4650" stroke-width="8"/><path d="M30 18l10-10" stroke="${ST2}" stroke-width="2.6"/><circle cx="41" cy="7" r="3" fill="#ff8a3d"/><path d="M36 4l-2-2M45 11l2 2" stroke="#ff8a3d" stroke-width="2"/>`),
  gic: I(`<rect x="6" y="14" width="16" height="22" rx="3" fill="#fff" stroke="${ST}" stroke-width="2.4"/><rect x="6" y="14" width="16" height="6" fill="#4fb5e8"/><path d="M26 38L42 14" stroke="${ST2}" stroke-width="3"/><path d="M40 12l4-2-1 5z" fill="${MET}" stroke="${ST}"/>`),
  swab: I(`<path d="M10 40L32 18" stroke="#e8d7a8" stroke-width="3"/><ellipse cx="36" cy="14" rx="7" ry="5" transform="rotate(-45 36 14)" fill="#b5651d" stroke="#7a3e10" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#b5651d" opacity=".5"/>`),
  scalpel: I(`<path d="M6 42L26 22" stroke="${ST2}" stroke-width="5"/><path d="M26 22q8-10 16-12q-2 8-12 16z" fill="${MET}" stroke="${ST}" stroke-width="2"/>`),
  periosteal: I(`<path d="M10 38L32 16" stroke="${ST2}" stroke-width="5"/><path d="M32 16l6-8 3 3-8 6z" fill="${MET}" stroke="${ST}" stroke-width="2"/><path d="M10 38l-5 3 2 2 5-3z" fill="${MET}" stroke="${ST}" stroke-width="2"/>`),
  surgdrill: I(`<path d="M6 34h24" stroke="${MET}" stroke-width="9"/><path d="M6 34h24" stroke="${ST2}" stroke-width="2"/><path d="M30 34h12" stroke="${ST}" stroke-width="2.6"/><circle cx="43" cy="34" r="2" fill="#c9a227"/><path d="M12 28q2-14 14-16" stroke="#7fd0f5" stroke-width="2"/><circle cx="28" cy="12" r="2" fill="#7fd0f5"/>`),
  zekrya: I(`<path d="M8 40L24 24" stroke="${MET}" stroke-width="5"/><path d="M24 24L42 6" stroke="#c9a227" stroke-width="3.2"/><path d="M28 20l2 2M32 16l2 2M36 12l2 2" stroke="${ST}" stroke-width="1.4"/>`),
  elevator: I(`<rect x="4" y="30" width="20" height="10" rx="5" fill="#ffcb3d" stroke="#a8692f" stroke-width="2.5" transform="rotate(-45 14 35)"/><path d="M21 27L38 10" stroke="${ST2}" stroke-width="4"/><path d="M38 10q4-2 5 2" stroke="${ST}" stroke-width="3"/>`),
  forceps: I(`<path d="M8 44c6-10 10-16 14-22M20 44c-2-10 0-16 4-22" stroke="${ST2}" stroke-width="4"/><path d="M22 22c2-6 4-10 9-14M24 22c4-4 8-7 13-8" stroke="${ST}" stroke-width="3.5"/>`),
  curette: I(`<path d="M8 40L32 16" stroke="${ST2}" stroke-width="4"/><path d="M32 16l4-4" stroke="${ST}" stroke-width="2.5"/><ellipse cx="39" cy="9" rx="4" ry="6" transform="rotate(45 39 9)" fill="${MET}" stroke="${ST}" stroke-width="2"/>`),
  saline: I(`<rect x="6" y="18" width="26" height="10" rx="2" fill="#f4fbff" stroke="${ST}" stroke-width="2.4"/><path d="M32 23h10" stroke="${ST}" stroke-width="2"/><path d="M42 27v6M40 36v4M44 35v3" stroke="#7fd0f5" stroke-width="2.4"/><text x="9" y="26" font-size="6" font-weight="800" fill="#2b7fb0" font-family="Nunito,sans-serif">NaCl</text>`),
  needle: I(`<path d="M6 42c8-8 12-14 16-20M16 44c-1-8 2-14 8-20" stroke="${ST2}" stroke-width="3.6"/><path d="M24 22l6-6" stroke="${ST}" stroke-width="3"/><path d="M30 16a8 8 0 1 1 10 2" stroke="${ST}" stroke-width="2"/><path d="M40 18q4 10-6 20" stroke="#4a7fd6" stroke-width="1.6"/>`),
  gauze: I(`<rect x="9" y="12" width="30" height="24" rx="5" fill="#fff" stroke="${ST2}" stroke-width="2.5"/><path d="M9 20h30M9 28h30M17 12v24M25 12v24M33 12v24" stroke="#dfe6ea" stroke-width="1.5"/>`),
  rinse: I(`<path d="M12 12h24l-3 30H15z" fill="#e6f7ff" stroke="${ST}" stroke-width="2.6"/><path d="M14 24h20l-2 17H16z" fill="#f2a6c8"/><path d="M14 24h20" stroke="#fff" stroke-width="1.5"/>`),
  scaler: I(`<path d="M6 42l18-18" stroke="#e9eef2" stroke-width="8"/><path d="M6 42l18-18" stroke="${ST2}" stroke-width="2"/><path d="M24 24l8-8q4-2 6 2" stroke="${ST}" stroke-width="3"/><circle cx="41" cy="23" r="1.8" fill="#4fb5e8"/><circle cx="44" cy="28" r="1.5" fill="#4fb5e8"/>`),
  gracey: I(`<path d="M10 40L30 20" stroke="#4fb5e8" stroke-width="5"/><path d="M30 20l6-6q4-2 4 2q0 3-3 3" stroke="${ST}" stroke-width="2.4"/><path d="M10 40l-4 4" stroke="${ST}" stroke-width="2.4"/>`),
  pbrush: I(`<path d="M8 40l20-20" stroke="${ST2}" stroke-width="6"/><path d="M28 20l5-5" stroke="${ST}" stroke-width="3"/><path d="M33 9l6 6M35 7l6 6M31 11l6 6" stroke="#fff" stroke-width="2.2"/><circle cx="40" cy="22" r="4" fill="#f6b6cf" stroke="#b5446f" stroke-width="1.4"/>`),
  brush: I(`<path d="M6 40L32 14" stroke="#4fb5e8" stroke-width="5"/><rect x="30" y="4" width="10" height="16" rx="3" fill="#fff" stroke="#2b7fb0" stroke-width="2.5" transform="rotate(45 35 12)"/><path d="M34 6l6 6M31 9l6 6" stroke="#9fe0ff" stroke-width="2"/>`),
  glove: I(`<path d="M12 44V22q0-3 3-3t3 3v-8q0-3 3-3t3 3v-2q0-3 3-3t3 3v4q0-3 3-3t3 3v16q0 10-10 10z" fill="#bfe6f5" stroke="${ST}" stroke-width="2.2"/><rect x="26" y="4" width="18" height="9" rx="3" fill="#cdeefa" stroke="${ST}" stroke-width="1.6"/>`),
  cartridge: I(`<rect x="10" y="16" width="28" height="12" rx="5" fill="#e6f7ff" stroke="${ST}" stroke-width="2.4"/><rect x="14" y="16" width="6" height="12" fill="#4a7fd6"/><rect x="36" y="18" width="5" height="8" rx="1" fill="#9aa7b2"/><path d="M8 32h32" stroke="${ST2}" stroke-width="2" stroke-dasharray="2 3"/>`),
  bur: I(`<path d="M10 40V18M24 40V12M38 40V18" stroke="${MET}" stroke-width="3"/><circle cx="10" cy="14" r="4" fill="#c9a227"/><path d="M21 12l3-8 3 8z" fill="#9fd8c9" stroke="${ST}"/><rect x="35" y="10" width="6" height="8" rx="2" fill="#ec5b4b"/>`),
  chart: I(`<rect x="5" y="6" width="30" height="36" rx="4" fill="#fff" stroke="${ST}" stroke-width="2.6"/><path d="M10 15h20M10 33h20" stroke="#dfe6ea" stroke-width="2"/><circle cx="13" cy="24" r="3.4" fill="#ec5b4b"/><circle cx="21" cy="24" r="3.4" fill="#78c443"/><circle cx="29" cy="24" r="3.4" fill="#e0b72e"/><path d="M30 40l12-14 3 3-12 14-5 1z" fill="#ffcb3d" stroke="${ST}" stroke-width="2"/>`),
  protocol: I(`<path d="M10 6h22l6 6v30H10z" fill="#fff" stroke="#6e4019" stroke-width="3" stroke-linejoin="round"/><path d="M32 6v6h6" fill="none" stroke="#6e4019" stroke-width="3" stroke-linejoin="round"/><path d="M16 18h16M16 25h16M16 32h10" stroke="#a8692f" stroke-width="2.6" stroke-linecap="round"/><circle cx="35" cy="36" r="8" fill="#78c443" stroke="#4a8d22" stroke-width="2.4"/><path d="M31 36l3 3 5-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`),
  tv: I(`<rect x="5" y="9" width="38" height="26" rx="4" fill="#2b2f36" stroke="${ST}" stroke-width="2.4"/><rect x="9" y="13" width="30" height="18" rx="2" fill="#7fd0f5"/><path d="M18 40h12" stroke="${ST}" stroke-width="3"/>`),
};
const TOOLS = {
  mirror: ['Gương nha khoa', 'Soi và phóng to bề mặt răng (kính lúp), quan sát gián tiếp mặt trong, mặt xa.'],
  probe: ['Cây đo túi', 'Cây thăm dò nha chu có vạch mm: đo độ sâu túi lợi/túi quanh răng và chảy máu khi thăm khám.'],
  cold: ['Thử lạnh', 'Viên bông tẩm khí lạnh (Endo-Ice) đặt lên răng để đánh giá đáp ứng của tủy.'],
  perc: ['Gõ răng', 'Gõ dọc, gõ ngang bằng cán gương để đánh giá vùng quanh chóp.'],
  mob: ['Khám lung lay', 'Đánh giá độ lung lay của răng (độ 0 đến III).'],
  bp: ['Đo huyết áp', 'Đo huyết áp trước khi gây tê ở bệnh nhân tăng huyết áp, tim mạch.', 'bp'],
  xray: ['X-quang quanh chóp', 'Đánh giá mức độ sâu, buồng tủy, vùng quanh chóp và xương ổ răng.', 'xray'],
  pano: ['X-quang Panorama', 'Phim toàn cảnh: đánh giá răng khôn và ống thần kinh răng dưới.', 'pano'],
  cotton: ['Cuộn bông & hút nước bọt', 'Cô lập răng khỏi nước bọt khi trám.'],
  hs: ['Tay khoan nhanh', 'Tốc độ cao, mũi kim cương: mở đường vào lỗ sâu, mở tủy.'],
  ls: ['Tay khoan chậm', 'Tốc độ chậm, mũi khoan tròn: lấy sạch ngà mềm.'],
  explorer: ['Thám trâm', 'Rê đầu nhọn dọc rãnh mặt nhai: mắc và đáy mềm là lỗ sâu, trượt và cứng là nhiễm màu. Kiểm tra đáy xoang sau khi lấy ngà mềm.'],
  chart: ['Ghi sơ đồ răng', 'Chọn tình trạng rồi chạm vào răng để ghi lên phiếu khám (sơ đồ răng).'],
  etch: ['Axit etching 37%', 'Axit phosphoric 37%: xói mòn men ngà để tăng dán dính.'],
  air: ['Tay xịt hơi – nước', 'Rửa sạch axit, thổi khô nhẹ.'],
  bond: ['Keo dán (bond)', 'Bôi lớp dán dính lên thành và đáy xoang.'],
  light: ['Đèn quang trùng hợp', 'Ánh sáng xanh làm đông cứng bond và composite.'],
  comp: ['Composite', 'Vật liệu trám thẩm mỹ, đắp từng lớp ≤ 2 mm.'],
  paper: ['Giấy cắn', 'Kiểm tra khớp cắn, đánh dấu điểm chạm sớm.'],
  finish: ['Mũi khoan hoàn tất', 'Mài chỉnh điểm chạm sớm, tạo hình miếng trám.'],
  polish: ['Đài cao su đánh bóng', 'Đánh bóng miếng trám cho láng mịn.'],
  syringe: ['Bơm tiêm gây tê', 'Gây tê tại chỗ hoặc gây tê vùng (gai Spix).'],
  dam: ['Đê cao su & kẹp', 'Cách ly răng, chống nhiễm khuẩn, tránh rơi dụng cụ.'],
  dg16: ['Cây thăm dò DG16', 'Tìm miệng ống tủy trên sàn buồng tủy.'],
  apex: ['Định vị chóp + trâm K15', 'Xác định chiều dài làm việc của từng ống tủy.', 'endo'],
  niti: ['Trâm NiTi máy', 'Sửa soạn, tạo hình ống tủy đến chiều dài làm việc.', 'endo'],
  irrig: ['Bơm rửa NaOCl', 'Bơm rửa sát khuẩn, hòa tan mô tủy.'],
  ppoint: ['Côn giấy', 'Làm khô ống tủy trước khi trám bít.'],
  gp: ['Côn gutta-percha', 'Trám bít ống tủy cùng xi măng trám bít.'],
  plugger: ['Cây lèn nóng', 'Cắt côn ở miệng ống tủy và lèn chặt.'],
  gic: ['Xi măng GIC', 'Trám kín buồng tủy, trám lót.'],
  swab: ['Bông sát khuẩn', 'Sát khuẩn vùng can thiệp bằng Povidone iodine hoặc Chlorhexidine.'],
  scalpel: ['Dao mổ số 15', 'Rạch niêm mạc tạo vạt.'],
  periosteal: ['Cây bóc tách', 'Tách lợi khỏi cổ răng, bóc tách vạt niêm mạc – màng xương.'],
  surgdrill: ['Tay khoan phẫu thuật', 'Mở xương, có bơm nước muối sinh lý làm mát.', 'surgery'],
  zekrya: ['Mũi Zekrya', 'Mũi khoan dài để chia cắt thân và chân răng.', 'surgery'],
  elevator: ['Cây bẩy thẳng', 'Làm lung lay, nong rộng ổ răng và bẩy lấy răng.'],
  forceps: ['Kìm nhổ răng', 'Kẹp chắc thân/chân răng và lấy răng ra.', 'extract'],
  curette: ['Thìa nạo ổ răng', 'Nạo sạch mô viêm, mô hạt trong ổ răng.'],
  saline: ['Bơm rửa nước muối', 'Bơm rửa ổ răng bằng nước muối sinh lý.'],
  needle: ['Kìm kẹp kim & chỉ khâu', 'Khâu đóng vạt.', 'surgery'],
  gauze: ['Gạc vô trùng', 'Ép ổ răng và cắn gạc cầm máu.'],
  rinse: ['Cốc súc miệng', 'Súc miệng Chlorhexidine 0,12% trước thủ thuật.'],
  scaler: ['Máy cạo vôi siêu âm', 'Lấy cao răng trên lợi.'],
  gracey: ['Cây nạo Gracey', 'Lấy cao răng dưới lợi, làm láng mặt chân răng.'],
  pbrush: ['Chổi & sò đánh bóng', 'Đánh bóng, loại bỏ vết dính màu.'],
  brush: ['Bàn chải (hướng dẫn)', 'Hướng dẫn chải răng đúng phương pháp Bass.'],
};
const SUP_ICON = { gloves: 'glove', lido: 'cartridge', mepi: 'cartridge', etch: 'etch', bond: 'bond', comp: 'comp', bur: 'bur', paste: 'pbrush', chx: 'rinse', niti: 'niti', irrig: 'irrig', obtu: 'gp', gic: 'gic', gauze: 'gauze', blade: 'scalpel', suture: 'needle' };
const EQUIP_ICON = { xray: 'xray', bp: 'bp', endo: 'apex', extract: 'forceps', surgery: 'surgdrill', pano: 'pano' };
const icon = (k) => ICONS[k] || ICONS.mirror;
const toolName = (k) => (TOOLS[k] ? TOOLS[k][0] : k);

/* ---------- loader ---------- */
function svgToImg(svg) {
  return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
}
/* SVG images are re-rasterised on every draw in some browsers; drawing pre-rendered bitmaps is much faster */
function toBitmap(im) { if (!im) return null; try { const c = document.createElement('canvas'); c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height; c.getContext('2d').drawImage(im, 0, 0); return c; } catch (e) { return im; } }
async function loadAllAssets(onProgress) {
  const jobs = [];
  for (const k in ASSET_DEFS) jobs.push(['w:' + k, () => { const d = ASSET_DEFS[k](); ASSETS[k] = d; return d.svg; }]);
  for (const [k, fn] of charJobs()) jobs.push(['c:' + k, fn]);
  let done = 0;
  await Promise.all(jobs.map(async ([key, fn]) => {
    const svg = fn(); const im = await svgToImg(svg), bm = toBitmap(im);
    if (key.startsWith('w:')) { const a = ASSETS[key.slice(2)]; a.img = bm; a.url = im ? im.src : ''; } else CHAR.img[key.slice(2)] = bm;
    done++; if (onProgress) onProgress(done / jobs.length);
  }));
}
function drawAsset(ctx, key, x, y, o = {}) {
  const a = ASSETS[key]; if (!a || !a.img) return;
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.drawImage(a.img, x + a.x0, y + a.y0, a.w, a.h);
  if (o.alpha != null) ctx.globalAlpha = 1;
}
