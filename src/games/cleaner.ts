import { ctx, W, H, layer } from '../core/canvas';
import { lin, rr, circ, dist } from '../core/draw';
import { ctl } from '../core/ctl';
import { caregiver } from '../art/safety';
import { baby } from '../art/props';
import { cleaningBottle } from '../art/hazards';
import { highlight } from '../ui/gesture';
import type { Micro } from './types';

const LOCK = { x: 321, y: 443 };
export class Cleaner implements Micro {
  readonly cmd = 'ШҮҮГЭЭГ ТҮГЖ!';
  readonly sub = 'Том хүнээр шүүгээг хаалгаж түгжүүл';
  readonly lose = 'Дүү бодист хүрчихлээ!';
  readonly tip = 'Цэвэрлэгээний бодист хүрч, амсаж болохгүй. Том хүнээр шүүгээнд хийлгэж түгжүүл.';
  readonly winText = 'ШҮҮГЭЭГ ТҮГЖЛЭЭ!';
  dead = false;
  private safe = false; private approach = 0; private door = 0;
  init(): void { this.dead = false; this.safe = false; this.approach = 0; this.door = 0; }
  update(dt: number): void {
    if (this.dead || this.safe) return;
    this.approach = Math.min(1, this.approach + dt / 4.1);
    if (this.approach >= 1) { this.dead = true; ctl.lose(this.lose); }
  }
  down(x: number, y: number): void {
    if (this.dead || this.safe) return;
    if (dist(x, y, LOCK.x, LOCK.y) < 30) { this.safe = true; ctl.win(); }
    else if (x > 192 && x < 301 && y > 441 && y < 521) { this.dead = true; ctl.lose('Цэвэрлэгээний бодист бүү хүр!'); }
  }
  key(k: string, down: boolean): void { if (down && k === 'ArrowUp') this.down(LOCK.x, LOCK.y); }
  resultUpdate(dt: number): void { if (this.safe) this.door = Math.min(1, this.door + dt * 2.5); }
  hint(): void { if (!this.safe && !this.dead) highlight(LOCK.x, LOCK.y, 24); }
  draw(): void {
    layer('cleaner-room', () => {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#c9dacf'], [1, '#f1f2db']]); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#a7805b'; ctx.fillRect(0, 505, W, H - 505);
      ctx.fillStyle = '#e8edf0'; rr(175, 265, 156, 60, 10);
      ctx.fillStyle = '#a6b4bd'; rr(200, 273, 104, 36, 10);
      ctx.fillStyle = '#d0dbe0'; rr(244, 241, 13, 43, 5); rr(244, 237, 39, 12, 5);
    });
    caregiver(60, 554, 1.35, this.dead);
    ctx.fillStyle = '#ad7847'; rr(170, 328, 164, 216, 6);
    ctx.fillStyle = '#574535'; rr(180, 338, 144, 196, 3);
    cleaningBottle(216, 522, 0.9); cleaningBottle(274, 522, 0.75);
    if (this.door > 0) { ctx.fillStyle = '#c89560'; rr(173, 331, 158 * this.door, 210, 5); }
    ctx.fillStyle = '#d5dee3'; rr(310, 426, 22, 34, 5);
    ctx.fillStyle = this.safe ? '#25915a' : '#c34e43'; circ(LOCK.x, LOCK.y, 5);
    baby(306 - this.approach * 81, 588 - this.approach * 45, 0);
  }
}
