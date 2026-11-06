import { ctx, W, H, layer } from '../core/canvas';
import { lin, rr, dist } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa } from '../art/bayraa';
import { caregiver } from '../art/safety';
import { dog } from '../art/hazards';
import { sun, cloud } from '../art/scenery';
import { highlight } from '../ui/gesture';
import type { Micro } from './types';

export class Dog implements Micro {
  readonly cmd = 'НОХОЙНООС ХОЛ БАЙ!';
  readonly sub = 'Том хүн дээр дарж хамт холд';
  readonly lose = 'Том хүнээс тусламж авч амжсангүй!';
  readonly tip = 'Танихгүй нохойд ойртож, хүрч болохгүй. Том хүнд хэлж, хамт холд.';
  readonly winText = 'ХОЛДОЖ ЧАДЛАА!';
  dead = false;
  private safe = false;
  private walk = 0;
  init(): void { this.dead = false; this.safe = false; this.walk = 0; }
  update(): void {}
  down(x: number, y: number): void {
    if (this.dead || this.safe) return;
    if (x >= 12 && x <= 112 && y >= 300 && y <= 570) { this.safe = true; ctl.win(); }
    else if (dist(x, y, 275, 535) < 68) { this.dead = true; ctl.lose('Нохойд хэт ойртлоо!'); }
  }
  key(k: string, down: boolean): void { if (down && k === 'ArrowLeft') this.down(62, 470); }
  resultUpdate(dt: number): void { if (this.safe) this.walk = Math.min(1, this.walk + dt); }
  hint(): void { if (!this.safe && !this.dead) highlight(62, 452, 47); }
  draw(): void {
    layer('dog-courtyard', () => {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#8ac9ed'], [1, '#e6f3f9']]); ctx.fillRect(0, 0, W, H);
      sun(285, 135, 23, '#fff2bd', '255,240,180', 0.5);
      cloud(83, 130, 0.75, 0.9, 17); cloud(240, 220, 0.5, 0.8, 19);
      ctx.fillStyle = '#a9b9a0'; rr(0, 240, W, 160, 0);
      ctx.fillStyle = '#d6c4a6'; rr(12, 215, 106, 120, 4); rr(180, 240, 160, 95, 4);
      ctx.fillStyle = '#6d8f9e';
      for (let y = 231; y < 320; y += 28) for (let x = 25; x < 110; x += 29) rr(x, y, 15, 19, 2);
      for (let x = 198; x < 328; x += 32) rr(x, 256, 18, 27, 2);
      ctx.fillStyle = '#d9cfb7'; ctx.fillRect(0, 400, W, H - 400);
      ctx.fillStyle = '#b78857'; for (let x = 0; x < W; x += 24) rr(x, 310, 15, 112, 4);
    });
    caregiver(60, 550, 1.35, this.dead);
    dog(276, 555, 0.9);
    bayraa(164 - this.walk * 50, 590 - this.walk * 15, 1.3, { mood: this.safe ? 'happy' : this.dead ? 'scared' : 'ok' });
  }
}
