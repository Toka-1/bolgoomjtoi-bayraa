import { dangerZone } from '../art/danger';
import { ctx, W, H, layer } from '../core/canvas';
import { lin, rr, seg } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa } from '../art/bayraa';
import { caregiver } from '../art/safety';
import { highlight } from '../ui/gesture';
import type { Micro } from './types';

export class Balcony implements Micro {
  readonly cmd = 'ДОТОГШ ОР!';
  readonly sub = 'Хашлаганаас холдож том хүн дээр оч';
  readonly lose = 'Хашлаганаас холдож амжсангүй!';
  readonly tip = 'Тагтны хашлага, цонхны тавцан дээр бүү авир. Дэргэд нь сандал бүү тавь. Том хүнтэй хамт дотогш ор.';
  readonly winText = 'ДОТОГШ ОРЛОО!';
  dead = false;
  private safe = false; private walk = 0;
  init(): void { this.dead = false; this.safe = false; this.walk = 0; }
  update(): void {}
  down(x: number, y: number): void {
    if (this.dead || this.safe) return;
    if (x >= 10 && x <= 135 && y >= 300 && y <= 590) { this.safe = true; ctl.win(); }
    else if (x >= 185 && x <= 350 && y >= 380 && y <= 510) { this.dead = true; ctl.lose('Хашлага руу авирч болохгүй!'); }
  }
  key(k: string, down: boolean): void { if (down && k === 'ArrowLeft') this.down(65, 460); }
  resultUpdate(dt: number): void { if (this.safe) this.walk = Math.min(1, this.walk + dt * 1.3); }
  hint(): void { if (!this.safe && !this.dead) highlight(65, 450, 48); }
  danger(): void { if (!this.safe && !this.dead) dangerZone(177, 385, 175, 119); }
  draw(): void {
    layer('balcony-home', () => {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#9bcde9'], [1, '#e2f0fa']]); ctx.fillRect(0, 0, W, H);
      for (let x = 150; x < W; x += 57) {
        ctx.fillStyle = '#a4b2bf'; rr(x, 240 + (x % 3) * 20, 47, 220, 2);
        ctx.fillStyle = '#627e97'; for (let y = 260; y < 440; y += 32) rr(x + 12, y, 21, 18, 1);
      }
      ctx.fillStyle = '#e2c8a1'; ctx.fillRect(0, 75, 145, 465);
      ctx.fillStyle = '#ac7b4c'; rr(9, 220, 128, 321, 5);
      ctx.fillStyle = '#f5e2be'; ctx.fillRect(18, 229, 110, 312);
      ctx.fillStyle = '#c6c9ca'; ctx.fillRect(145, 510, W - 145, H - 510);
      ctx.fillStyle = '#b88757'; ctx.fillRect(0, 540, 145, H - 540);
      ctx.strokeStyle = '#596e7c'; ctx.lineWidth = 6;
      seg(166, 390, 354, 390); seg(166, 506, 354, 506);
      for (let x = 172; x < 355; x += 25) seg(x, 390, x, 506);
    });
    caregiver(58, 540, 1.35, this.dead);
    bayraa(245 - this.walk * 151, 584 - this.walk * 8, 1.3, { mood: this.safe ? 'happy' : this.dead ? 'scared' : 'ok' });
  }
}
