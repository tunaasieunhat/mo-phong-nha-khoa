/* ================== ASSETS 2: characters (front-facing chibi, layered body + head) ==================
   Body box 64 x 100, feet anchor at (32, 98). Head box 48 x 52, head centre at (24, 28). */
const CHAR = { looks: [], img: {} };
const SK = ['#f8d5b5', '#efc29a', '#ddaa7c', '#c68f62'];
const HAIRC = ['#2b1a10', '#3d2414', '#5a3a1e', '#1d1d24', '#7a4a22'];
const SHIRTS = ['#ef6f6c', '#5fb3e8', '#f6c344', '#8fd16a', '#b48ae6', '#f28fb5', '#4fcfb8', '#ff9f43', '#7b8ce0'];
const PANTSC = ['#3f5f8f', '#5b4636', '#2f3a4f', '#6a6f7c', '#8a6a4a'];
const so = `stroke="${OUT}" stroke-opacity=".65" stroke-width="1.3" stroke-linejoin="round"`;

function bodySvg(L, pose) {
  let s = ''; const sit = pose === 'sit', dy = sit ? 8 : 0;
  const leg = (x, y1, y2) => `<rect x="${x}" y="${y1}" width="8" height="${y2 - y1}" rx="4" fill="${L.pants}" ${so}/><ellipse cx="${x + 4}" cy="${y2 + 1}" rx="5.6" ry="3.2" fill="${L.shoes}" ${so}/>`;
  if (sit) s += `<ellipse cx="25" cy="88" rx="7" ry="6" fill="${L.pants}" ${so}/><ellipse cx="39" cy="88" rx="7" ry="6" fill="${L.pants}" ${so}/>` + leg(21, 88, 95) + leg(35, 88, 95);
  else if (pose[0] === 'w') { const ph = +pose.slice(1) / 8 * Math.PI * 2, a = Math.max(0, Math.sin(ph)), b = Math.max(0, -Math.sin(ph)); s += leg(23, 74 - 2 * a, 95 - 4.5 * a + b) + leg(33, 74 - 2 * b, 95 - 4.5 * b + a); }
  else s += leg(23, 74, 95) + leg(33, 74, 95);
  const coatLen = L.coat ? 88 : 80;
  s += `<rect x="29" y="${45 + dy}" width="6" height="8" fill="${L.skin}"/>`;
  s += `<path d="M19,${58 + dy} Q19,${49 + dy} 28,${48 + dy} L36,${48 + dy} Q45,${49 + dy} 45,${58 + dy} L45,${(sit ? 84 : coatLen) - 2} Q45,${(sit ? 84 : coatLen)} 42,${(sit ? 84 : coatLen)} L22,${(sit ? 84 : coatLen)} Q19,${(sit ? 84 : coatLen)} 19,${(sit ? 84 : coatLen) - 2} Z" fill="${L.coat ? '#ffffff' : L.shirt}" ${so}/>`;
  if (L.coat) s += `<path d="M28,${48 + dy} L32,${60 + dy} L36,${48 + dy} Z" fill="${L.shirt}"/><path d="M32,${60 + dy} L32,${(sit ? 84 : coatLen)}" stroke="#c9d6dc" stroke-width="1.2"/><rect x="36" y="${62 + dy}" width="6" height="4" rx="1" fill="#4fb5e8"/><path d="M22,${70 + dy} h7" stroke="#c9d6dc" stroke-width="1.4"/>`;
  else s += `<path d="M28,${48 + dy} L32,${54 + dy} L36,${48 + dy}" fill="${L.skin}" stroke="${hx(L.shirt, -0.25)}" stroke-width="1.2"/><path d="M20,${(sit ? 80 : 74)} h24" stroke="${hx(L.shirt, -0.18)}" stroke-width="2" opacity=".5"/>`;
  if (L.tag) s += `<rect x="23" y="${57 + dy}" width="7" height="4" rx="1" fill="${L.tag}"/>`;
  const sleeve = L.coat ? '#ffffff' : hx(L.shirt, -0.06);
  if (sit) s += `<path d="M19,${52 + dy} Q13,${64 + dy} 22,${76 + dy}" stroke="${sleeve}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M45,${52 + dy} Q51,${64 + dy} 42,${76 + dy}" stroke="${sleeve}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="24" cy="${78 + dy}" r="3.8" fill="${L.skin}" ${so}/><circle cx="40" cy="${78 + dy}" r="3.8" fill="${L.skin}" ${so}/>`;
  else {
    const sw = pose[0] === 'w' ? 3 * Math.sin(+pose.slice(1) / 8 * Math.PI * 2) : 0;
    s += `<rect x="13" y="51" width="7" height="${20 + sw}" rx="3.5" fill="${sleeve}" ${so}/><rect x="44" y="51" width="7" height="${20 - sw}" rx="3.5" fill="${sleeve}" ${so}/><circle cx="16.5" cy="${73 + sw}" r="3.8" fill="${L.skin}" ${so}/><circle cx="47.5" cy="${73 - sw}" r="3.8" fill="${L.skin}" ${so}/>`;
  }
  return svgDoc(0, 0, 64, 100, s, '', 2);
}
function headSvg(L, mood) {
  let s = ''; const hs = L.hs, hc = L.hair, sk = L.skin;
  const defs = `<radialGradient id="fg" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="${hx(sk, 0.18)}"/><stop offset="1" stop-color="${sk}"/></radialGradient>`;
  if (hs === 2) s += `<path d="M8,26 Q6,48 12,50 L36,50 Q42,48 40,26 Z" fill="${hc}" ${so}/>`;
  if (hs === 4) s += `<path d="M8,24 Q6,40 11,42 L37,42 Q42,40 40,24 Z" fill="${hc}" ${so}/>`;
  if (hs === 3) s += `<circle cx="24" cy="9" r="7" fill="${hc}" ${so}/>`;
  s += `<circle cx="9.5" cy="30" r="3.4" fill="${sk}" ${so}/><circle cx="38.5" cy="30" r="3.4" fill="${sk}" ${so}/>`;
  s += `<circle cx="24" cy="28" r="15" fill="url(#fg)" ${so}/>`;
  if (mood === 'pain') s += `<ellipse cx="35" cy="34" rx="6" ry="5.5" fill="${hx(sk, -0.04)}" ${so}/>`;
  // hair front
  if (hs === 9) s += `<path d="M8.5,25 Q9,10 24,10 Q39,10 39.5,25 Q32,20 24,20.5 Q16,20 8.5,25 Z" fill="${L.cap}" ${so}/><path d="M12,16 q12,-5 24,0" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" fill="none"/>`;
  else if (hs === 0) s += `<path d="M9,27 Q8,12 24,11 Q40,12 39,27 Q37,19 30,18 Q24,22 17,18 Q11,20 9,27 Z" fill="${hc}" ${so}/>`;
  else if (hs === 1) s += `<path d="M9,28 Q8,11 25,11 Q41,12 39,26 Q36,16 22,19 Q14,20 9,28 Z" fill="${hc}" ${so}/><path d="M22,13 q-4,4 -6,9" stroke="${hx(hc, 0.25)}" stroke-width="1.4" fill="none"/>`;
  else if (hs === 5) s += `<path d="M9,27 Q9,17 15,15 Q12,22 12,28 Z M39,27 Q39,17 33,15 Q36,22 36,28 Z" fill="${hc}" ${so}/><path d="M16,14 q8,-3 16,0" stroke="${hc}" stroke-width="2" fill="none"/>`;
  else s += `<path d="M8.5,30 Q7,11 24,11 Q41,11 39.5,30 Q37,20 31,18 Q24,23 16,19 Q11,21 8.5,30 Z" fill="${hc}" ${so}/>`;
  // brows + eyes
  const ink = '#3a2210';
  if (mood === 'angry') s += `<path d="M14,22 l7,3 M34,22 l-7,3" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
  else if (mood === 'pain') s += `<path d="M14,24 l6,-2 M34,24 l-6,-2" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>`;
  else s += `<path d="M15,23 q3,-2 6,0 M27,23 q3,-2 6,0" stroke="${hx(hc, 0.1)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if (mood === 'happy') s += `<path d="M15,30 q3,-4 6,0 M27,30 q3,-4 6,0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  else if (mood === 'pain') s += `<path d="M15,28 l5,2 l-5,2" stroke="${ink}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="30" cy="30" rx="2.2" ry="2.8" fill="${ink}"/><path d="M13,33 q-1,3 0,5" stroke="#7fd0f5" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  else s += `<ellipse cx="18" cy="30" rx="2.3" ry="2.9" fill="${ink}"/><ellipse cx="30" cy="30" rx="2.3" ry="2.9" fill="${ink}"/><circle cx="18.8" cy="29" r=".9" fill="#fff"/><circle cx="30.8" cy="29" r=".9" fill="#fff"/>`;
  if (L.glasses) s += `<circle cx="18" cy="30" r="5" fill="none" stroke="#3c4650" stroke-width="1.4"/><circle cx="30" cy="30" r="5" fill="none" stroke="#3c4650" stroke-width="1.4"/><path d="M23,30 h2" stroke="#3c4650" stroke-width="1.4"/>`;
  // cheeks + mouth / mask
  if (L.mask) s += `<path d="M13,32 Q24,30 35,32 L34,40 Q24,44 14,40 Z" fill="#cdeefa" ${so}/><path d="M15,35 h18 M16,38 h16" stroke="#9fcfe3" stroke-width="1"/><path d="M13,33 L9,30 M35,33 L39,30" stroke="#cdeefa" stroke-width="1.4"/>`;
  else {
    s += `<ellipse cx="13.5" cy="35" rx="3" ry="2" fill="#ff8a8a" opacity=".4"/><ellipse cx="34.5" cy="35" rx="3" ry="2" fill="#ff8a8a" opacity=".4"/>`;
    if (mood === 'happy') s += `<path d="M19,35 q5,6 10,0 Z" fill="#9b2c2c" stroke="${ink}" stroke-width="1.2" stroke-linejoin="round"/>`;
    else if (mood === 'pain') s += `<path d="M18,37 q2,-2 4,0 q2,2 4,0 q2,-2 4,0" stroke="${ink}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    else if (mood === 'angry') s += `<path d="M19,38 q5,-4 10,0" stroke="${ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    else s += `<path d="M20,36 q4,2.5 8,0" stroke="${ink}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  }
  if (mood === 'pain') s += `<circle cx="40" cy="37" r="5" fill="${sk}" ${so}/><path d="M37,33 l-2,-3 M40,32 l0,-3.5 M43,33 l2,-3" stroke="${sk}" stroke-width="2.6" stroke-linecap="round"/><path d="M44,22 l3,-3 M46,27 l4,-1" stroke="#ec5b4b" stroke-width="1.6" stroke-linecap="round"/>`;
  if (mood === 'angry') s += `<path d="M38,12 l3,-3 l1,4 l3,-2" stroke="#ec5b4b" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  return svgDoc(0, 0, 48, 52, s, defs, 2);
}
function makeLooks() {
  const r = mulberry(2024), L = [];
  for (let k = 0; k < 14; k++) {
    const f = k % 2 === 1, old = k >= 11;
    L.push({ id: 'p' + k, g: f ? 'f' : 'm', old, skin: SK[Math.floor(r() * SK.length)], hair: old ? '#b9b4ad' : HAIRC[Math.floor(r() * HAIRC.length)], hs: f ? [2, 3, 4][Math.floor(r() * 3)] : old ? 5 : [0, 1][Math.floor(r() * 2)], shirt: SHIRTS[k % SHIRTS.length], pants: PANTSC[Math.floor(r() * PANTSC.length)], shoes: r() < 0.5 ? '#3c2a1a' : '#f4f1e6', glasses: r() < 0.22 });
  }
  return L;
}
const STAFF = {
  doc_m: { id: 'doc_m', g: 'm', skin: '#f3cfae', hair: '#2b1a10', hs: 9, cap: '#5cc7b2', shirt: '#5cc7b2', pants: '#5cc7b2', shoes: '#f4f1e6', coat: true, mask: true, tag: '#ffcb3d' },
  doc_f: { id: 'doc_f', g: 'f', skin: '#f6d3b3', hair: '#3d2414', hs: 9, cap: '#f28fb5', shirt: '#f28fb5', pants: '#f28fb5', shoes: '#f4f1e6', coat: true, mask: true, tag: '#ffcb3d' },
  assoc: { id: 'assoc', g: 'm', skin: '#efc29a', hair: '#1d1d24', hs: 9, cap: '#4a7fd6', shirt: '#4a7fd6', pants: '#4a7fd6', shoes: '#f4f1e6', mask: true },
  recep: { id: 'recep', g: 'f', skin: '#f6d3b3', hair: '#3d2414', hs: 3, shirt: '#7fd6c8', pants: '#3f5f8f', shoes: '#3c2a1a', tag: '#ffffff' },
};
function charJobs() {
  CHAR.looks = makeLooks(); const jobs = [];
  const all = CHAR.looks.concat(Object.values(STAFF));
  for (const L of all) {
    const poses = L.id.startsWith('p') ? ['stand', 'sit', 'w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'] : ['stand'];
    const moods = L.id.startsWith('p') ? ['calm', 'pain', 'happy', 'angry'] : ['calm', 'happy'];
    poses.forEach((p) => jobs.push([L.id + '|' + p, () => bodySvg(L, p)]));
    moods.forEach((m) => jobs.push([L.id + '|h|' + m, () => headSvg(L, m)]));
  }
  return jobs;
}
function drawChar(ctx, L, x, y, o = {}) {
  const pose = o.pose || 'stand', mood = o.mood || 'calm', s = o.scale || 0.62;
  const b = CHAR.img[L.id + '|' + pose] || CHAR.img[L.id + '|stand'], h = CHAR.img[L.id + '|h|' + mood] || CHAR.img[L.id + '|h|calm'];
  if (!o.noShadow) { ctx.fillStyle = 'rgba(30,50,10,.2)'; ctx.beginPath(); ctx.ellipse(x, y, 13, 5.5, 0, 0, 7); ctx.fill(); }
  const z = o.z || 0, bob = o.bob || 0;
  if (b) ctx.drawImage(b, x - 32 * s, y - z - 98 * s - bob, 64 * s, 100 * s);
  const hy = pose === 'sit' ? 54 : 62;
  if (h) ctx.drawImage(h, x - 24 * s + (o.dir || 0), y - z - (hy + 28) * s - bob * 1.3, 48 * s, 52 * s);
}
