import { dangerZone } from '../art/danger';
import { gesture } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, ell, seg } from '../core/draw';
import { ctl } from '../core/ctl';
import { sfx } from '../core/audio';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { caregiver, noSwimmingSign } from '../art/safety';
import { sun, cloud, ridge, grass } from '../art/scenery';
import type { Micro } from './types';

const WATER_X = 230, WATER_Y = 390;
const SAFE_X = 130, FEET_Y = 590;

/** Prevention: lead the child away from the water. Entering it is always a failure. */
export class River implements Micro {
  readonly focus = {zoom:1,y:425,height:420};
  readonly cmd = 'ГОЛ РУУ БҮҮ ОР!';
  readonly sub = 'Эрэг дээр дарж уснаас холд';
  readonly lose = 'Усанд орж, урсгалд автлаа!';
  readonly tip = 'Голын ус руу бүү ор. Урсгалд автах, живэх аюултай. Уснаас хол, эрэг дээр үлдэж том хүнд хэл.';
  readonly keys = '← — уснаас холдох';
  readonly winText = 'ЭРЭГ ДЭЭР ҮЛДЛЭЭ!';
  dead = false;
  x = 150;
  private leaving = false;
  private safe = false;
  private drift = 0;
  private sink = 0;

  init(): void { this.x = 150; this.leaving = false; this.safe = false; this.drift = 0; this.sink = 0; this.dead = false; }
  update(dt: number): void {
    if (this.dead || this.safe) return;
    if (this.leaving) {
      this.x = Math.max(SAFE_X, this.x - dt * 160);
      if (this.x <= SAFE_X) { this.safe = true; ctl.win(); }
    } else {
      this.x += dt * 18 * (1 + (ctl.stage ?? 0) * .15);
      if (this.x >= WATER_X) this.enterWater();
    }
  }
  private enterWater(): void {
    if (this.dead || this.safe) return;
    this.x = WATER_X + 18; this.dead = true; sfx('splash'); ctl.lose(this.lose);
  }
  down(x: number, y: number): void {
    if (this.dead || this.safe || y < WATER_Y) return;
    if (x < WATER_X) this.leaving = true;
    else this.enterWater();
  }
  key(k: string, isDown: boolean): void {
    if (!isDown || this.dead || this.safe) return;
    if (k === 'ArrowLeft') this.leaving = true;
    if (k === 'ArrowRight') this.enterWater();
  }
  /** The failure consequence cannot be reversed by tapping or swimming. */
  resultUpdate(dt: number): void {
    if (this.dead) { this.drift = Math.min(110, this.drift + 35 * dt); this.sink = Math.min(1, this.sink + dt * 0.5); }
  }
  hint(): void { if (!this.safe && !this.dead) gesture(this.x, FEET_Y - 75, SAFE_X, FEET_Y - 75, 35); }
  danger(): void { if (!this.safe && !this.dead) dangerZone(WATER_X + 3, WATER_Y + 4, 120, 205, 'water'); }
  draw(): void {
    layer('river-prevention', paintRiver);
    // The caregiver stays on dry land; the smaller child is the movable avatar.
    caregiver(58, 550, 1.3, this.dead);
    const r = rng(5);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;
    for (let i = 0; i < 24; i++) {
      const y = r(WATER_Y + 10, H - 10), x = WATER_X + ((r(0, 230) + (reduce ? 0 : clock.t * 45)) % 230);
      seg(x, y, x + 20, y);
    }
    ctx.save();
    if (this.dead) { ctx.beginPath(); ctx.rect(WATER_X, WATER_Y, W - WATER_X, H - WATER_Y); ctx.clip(); ctx.globalAlpha = 1 - this.sink; }
    bayraa(this.dead ? this.x + this.drift : this.x, FEET_Y + this.sink * 55, 1.3, {
      mood: this.dead ? 'scared' : this.safe ? 'happy' : 'ok', arms: this.dead ? 0.7 : 0,
      noShadow: this.dead,
    });
    ctx.restore();
    if (this.dead) {
      ctx.strokeStyle = '#e0f7ff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(this.x + this.drift, FEET_Y - 50, 40, 8, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
}

function paintRiver(): void {
  ctx.fillStyle = lin(0, 0, 0, WATER_Y, [[0, '#a4cbd7'], [1, '#d7effb']]); ctx.fillRect(0, 0, W, H);
  sun(290, 150, 22, '#fff6c8', '255,240,180', 0.5);
  cloud(90, 165, 0.7, 0.95, 21); cloud(240, 230, 0.5, 0.85, 22);
  ridge(360, 85, 81, [[0, '#7fa36a'], [1, '#9dbb7a']]);
  ctx.fillStyle = '#a4bd8d'; ctx.fillRect(0, 358, W, 35);
  grass(360, 390, 40, 7, 'rgba(40,80,20,.6)', 'rgba(170,210,100,.6)');
  ctx.fillStyle = lin(0, WATER_Y, 0, H, [[0, '#8ab7c8'], [1, '#658fa6']]); ctx.fillRect(WATER_X, WATER_Y, W - WATER_X, H - WATER_Y);
  ctx.fillStyle = lin(0, WATER_Y, 0, H, [[0, '#ead6a1'], [1, '#d1b37d']]); ctx.fillRect(0, WATER_Y, WATER_X, H - WATER_Y);
  ctx.strokeStyle = '#f4e8c8'; ctx.lineWidth = 8; seg(WATER_X, WATER_Y, WATER_X, H);
  const r = rng(3); ctx.fillStyle = '#ad9c7b';
  for (let i = 0; i < 35; i++) ell(r(12, WATER_X - 16), r(WATER_Y + 10, H), r(2, 5), r(1, 3));
  ctx.fillStyle = '#775a3a'; ctx.fillRect(187, 300, 6, 92);
  noSwimmingSign(190, 300, 40);
}
