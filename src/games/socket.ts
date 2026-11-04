import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rad, rr, ell, seg, circ, text, dist, shadow, glow, C } from '../core/draw';
import { ctl } from '../core/ctl';
import { sfx } from '../core/audio';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { planks, skirting, mottle } from '../art/scenery';
import type { Micro } from './types';

export class Socket implements Micro {
  readonly cmd = 'БИТГИЙ ХҮР!';
  readonly sub = 'Юунд ч хүрэлгүй хүлээ';
  readonly lose = 'Цахилгаанд цохиулчихлаа!';
  readonly tip = 'Залгуур руу сэрээ, түлхүүр зэрэг төмөр юм хэзээ ч бүү хий. Хүүхэдтэй гэрт залгуурын хамгаалалт тавь.';
  readonly timeoutWin = true;
  readonly keys = 'Юу ч бүү дар';
  readonly winText = 'ЗӨВ, ХҮРСЭНГҮЙ!';
  dead = false;
  private zap = 0;

  init(): void { this.zap = 0; }
  update(): void {}
  resultUpdate(dt: number): void { this.zap = Math.max(0, this.zap - dt); }
  key(k: string, isDown: boolean): void {
    if (isDown && (k === 'Enter' || k === ' ')) this.down(250, 300);
  }
  down(x: number, y: number): void {
    if (dist(x, y, 250, 300) < 60 || dist(x, y, 120, 478) < 55) { this.zap = 0.7; this.dead = true; sfx('zap'); ctl.lose(this.lose); }
  }
  draw(): void {
    layer('socket-room', paintRoom);
    const glint = reduce ? 0.6 : (Math.sin(clock.t * 6) + 1) / 2;
    sparkle(150, 462, 3 + glint * 5, glint);
    bayraa(250, 590, 1.1, { mood: this.dead ? 'dead' : 'ok', arms: this.dead ? 1 : 0 });
    if (!this.dead) {
      shadow(115, 382, 70, 6, 0.15);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.roundRect(40, 330, 150, 46, 18); ctx.moveTo(150, 374); ctx.lineTo(196, 410); ctx.lineTo(168, 372); ctx.fill();
      ctx.strokeStyle = 'rgba(27,31,59,.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(40, 330, 150, 46, 18); ctx.stroke();
      text('Хүрээд үзэх үү?', 115, 353, 15, C.ink, { w: 700 });
    }
    if (this.zap > 0) {
      ctx.fillStyle = `rgba(255,240,120,${this.zap * 0.75})`; ctx.fillRect(0, 0, W, H);
      glow(250, 470, 140, '170,210,255', this.zap);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9 + clock.t * 3;
        bolt(250 + Math.cos(a) * 28, 470 + Math.sin(a) * 34, 250 + Math.cos(a) * 70, 470 + Math.sin(a) * 80);
      }
      bolt(250, 300, 250, 420);
    }
  }
}

function bolt(x1: number, y1: number, x2: number, y2: number): void {
  const pts: Array<[number, number]> = [[x1, y1]];
  for (let k = 1; k < 5; k++) pts.push([x1 + (x2 - x1) * k / 5 + (Math.random() - 0.5) * 16, y1 + (y2 - y1) * k / 5 + (Math.random() - 0.5) * 16]);
  pts.push([x2, y2]);
  for (const [w, c] of [[7, 'rgba(120,180,255,.45)'], [2.5, '#ffffff']] as const) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
}

function sparkle(x: number, y: number, r: number, a: number): void {
  glow(x, y, r * 3, '255,255,240', a * 0.6);
  ctx.fillStyle = `rgba(255,255,255,${0.4 + a * 0.6})`;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const ang = (i * Math.PI) / 4, rr2 = i % 2 ? r * 0.25 : r; ctx.lineTo(x + Math.cos(ang) * rr2, y + Math.sin(ang) * rr2); }
  ctx.closePath(); ctx.fill();
}

function paintRoom(): void {
  // wallpaper with stripes and a small repeating motif
  ctx.fillStyle = lin(0, 0, 0, 500, [[0, '#bdd8c5'], [1, '#d4e8da']]); ctx.fillRect(0, 0, W, 500);
  ctx.fillStyle = 'rgba(140,180,152,.35)'; for (let x = 0; x < W; x += 36) ctx.fillRect(x, 0, 14, 500);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 0; x < W; x += 36) ctx.fillRect(x + 14, 0, 1.5, 500);
  ctx.fillStyle = 'rgba(110,150,122,.35)';
  for (let y = 20; y < 490; y += 40) for (let x = 25; x < W; x += 36) {
    const yy = y + ((x / 36) % 2) * 20;
    ctx.beginPath(); ctx.moveTo(x, yy - 5); ctx.quadraticCurveTo(x + 4, yy, x, yy + 5); ctx.quadraticCurveTo(x - 4, yy, x, yy - 5); ctx.fill();
  }
  mottle(0, 0, W, 500, 31, '60,90,70', 40, 0.05);
  ctx.fillStyle = lin(0, 0, 0, 70, [[0, 'rgba(30,50,40,.25)'], [1, 'rgba(30,50,40,0)']]); ctx.fillRect(0, 0, W, 70);
  skirting(500);
  planks(500, H, 180, 15, '#c48e5c', '#86592f');
  // socket plate
  shadow(253, 337, 40, 6, 0.25);
  ctx.fillStyle = 'rgba(30,50,40,.25)'; rr(218, 269, 70, 70, 12);
  ctx.fillStyle = lin(215, 265, 285, 335, [[0, '#ffffff'], [1, '#d9dde2']]); rr(215, 265, 70, 70, 12);
  ctx.fillStyle = lin(222, 272, 278, 328, [[0, '#e3e7ec'], [1, '#ffffff']]); rr(222, 272, 56, 56, 9);
  ctx.fillStyle = rad(250, 300, 22, [[0, '#d0d5db'], [0.8, '#eef1f4'], [1, '#b9c0c8']], 252, 304); circ(250, 300, 21);
  ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(250, 300, 21, 0, Math.PI * 2); ctx.stroke();
  for (const hx of [240, 260]) { ctx.fillStyle = '#1c1f26'; circ(hx, 300, 3.6); ctx.fillStyle = 'rgba(255,255,255,.5)'; circ(hx + 0.8, 301.6, 1); }
  text('220V', 250, 350, 12, '#5b6b60', { w: 700 });
  // fork lying on the floor
  ctx.save(); ctx.translate(120, 478); ctx.rotate(-0.4);
  ctx.fillStyle = 'rgba(30,15,5,.35)'; ell(2, 7, 44, 5);
  ctx.lineCap = 'round';
  ctx.strokeStyle = lin(0, -4, 0, 4, [[0, '#f2f4f7'], [0.5, '#a3abb5'], [1, '#5c636d']]);
  ctx.lineWidth = 7; seg(-40, 0, 12, 0);
  ctx.lineWidth = 9; seg(8, 0, 16, 0);
  ctx.lineWidth = 2.6; for (const dy of [-7, -2.5, 2.5, 7]) seg(16, dy * 0.6, 40, dy);
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2; seg(-36, -2, 6, -2);
  ctx.restore();
  // a power cable running along the skirting
  ctx.strokeStyle = '#f4f4f4'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(278, 334); ctx.bezierCurveTo(300, 420, 320, 470, W + 10, 492); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(279.5, 334); ctx.bezierCurveTo(301.5, 420, 321, 471, W + 10, 494); ctx.stroke();
  const r = rng(3);
  ctx.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 20; i++) circ(r(0, W), r(520, H), r(0.5, 1.2));
}
