import { dangerZone } from '../art/danger';
import { perspectiveFloor, solidBox } from '../art/depth';
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
  danger(): void { if (!this.safe && !this.dead) dangerZone(192, 456, 105, 69); }
  draw(): void {
    layer('cleaner-room', () => {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#c9dacf'], [1, '#f1f2db']]); ctx.fillRect(0, 0, W, H);
      perspectiveFloor(420, '#bd9873');
      // The basin rests on the cupboard countertop rather than floating above it.
      solidBox(170, 412, 164, 132, 12, '#ad7847', '#d8b17e', '#775133');
      solidBox(166, 396, 173, 16, 12, '#c4ced0', '#eef2eb', '#8d9d9f');
      ctx.fillStyle = '#8b9fa7'; rr(207, 386, 86, 13, 6);
      ctx.fillStyle = '#d0dbe0'; rr(248, 357, 9, 31, 4); rr(248, 353, 27, 9, 4);
    });
    caregiver(72, 560, 1.8, this.dead);
    ctx.fillStyle = '#574535'; rr(180, 422, 144, 112, 3);
    solidBox(180, 522, 144, 10, 8, '#986d43', '#d5ae7b', '#755333');
    cleaningBottle(216, 522, 0.9); cleaningBottle(274, 522, 0.75);
    // Left hinge: open door projects out into the room; closed door covers bottles.
    const edge = 173 - 43 * (1 - this.door) + 158 * this.door;
    const offset = 24 * (1 - this.door);
    ctx.fillStyle = '#c89560'; ctx.strokeStyle = '#805536'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(173, 415); ctx.lineTo(edge, 415 + offset);
    ctx.lineTo(edge, 541 + offset); ctx.lineTo(173, 541); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d5dee3'; rr(310, 426, 22, 34, 5);
    ctx.fillStyle = this.safe ? '#25915a' : '#c34e43'; circ(LOCK.x, LOCK.y, 5);
    baby(306 - this.approach * 81, 588 - this.approach * 45, 0);
  }
}
