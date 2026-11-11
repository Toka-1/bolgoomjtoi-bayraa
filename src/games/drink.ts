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
  readonly focus = {zoom:1.04,y:450,height:400};
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
    this.reach = Math.min(1, this.reach + dt / (4.2 - (ctl.stage ?? 0) * .35));
    if (this.reach >= 1) { this.dead = true; ctl.lose(this.lose); }
  }
  down(x: number, y: number): void {
    if (this.dead || this.safe) return;
    if (x >= 12 && x <= 115 && y >= 275 && y <= 555) { this.safe = true; ctl.win(); }
    else if (dist(x, y, 269, 385) < 26) { this.dead = true; ctl.lose(this.lose); }
  }
  key(k: string, down: boolean): void { if (down && k === 'ArrowLeft') this.down(60, 430); }
  resultUpdate(dt: number): void {
    if (this.safe) this.moved = Math.min(1, this.moved + dt * 2);
    if (this.dead) this.spill = Math.min(1, this.spill + dt * 2);
  }
  hint(): void { if (!this.safe && !this.dead) highlight(60, 420, 46); }
  danger(): void { if (!this.safe && !this.dead) { dangerZone(252, 375, 34, 24, 'heat'); heatWaves(255, 371, 28); } }
  draw(): void {
    layer('hot-drink-room', () => {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#e6d3bb'], [1, '#faf0da']]); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#b58a60'; ctx.fillRect(0, 495, W, H - 495);
      ctx.strokeStyle = 'rgba(94,63,37,.25)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 45) seg(180 + (x - 180) * 0.5, 495, x, H);
      // Window sill and table share the same waist-height reference.
      ctx.fillStyle = '#9d7953'; rr(176, 230, 130, 140, 5);
      ctx.fillStyle = lin(0, 238, 0, 362, [[0, '#91cee9'], [1, '#e0f2e8']]); ctx.fillRect(184, 238, 114, 124);
      ctx.strokeStyle = '#f4e9d7'; ctx.lineWidth = 6; seg(241, 238, 241, 362); seg(184, 300, 298, 300);
      ctx.fillStyle = '#f4e9d7'; rr(166, 370, 150, 10, 3);
      ctx.fillStyle = '#b38c61'; rr(25, 260, 78, 60, 5);
      ctx.fillStyle = '#e9ddc7'; rr(32, 267, 64, 46, 2);
      ctx.strokeStyle = '#8c9b7e'; ctx.lineWidth = 3; seg(40, 302, 58, 284); seg(58, 284, 87, 302);
      ctx.fillStyle = 'rgba(129,88,49,.18)'; ctx.fillRect(0, 490, W, 5);
    });
    caregiver(59 + this.moved * 50, 550, 1.45, this.dead);
    ctx.fillStyle = '#82552f'; rr(131, 403, 14, 132, 3); rr(283, 403, 14, 132, 3);
    ctx.fillStyle = '#c59359'; rr(118, 395, 192, 20, 6);
    ctx.fillStyle = '#dee7f1'; rr(255, 398, 35, 150, 4);
    ctx.save(); ctx.translate(269 - this.moved * 85 + this.spill * 20, 395 + this.spill * 110); ctx.rotate(this.spill * 0.8);
    hotCup(0, 0, 0.55); ctx.restore();
    baby(293 - this.reach * 28, 570 - this.reach * 23, 0);
  }
}
