"use strict";
/* ================== CORE: utils, state, save, audio ================== */
const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wpick = (arr) => { const tot = arr.reduce((s, x) => s + x.w, 0); let r = Math.random() * tot; for (const x of arr) { r -= x.w; if (r <= 0) return x; } return arr[0]; };
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
/* render quality: Q.scale lowers the canvas resolution on slow devices (auto) or by setting */
const Q = { scale: 1, ema: 16.7, evalT: 0, slow: 0, fast: 0 };
const DPR = () => Math.max(0.75, Math.min(window.devicePixelRatio || 1, 2) * Q.scale);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function money(n) { return Math.round(n).toLocaleString('vi-VN') + 'đ'; }
function moneyShort(n) {
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  if (a >= 1e9) return s + (a / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace('.', ',').replace(',0', '') + ' tỷ';
  if (a >= 1e6) return s + (a / 1e6).toFixed(a >= 1e8 ? 0 : 1).replace('.', ',').replace(',0', '') + 'tr';
  if (a >= 1e3) return s + Math.round(a / 1e3) + 'k';
  return s + Math.round(a) + 'đ';
}
function clock(min) { const h = Math.floor(min / 60), m = Math.floor(min % 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
const setText = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };

/* ---------- game state ---------- */
const SAVE_KEY = 'mpnk_v3';
function freshState() {
  return {
    v: 3, profile: { name: '', clinic: 'Nha Khoa Nụ Cười', g: 'm', school: '', set: false },
    money: START_MONEY, loan: 0, xp: 0, level: 1, rep: 3.0,
    day: 1, time: 8 * 60, dayDone: false,
    today: { patients: 0, revenue: 0, supply: 0, other: 0, angry: 0 },
    chairs: 1, chairLv: [1, 0, 0], assoc: [null, null, null],
    equip: { xray: false, bp: false, endo: false, extract: false, surgery: false, pano: false },
    decor: { plant: 0, tv: 0, tank: 0, sofa: 0, ac: 0 },
    stock: Object.assign({}, START_STOCK),
    quests: {}, tut: 0, newbie: 0, guideMin: false, quiz: {},
    log: [], fin: [],
    stats: { treated: 0, byType: {}, dxRight: 0, perfect: 0, orders: 0, fullHx: 0, referred: 0, chartRight: 0, wasteQ: 0, compl: 0 },
    settings: { sound: true, hints: true, guide: true, gfx: 'auto' },
  };
}
let G = { settings: { sound: true, hints: true, guide: true, gfx: 'auto' }, stats: {} };
function loadGame() {
  G = freshState();
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (s && s.v === 3) { const f = freshState(); G = Object.assign(f, s); for (const k of ['profile', 'equip', 'decor', 'stock', 'stats', 'settings', 'today', 'quiz']) G[k] = Object.assign(f[k], s[k] || {}); }
  } catch (e) { }
}
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { } }
const xpNeed = (lv) => 200 + (lv - 1) * 180;
/* kind: supply | film | equip | staff | decor | fixed | interest | loan (loan = borrowing/repaying, not income or expense) */
function addMoney(amount, label, kind) {
  G.money += amount; G.fin.unshift({ d: G.day, t: clock(G.time), label, amount, kind: kind || '' }); if (G.fin.length > 120) G.fin.pop();
  if (kind === 'loan') return;
  if (amount > 0) G.today.revenue += amount; else if (kind === 'supply' || kind === 'film') G.today.supply -= amount; else if (kind !== 'fixed' && kind !== 'interest') G.today.other -= amount;
}

/* ---------- toasts ---------- */
function toast(msg, kind) {
  const el = document.createElement('div'); el.className = 'toast' + (kind ? ' ' + kind : ''); el.textContent = msg;
  const box = $('toasts'); box.appendChild(el); while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, 2800);
}

/* ---------- audio (WebAudio, starts after first tap) ---------- */
const Sound = {
  ctx: null, motor: null,
  init() { if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; } try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } },
  tone(freq, dur, type = 'sine', vol = 0.12, slide = 0, delay = 0) {
    if (!G.settings.sound || !this.ctx) return; const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  },
  tap() { this.tone(660, 0.08, 'triangle', 0.08); },
  tick() { this.tone(2600, 0.03, 'square', 0.045); },
  rough() { this.tone(900, 0.04, 'sawtooth', 0.035); },
  pop() { this.tone(420, 0.12, 'sine', 0.12, 380); },
  coin() { this.tone(988, 0.1, 'square', 0.05); this.tone(1319, 0.25, 'square', 0.05, 0, 0.08); },
  good() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.09, 0, i * 0.08)); },
  bad() { this.tone(220, 0.22, 'sawtooth', 0.05, -80); },
  step() { this.tone(784, 0.1, 'triangle', 0.08); this.tone(1175, 0.16, 'triangle', 0.07, 0, 0.07); },
  beep(f = 1500) { this.tone(f, 0.06, 'square', 0.04); },
  horn() { this.tone(330, 0.18, 'square', 0.04); this.tone(392, 0.25, 'square', 0.04, 0, 0.2); },
  motorOn(kind) {
    if (!G.settings.sound || !this.ctx || this.motor) return; const c = this.ctx;
    const base = { scaler: 2600, air: 900, hs: 2100, ls: 700, surgdrill: 1200, finish: 1900, polish: 500, polishbrush: 500, niti: 400, suction: 300 }[kind]; if (!base) return;
    const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain();
    o.type = kind === 'air' ? 'triangle' : 'sawtooth'; o.frequency.value = base; f.type = 'bandpass'; f.frequency.value = base * 1.3; f.Q.value = 2;
    l.frequency.value = 23; lg.gain.value = base * 0.02; l.connect(lg).connect(o.frequency);
    g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(kind === 'air' ? 0.02 : 0.032, c.currentTime + 0.08);
    o.connect(f).connect(g).connect(c.destination); o.start(); l.start(); this.motor = { o, l, g };
  },
  motorOff() { if (!this.motor || !this.ctx) return; const m = this.motor; this.motor = null; const t = this.ctx.currentTime; m.g.gain.cancelScheduledValues(t); m.g.gain.setValueAtTime(Math.max(0.0001, m.g.gain.value), t); m.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); m.o.stop(t + 0.1); m.l.stop(t + 0.1); },
};
const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { } };

/* ---------- layer cache: renders a world-space layer once, re-uses it while the camera pans inside it ----------
   view = { tx, ty: integer device-px translation of world origin, s: device px per world unit, wpx, hpx: screen size in device px } */
class LayerCache {
  constructor(n = 1, maxPx = 9e6) { this.cvs = []; for (let k = 0; k < n; k++) this.cvs.push(document.createElement('canvas')); this.maxPx = maxPx; this.key = null; this.s = 0; this.ox = 0; this.oy = 0; this.cw = 0; this.ch = 0; }
  covers(v) { if (this.key === null) return false; const r = v.s / this.s, x0 = this.ox * r + v.tx, y0 = this.oy * r + v.ty; return x0 <= 0.5 && y0 <= 0.5 && x0 + this.cw * r >= v.wpx - 0.5 && y0 + this.ch * r >= v.hpx - 0.5; }
  invalidate() { this.key = null; }
  /* returns true when it rebuilt */
  ensure(v, key, render, allowScaled) {
    const same = Math.abs(v.s - this.s) < 1e-6 * v.s;
    if (this.key === key && (same || allowScaled) && this.covers(v)) return false;
    const area = v.wpx * v.hpx, m = clamp((Math.sqrt(this.maxPx / Math.max(1, area)) - 1) / 2, 0.02, 0.22);
    this.s = v.s; this.ox = Math.floor(-v.tx - v.wpx * m); this.oy = Math.floor(-v.ty - v.hpx * m);
    this.cw = Math.min(8192, Math.ceil(v.wpx * (1 + 2 * m)) + 2); this.ch = Math.min(8192, Math.ceil(v.hpx * (1 + 2 * m)) + 2);
    for (const c of this.cvs) { if (c.width !== this.cw || c.height !== this.ch) { c.width = this.cw; c.height = this.ch; } }
    render(this.cvs.map((c) => { const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.cw, this.ch); x.setTransform(this.s, 0, 0, this.s, -this.ox, -this.oy); return x; }), this);
    this.key = key; return true;
  }
  /* draw canvas k onto ctx (identity transform expected) */
  blit(ctx, v, k = 0) { const r = v.s / this.s; if (Math.abs(r - 1) < 1e-6) ctx.drawImage(this.cvs[k], this.ox + v.tx, this.oy + v.ty); else ctx.drawImage(this.cvs[k], this.ox * r + v.tx, this.oy * r + v.ty, this.cw * r, this.ch * r); }
  /* draw canvas k in world coordinates (ctx carries the world transform) */
  blitWorld(ctx, k = 0) { ctx.drawImage(this.cvs[k], this.ox / this.s, this.oy / this.s, this.cw / this.s, this.ch / this.s); }
}

/* ---------- tiled layer cache for the big scrolling world: tiles are rendered once per zoom level and re-used while
   panning; new tiles are rendered a few per frame; after a zoom the old tiles are shown scaled until new ones are ready */
class TileLayer {
  constructor(size = 512, n = 2, perFrame = 5) { this.size = size; this.n = n; this.perFrame = perFrame; this.sets = []; this.pool = []; this.frame = 0; this.key = null; }
  newSet(s) { const S = { s, tiles: new Map() }; this.sets.push(S); while (this.sets.length > 2) this.drop(this.sets.shift()); return S; }
  drop(S) { for (const t of S.tiles.values()) this.pool.push(t); S.tiles.clear(); }
  invalidate() { this.sets.forEach((S) => this.drop(S)); this.sets = []; }
  range(S, v, ring = 0) { const r = S.s / v.s, z = this.size; return [Math.floor((-v.tx) * r / z) - ring, Math.floor((-v.ty) * r / z) - ring, Math.floor((v.wpx - 1 - v.tx) * r / z) + ring, Math.floor((v.hpx - 1 - v.ty) * r / z) + ring]; }
  render(S, ix, iy, renderFn) {
    let t = this.pool.pop(); if (!t) { t = { cv: [] }; for (let k = 0; k < this.n; k++) { const c = document.createElement('canvas'); c.width = c.height = this.size; t.cv.push(c); } }
    t.ix = ix; t.iy = iy; t.used = this.frame;
    renderFn(t.cv.map((c) => { const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.size, this.size); x.setTransform(S.s, 0, 0, S.s, -ix * this.size, -iy * this.size); return x; }), t, [ix * this.size / S.s, iy * this.size / S.s, (ix + 1) * this.size / S.s, (iy + 1) * this.size / S.s]);
    S.tiles.set(ix + ',' + iy, t); return t;
  }
  /* settled = camera zoom not changing; renderFn(ctxs, tile, worldRect) */
  missingIn(S, v) { const R = this.range(S, v); for (let iy = R[1]; iy <= R[3]; iy++) for (let ix = R[0]; ix <= R[2]; ix++) if (!S.tiles.has(ix + ',' + iy)) return true; return false; }
  prepare(v, key, renderFn, settled) {
    this.frame++; this.holes = false; if (key !== this.key) { this.invalidate(); this.key = key; }
    let A = this.sets[this.sets.length - 1];
    if (!A) A = this.newSet(v.s); else if (Math.abs(A.s - v.s) > 1e-6 * v.s && (settled || A.s / v.s > 1.35 || A.s / v.s < 0.62)) A = this.newSet(v.s);
    const R = this.range(A, v), need = [];
    for (let iy = R[1]; iy <= R[3]; iy++) for (let ix = R[0]; ix <= R[2]; ix++) { const t = A.tiles.get(ix + ',' + iy); if (t) t.used = this.frame; else need.push([ix, iy]); }
    const hasFallback = this.sets.length > 1 && !this.missingIn(this.sets[0], v), fresh = this.sets.length === 1 && A.tiles.size === 0;
    let budget = fresh ? need.length : hasFallback ? this.perFrame : this.perFrame + 2;
    for (const [ix, iy] of need) { if (budget <= 0) break; this.render(A, ix, iy, renderFn); budget--; }
    const aMissing = need.some(([ix, iy]) => !A.tiles.has(ix + ',' + iy));
    if (aMissing && !hasFallback) this.holes = true;
    if (!aMissing && this.sets.length > 1) this.drop(this.sets.shift());
    if (!aMissing && this.sets.length === 1) { let pre = 1; const P = this.range(A, v, 1); outer: for (let iy = P[1]; iy <= P[3]; iy++) for (let ix = P[0]; ix <= P[2]; ix++) if (!A.tiles.has(ix + ',' + iy)) { this.render(A, ix, iy, renderFn); if (--pre <= 0) break outer; } }
    for (const S of this.sets) if (S.tiles.size > 60) { const P = this.range(S, v, 2); for (const [id, t] of S.tiles) if (t.ix < P[0] || t.ix > P[2] || t.iy < P[1] || t.iy > P[3]) { S.tiles.delete(id); this.pool.push(t); } }
    if (this.pool.length > 16) this.pool.length = 16;
  }
  /* composite layer k onto ctx (identity transform) */
  blit(ctx, v, k, fill) {
    let missing = false;
    for (const S of this.sets) {
      const r = v.s / S.s, z = this.size, R = this.range(S, v), same = Math.abs(r - 1) < 1e-6;
      for (let iy = R[1]; iy <= R[3]; iy++) for (let ix = R[0]; ix <= R[2]; ix++) {
        const t = S.tiles.get(ix + ',' + iy);
        if (!t) { if (S === this.sets[0]) missing = true; continue; }
        if (same) ctx.drawImage(t.cv[k], ix * z + v.tx, iy * z + v.ty); else ctx.drawImage(t.cv[k], ix * z * r + v.tx, iy * z * r + v.ty, z * r, z * r);
      }
    }
    return missing;
  }
  /* draw layer k inside world rect W (ctx carries the world transform) */
  blitWorld(ctx, k, W) {
    for (const S of this.sets) {
      const z = this.size / S.s, x0 = Math.floor(W[0] / z), y0 = Math.floor(W[1] / z), x1 = Math.floor(W[2] / z), y1 = Math.floor(W[3] / z);
      for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) { const t = S.tiles.get(ix + ',' + iy); if (t) ctx.drawImage(t.cv[k], ix * z, iy * z, z, z); }
    }
  }
}
