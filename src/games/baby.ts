import { perspectiveFloor, solidBox } from '../art/depth';
import { dangerZone, heatWaves } from '../art/danger';
import { gesture, highlight } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rr, seg, dist, shadow } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa } from '../art/bayraa';
import { baby, cradle, stove, pipe } from '../art/props';
import { mottle } from '../art/scenery';
import type { Micro } from './types';
import { DragKeys } from '../core/dragKeys';

export class Baby implements Micro {
  readonly focus = {zoom:1.04,y:405,height:420};
  readonly cmd = 'ХҮҮХДИЙГ ХАМГААЛ!';
  readonly sub = 'Хүүхдийг өлгийд нь чирж хий';
  readonly lose = 'Түлэгдчихлээ!';
  readonly tip = 'Халуун зуухны дэргэд хүүхдийг ганцааранг нь бүү орхи. Зуухыг хашлагаар хамгаал.';
  dead = false;
  readonly keys = 'Баруун товч: авах / тавих';
  private arrows = new DragKeys();
  private bx = 290; private by = 545; private drag = false; private safe = false;

  init(): void { this.dead = false; this.bx = 290; this.by = 545; this.cancelInput(); this.bx += (ctl.variation ?? 0) * 15; this.safe = false; }
  update(dt: number): void {
    if (this.drag) {
      const [dx, dy] = this.arrows.delta(dt);
      this.bx = Math.max(20, Math.min(W - 20, this.bx + dx));
      this.by = Math.max(140, Math.min(H - 40, this.by + dy));
    }
    if (this.drag || this.safe || this.dead) return;
    this.bx -= 30 * (1 + (ctl.stage ?? 0) * .12) * dt;
    if (this.bx < 150) { this.dead = true; ctl.lose(this.lose); }
  }
  down(x: number, y: number): void { if (!this.safe && !this.dead && dist(x, y, this.bx, this.by - 16) < 50) this.drag = true; }
  cancelInput(): void {
    if (this.drag && !this.safe) { this.by = 545; this.bx = Math.max(160, Math.min(330, this.bx)); }
    this.drag = false; this.arrows.clear();
  }
  key(k: string, isDown: boolean): void {
    this.arrows.key(k, isDown);
  }
  select(x: number, y: number): boolean {
    if (this.safe || this.dead) return false;
    if (this.drag) { this.move(x, y); this.up(); } else this.down(x, y);
    return this.drag;
  }
  move(x: number, y: number): void { if (this.drag) { this.bx = x; this.by = y + 16; } }
  up(): void {
    if (!this.drag) return;
    this.drag = false;
    if (this.bx > 230 && this.bx < 350 && this.by > 420 && this.by < 480) { this.safe = true; this.bx = 290; this.by = 460; ctl.win(); }
    else { this.by = 545; this.bx = Math.max(160, Math.min(330, this.bx)); }
  }
  hint(): void {
    if (this.safe) return;
    if (this.drag) highlight(290, 444, 48);
    else gesture(this.bx, this.by - 16, 290, 444, 48);
  }
  danger(): void { if (!this.safe && !this.dead) { dangerZone(38, 435, 116, 100, 'heat'); heatWaves(44, 434, 98); } }
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
    bayraa(185, 552, 1.15, { mood: this.dead || !this.safe ? 'scared' : 'happy', arms: this.dead ? 1 : 0 });
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
    ctx.strokeStyle = 'rgba(80,40,10,.25)'; ctx.lineWidth = 5; seg(x0 + 2, 112, x1 + 2, 284);
    ctx.strokeStyle = lin(x0, 112, x1, 284, [[0, '#d0671a'], [1, '#f08a2a']]); ctx.lineWidth = 3.5; seg(x0, 112, x1, 284);
  }
  ctx.strokeStyle = '#995e2d'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.ellipse(180, 112, 42, 14, 0, 0, Math.PI * 2); ctx.stroke();
  // lattice wall (хана)
  ctx.save(); ctx.beginPath(); ctx.rect(0, 290, W, 178); ctx.clip();
  ctx.fillStyle = 'rgba(110,70,30,.08)'; ctx.fillRect(0, 290, W, 178);
  for (const [dx, a] of [[1.5, 'rgba(80,40,10,.3)'], [0, '']] as const) {
    for (let x = -360; x < W + 360; x += 34) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = a || lin(x, 290, x + 180, 470, [[0, '#c48850'], [1, '#e2a76a']]);
      seg(x + dx, 290 + dx, x + 180 + dx, 470 + dx);
      ctx.strokeStyle = a || lin(x, 470, x + 180, 290, [[0, '#b77b44'], [1, '#d99c5e']]);
      seg(x + dx, 470 + dx, x + 180 + dx, 290 + dx);
    }
  }
  // pins where the laths cross
  ctx.fillStyle = '#6e4220';
  for (let a = -360; a < W + 360; a += 34) for (let b = -360; b < W + 360; b += 34) {
    const px = (180 + a + b) / 2, py = 290 + px - a;
    if (px > -4 && px < W + 4 && py > 290 && py < 468) rr(px - 1.6, py - 1.6, 3.2, 3.2, 1);
  }
  ctx.restore();
  ctx.fillStyle = lin(0, 280, 0, 294, [[0, '#d4884a'], [0.5, '#a8622c'], [1, '#7a431a']]); ctx.fillRect(0, 280, W, 14);
  ctx.fillStyle = lin(0, 464, 0, 478, [[0, '#d4884a'], [0.5, '#a8622c'], [1, '#7a431a']]); ctx.fillRect(0, 464, W, 14);
  // The cradle sits on a low base on the same floor as the stove and people.
  perspectiveFloor(476, '#b77b51');
  shadow(290, 537, 67, 10, .28);
  solidBox(232, 461, 112, 62, 12, '#b65d28', '#e9ab64', '#7b3c20');
  ctx.fillStyle = '#704426'; rr(238, 521, 12, 16, 2); rr(326, 521, 12, 16, 2);
  cradle(240, 430, 100, 40);
}
