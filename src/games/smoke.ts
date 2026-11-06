import { gesture, highlightRect } from '../ui/gesture';
import { ctx, W, H, clock, layer } from '../core/canvas';
import { lin, rr, ell, seg, circ } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa } from '../art/bayraa';
import { stove, pipe } from '../art/props';
import { planks, skirting, mottle, puffSprite, drawPuff, ridge } from '../art/scenery';
import type { Micro } from './types';

const WX = 210, WY = 150, WW = 120, WH = 120;
const DOOR = { x: 242, y: 285, w: 100, h: 215 };

export class Smoke implements Micro {
  readonly cmd = 'ГАДАГШ ГАР!';
  readonly sub = 'Хаалган дээр дарж гадагш гар';
  readonly lose = 'Гадагш гарч амжсангүй!';
  readonly tip = 'Угаарын аюултай үед хаалгаар гадагш гарч, том хүнд хэл. Цонх нээх гэж дотор бүү үлд.';
  readonly winText = 'ГАДАА ГАРЛАА!';
  dead = false;
  private open = false;
  private smoke = 0.15;
  private exit = 0;

  init(): void { this.open = false; this.exit = 0; this.smoke = 0.15; }
  update(dt: number): void {
    this.smoke = Math.min(1, this.smoke + dt * 0.2);
  }
  down(x: number, y: number): void {
    if (!this.dead && !this.open && x >= DOOR.x && x <= DOOR.x + DOOR.w && y >= DOOR.y && y <= DOOR.y + DOOR.h) { this.open = true; ctl.win(); }
  }
  resultUpdate(dt: number): void { if (this.open) this.exit = Math.min(1, this.exit + dt * 1.8); }

  hint(): void {
    if (this.open) return;
    highlightRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h);
    gesture(292, 390, 292, 390, 36);
  }
  draw(): void {
    if (this.exit >= 1) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#83c8ef'], [1, '#eef9ff']]); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#8fbd62'; ctx.fillRect(0, 480, W, H - 480);
      bayraa(245, 574, 1.65, { mood: 'happy' });
      return;
    }
    layer('smoke-room', paintRoom);
    windowView();
    drawDoor(this.open);
    pipe(84, 0, 400, 22);
    stove(40, 390, 110, 110);
    bayraa(184 + this.exit * 108, 575 - this.exit * 75, 1.65 - this.exit * 0.2, {
      mood: this.dead ? 'dead' : this.open ? 'happy' : 'scared',
      green: !this.open && this.smoke > 0.45, rot: this.dead ? -0.25 : 0,
    });
    if (this.smoke > 0) {
      const img = puffSprite('95,95,105'), t = clock.t;
      for (let i = 0; i < 14; i++) {
        const p = (t * 0.25 + i / 14) % 1;
        drawPuff(img, 95 + Math.sin(i * 7 + t) * 40 + p * 130, 390 - p * 380, 28 + p * 80, this.smoke * (1 - p) * 0.9, i + t * 0.2);
      }
      ctx.fillStyle = `rgba(88,88,98,${this.smoke * 0.45})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}

function paintRoom(): void {
  ctx.fillStyle = lin(0, 0, 0, 500, [[0, '#cdb894'], [0.5, '#e6d6b8'], [1, '#d9c6a3']]);
  ctx.fillRect(0, 0, W, 500);
  mottle(0, 0, W, 500, 21, '120,90,50', 60, 0.05);
  mottle(0, 0, W, 500, 22, '255,250,235', 40, 0.06);
  // framed photo of the steppe
  ctx.fillStyle = 'rgba(40,25,10,.25)'; rr(124, 106, 72, 58, 3);
  ctx.fillStyle = lin(120, 0, 192, 0, [[0, '#7a4a26'], [1, '#4f2e14']]); rr(120, 100, 72, 58, 3);
  ctx.save(); ctx.beginPath(); ctx.rect(126, 106, 60, 46); ctx.clip();
  ctx.fillStyle = lin(0, 106, 0, 152, [[0, '#9fd2f2'], [1, '#e8f5fb']]); ctx.fillRect(126, 106, 60, 46);
  ctx.translate(126, 106); ctx.scale(60 / W, 46 / 200); ridge(150, 70, 4, [[0, '#7b93b8'], [1, '#5b739a']], 0.25);
  ctx.fillStyle = '#86b84a'; ctx.fillRect(0, 150, W, 60);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(126, 106, 60, 4);
  // window recess shadow
  ctx.fillStyle = 'rgba(60,40,20,.25)'; rr(WX - 10, WY - 8, WW + 22, WH + 24, 6);
  skirting(500);
  planks(500, H, 200, 7);
  // corner shading
  ctx.fillStyle = lin(0, 0, 60, 0, [[0, 'rgba(40,25,10,.25)'], [1, 'rgba(40,25,10,0)']]); ctx.fillRect(0, 0, 60, 500);
  ctx.fillStyle = lin(0, 0, 0, 60, [[0, 'rgba(40,25,10,.25)'], [1, 'rgba(40,25,10,0)']]); ctx.fillRect(0, 0, W, 60);
}

/** Closed window: scenery only, with no opening animation or input handler. */
function windowView(): void {
  ctx.fillStyle = lin(0, WY, 0, WY + WH, [[0, '#627e97'], [1, '#a3bacb']]);
  ctx.fillRect(WX, WY, WW, WH);
  ctx.strokeStyle = '#a57148'; ctx.lineWidth = 8; ctx.strokeRect(WX, WY, WW, WH);
  ctx.lineWidth = 5; seg(WX + WW / 2, WY, WX + WW / 2, WY + WH); seg(WX, WY + WH / 2, WX + WW, WY + WH / 2);
  ctx.fillStyle = '#e0d8c8'; rr(WX - 10, WY + WH + 2, WW + 20, 10, 3);
  ctx.fillStyle = 'rgba(40,25,10,.2)'; ell(WX + WW / 2, WY + WH + 16, WW / 2 + 8, 4);
}

function drawDoor(open: boolean): void {
  const { x, y, w, h } = DOOR;
  ctx.fillStyle = '#543b29'; rr(x - 7, y - 7, w + 14, h + 7, 5);
  ctx.fillStyle = open ? lin(0, y, 0, y + h, [[0, '#9edbff'], [0.8, '#e8f8ff'], [1, '#8fbd62']]) : lin(x, 0, x + w, 0, [[0, '#d99a53'], [1, '#985729']]);
  ctx.fillRect(x, y, w, h);
  if (open) { ctx.fillStyle = '#ffe7a2'; circ(x + 65, y + 40, 15); }
  else {
    ctx.strokeStyle = '#f5c879'; ctx.lineWidth = 3; ctx.strokeRect(x + 12, y + 14, w - 24, h - 30);
    ctx.fillStyle = '#f4b400'; circ(x + w - 18, y + h * 0.55, 5);
  }
}
