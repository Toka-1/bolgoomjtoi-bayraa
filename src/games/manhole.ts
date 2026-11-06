import { dangerZone } from '../art/danger';
import { ctx, W, H, layer } from '../core/canvas';
import { lin, seg, rr } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa } from '../art/bayraa';
import { manhole } from '../art/hazards';
import { highlight } from '../ui/gesture';
import type { Micro } from './types';

export class Manhole implements Micro {
  readonly cmd = 'НҮХИЙГ ТОЙР!';
  readonly sub = 'Нүхний хажуугийн аюулгүй зам дээр дар';
  readonly lose = 'Нүхийг тойрч амжсангүй!';
  readonly tip = 'Таггүй нүхэнд ойртохгүй, дээгүүр нь үсрэхгүй. Хол зайтай тойрч, том хүнд хэл.';
  readonly winText = 'АЮУЛГҮЙ ТОЙРЛОО!';
  dead = false;
  private route = 0;
  private progress = 0;
  private fall = 0;
  private fell = false;
  init(): void { this.dead = false; this.route = 0; this.progress = 0; this.fall = 0; this.fell = false; }
  update(dt: number): void {
    if (this.dead || !this.route || this.progress >= 1) return;
    this.progress = Math.min(1, this.progress + dt / 2);
    if (this.progress >= 1) ctl.win();
  }
  down(x: number, y: number): void {
    if (this.dead || this.route || y < 360) return;
    if (x < 112) this.route = -1;
    else if (x > 258) this.route = 1;
    else if (((x - 180) / 62) ** 2 + ((y - 465) / 35) ** 2 <= 1) { this.dead = true; this.fell = true; ctl.lose('Нээлттэй нүх рүү орчихлоо!'); }
  }
  key(k: string, down: boolean): void { if (down && k === 'ArrowLeft') this.down(65, 470); if (down && k === 'ArrowRight') this.down(295, 470); }
  resultUpdate(dt: number): void { if (this.fell) this.fall = Math.min(1, this.fall + dt); }
  hint(): void { if (!this.dead && !this.route) { highlight(65, 465, 32); highlight(295, 485, 32); } }
  danger(): void { if (!this.dead && this.progress < 1) dangerZone(117, 429, 126, 71); }
  draw(): void {
    layer('manhole-pavement', () => {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#a8cbe3'], [1, '#e6edf3']]); ctx.fillRect(0, 0, W, H);
      for (const [x, y, w, h, colour] of [[0, 155, 108, 145, '#b6a997'], [118, 126, 112, 174, '#b3bec8'], [242, 176, 118, 124, '#bfb59f']] as const) {
        ctx.fillStyle = colour; rr(x, y, w, h, 2);
        ctx.fillStyle = '#6c8ca1';
        for (let wy = y + 12; wy < y + h - 16; wy += 28) for (let wx = x + 10; wx < x + w - 12; wx += 25) rr(wx, wy, 14, 18, 1);
        ctx.fillStyle = '#e8edf1'; ctx.fillRect(x - 2, y - 5, w + 4, 6);
      }
      ctx.fillStyle = '#abb4bf'; ctx.fillRect(0, 300, W, H - 300);
      ctx.strokeStyle = '#8896a5'; ctx.lineWidth = 2;
      for (let y = 320; y < H; y += 50) seg(0, y, W, y);
      seg(110, 300, 60, H); seg(245, 300, 300, H);
    });
    manhole(180, 465, 0.9);
    const p = this.progress, side = this.route < 0 ? 65 : 295;
    const x = !this.route ? 180 : p < 0.3 ? 180 + (side - 180) * p / 0.3 : p < 0.75 ? side : side + (180 - side) * (p - 0.75) / 0.25;
    const y = p < 0.3 ? 590 : p < 0.75 ? 590 - (p - 0.3) / 0.45 * 225 : 365 - (p - 0.75) / 0.25 * 20;
    ctx.save(); ctx.globalAlpha = 1 - this.fall;
    bayraa(this.fell ? 180 : x, this.fell ? 490 + this.fall * 40 : y, 1.25 - p * 0.25, { mood: this.dead ? 'scared' : p >= 1 ? 'happy' : 'ok' });
    ctx.restore();
  }
}
