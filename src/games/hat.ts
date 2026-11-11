import { dangerZone } from '../art/danger';
import { gesture, highlight } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { sfx } from '../core/audio';
import { lin, rad, rr, circ, seg, text, rand, dist, C } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa, winterHat } from '../art/bayraa';
import { snowfall, sun, ridge, hills, mottle, puffSprite, drawPuff } from '../art/scenery';
import type { Micro } from './types';
import { DragKeys } from '../core/dragKeys';

// Keep the drawn hat brim, hint and drop target on the same head anchor.
const AVATAR = { x: 180, y: 600, scale: 1.65 };
const HEAD_Y = AVATAR.y - 101 * AVATAR.scale;

export class Hat implements Micro {
  readonly focus = {zoom:1.02,y:386};
  readonly cmd = 'МАЛГАЙГАА ӨМС!';
  readonly sub = 'Лоовуузыг толгой руу нь чир';
  readonly lose = 'Хөлдчихлөө!';
  readonly tip = 'Хасах 40 градуст чих, хамар хамгийн түрүүнд хөлддөг. Чихийг нь бүрхдэг дулаан малгай, бээлий, ороолтоо заавал өмс.';
  dead = false;
  readonly keys = 'Баруун товч: авах / тавих';
  private arrows = new DragKeys();
  private hx = 0; private hy = 0; private drag = false; private on = false;
  private t = 0; private wind = 1; private settled = 0;

  init(): void {
    this.dead = false; this.t = 0; this.settled = 0;
    this.wind = Math.random() < .5 ? -1 : 1;
    this.hx = rand(70, 290); this.hy = rand(235, 330); this.cancelInput(); this.on = false;
  }
  update(dt: number): void {
    if (this.dead || this.on) return;
    this.t += dt;
    // Wind moves only the loose hat. A held hat always follows the player's hand.
    if (!this.drag) {
      this.hx = Math.max(55, Math.min(W - 55, this.hx + this.wind * (ctl.stage ?? 0) * (14 + 9 * Math.sin(this.t * 3)) * dt));
    }
    if (!this.drag) return;
    const [dx, dy] = this.arrows.delta(dt);
    this.hx = Math.max(20, Math.min(W - 20, this.hx + dx));
    this.hy = Math.max(130, Math.min(H - 40, this.hy + dy));
  }
  cancelInput(): void { this.drag = false; this.arrows.clear(); }
  key(k: string, isDown: boolean): void {
    this.arrows.key(k, isDown);
  }
  select(x: number, y: number): boolean {
    if (this.on || this.dead) return false;
    if (this.drag) { this.move(x, y); this.up(); } else this.down(x, y);
    return this.drag;
  }
  down(x: number, y: number): void { if (!this.on && dist(x, y, this.hx, this.hy - 14) < 50) this.drag = true; }
  move(x: number, y: number): void { if (this.drag) { this.hx = x; this.hy = y + 14; } }
  up(): void {
    if (!this.drag) return;
    this.drag = false;
    if (dist(this.hx, this.hy, AVATAR.x, HEAD_Y) < 55) { this.on = true; sfx('settle'); ctl.win(); }
  }
  resultUpdate(dt: number): void { if (this.on) this.settled = Math.min(1, this.settled + dt * 4); }
  hint(): void {
    if (this.on) return;
    if (this.drag) highlight(AVATAR.x, HEAD_Y, 55);
    else gesture(this.hx, this.hy - 14, AVATAR.x, HEAD_Y - 14, 45);
  }
  danger(): void { if (!this.on && !this.dead) dangerZone(24, 380, 58, 88, 'cold'); }
  draw(): void {
    layer('hat-steppe', paintSteppe);
    if ((ctl.stage ?? 0) > 0 && !this.on) {
      // A fluttering cloth makes the wind direction visible without action arrows.
      ctx.strokeStyle = '#715d52'; ctx.lineWidth = 3; seg(280, 170, 280, 240);
      const flutter = reduce ? 0 : Math.sin(clock.t * 9) * 5;
      ctx.fillStyle = '#f3ac67';
      ctx.beginPath(); ctx.moveTo(280, 172); ctx.lineTo(280 + this.wind * 43, 178 + flutter);
      ctx.lineTo(280 + this.wind * 43, 193 + flutter); ctx.lineTo(280, 190); ctx.closePath(); ctx.fill();
    }
    const cold = this.on ? 0 : ctl.playing ? ctl.frac : this.dead ? 1 : 0;
    const frozen = this.dead || (!this.on && ctl.playing && ctl.frac > 0.75);
    // breath vapour
    const img = puffSprite('255,255,255'), t = clock.t;
    for (let i = 0; i < 4; i++) {
      const p = (t * 0.7 + i / 4) % 1;
      drawPuff(img, AVATAR.x + 8 + p * 40, AVATAR.y - 77 * AVATAR.scale - p * 26, 5 + p * 16, 0.6 * (1 - p));
    }
    bayraa(AVATAR.x, AVATAR.y, AVATAR.scale, { hat: false, shiver: !this.on, frozen, mood: this.dead ? 'dead' : this.on ? 'happy' : 'scared' });
    if (this.on) {
      const bounce = reduce ? 0 : Math.sin(this.settled * Math.PI * 2) * 9 * (1 - this.settled);
      winterHat(AVATAR.x, HEAD_Y - bounce, AVATAR.scale);
    }
    if (!this.on) {
      if (this.drag) { ctx.fillStyle = 'rgba(10,20,40,.18)'; circ(this.hx + 6, this.hy + 16, 24); }
      winterHat(this.hx, this.hy, AVATAR.scale);
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
  ctx.save(); ctx.translate(0,240); ctx.scale(.6,.6);
  ctx.fillStyle = 'rgba(20,30,60,.2)'; rr(39, 114, 22, 120, 11);
  ctx.fillStyle = lin(36, 0, 58, 0, [[0, '#ffffff'], [0.6, '#eef3f8'], [1, '#c4cfdc']]); rr(36, 110, 22, 120, 11);
  ctx.fillStyle = lin(42, 0, 52, 0, [[0, '#6fb6e8'], [1, '#3d86c4']]); rr(43, 196, 8, 32, 4);
  ctx.fillStyle = rad(47, 236, 15, [[0, '#a8dcff'], [1, '#2f78b8']], 43, 231); circ(47, 236, 14);
  ctx.strokeStyle = 'rgba(27,31,59,.4)'; ctx.lineWidth = 1;
  for (let y = 122; y < 220; y += 10) seg(52, y, 56, y);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; rr(39, 118, 3, 100, 2);
  text('−40°', 112, 140, 40, C.ink, { stroke: '#fff', sw: 8, drop: true });
  ctx.restore();
}
