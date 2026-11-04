import { ctx, W, H, reduce, layer } from '../core/canvas';
import { lin, rad, ell, seg, rr, circ, text, C } from '../core/draw';
import { ctl } from '../core/ctl';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { snowfall, mottle, chimneySmoke } from '../art/scenery';
import type { Micro } from './types';

/** Lean (radians) at which Bayraa goes down. */
const FALL = 0.75;

export class Ice implements Micro {
  readonly cmd = 'ТЭНЦВЭРЭЭ БАРИ!';
  readonly sub = 'Хазайсны эсрэг тал руу дар';
  readonly lose = 'Хальтирч унлаа!';
  readonly tip = 'Мөсөн дээр оцон шувуу шиг жижиг алхмаар, гараа халааснаасаа гаргаж алх. Гулгадаггүй ултай гутал өмс.';
  readonly timeoutWin = true;
  dead = false;
  /** lean angle and its angular velocity; positive = leaning right */
  private a = 0; private w = 0;
  private t = 0; private slipIn = 0; private slip = 0; private slipDir = 1;
  private scroll = 0; private push = 0; private pushDir = 0;

  init(): void {
    this.a = (Math.random() < 0.5 ? -1 : 1) * 0.05; this.w = 0;
    this.t = 0; this.slipIn = 0.35; this.slip = 0; this.scroll = 0; this.push = 0;
  }
  update(dt: number): void {
    if (this.dead) {
      // finish the fall
      this.w += Math.sign(this.a || 1) * 9 * dt;
      this.a = Math.max(-1.5, Math.min(1.5, this.a + this.w * dt));
      return;
    }
    this.t += dt;
    this.scroll += dt * 110;
    if (this.slip > 0) this.slip -= dt;
    if (this.push > 0) this.push -= dt;
    // a sudden slip every so often, stronger as the round goes on
    this.slipIn -= dt;
    if (this.slipIn <= 0) {
      this.slipIn = 0.7 + Math.random() * 0.5;
      this.slipDir = Math.random() < 0.5 ? -1 : 1;
      this.w += this.slipDir * (0.7 + this.t * 0.08);
      this.slip = 0.25;
    }
    // ice is unstable: leaning makes you lean more
    this.w += (this.a * 1.4 + (Math.random() - 0.5) * 0.6) * dt;
    this.w *= Math.pow(0.15, dt);
    this.a += this.w * dt;
    if (Math.abs(this.a) > FALL) { this.dead = true; ctl.lose(this.lose); }
  }
  /** Tap the left half to lean left, the right half to lean right. */
  private nudge(dir: number): void {
    if (this.dead) return;
    this.w += dir * 1.0;
    this.push = 0.18; this.pushDir = dir;
  }
  down(x: number): void { this.nudge(x < 180 ? -1 : 1); }
  key(k: string, isDown: boolean): void {
    if (!isDown) return;
    if (k === 'ArrowLeft') this.nudge(-1);
    if (k === 'ArrowRight') this.nudge(1);
  }
  draw(): void {
    layer('ice-city', paintCity);
    chimneySmoke(192, 18, 0.8, '200,200,208', 0.5);
    // the icy sheet he is walking on, sliding past
    icePatch(180, 566, 3, 2.1);
    const r = rng(19);
    for (let i = 0; i < 9; i++) {
      const y = 260 + ((r(0, 400) + this.scroll) % 400);
      const k = 0.5 + (y - 260) / 380;
      icePatch(r(30, 330), y, 100 + i, 0.35 * k + 0.2);
    }
    // feet slide on a slip
    const slide = this.slip > 0 && !reduce ? this.slipDir * Math.sin((0.25 - this.slip) * 40) * 3 : 0;
    const danger = Math.abs(this.a) / FALL;
    bayraa(180 + slide, 562, 1, {
      rot: this.a,
      arms: this.dead ? 1 : 0.35 + danger * 0.5,
      mood: this.dead ? 'dead' : danger > 0.55 ? 'scared' : 'ok',
    });
    if (!this.dead) meter(this.a, danger);
    snowfall(0.8);
    // side hints: the side to tap glows as he tips over
    if (!this.dead && danger > 0.3) {
      const side = this.a > 0 ? -1 : 1, x = side < 0 ? 0 : W / 2;
      ctx.fillStyle = lin(side < 0 ? 0 : W, 0, W / 2, 0, [[0, `rgba(244,180,0,${(danger - 0.3) * 0.5})`], [1, 'rgba(244,180,0,0)']]);
      ctx.fillRect(x, 0, W / 2, H);
      text(side < 0 ? '◀' : '▶', side < 0 ? 34 : W - 34, 400, 34, '#fff', { stroke: C.ink, sw: 6 });
    }
    if (this.push > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.push})`;
      circ(this.pushDir < 0 ? 60 : W - 60, 400, 40 * (1 - this.push * 3));
    }
  }
}

/** Balance gauge: needle shows the lean, red zones at the ends. */
function meter(a: number, danger: number): void {
  const cx = W / 2, cy = 190, R = 70, span = 1.1;
  ctx.lineCap = 'butt';
  ctx.lineWidth = 12;
  ctx.strokeStyle = 'rgba(27,31,59,.45)';
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 - span, -Math.PI / 2 + span); ctx.stroke();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#4cd07a';
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 - span * 0.55, -Math.PI / 2 + span * 0.55); ctx.stroke();
  ctx.strokeStyle = '#f4b400';
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 - span * 0.8, -Math.PI / 2 - span * 0.55); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 + span * 0.55, -Math.PI / 2 + span * 0.8); ctx.stroke();
  ctx.strokeStyle = C.red;
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 - span, -Math.PI / 2 - span * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 + span * 0.8, -Math.PI / 2 + span); ctx.stroke();
  const ang = -Math.PI / 2 + (a / FALL) * span * 0.9;
  ctx.strokeStyle = danger > 0.8 ? C.red : '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  seg(cx, cy, cx + Math.cos(ang) * (R + 8), cy + Math.sin(ang) * (R + 8));
  ctx.fillStyle = C.ink; circ(cx, cy, 6);
}

function icePatch(x: number, y: number, seed: number, k = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); x = 0; y = 0;
  ctx.fillStyle = 'rgba(90,130,170,.18)'; ell(x, y + 2, 47, 18);
  ctx.fillStyle = rad(x, y, 46, [[0, '#eefcff'], [0.45, '#b4e4f8'], [0.9, '#86c3e2'], [1, 'rgba(134,195,226,.6)']], x - 10, y - 5);
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 16 / 44); ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.restore(); ctx.fill();
  const r = rng(seed);
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    let cx = x + r(-20, 20), cy = y + r(-6, 6);
    ctx.beginPath(); ctx.moveTo(cx, cy);
    for (let k = 0; k < 3; k++) { cx += r(-12, 12); cy += r(-4, 4); ctx.lineTo(cx, cy); }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ell(x - 14, y - 5, 15, 2.6, -0.08);
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ell(x + 16, y + 4, 6, 1.4);
  ctx.restore();
}

function paintCity(): void {
  ctx.fillStyle = lin(0, 0, 0, 230, [[0, '#a6bdd6'], [1, '#e2e8ee']]);
  ctx.fillRect(0, 0, W, 230);
  // distant blocks in haze
  const far = rng(41);
  for (let x = -10; x < W; x += far(30, 50)) {
    const h = far(60, 120); ctx.fillStyle = 'rgba(150,165,185,.7)'; ctx.fillRect(x, 222 - h, far(28, 44), h);
  }
  ctx.fillStyle = lin(0, 100, 0, 230, [[0, 'rgba(220,226,232,0)'], [1, 'rgba(220,226,232,.85)']]); ctx.fillRect(0, 100, W, 130);
  // panel apartment blocks
  const blocks: Array<[number, number, number, number, string]> = [[0, 70, 110, 150, '#a9b2bd'], [120, 40, 120, 180, '#c1b7a6'], [250, 80, 110, 140, '#9faab8']];
  const r = rng(9);
  for (const [x, y, w, h, base] of blocks) {
    ctx.fillStyle = lin(x, 0, x + w, 0, [[0, base], [1, shade(base, -28)]]); ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(60,70,85,.18)'; ctx.lineWidth = 1;
    for (let py = y + 24; py < y + h; py += 24) seg(x, py, x + w, py);
    for (let wy = y + 8; wy < y + h - 10; wy += 24) for (let wx = x + 10; wx < x + w - 12; wx += 22) {
      const lit = r() < 0.35;
      ctx.fillStyle = lit ? lin(0, wy, 0, wy + 13, [[0, '#ffe39a'], [1, '#f5b54a']]) : lin(0, wy, 0, wy + 13, [[0, '#7d93ab'], [1, '#46566b']]);
      ctx.fillRect(wx, wy, 11, 13);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(wx, wy, 11, 2);
      ctx.fillStyle = 'rgba(40,45,55,.35)'; ctx.fillRect(wx - 1, wy + 13, 13, 2);
    }
    ctx.fillStyle = '#f7fafc'; rr(x - 2, y - 5, w + 4, 7, 3);
    ctx.fillStyle = 'rgba(30,40,60,.15)'; ctx.fillRect(x, y + 2, w, 3);
  }
  ctx.fillStyle = '#5f6670'; ctx.fillRect(189, 40, 7, -20); ctx.fillRect(188, 18, 9, 3);
  // smog band
  ctx.fillStyle = lin(0, 150, 0, 225, [[0, 'rgba(214,214,206,0)'], [1, 'rgba(214,214,206,.65)']]); ctx.fillRect(0, 150, W, 75);
  // snowy pavement
  ctx.fillStyle = lin(0, 220, 0, H, [[0, '#dde6ef'], [0.25, '#eef3f8'], [1, '#fbfdff']]); ctx.fillRect(0, 220, W, H - 220);
  ctx.fillStyle = lin(0, 216, 0, 232, [[0, '#ffffff'], [1, '#cdd9e5']]);
  ctx.beginPath(); ctx.moveTo(0, 232); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 220 + Math.sin(x * 0.11) * 3); ctx.lineTo(W, 232); ctx.fill();
  mottle(0, 230, W, H - 230, 12, '150,175,205', 50, 0.1);
  // footprints along the path
  const fp = rng(77);
  ctx.fillStyle = 'rgba(150,172,198,.35)';
  for (let i = 0; i < 70; i++) {
    const y = fp(240, H), k = 0.5 + (y - 240) / 400;
    ell(180 + fp(-60, 60) * k, y, 3 * k, 5.5 * k, fp(-0.3, 0.3));
  }
  // sparkles
  const sp = rng(5);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,255,255,${sp(0.5, 1)})`; circ(sp(0, W), sp(240, H), sp(0.6, 1.4)); }
  // street lamp
  ctx.fillStyle = lin(344, 0, 350, 0, [[0, '#3c4250'], [1, '#6a7282']]); ctx.fillRect(344, 150, 5, 110);
  ctx.fillStyle = '#4a5160'; rr(330, 146, 26, 6, 3);
  ctx.fillStyle = 'rgba(255,240,190,.9)'; rr(333, 151, 14, 3, 1);
  ctx.fillStyle = '#fff'; rr(328, 143, 30, 4, 2);
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}
