import { dangerZone, heatWaves } from '../art/danger';
import { ctx, W, H, layer } from '../core/canvas';
import { lin, rr, dist, seg } from '../core/draw';
import { ctl } from '../core/ctl';
import { caregiver } from '../art/safety';
import { baby } from '../art/props';
import { hotCup } from '../art/hazards';
import { highlight } from '../ui/gesture';
import type { Micro } from './types';

export class Drink implements Micro {
  readonly cmd = 'ТОМ ХҮНЭЭ ДУУД!';
  readonly sub = 'Халуун аягыг том хүнээр холдуул';
  readonly lose = 'Дүү бүтээлгээс татаж, аяга асгарлаа!';
  readonly tip = 'Халуун аягыг өөрөө бүү барь. Том хүнээр ширээний ирмэгээс, хүүхдийн гараас холдуул.';
  readonly winText = 'АЮУЛГҮЙ БОЛЛОО!';
  dead = false;
  private safe = false;
  private reach = 0;
  private moved = 0;
  private spill = 0;
  init(): void { this.dead = false; this.safe = false; this.reach = 0; this.moved = 0; this.spill = 0; }
  update(dt: number): void {
    if (this.dead || this.safe) return;
    this.reach = Math.min(1, this.reach + dt / 4.2);
    if (this.reach >= 1) { this.dead = true; ctl.lose(this.lose); }
  }
  down(x: number, y: number): void {
    if (this.dead || this.safe) return;
    if (x >= 12 && x <= 115 && y >= 275 && y <= 555) { this.safe = true; ctl.win(); }
    else if (dist(x, y, 269, 385) < 36) { this.dead = true; ctl.lose(this.lose); }
  }
  key(k: string, down: boolean): void { if (down && k === 'ArrowLeft') this.down(60, 430); }
  resultUpdate(dt: number): void {
    if (this.safe) this.moved = Math.min(1, this.moved + dt * 2);
    if (this.dead) this.spill = Math.min(1, this.spill + dt * 2);
  }
  hint(): void { if (!this.safe && !this.dead) highlight(60, 420, 46); }
  danger(): void { if (!this.safe && !this.dead) { dangerZone(243, 350, 54, 48, 'heat'); heatWaves(245, 347, 45); } }
  draw(): void {
    layer('hot-drink-room', () => {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#e6d3bb'], [1, '#faf0da']]); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#b58a60'; ctx.fillRect(0, 495, W, H - 495);
      ctx.strokeStyle = 'rgba(94,63,37,.25)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 45) seg(180 + (x - 180) * 0.5, 495, x, H);
      ctx.fillStyle = '#9d7953'; rr(176, 132, 130, 146, 5);
      ctx.fillStyle = lin(0, 140, 0, 268, [[0, '#91cee9'], [1, '#e0f2e8']]); ctx.fillRect(184, 140, 114, 130);
      ctx.strokeStyle = '#f4e9d7'; ctx.lineWidth = 6; seg(241, 140, 241, 270); seg(184, 204, 298, 204);
      ctx.fillStyle = '#f4e9d7'; rr(166, 275, 150, 10, 3);
      ctx.fillStyle = '#b38c61'; rr(25, 150, 94, 95, 5);
      ctx.strokeStyle = '#dfc6a3'; ctx.lineWidth = 2; ctx.strokeRect(32, 157, 80, 81);
      ctx.fillStyle = '#e5d9c3'; rr(98, 188, 5, 20, 2);
    });
    caregiver(59 + this.moved * 50, 550, 1.45, this.dead);
    ctx.fillStyle = '#82552f'; rr(131, 403, 14, 132, 3); rr(283, 403, 14, 132, 3);
    ctx.fillStyle = '#c59359'; rr(118, 395, 192, 20, 6);
    ctx.fillStyle = '#dee7f1'; rr(255, 398, 35, 150, 4);
    ctx.save(); ctx.translate(269 - this.moved * 85 + this.spill * 20, 395 + this.spill * 110); ctx.rotate(this.spill * 0.8);
    hotCup(0, 0, 0.95); ctx.restore();
    baby(293 - this.reach * 28, 570 - this.reach * 23, 0);
  }
}
