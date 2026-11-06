import { gesture, highlight, stopHint } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rad, rr, circ, seg, text, rand, glow, C } from '../core/draw';
import { ctl } from '../core/ctl';
import { sfx } from '../core/audio';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { car, CAR_PAINTS, type CarPaint } from '../art/props';
import { mottle, chimneySmoke } from '../art/scenery';
import type { Micro } from './types';

/** Lanes: far lane drives left, near lane drives right. `y` is road level, `s` the perspective scale. */
const LANES = [{ y: 378, s: 1.9, dir: -1 }, { y: 452, s: 2.4, dir: 1 }] as const;
/** The zebra crossing spans these x values; cars stop before it on green. */
const ZEBRA_L = 122, ZEBRA_R = 238;
const CAR_LEN = 80, GAP = 34, SPEED = 230;
const START_Y = 592, END_Y = 300;

interface Car { x: number; lane: 0 | 1; paint: CarPaint; v: number }

export class Crossing implements Micro {
  readonly cmd = 'НОГООНЫГ ХҮЛЭЭ!';
  readonly sub = 'Ногоон асахад дэлгэц дээр дар';
  readonly lose = 'Хоцорлоо!';
  readonly tip = 'Явган хүний гарцаар зөвхөн ногоон гэрэл асахад гар. Гарахаасаа өмнө зүүн, баруун тийшээ хар. Утсаа ширтэж бүү алх.';
  readonly keys = 'Space / ↑ — зам гарах';
  dead = false;
  private t = 0;
  private redT = 1.5;
  private cars: Car[] = [];
  private spawn = [0, 0];
  private walking = false;
  private walk = 0;
  private hit = 0;
  private crashed = false;

  init(): void {
    this.t = 0; this.redT = rand(1.0, 2.2);
    this.walking = false; this.walk = 0; this.hit = 0; this.crashed = false;
    this.spawn = [rand(0, 0.3), rand(0, 0.3)];
    // start with traffic already flowing
    this.cars = [
      { x: rand(-40, 60), lane: 0, paint: pick(), v: SPEED },
      { x: rand(200, 300), lane: 1, paint: pick(), v: SPEED },
    ];
  }

  private get green(): boolean { return this.t >= this.redT; }

  /** Cosmetic: walk across (or stumble) and fade the crash flash. */
  resultUpdate(dt: number): void {
    if (this.hit > 0) this.hit -= dt;
    if (this.walking) this.walk = Math.min(1, this.walk + dt / 1.6);
  }

  update(dt: number): void {
    this.t += dt;
    this.resultUpdate(dt);

    // traffic
    for (const l of [0, 1] as const) {
      if (this.green) continue;
      this.spawn[l] -= dt;
      if (this.spawn[l] <= 0) {
        this.spawn[l] = rand(0.55, 1.1);
        const dir = LANES[l].dir;
        this.cars.push({ x: dir > 0 ? -CAR_LEN * LANES[l].s - 10 : W + 10, lane: l, paint: pick(), v: SPEED });
      }
    }
    for (const l of [0, 1] as const) {
      const dir = LANES[l].dir;
      const length = CAR_LEN * LANES[l].s;
      // front-most first
      const lane = this.cars.filter(c => c.lane === l).sort((a, b) => (b.x - a.x) * dir);
      let limit = Infinity; // how far (in travel direction) the front of this car may go
      for (const c of lane) {
        const front = dir > 0 ? c.x + length : W - c.x;
        const stopLine = dir > 0 ? ZEBRA_L - 6 : W - (ZEBRA_R + 6);
        let target = SPEED;
        if (this.green && front <= stopLine + 2) limit = Math.min(limit, stopLine);
        const room = limit - front;
        if (room < 60) target = Math.max(0, room * 4);
        c.v += (target - c.v) * Math.min(1, dt * (target < c.v ? 10 : 3));
        const move = Math.min(c.v * dt, Math.max(0, limit - front));
        c.x += move * dir;
        const newFront = front + move;
        limit = newFront - length - GAP;
      }
    }
    this.cars = this.cars.filter(c => c.x > -CAR_LEN * LANES[c.lane].s - 40 && c.x < W + 40);
  }

  down(): void {
    if (this.walking || this.dead) return;
    this.walking = true;
    if (this.green) ctl.win();
    else { this.dead = true; this.crashed = true; this.hit = 0.5; sfx('horn'); ctl.lose('Машин мөргөчихлөө!'); }
  }
  /** Only show where to tap once it is actually safe. */
  hint(): void {
    if (this.walking) return;
    highlight(300, 360, 43);
    if (this.green) gesture(180, 450, 180, 450, 40);
    else stopHint(180, 540, 28);
  }
  key(k: string, isDown: boolean): void { if (isDown && (k === ' ' || k === 'ArrowUp' || k === 'Enter')) this.down(); }

  draw(): void {
    layer('crossing-street', paintStreet);
    chimneySmoke(72, 92, 0.8, '205,205,210', 0.45);

    // Bayraa walks up the crossing; on a red tap he only gets one step out before the screech.
    const k = this.crashed ? Math.min(this.walk, 0.12) : this.walk;
    const by = START_Y + (END_Y - START_Y) * k;
    // Follow the ground depth: a readable foreground child recedes toward the far pavement.
    const bs = 1.45 - 0.7 * k;
    const bob = this.walking && !this.dead && !reduce ? Math.abs(Math.sin(clock.t * 12)) * -3 : 0;

    const items: Array<[number, () => void]> = [];
    for (const c of this.cars) {
      const L = LANES[c.lane];
      items.push([L.y, () => drawCar(c, L.y, L.s, L.dir, this.green)]);
    }
    items.push([by, () => bayraa(180, by + bob, bs, {
      mood: this.crashed ? 'dead' : this.dead ? 'scared' : this.walking ? 'happy' : this.green ? 'ok' : 'scared',
      rot: this.crashed ? -0.35 * Math.min(1, this.walk * 6) : 0,
    })]);
    items.push([612, () => signal(300, 612, this.green, Math.max(0, this.redT - this.t))]);
    items.sort((a, b) => a[0] - b[0]);
    for (const [, f] of items) f();

    if (this.crashed) {
      // a car skids in
      drawCar({ x: 20, lane: 1, paint: CAR_PAINTS[1], v: 0 }, LANES[1].y + 20, LANES[1].s, 1, true);
      if (this.hit > 0) { ctx.fillStyle = `rgba(255,255,255,${this.hit})`; ctx.fillRect(0, 0, W, H); }
      text('ДУУТ!', 230, 470, 26, '#fff', { stroke: C.red, sw: 7, drop: true });
    }
  }
}

const pick = (): CarPaint => CAR_PAINTS[Math.floor(Math.random() * CAR_PAINTS.length)];

function drawCar(c: Car, y: number, s: number, dir: number, braking: boolean): void {
  ctx.save();
  if (dir > 0) { ctx.translate(c.x, y); ctx.scale(s, s); car(0, 0, braking && c.v < SPEED * 0.9, 0, c.paint); }
  else { ctx.translate(c.x + CAR_LEN * s, y); ctx.scale(-s, s); car(0, 0, braking && c.v < SPEED * 0.9, 0, c.paint); }
  ctx.restore();
}

/** Pedestrian signal with a countdown. (x, y) is the foot of the pole. */
function signal(x: number, y: number, green: boolean, left: number): void {
  ctx.fillStyle = 'rgba(10,12,30,.3)'; ctx.beginPath(); ctx.ellipse(x + 2, y + 2, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lin(x - 3, 0, x + 3, 0, [[0, '#3a3f4a'], [0.5, '#8a909c'], [1, '#2a2e36']]);
  ctx.fillRect(x - 3, y - 260, 6, 260);
  const bx = x - 18, by = y - 286;
  ctx.fillStyle = '#0d0f14'; rr(bx - 2, by - 2, 40, 74, 7);
  ctx.fillStyle = lin(bx, 0, bx + 36, 0, [[0, '#2a2d36'], [1, '#14161c']]); rr(bx, by, 36, 70, 6);
  const lamp = (cy: number, on: boolean, rgb: string, walkPose: boolean) => {
    ctx.fillStyle = '#07080b'; rr(bx + 4, cy - 14, 28, 28, 4);
    ctx.fillStyle = on ? `rgb(${rgb})` : `rgba(${rgb},.14)`;
    person(bx + 18, cy, walkPose);
    if (on) glow(bx + 18, cy, 34, rgb, 0.5);
  };
  lamp(by + 18, !green, '255,60,50', false);
  lamp(by + 52, green, '60,255,140', true);
  // countdown
  ctx.fillStyle = '#07080b'; rr(bx - 34, by + 4, 30, 26, 4);
  if (!green) text(String(Math.ceil(left)), bx - 19, by + 18, 18, '#ff4a3a', { w: 700 });
  else if (!reduce && Math.sin(clock.t * 10) > 0) text('→', bx - 19, by + 17, 18, '#3cff8c', { w: 700 });
  else if (reduce) text('→', bx - 19, by + 17, 18, '#3cff8c', { w: 700 });
}

/** Pictogram person for the signal lamp. */
function person(x: number, y: number, walking: boolean): void {
  circ(x, y - 9, 3);
  ctx.beginPath(); ctx.roundRect(x - 3, y - 5, 6, 9, 2); ctx.fill();
  ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  if (walking) { seg(x - 1, y + 3, x - 5, y + 11); seg(x + 1, y + 3, x + 5, y + 10); seg(x - 3, y - 3, x - 7, y + 2); seg(x + 3, y - 3, x + 6, y + 1); }
  else { seg(x - 1.5, y + 3, x - 1.5, y + 11); seg(x + 1.5, y + 3, x + 1.5, y + 11); seg(x - 3, y - 3, x - 4, y + 4); seg(x + 3, y - 3, x + 4, y + 4); }
}

function paintStreet(): void {
  // winter city sky and blocks
  ctx.fillStyle = lin(0, 0, 0, 300, [[0, '#9fb6d0'], [1, '#e4e6e4']]); ctx.fillRect(0, 0, W, 300);
  const r = rng(91);
  for (let x = -6; x < W; x += r(34, 52)) {
    const h = r(70, 130), w = r(30, 46);
    ctx.fillStyle = 'rgba(150,162,180,.75)'; ctx.fillRect(x, 300 - 30 - h, w, h);
  }
  const blocks: Array<[number, number, number, string]> = [[0, 110, 120, '#b9ac98'], [128, 70, 110, '#a7b1bd'], [246, 120, 114, '#c6b9a2']];
  for (const [x, y, w, base] of blocks) {
    ctx.fillStyle = lin(x, 0, x + w, 0, [[0, base], [1, 'rgba(90,90,100,1)']]);
    ctx.globalAlpha = 1; ctx.fillRect(x, y, w, 300 - y);
    ctx.fillStyle = lin(x, 0, x + w, 0, [[0, 'rgba(255,255,255,.15)'], [1, 'rgba(0,0,0,.25)']]); ctx.fillRect(x, y, w, 300 - y);
    for (let wy = y + 10; wy < 280; wy += 22) for (let wx = x + 9; wx < x + w - 12; wx += 20) {
      const lit = r() < 0.3;
      ctx.fillStyle = lit ? lin(0, wy, 0, wy + 12, [[0, '#ffe39a'], [1, '#f2b048']]) : lin(0, wy, 0, wy + 12, [[0, '#8096ad'], [1, '#4a5a6e']]);
      ctx.fillRect(wx, wy, 10, 12);
    }
    ctx.fillStyle = '#f5f8fb'; rr(x - 2, y - 5, w + 4, 7, 3);
  }
  ctx.fillStyle = '#5c6470'; ctx.fillRect(68, 92, 8, 18);
  // shop signs at street level
  ctx.fillStyle = lin(0, 250, 0, 268, [[0, '#2f6fe0'], [1, '#1a47a8']]); rr(14, 252, 80, 16, 3);
  text('ДЭЛГҮҮР', 54, 260, 10, '#fff', { w: 700 });
  ctx.fillStyle = lin(0, 250, 0, 268, [[0, '#e5332a'], [1, '#9e140d']]); rr(262, 252, 74, 16, 3);
  text('ЭМИЙН САН', 299, 260, 9, '#fff', { w: 700 });
  ctx.fillStyle = lin(0, 200, 0, 300, [[0, 'rgba(214,214,206,0)'], [1, 'rgba(214,214,206,.55)']]); ctx.fillRect(0, 200, W, 100);

  // far sidewalk
  ctx.fillStyle = lin(0, 296, 0, 330, [[0, '#c9ccd2'], [1, '#aeb3bb']]); ctx.fillRect(0, 296, W, 34);
  ctx.strokeStyle = 'rgba(80,85,95,.25)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 26) seg(x, 296, x - 6, 330);
  ctx.fillStyle = lin(0, 326, 0, 334, [[0, '#e6e8ec'], [1, '#7b808a']]); ctx.fillRect(0, 326, W, 8);
  // road
  ctx.fillStyle = lin(0, 334, 0, 476, [[0, '#4e525b'], [1, '#666a73']]); ctx.fillRect(0, 334, W, 142);
  mottle(0, 334, W, 142, 44, '25,25,30', 40, 0.12);
  const grit = rng(17);
  for (let i = 0; i < 360; i++) { ctx.fillStyle = grit() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.18)'; ctx.fillRect(grit(0, W), grit(334, 476), 1, 1); }
  // lane line
  ctx.fillStyle = '#f2f2ee';
  for (let x = 0; x < W; x += 44) if (x + 24 < ZEBRA_L - 10 || x > ZEBRA_R + 10) rr(x, 402, 24, 4, 1);
  // stop lines
  ctx.fillRect(ZEBRA_L - 12, 404, 4, 66); ctx.fillRect(ZEBRA_R + 8, 338, 4, 66);
  // zebra crossing in perspective (narrower at the far side)
  for (let i = 0; i < 9; i++) {
    const y0 = 340 + i * 15.5, y1 = y0 + 8.5;
    const sq = 0.86 + 0.14 * ((y0 - 334) / 142);
    const cx = (ZEBRA_L + ZEBRA_R) / 2, hw = ((ZEBRA_R - ZEBRA_L) / 2) * sq;
    ctx.fillStyle = 'rgba(245,245,240,.92)'; ctx.fillRect(cx - hw, y0, hw * 2, y1 - y0);
  }
  mottle(ZEBRA_L, 340, ZEBRA_R - ZEBRA_L, 136, 3, '60,60,60', 14, 0.18);
  // near curb and sidewalk
  ctx.fillStyle = lin(0, 474, 0, 488, [[0, '#7b808a'], [0.3, '#eceef1'], [1, '#b9bdc4']]); ctx.fillRect(0, 474, W, 14);
  ctx.fillStyle = lin(0, 488, 0, H, [[0, '#b8bcc3'], [1, '#d6d9de']]); ctx.fillRect(0, 488, W, H - 488);
  ctx.strokeStyle = 'rgba(80,85,95,.28)'; ctx.lineWidth = 1.2;
  for (let y = 488; y < H; y += 36) seg(0, y, W, y);
  for (let x = -40; x < W + 40; x += 40) seg(x, 488, x + (x - 180) * 0.25, H);
  // tactile paving at the crossing
  ctx.fillStyle = lin(0, 490, 0, 520, [[0, '#f2c400'], [1, '#d9a800']]); ctx.fillRect(ZEBRA_L + 8, 490, ZEBRA_R - ZEBRA_L - 16, 28);
  ctx.fillStyle = 'rgba(120,80,0,.35)';
  for (let y = 495; y < 516; y += 7) for (let x = ZEBRA_L + 14; x < ZEBRA_R - 10; x += 8) circ(x, y, 1.6);
  ctx.fillStyle = lin(0, 300, 0, 320, [[0, '#f2c400'], [1, '#d9a800']]); ctx.fillRect(ZEBRA_L + 14, 302, ZEBRA_R - ZEBRA_L - 28, 20);
  // snow left on the edges
  mottle(0, 600, W, 40, 9, '255,255,255', 16, 0.5);
  ctx.fillStyle = rad(20, 630, 60, [[0, 'rgba(255,255,255,.8)'], [1, 'rgba(255,255,255,0)']]); circ(20, 630, 60);
  ctx.fillStyle = rad(350, 300, 40, [[0, 'rgba(255,255,255,.7)'], [1, 'rgba(255,255,255,0)']]); circ(350, 300, 40);
}
