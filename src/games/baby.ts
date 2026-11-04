import { gesture } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rr, seg, text, dist, C, shadow } from '../core/draw';
import { ctl } from '../core/ctl';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { baby, cradle, stove, pipe } from '../art/props';
import { mottle } from '../art/scenery';
import type { Micro } from './types';

export class Baby implements Micro {
  readonly cmd = 'ХҮҮХДИЙГ ХАМГААЛ!';
  readonly sub = 'Хүүхдийг өлгийд нь чирж хий';
  readonly lose = 'Түлэгдчихлээ!';
  readonly tip = 'Халуун зуухны дэргэд хүүхдийг ганцааранг нь бүү орхи. Зуухыг хашлагаар хамгаал.';
  dead = false;
  private bx = 290; private by = 545; private drag = false; private safe = false;

  init(): void { this.bx = 290; this.by = 545; this.drag = false; this.safe = false; }
  update(dt: number): void {
    if (this.drag || this.safe || this.dead) return;
    this.bx -= 30 * dt;
    if (this.bx < 150) { this.dead = true; ctl.lose(this.lose); }
  }
  down(x: number, y: number): void { if (!this.safe && !this.dead && dist(x, y, this.bx, this.by - 16) < 50) this.drag = true; }
  move(x: number, y: number): void { if (this.drag) { this.bx = x; this.by = y + 16; } }
  up(): void {
    if (!this.drag) return;
    this.drag = false;
    if (this.bx > 230 && this.bx < 350 && this.by > 260 && this.by < 400) { this.safe = true; this.bx = 290; this.by = 340; ctl.win(); }
    else { this.by = 545; this.bx = Math.max(160, Math.min(330, this.bx)); }
  }
  hint(): void { if (!this.safe && !this.drag) gesture(this.bx, this.by - 16, 290, 324, 48); }
  draw(): void {
    layer('baby-ger', paintGer);
    pipe(84, 0, 444, 20);
    stove(40, 440, 110, 90);
    // heat shimmer
    ctx.strokeStyle = 'rgba(255,140,70,.35)'; ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let y = 0; y < 50; y += 5) ctx.lineTo(62 + i * 30 + Math.sin(y / 6 + clock.t * 8) * 4, 430 - y);
      ctx.stroke();
    }
    bayraa(205, 498, 0.72, { mood: this.dead || !this.safe ? 'scared' : 'happy', arms: this.dead ? 1 : 0 });
    const crawl = this.drag || this.safe || reduce ? 0 : Math.sin(clock.t * 10) * 2;
    if (this.drag) shadow(this.bx + 4, Math.max(this.by + 30, 560), 30, 5, 0.2);
    baby(this.bx, this.by, crawl, !this.drag && !this.safe);
    if (this.dead) { ctx.fillStyle = 'rgba(255,90,40,.35)'; ctx.fillRect(0, 0, W, H); }
  }
}

function paintGer(): void {
  // felt behind the lattice
  ctx.fillStyle = lin(0, 0, 0, 470, [[0, '#e9dcc0'], [1, '#f6eedc']]); ctx.fillRect(0, 0, W, 476);
  mottle(0, 0, W, 470, 51, '150,120,70', 50, 0.06);
  // roof poles (унь) and the band above the lattice
  ctx.lineCap = 'round';
  for (let i = -6; i <= 16; i++) {
    const x0 = 180 + i * 6, x1 = -200 + i * 36;
    ctx.strokeStyle = 'rgba(80,40,10,.25)'; ctx.lineWidth = 5; seg(x0 + 2, -40, x1 + 2, 114);
    ctx.strokeStyle = lin(x0, -40, x1, 114, [[0, '#d0671a'], [1, '#f08a2a']]); ctx.lineWidth = 3.5; seg(x0, -40, x1, 114);
  }
  // lattice wall (хана)
  ctx.save(); ctx.beginPath(); ctx.rect(0, 120, W, 348); ctx.clip();
  ctx.fillStyle = 'rgba(110,70,30,.08)'; ctx.fillRect(0, 120, W, 348);
  for (const [dx, a] of [[1.5, 'rgba(80,40,10,.3)'], [0, '']] as const) {
    for (let x = -360; x < W + 360; x += 34) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = a || lin(x, 120, x + 350, 470, [[0, '#c48850'], [1, '#e2a76a']]);
      seg(x + dx, 120 + dx, x + 350 + dx, 470 + dx);
      ctx.strokeStyle = a || lin(x, 470, x + 350, 120, [[0, '#b77b44'], [1, '#d99c5e']]);
      seg(x + dx, 470 + dx, x + 350 + dx, 120 + dx);
    }
  }
  // pins where the laths cross
  ctx.fillStyle = '#6e4220';
  for (let a = -360; a < W + 360; a += 34) for (let b = -360; b < W + 360; b += 34) {
    const px = (350 + a + b) / 2, py = 120 + px - a;
    if (px > -4 && px < W + 4 && py > 120 && py < 468) rr(px - 1.6, py - 1.6, 3.2, 3.2, 1);
  }
  ctx.restore();
  ctx.fillStyle = lin(0, 110, 0, 124, [[0, '#d4884a'], [0.5, '#a8622c'], [1, '#7a431a']]); ctx.fillRect(0, 110, W, 14);
  ctx.fillStyle = lin(0, 464, 0, 478, [[0, '#d4884a'], [0.5, '#a8622c'], [1, '#7a431a']]); ctx.fillRect(0, 464, W, 14);
  // low painted bed under the cradle
  shadow(290, 472, 72, 6, 0.4);
  ctx.fillStyle = lin(0, 362, 0, 470, [[0, '#e8801f'], [1, '#a4500e']]); rr(222, 362, 136, 108, 4);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.strokeRect(232, 380, 116, 78);
  ctx.strokeRect(244, 392, 92, 54);
  ctx.fillStyle = lin(0, 356, 0, 368, [[0, '#ffb05a'], [1, '#c4620e']]); rr(218, 356, 144, 10, 3);
  cradle(240, 300, 100, 60);
  text('ӨЛГИЙ', 290, 383, 12, '#ffe6a8', { w: 700 });
  // carpet with an ornamental border
  ctx.fillStyle = lin(0, 476, 0, H, [[0, '#8e2018'], [1, '#c23a2e']]); ctx.fillRect(0, 476, W, H - 476);
  ctx.fillStyle = lin(0, 476, 0, 500, [[0, 'rgba(20,0,0,.4)'], [1, 'rgba(20,0,0,0)']]); ctx.fillRect(0, 476, W, 24);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(14, 492, W - 28, H - 510);
  ctx.lineWidth = 1.5; ctx.strokeRect(22, 500, W - 44, H - 526);
  ctx.strokeStyle = 'rgba(244,180,0,.55)'; ctx.lineWidth = 2;
  for (let x = 36; x < W - 30; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 500); ctx.lineTo(x, 506); ctx.lineTo(x + 12, 506); ctx.lineTo(x + 12, 500); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, H - 26); ctx.lineTo(x, H - 32); ctx.lineTo(x + 12, H - 32); ctx.lineTo(x + 12, H - 26); ctx.stroke();
  }
  const fib = rng(6);
  for (let i = 0; i < 260; i++) { ctx.fillStyle = fib() < 0.5 ? 'rgba(255,200,180,.06)' : 'rgba(40,0,0,.1)'; ctx.fillRect(fib(0, W), fib(478, H), 2, 1); }
}
