import { gesture } from '../ui/gesture';
import { ctx, W, H, layer } from '../core/canvas';
import { lin, rad, ell, seg, rr, circ } from '../core/draw';
import { ctl } from '../core/ctl';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { snowfall, mottle, chimneySmoke } from '../art/scenery';
import type { Micro } from './types';

const LANES = [80, 180, 280];
interface Row { y: number; lanes: number[]; seed: number }

export class Ice implements Micro {
  readonly cmd = 'МӨСИЙГ ТОЙР!';
  readonly sub = 'Дарсан тал руугаа алхана';
  readonly lose = 'Хальтирч унлаа!';
  readonly tip = 'Мөсөн дээр жижиг алхмаар, гараа халааснаасаа гаргаж алх. Гулгадаггүй ултай гутал өмс.';
  readonly timeoutWin = true;
  dead = false;
  private lane = 1; private px = LANES[1]; private rows: Row[] = [];
  private sp = 0; private rot = 0; private first = true;

  init(): void { this.lane = 1; this.px = LANES[1]; this.rows = []; this.sp = 0; this.rot = 0; this.first = true; }
  update(dt: number): void {
    if (this.dead) { this.rot = Math.min(1.5, this.rot + dt * 6); return; }
    this.px += (LANES[this.lane] - this.px) * Math.min(1, dt * 14);
    this.sp -= dt;
    if (this.sp <= 0) {
      this.sp = 0.8;
      const free = Math.floor(Math.random() * 3), others = [0, 1, 2].filter(l => l !== free);
      const lanes = Math.random() < 0.5 ? others : [others[Math.floor(Math.random() * 2)]];
      this.rows.push({ y: this.first ? 150 : -30, lanes, seed: (Math.random() * 1e9) | 0 });
      this.first = false;
    }
    for (const r of this.rows) {
      r.y += 230 * dt;
      if (Math.abs(r.y - 548) < 20 && r.lanes.some(l => Math.abs(LANES[l] - this.px) < 42)) { this.dead = true; ctl.lose(this.lose); }
    }
    this.rows = this.rows.filter(r => r.y < 700);
  }
  down(x: number): void { this.lane = x < 130 ? 0 : x < 230 ? 1 : 2; }
  key(k: string, isDown: boolean): void {
    if (!isDown) return;
    if (k === 'ArrowLeft') this.lane = Math.max(0, this.lane - 1);
    if (k === 'ArrowRight') this.lane = Math.min(2, this.lane + 1);
  }
  hint(): void { gesture(180, 550, 80, 550, 30); }
  draw(): void {
    layer('ice-city', paintCity);
    chimneySmoke(192, 18, 0.8, '200,200,208', 0.5);
    for (const r of this.rows) for (const l of r.lanes) icePatch(LANES[l], r.y, r.seed + l);
    bayraa(this.px, 560, 0.85, { mood: this.dead ? 'dead' : 'ok', rot: this.rot });
    snowfall(0.8);
  }
}

function icePatch(x: number, y: number, seed: number): void {
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
  // trodden lanes and footprints
  ctx.strokeStyle = 'rgba(160,182,206,.45)'; ctx.lineWidth = 2.5; ctx.setLineDash([12, 14]);
  seg(130, 232, 130, H); seg(230, 232, 230, H); ctx.setLineDash([]);
  const fp = rng(77);
  ctx.fillStyle = 'rgba(150,172,198,.35)';
  for (let i = 0; i < 70; i++) {
    const lane = LANES[Math.floor(fp(0, 3))], y = fp(240, H), k = 0.5 + (y - 240) / 400;
    ell(lane + fp(-24, 24), y, 3 * k, 5.5 * k, fp(-0.3, 0.3));
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
