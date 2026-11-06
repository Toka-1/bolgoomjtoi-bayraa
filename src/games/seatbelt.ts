import { dangerZone } from '../art/danger';
import { ctx, W, H, layer } from '../core/canvas';
import { lin, rr, seg, circ, dist } from '../core/draw';
import { ctl } from '../core/ctl';
import { DragKeys } from '../core/dragKeys';
import { bayraa } from '../art/bayraa';
import { boosterSeat } from '../art/hazards';
import { highlight } from '../ui/gesture';
import type { Micro } from './types';

const TONGUE = { x: 123, y: 398 }, BUCKLE = { x: 218, y: 451 };

export class Seatbelt implements Micro {
  readonly cmd = 'БҮСЭЭ ЗҮҮ!';
  readonly sub = 'Бүсний үзүүрийг түгжээнд нь хий';
  readonly lose = 'Бүсээ зүүж амжсангүй!';
  readonly tip = 'Машин хөдлөхөөс өмнө өөрт тохирсон хүүхдийн суудалд сууж, бүсээ зүү. Том хүнээр шалгуул.';
  readonly winText = 'БҮСЭЭ ЗҮҮЛЭЭ!';
  dead = false;
  private x = TONGUE.x; private y = TONGUE.y;
  private drag = false; private fastened = false;
  private arrows = new DragKeys();
  init(): void { this.dead = false; this.fastened = false; this.cancelInput(); }
  update(dt: number): void {
    if (!this.drag || this.dead || this.fastened) return;
    const [dx, dy] = this.arrows.delta(dt); this.move(this.x + dx, this.y + dy);
  }
  down(x: number, y: number): void { if (!this.dead && !this.fastened && dist(x, y, this.x, this.y) < 29) this.drag = true; }
  move(x: number, y: number): void {
    if (!this.drag || this.dead || this.fastened) return;
    this.x = Math.max(90, Math.min(270, x)); this.y = Math.max(320, Math.min(505, y));
  }
  up(): void {
    if (!this.drag || this.dead || this.fastened) return;
    this.drag = false; this.arrows.clear();
    if (dist(this.x, this.y, BUCKLE.x, BUCKLE.y) < 25) {
      this.fastened = true; this.x = BUCKLE.x; this.y = BUCKLE.y; ctl.win();
    } else this.cancelInput();
  }
  cancelInput(): void {
    this.drag = false; this.arrows.clear();
    if (!this.fastened) { this.x = TONGUE.x; this.y = TONGUE.y; }
  }
  select(x: number, y: number): boolean {
    if (this.drag) { this.move(x, y); this.up(); } else this.down(x, y);
    return this.drag;
  }
  key(k: string, down: boolean): void { this.arrows.key(k, down); }
  hint(): void {
    if (this.fastened || this.dead) return;
    highlight(BUCKLE.x, BUCKLE.y, 25);
    if (!this.drag) highlight(this.x, this.y, 26);
  }
  danger(): void { if (!this.fastened && !this.dead) dangerZone(300, 315, 0, 0); }
  draw(): void {
    layer('seatbelt-car', () => {
      ctx.fillStyle = '#526474'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = lin(0, 95, 0, 245, [[0, '#8fc9ec'], [1, '#dcebd1']]); rr(16, 95, W - 32, 142, 18);
      ctx.fillStyle = '#849b72'; rr(22, 204, W - 44, 27, 8);
      ctx.fillStyle = '#344653'; rr(16, 248, W - 32, 342, 25);
      ctx.fillStyle = '#1c2c39'; ctx.fillRect(0, 590, W, H - 590);
    });
    boosterSeat(180, 447, 1);
    // Hips meet the cushion at y447; knees project forward and feet hang below.
    bayraa(180, 469, 1.6, { mood: this.fastened ? 'happy' : this.dead ? 'scared' : 'ok', noShadow: true, seated: true });
    // Armrests overlap the sitter at the sides, placing the child inside the seat.
    ctx.fillStyle = '#283b55'; rr(95, 416, 23, 43, 8); rr(242, 416, 23, 43, 8);
    ctx.fillStyle = '#7493a6'; rr(96, 414, 22, 10, 5); rr(242, 414, 22, 10, 5);
    ctx.strokeStyle = '#16232c'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    seg(112, 385, this.fastened ? BUCKLE.x : this.x, this.fastened ? BUCKLE.y : this.y);
    if (this.fastened) seg(139, 451, BUCKLE.x, BUCKLE.y);
    ctx.strokeStyle = '#b8c9d2'; ctx.lineWidth = 2;
    seg(110, 385, this.x - 2, this.y);
    ctx.fillStyle = '#b3c0ca'; rr(this.x - 9, this.y - 8, 18, 16, 3);
    ctx.fillStyle = '#ce453e'; rr(BUCKLE.x - 12, BUCKLE.y - 11, 24, 25, 5);
    ctx.fillStyle = this.fastened ? '#5ed597' : '#f4d5c8'; circ(BUCKLE.x, BUCKLE.y + 1, 4);
  }
}
