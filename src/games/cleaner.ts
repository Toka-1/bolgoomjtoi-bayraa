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

// One transform for the sink, bottles, closing door, and their interaction targets.
const UNIT = { x: 180, y: 470, scale: .78 };
const unitX = (x: number): number => UNIT.x + (x - 170) * UNIT.scale;
const unitY = (y: number): number => UNIT.y + (y - 412) * UNIT.scale;
const LOCK = { x: unitX(321), y: unitY(443) };
function drawUnit(paint: () => void): void {
  ctx.save(); ctx.translate(UNIT.x, UNIT.y); ctx.scale(UNIT.scale, UNIT.scale); ctx.translate(-170, -412);
  paint(); ctx.restore();
}
export class Cleaner implements Micro {
  readonly focus = {zoom:1.05,y:470,height:360};
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
    this.approach = Math.min(1, this.approach + dt / (4.1 - (ctl.stage ?? 0) * .35));
    if (this.approach >= 1) { this.dead = true; ctl.lose(this.lose); }
  }
  down(x: number, y: number): void {
    if (this.dead || this.safe) return;
    if (dist(x, y, LOCK.x, LOCK.y) < 30) { this.safe = true; ctl.win(); }
    else if (x > unitX(192) && x < unitX(301) && y > unitY(441) && y < unitY(521)) { this.dead = true; ctl.lose('Цэвэрлэгээний бодист бүү хүр!'); }
  }
  key(k: string, down: boolean): void { if (down && k === 'ArrowUp') this.down(LOCK.x, LOCK.y); }
  resultUpdate(dt: number): void { if (this.safe) this.door = Math.min(1, this.door + dt * 2.5); }
  hint(): void { if (!this.safe && !this.dead) highlight(LOCK.x, LOCK.y, 24); }
  danger(): void { if (!this.safe && !this.dead) dangerZone(unitX(192), unitY(456), 105 * UNIT.scale, 69 * UNIT.scale); }
  draw(): void {
    layer('cleaner-room', () => {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#c9dacf'], [1, '#f1f2db']]); ctx.fillRect(0, 0, W, H);
      perspectiveFloor(500, '#bd9873');
      // An ordinary window and tiled splashback anchor the counter to the room.
      ctx.fillStyle = '#72919b'; rr(190, 250, 132, 133, 5);
      ctx.fillStyle = '#d0e7ea'; rr(197, 257, 118, 119, 2);
      ctx.strokeStyle = '#f5efdf'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(256, 257); ctx.lineTo(256, 376); ctx.moveTo(197, 316); ctx.lineTo(315, 316); ctx.stroke();
      ctx.fillStyle = '#f4efdf'; rr(183, 383, 145, 9, 3);
      ctx.fillStyle = '#dce5d9'; rr(177, 412, 163, 85, 2);
      ctx.strokeStyle = 'rgba(92,120,112,.25)'; ctx.lineWidth = 1;
      for (let x = 177; x < 341; x += 27) { ctx.beginPath(); ctx.moveTo(x, 412); ctx.lineTo(x, 497); ctx.stroke(); }
      for (let y = 412; y < 498; y += 22) { ctx.beginPath(); ctx.moveTo(177, y); ctx.lineTo(340, y); ctx.stroke(); }
      drawUnit(() => {
      // The basin rests on the cupboard countertop rather than floating above it.
      solidBox(170, 412, 164, 132, 12, '#ad7847', '#d8b17e', '#775133');
      solidBox(166, 396, 173, 16, 12, '#c4ced0', '#eef2eb', '#8d9d9f');
      ctx.fillStyle = '#8b9fa7'; rr(207, 386, 86, 13, 6);
      ctx.fillStyle = '#d0dbe0'; rr(248, 357, 9, 31, 4); rr(248, 353, 27, 9, 4);
      });
    });
    caregiver(72, 580, 1.3, this.dead);
    drawUnit(() => {
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
    ctx.fillStyle = this.safe ? '#25915a' : '#c34e43'; circ(321, 443, 5);
    });
    baby(306 - this.approach * 81, 595 - this.approach * 27, 0);
  }
}
