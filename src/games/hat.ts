import { ctx, W, H, clock, layer } from '../core/canvas';
import { lin, rad, rr, circ, seg, text, rand, dist, C } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa, mongolHat } from '../art/bayraa';
import { snowfall, sun, ridge, hills, mottle, puffSprite, drawPuff } from '../art/scenery';
import type { Micro } from './types';

export class Hat implements Micro {
  readonly cmd = 'МАЛГАЙГАА ӨМС!';
  readonly sub = 'Малгайг толгой руу нь чир';
  readonly lose = 'Хөлдчихлөө!';
  readonly tip = 'Хасах 40 градуст чих, хамар хамгийн түрүүнд хөлддөг. Малгай, бээлий, ороолтоо заавал өмс.';
  dead = false;
  private hx = 0; private hy = 0; private drag = false; private on = false;

  init(): void { this.hx = rand(70, 290); this.hy = rand(220, 330); this.drag = false; this.on = false; }
  update(): void {}
  down(x: number, y: number): void { if (!this.on && dist(x, y, this.hx, this.hy - 14) < 50) this.drag = true; }
  move(x: number, y: number): void { if (this.drag) { this.hx = x; this.hy = y + 14; } }
  up(): void {
    if (!this.drag) return;
    this.drag = false;
    if (dist(this.hx, this.hy, 180, 469) < 55) { this.on = true; ctl.win(); }
  }
  draw(): void {
    layer('hat-steppe', paintSteppe);
    const cold = this.on ? 0 : ctl.playing ? ctl.frac : this.dead ? 1 : 0;
    const frozen = this.dead || (!this.on && ctl.playing && ctl.frac > 0.75);
    // breath vapour
    const img = puffSprite('255,255,255'), t = clock.t;
    for (let i = 0; i < 4; i++) {
      const p = (t * 0.7 + i / 4) % 1;
      drawPuff(img, 186 + p * 40, 499 - p * 26, 5 + p * 16, 0.6 * (1 - p));
    }
    bayraa(180, 600, 1.3, { hat: this.on, shiver: !this.on, frozen, mood: this.dead ? 'dead' : this.on ? 'happy' : 'scared' });
    if (!this.on) {
      if (this.drag) { ctx.fillStyle = 'rgba(10,20,40,.18)'; circ(this.hx + 6, this.hy + 16, 24); }
      mongolHat(this.hx, this.hy, this.drag ? 1.45 : 1.3);
    }
    snowfall(0.95);
    // frost creeping in from the edges
    if (cold > 0) {
      ctx.fillStyle = rad(W / 2, H / 2, H * 0.7, [[0, 'rgba(225,242,255,0)'], [0.6 - cold * 0.2, 'rgba(225,242,255,0)'], [1, `rgba(225,242,255,${0.25 + cold * 0.55})`]]);
      ctx.fillRect(0, 0, W, H);
    }
  }
}

function paintSteppe(): void {
  ctx.fillStyle = lin(0, 0, 0, 470, [[0, '#7f9fc4'], [0.6, '#c9d9ea'], [1, '#f1f5fa']]); ctx.fillRect(0, 0, W, H);
  sun(270, 300, 14, '#fff6dc', '255,236,200', 0.35);
  ridge(440, 120, 17, [[0, '#a5b6cf'], [1, '#c8d4e4']], 0.6);
  ridge(470, 70, 23, [[0, '#93a6c2'], [1, '#bccbde']], 0.5);
  hills(470, 10, 0.02, 1, [[0, '#ffffff'], [1, '#dde7f2']]);
  hills(520, 8, 0.03, 2, [[0, '#f6f9fc'], [1, '#d4e0ec']]);
  mottle(0, 480, W, 160, 8, '140,165,200', 30, 0.08);
  ctx.strokeStyle = 'rgba(60,40,30,.6)'; ctx.lineWidth = 2;
  for (const [x, y, h] of [[300, 478, 28], [320, 482, 20], [26, 486, 24]] as const) {
    seg(x, y, x, y - h); seg(x, y - h * 0.6, x - 6, y - h * 0.85); seg(x, y - h * 0.5, x + 5, y - h * 0.8);
  }
  // thermometer
  ctx.fillStyle = 'rgba(20,30,60,.2)'; rr(39, 114, 22, 120, 11);
  ctx.fillStyle = lin(36, 0, 58, 0, [[0, '#ffffff'], [0.6, '#eef3f8'], [1, '#c4cfdc']]); rr(36, 110, 22, 120, 11);
  ctx.fillStyle = lin(42, 0, 52, 0, [[0, '#6fb6e8'], [1, '#3d86c4']]); rr(43, 196, 8, 32, 4);
  ctx.fillStyle = rad(47, 236, 15, [[0, '#a8dcff'], [1, '#2f78b8']], 43, 231); circ(47, 236, 14);
  ctx.strokeStyle = 'rgba(27,31,59,.4)'; ctx.lineWidth = 1;
  for (let y = 122; y < 220; y += 10) seg(52, y, 56, y);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; rr(39, 118, 3, 100, 2);
  text('−40°', 112, 140, 40, C.ink, { stroke: '#fff', sw: 8, drop: true });
}
