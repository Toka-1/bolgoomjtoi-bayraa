import { ctx, W, H, layer } from '../core/canvas';
import { rr, ell, dist } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa } from '../art/bayraa';
import { caregiver } from '../art/safety';
import { dangerZone } from '../art/danger';
import { perspectiveFloor } from '../art/depth';
import { reversingCar, damagedCord, snowRoof, icicle } from '../art/prevention';
import type { Micro } from './types';
import {outdoorBackdrop} from '../art/outdoors';

const CHILD = { x: 182, y: 591, scale: 1.1, safeX: 146 };
const CORD = { x: 270, y: 578, scale: .7 };
const FALLING = { x: 201, startY: 325, length: 46, groundY: 590 };

/** All outcomes latch once; the result animation cannot alter gameplay. */
abstract class Retreat implements Micro {
  readonly focus = {zoom:1.05,y:460,height:420};
  abstract readonly cmd: string;
  abstract readonly sub: string;
  abstract readonly lose: string;
  abstract readonly tip: string;
  readonly winText = 'АЮУЛААС ХОЛДЛОО!';
  dead = false; safe = false; walk = 0; approach = 0;
  init(): void { this.dead = false; this.safe = false; this.walk = 0; this.approach = 0; }
  protected leave(): void { if (!this.dead && !this.safe) { this.safe = true; ctl.win(); } }
  protected fail(): void { if (!this.dead && !this.safe) { this.dead = true; ctl.lose(this.lose); } }
  key(k: string, down: boolean): void { if (down && k === 'ArrowLeft') this.leave(); }
  resultUpdate(dt: number): void { if (this.safe) this.walk = Math.min(1, this.walk + dt * 1.4); }
  abstract update(dt: number): void;
  abstract down(x: number, y: number): void;
  abstract draw(): void;
  protected adultHit(x: number, y: number): boolean {
    return x >= 7 && x <= 104 && y >= 376 && y <= 597;
  }
  people(): void {
    caregiver(54, 590, 1.3, this.dead);
    bayraa(CHILD.x + (CHILD.safeX - CHILD.x) * this.walk, CHILD.y, CHILD.scale, { mood: this.safe ? 'happy' : this.dead ? 'scared' : 'ok' });
  }
}

export class Reversing extends Retreat {
  vehicle(): { x: number; y: number; scale: number } { return { x: 250 - this.approach * 29, y: CHILD.y, scale: 3 }; }
  readonly cmd = 'МАШИНЫ АРААС ХОЛД!';
  readonly sub = 'Том хүнтэй хамт машинаас холд';
  readonly lose = 'Ухарч буй машинд хэт ойртлоо!';
  readonly tip = 'Ухарч буй машины араар бүү яв. Машинаас хол байж, том хүнтэй хамт яв.';
  update(dt: number): void {
    if (this.safe || this.dead) return;
    this.approach = Math.min(1, this.approach + dt / (4.2 - (ctl.stage ?? 0) * .35));
    if (this.approach >= 1) this.fail();
  }
  down(x: number, y: number): void {
    const v = this.vehicle();
    if (this.adultHit(x, y)) this.leave();
    else if (x >= v.x - 9 && x <= v.x + 127 * v.scale && y >= v.y - 54 * v.scale && y <= v.y + 10) this.fail();
  }
  danger(): void {
    const v = this.vehicle();
    if (!this.safe && !this.dead) dangerZone(v.x - 12, v.y - 54 * v.scale, W - v.x + 8, 54 * v.scale + 4);
  }
  draw(): void {
    layer('reversing-yard', () => {
      ctx.fillStyle = '#bed4dc'; ctx.fillRect(0, 0, W, H);
      outdoorBackdrop('city',W,H,456);
      ctx.fillStyle = '#cab6a0'; rr(180, 125, 180, 331, 4);
      ctx.fillStyle = '#6b7d83'; rr(207, 198, 142, 258, 4);
      ctx.strokeStyle = 'rgba(214,224,222,.4)'; ctx.lineWidth = 2;
      for (let y = 212; y < 453; y += 18) { ctx.beginPath(); ctx.moveTo(210, y); ctx.lineTo(346, y); ctx.stroke(); }
      ctx.fillStyle = '#e0d4bc'; rr(198, 188, 158, 12, 2);
      ctx.fillStyle = '#b4c49a'; ctx.fillRect(0, 411, W, 45);
      perspectiveFloor(456, '#b8b7b0');
      ctx.fillStyle = '#e9e3d4'; rr(0, 456, 197, 150, 3);
      ctx.fillStyle = '#989e9a'; rr(197, 456, 8, 150, 2);
    });
    this.people();
    const v = this.vehicle(); reversingCar(v.x, v.y, v.scale);
  }
}

export class Cord extends Retreat {
  readonly cmd = 'ЭВДЭРСЭН УТАСНААС ХОЛД!';
  readonly sub = 'Утсанд хүрэлгүй том хүнд хэл';
  readonly lose = 'Ил гарсан утсанд хүрчихлээ!';
  readonly tip = 'Эвдэрсэн цахилгааны утсанд бүү хүр. Өөрөө засах, залгах гэж оролдохгүй, том хүнд хэл.';
  readonly timeoutWin = true;
  update(): void {}
  down(x: number, y: number): void {
    if (this.adultHit(x, y)) this.leave();
    else if (dist(x, y, CORD.x, CORD.y) < 19 ||
      (x >= CORD.x - 66 * CORD.scale && x <= CORD.x + 89 * CORD.scale && y >= CORD.y - 30 * CORD.scale && y <= CORD.y + 20 * CORD.scale)) this.fail();
  }
  danger(): void { if (!this.safe && !this.dead) dangerZone(220, 552, 116, 44, 'electric'); }
  draw(): void {
    layer('cord-room', () => {
      ctx.fillStyle = '#e9ddc7'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#aa8d72'; rr(191, 260, 132, 131, 5);
      ctx.fillStyle = '#b5d0d6'; rr(200, 269, 114, 113, 3);
      ctx.fillStyle = '#e9e1cd'; rr(184, 391, 146, 9, 3);
      perspectiveFloor(466, '#c1a17d');
      ctx.fillStyle = '#e8e4d8'; rr(266, 400, 40, 39, 5);
      ctx.fillStyle = '#69777c'; rr(279, 412, 4, 9, 1); rr(291, 412, 4, 9, 1);
      ctx.strokeStyle = '#596570'; ctx.lineWidth = 6;
      ctx.fillStyle = '#596570'; rr(276, 414, 20, 20, 4);
      ctx.beginPath(); ctx.moveTo(286, 434); ctx.lineTo(286, 466);
      ctx.bezierCurveTo(286, 496, 205, 522, CORD.x - 66 * CORD.scale, CORD.y - 15 * CORD.scale); ctx.stroke();
    });
    damagedCord(CORD.x, CORD.y, CORD.scale);
    this.people();
  }
}

export class Icicles extends Retreat {
  fallingTip(): { x: number; y: number } {
    const fall = Math.max(0, (this.approach - .55) / .45);
    return { x: FALLING.x, y: FALLING.startY + FALLING.length + fall * (FALLING.groundY - FALLING.startY - FALLING.length) };
  }
  readonly cmd = 'ДЭЭВРЭЭС ХОЛД!';
  readonly sub = 'Мөсөн унжлагаас хол, том хүн дээр оч';
  readonly lose = 'Мөсөн унжлага доор зогсчихлоо!';
  readonly tip = 'Дээврээс мөс, цас унаж болно. Байшингийн ирмэгээс хол явж, том хүнд хэл.';
  update(dt: number): void {
    if (this.safe || this.dead) return;
    this.approach = Math.min(1, this.approach + dt / (4.3 - (ctl.stage ?? 0) * .3));
    // The consequence starts when the ice reaches the child's head, not after
    // it has already passed through the character and hit the pavement.
    if (this.fallingTip().y >= CHILD.y - 109 * CHILD.scale) this.fail();
  }
  down(x: number, y: number): void {
    const tip = this.fallingTip();
    if (this.adultHit(x, y)) this.leave();
    else if ((x >= 175 && x <= 344 && y >= 544 && y <= 605) ||
      (x >= 175 && x <= 344 && y >= 312 && y <= 392) ||
      (Math.abs(x - tip.x) <= 14 && y >= tip.y - FALLING.length && y <= tip.y + 6)) this.fail();
  }
  danger(): void { if (!this.safe && !this.dead) dangerZone(185, 326, 150, 66, 'cold'); }
  draw(): void {
    layer('icicle-street', () => {
      ctx.fillStyle = '#c6d9e0'; ctx.fillRect(0, 0, W, H);
      outdoorBackdrop('winter-city',W,H,478);
      perspectiveFloor(478, '#ecece2', 'rgba(95,124,140,.15)');
      snowRoof(183, 318, 151, 0, 272);
    });
    ctx.fillStyle = 'rgba(95,124,140,.15)'; ell(FALLING.x, FALLING.groundY, 21, 6);
    const tip = this.fallingTip();
    icicle(tip.x, tip.y - FALLING.length, FALLING.length);
    this.people();
  }
}
