import { gesture } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rad, rr, circ, ell, seg, text, C } from '../core/draw';
import { ctl } from '../core/ctl';
import { sfx } from '../core/audio';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { sun, cloud, ridge, grass } from '../art/scenery';
import type { Micro } from './types';

/** Water surface line; Bayraa's head bobs just above it. */
const WATER_Y = 400;
/** Reach the bank on the left to win, drift past the buoys on the right to lose. */
const SHORE_X = 70, DEEP_X = 318;
const KICK = 160;
const AVATAR_SCALE = 1.35;
// Shoulder height sets immersion; scaling the child must not lift him out of the water.
const SURFACE_Y = WATER_Y + 14;

export class River implements Micro {
  readonly cmd = 'ЭРЭГ РҮҮ СЭЛ!';
  readonly sub = 'Олон дахин дарж эрэг рүү сэл';
  readonly lose = 'Урсгалд автчихлаа!';
  readonly tip = 'Голд ганцаараа, гүн, урсгал хүчтэй газар хэзээ ч бүү ор. Том хүн хараж байхад гүехэн газар л сэл. Урсгалд автвал эрэг рүү хөндлөн сэл.';
  readonly keys = 'Space — сэлэх';
  readonly winText = 'ЭРЭГТЭЭ ГАРЛАА!';
  dead = false;
  x = 200;
  private v = 0;
  private t = 0;
  private stroke = 0;
  private sink = 0;
  private safe = false;

  init(): void { this.x = 200; this.v = 40; this.t = 0; this.stroke = 0; this.sink = 0; this.safe = false; this.dead = false; }

  update(dt: number): void {
    if (this.dead || this.safe) return;
    this.t += dt;
    const current = 55 + this.t * 10;
    this.v += (current - this.v) * Math.min(1, dt * 2.5);
    this.x += this.v * dt;
    if (this.stroke > 0) this.stroke -= dt;
    if (this.x <= SHORE_X) { this.x = SHORE_X; this.safe = true; ctl.win(); }
    else if (this.x >= DEEP_X) { this.dead = true; ctl.lose(this.lose); }
  }
  /** Cosmetic: climb out on the bank, or get pulled under past the buoys. */
  resultUpdate(dt: number): void {
    if (this.dead) { this.sink = Math.min(1, this.sink + dt * 1.2); this.x += 30 * dt; }
    if (this.safe) this.x = Math.max(36, this.x - 30 * dt);
  }
  private swim(): void {
    if (this.dead || this.safe) return;
    this.v -= KICK; this.stroke = 0.25;
    sfx('splash');
  }
  down(): void { this.swim(); }
  key(k: string, isDown: boolean): void { if (isDown && (k === ' ' || k === 'ArrowLeft' || k === 'Enter')) this.swim(); }
  hint(): void { if (!this.safe && !this.dead) gesture(180, 520, 180, 520, 34); }

  draw(): void {
    layer('river', paintRiver);
    const t = clock.t;
    // current: streaks drifting right
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    const r = rng(5);
    for (let i = 0; i < 26; i++) {
      const y = r(WATER_Y + 8, H - 10), sp = r(40, 90), len = r(12, 30);
      const x = ((r(0, W + 60) + (reduce ? 0 : t * sp)) % (W + 60)) - 30;
      seg(x, y, x + len, y);
    }
    buoys(t);

    // Bayraa in the water: only head, shoulders and arms show above the surface
    const bob = reduce ? 0 : Math.sin(t * 5) * 2;
    const climb = this.safe ? Math.min(1, (SHORE_X - this.x) / 34) : 0;
    const swimFeet = SURFACE_Y + 66 * AVATAR_SCALE;
    const by = swimFeet + bob + this.sink * 100 - climb * (swimFeet - WATER_Y);
    ctx.save();
    // Once he climbs onto the bank, show his full body and ground shadow.
    if (climb < 1) { ctx.beginPath(); ctx.rect(0, 0, W, SURFACE_Y); ctx.clip(); }
    bayraa(this.x, by, AVATAR_SCALE, {
      mood: this.dead ? 'scared' : this.safe ? 'happy' : this.x > 250 ? 'scared' : 'ok',
      arms: this.stroke > 0 ? 1 : 0.55, wave: this.dead, noShadow: climb < 1,
    });
    ctx.restore();
    // ripples around him
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
    for (let k = 0; k < 2; k++) {
      const p = ((t * 1.4 + k * 0.5) % 1);
      ctx.globalAlpha = (1 - p) * (1 - climb) * (1 - this.sink);
      ctx.beginPath(); ctx.ellipse(this.x, SURFACE_Y, 30 + p * 30, 6 + p * 4, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (this.stroke > 0) {
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      for (let k = 0; k < 5; k++) circ(this.x + 26 + k * 5, WATER_Y + 4 - Math.sin(k) * 8 * this.stroke * 4, 2.5);
    }
    // progress hint: arrow toward the bank
    if (!this.safe && !this.dead) text('◀ ЭРЭГ', 86, 250, 18, '#fff', { stroke: C.ink, sw: 5 });
  }
}

function buoys(t: number): void {
  for (let i = 0; i < 4; i++) {
    const y = WATER_Y + 30 + i * 50, bob = reduce ? 0 : Math.sin(t * 3 + i) * 2;
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
    if (i < 3) seg(DEEP_X + 10, y + bob, DEEP_X + 10, y + 50);
    ctx.fillStyle = rad(DEEP_X + 10, y + bob, 9, [[0, '#ff8a7e'], [1, '#b81a12']], DEEP_X + 7, y + bob - 3);
    circ(DEEP_X + 10, y + bob, 8);
    ctx.fillStyle = '#fff'; ctx.fillRect(DEEP_X + 3, y + bob - 1.5, 14, 3);
  }
}

function paintRiver(): void {
  ctx.fillStyle = lin(0, 0, 0, WATER_Y, [[0, '#3f9de6'], [1, '#bfe6fb']]); ctx.fillRect(0, 0, W, H);
  sun(290, 80, 22, '#fff6c8', '255,240,180', 0.55);
  cloud(90, 90, 0.7, 0.95, 21); cloud(250, 170, 0.5, 0.85, 22);
  ridge(330, 90, 81, [[0, '#7fa36a'], [1, '#9dbb7a']]);
  // far bank with larches
  ctx.fillStyle = lin(0, 330, 0, WATER_Y, [[0, '#86b84a'], [1, '#5f9a2f']]); ctx.fillRect(0, 336, W, WATER_Y - 336);
  const r = rng(3);
  for (let i = 0; i < 14; i++) {
    const x = r(0, W), h = r(26, 46), y = 344 + r(0, 10);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 1.5, y - 6, 3, 8);
    ctx.fillStyle = lin(0, y - h, 0, y, [[0, '#3f7a3a'], [1, '#2a5a2a']]);
    ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + h * 0.32, y - 4); ctx.lineTo(x - h * 0.32, y - 4); ctx.closePath(); ctx.fill();
  }
  grass(336, 356, 40, 7, 'rgba(40,80,20,.6)', 'rgba(170,210,100,.6)');
  // water
  ctx.fillStyle = lin(0, WATER_Y, 0, H, [[0, '#4fb3d9'], [0.5, '#2c86b3'], [1, '#1a5f8a']]); ctx.fillRect(0, WATER_Y, W, H - WATER_Y);
  // deep water beyond the buoys is darker
  ctx.fillStyle = lin(DEEP_X - 30, 0, W, 0, [[0, 'rgba(10,40,80,0)'], [1, 'rgba(10,40,80,.45)']]); ctx.fillRect(DEEP_X - 30, WATER_Y, W, H - WATER_Y);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, WATER_Y, W, 2);
  // near bank: pebbles and sand on the left
  ctx.fillStyle = lin(0, 0, 90, 0, [[0, '#e6cf98'], [1, '#cdb178']]);
  ctx.beginPath(); ctx.moveTo(0, WATER_Y - 10); ctx.quadraticCurveTo(70, WATER_Y - 6, 92, WATER_Y + 20);
  ctx.quadraticCurveTo(60, H * 0.8, 40, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 40; i++) {
    const y = r(WATER_Y, H), x = r(0, 60 - (y - WATER_Y) * 0.05);
    ctx.fillStyle = r() < 0.5 ? '#a99b84' : '#8a7c66'; ell(x, y, r(2, 5), r(1.5, 3));
  }
  // a lifebuoy hanging on a post: the safe spot is where adults watch
  ctx.fillStyle = '#7a5532'; ctx.fillRect(28, WATER_Y - 110, 6, 110);
  ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(31, WATER_Y - 76, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 7;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(31, WATER_Y - 76, 13, k * Math.PI / 2, k * Math.PI / 2 + 0.5); ctx.stroke(); }
  // "deep" sign
  ctx.fillStyle = '#6b6f78'; ctx.fillRect(338, WATER_Y - 70, 4, 70);
  ctx.fillStyle = '#fff'; rr(318, WATER_Y - 92, 40, 24, 3);
  ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(320, WATER_Y - 90, 36, 20);
  ctx.fillStyle = C.red; ctx.font = '900 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('ГҮН', 338, WATER_Y - 80);
}
