import { dangerZone } from '../art/danger';
import { gesture, highlight } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rad, rr, seg, C, circ } from '../core/draw';
import { ctl } from '../core/ctl';
import { rng } from '../core/rng';
import { cow, car, ger } from '../art/props';
import { sun, cloud, ridge, hills, grass, mottle } from '../art/scenery';
import type { Micro } from './types';

const CAR_Y = 466;
const COW_X = 210, COW_SCALE = 0.62;

export class Cow implements Micro {
  readonly focus = {zoom:1,y:450,height:320};
  readonly cmd = 'МАЛЫГ ХҮЛЭЭ!';
  readonly sub = 'Дарж байхад машин зогсоно';
  readonly lose = 'Хоцорлоо!';
  readonly tip = 'Хөдөө замд мал гэнэт гарч ирдэг. Хурдаа сааруулж, мал бүрэн гартал хүлээ.';
  dead = false;
  readonly keys = 'Space / ↓ — тоормос';
  private brakeKeys = new Set<string>();
  private pointerHold = false;
  private cx = 20; private v = 100; private hold = false; private cowY = 360; private t = 0; private t0 = 0;

  init(): void { this.dead = false; this.cx = 20; this.v = 100; this.cancelInput(); this.cowY = 360; this.t = 0; this.t0 = 0.1 + Math.random() * (0.4 + (ctl.stage ?? 0) * .15); }
  update(dt: number): void {
    if (this.dead) return;
    this.t += dt;
    if (this.t > this.t0) this.cowY += 85 * dt;
    const target = this.hold ? 0 : 100;
    this.v = Math.max(0, Math.min(100, this.v + (target > this.v ? 260 : -600) * dt));
    this.cx += this.v * dt;
    if (this.cowY > CAR_Y - 35 && this.cowY < CAR_Y + 50 && this.cx + 126 > COW_X - 34 * COW_SCALE && this.cx < COW_X + 65 * COW_SCALE) { this.dead = true; ctl.lose('Үхэр мөргөчихлөө!'); }
    if (this.cx + 126 >= 335) ctl.win();
  }
  down(): void { this.pointerHold = true; this.syncBrake(); }
  up(): void { this.pointerHold = false; this.syncBrake(); }
  private syncBrake(): void { this.hold = this.pointerHold || this.brakeKeys.size > 0; }
  cancelInput(): void { this.pointerHold = false; this.brakeKeys.clear(); this.syncBrake(); }
  hint(): void {
    if (this.cowY >= CAR_Y + 50) return;
    highlight(COW_X + 5, this.cowY - 24, 34);
    if (!this.hold) gesture(180, 550, 180, 550, 30);
  }
  key(k: string, isDown: boolean): void {
    if (k !== ' ' && k !== 'ArrowDown') return;
    if (isDown) this.brakeKeys.add(k); else this.brakeKeys.delete(k);
    this.syncBrake();
  }
  danger(): void { if (!this.dead && this.cowY < CAR_Y + 50) dangerZone(COW_X - 30, this.cowY - 52, 86, 56); }
  draw(): void {
    layer('cow-road', paintRoad);
    flag(345, 380);
    const shake = this.dead && !reduce ? Math.sin(clock.t * 50) * 2 : 0;
    const drawCar = () => car(this.cx, CAR_Y, this.hold, shake);
    if (this.cowY < CAR_Y) { cow(COW_X, this.cowY, COW_SCALE); drawCar(); } else { drawCar(); cow(COW_X, this.cowY, COW_SCALE); }
  }
}

function flag(x: number, y: number): void {
  const t = clock.t, w = reduce ? 0 : 1;
  ctx.strokeStyle = lin(x - 2, 0, x + 2, 0, [[0, '#d9d9de'], [1, '#6b6f78']]); ctx.lineWidth = 3; seg(x, y + 90, x, y);
  ctx.fillStyle = lin(x - 28, 0, x, 0, [[0, '#ff5a4a'], [1, '#b81a12']]);
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - 12, y + 2 + Math.sin(t * 6) * 3 * w, x - 26, y + 10 + Math.sin(t * 6 + 1) * 2 * w);
  ctx.quadraticCurveTo(x - 12, y + 14 + Math.sin(t * 6 + 2) * 3 * w, x, y + 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.gold; circ(x, y - 2, 3);
}

function paintRoad(): void {
  ctx.fillStyle = lin(0, 0, 0, 360, [[0, '#9ac5d4'], [0.7, '#a8d8f6'], [1, '#e2f3fc']]); ctx.fillRect(0, 0, W, H);
  sun(70, 120, 20, '#fff4c4', '255,240,190', 0.5);
  cloud(250, 110, 0.9, 1, 2); cloud(110, 190, 0.6, 0.85, 6); cloud(320, 230, 0.45, 0.7, 9);
  ridge(330, 110, 31, [[0, '#8ca3c8'], [1, '#a9bdd8']], 0.3);
  ridge(350, 60, 37, [[0, '#7d9a8a'], [1, '#93ae8a']]);
  hills(362, 6, 0.03, 0, [[0, '#a8d266'], [1, '#7fb247']], 40);
  ger(250, 370, 0.22); ger(285, 372, 0.18);
  const sheep = rng(4);
  for (let i = 0; i < 9; i++) { const x = sheep(40, 180), y = sheep(372, 392); ctx.fillStyle = '#f6f2ea'; rr(x, y, 6, 3.5, 2); ctx.fillStyle = '#2a2a2a'; circ(x + 6.5, y + 1, 1.3); }
  grass(366, 398, 50, 2, 'rgba(70,110,30,.6)', 'rgba(170,210,100,.6)');
  // gravel shoulder and asphalt
  ctx.fillStyle = '#b8a888'; ctx.fillRect(0, 396, W, 6); ctx.fillRect(0, 478, W, 6);
  ctx.fillStyle = lin(0, 400, 0, 480, [[0, '#5d6068'], [1, '#71747c']]); ctx.fillRect(0, 400, W, 80);
  mottle(0, 400, W, 80, 14, '30,30,35', 40, 0.12);
  const grit = rng(8);
  for (let i = 0; i < 300; i++) { ctx.fillStyle = grit() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.15)'; ctx.fillRect(grit(0, W), grit(400, 480), 1, 1); }
  ctx.fillStyle = '#f2f2ee'; for (let x = 0; x < W; x += 40) rr(x, 438, 22, 4, 1);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(0, 403, W, 1.5); ctx.fillRect(0, 475, W, 1.5);
  // foreground steppe
  ctx.fillStyle = lin(0, 484, 0, H, [[0, '#9cb886'], [1, '#7d9b68']]); ctx.fillRect(0, 484, W, H - 484);
  mottle(0, 490, W, 150, 19, '40,80,10', 30, 0.15);
  grass(492, H, 120, 3, 'rgba(50,90,20,.7)', 'rgba(180,220,110,.7)');
  // cattle warning sign
  ctx.fillStyle = '#6b6f78'; ctx.fillRect(28, 560, 4, 70);
  ctx.fillStyle = '#c4161c'; ctx.beginPath(); ctx.moveTo(30, 520); ctx.lineTo(56, 566); ctx.lineTo(4, 566); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd43a'; ctx.beginPath(); ctx.moveTo(30, 530); ctx.lineTo(48, 561); ctx.lineTo(12, 561); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1b1b1b'; rr(21, 545, 15, 8, 3); rr(34, 542, 6, 6, 2); ctx.fillRect(23, 552, 2, 5); ctx.fillRect(32, 552, 2, 5);
  ctx.fillStyle = rad(30, 548, 40, [[0, 'rgba(255,255,255,.15)'], [1, 'rgba(255,255,255,0)']], 20, 535); ctx.fillRect(0, 515, 60, 55);
}
