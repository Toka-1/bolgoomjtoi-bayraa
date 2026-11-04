import { gesture } from '../ui/gesture';
import { ctx, W, H, clock, layer } from '../core/canvas';
import { lin, rad, rr, ell, seg, circ } from '../core/draw';
import { ctl } from '../core/ctl';
import { bayraa } from '../art/bayraa';
import { stove, pipe } from '../art/props';
import { planks, skirting, mottle, cloud, puffSprite, drawPuff, ridge } from '../art/scenery';
import type { Micro } from './types';

const WX = 210, WY = 150, WW = 120, WH = 120;

export class Smoke implements Micro {
  readonly cmd = 'ЦОНХОО НЭЭ!';
  readonly sub = 'Цонхон дээр дарж нээ';
  readonly lose = 'Угаартчихлаа…';
  readonly tip = 'Зуух түлж байхдаа салхивчаа онгорхой байлга. Толгой өвдөж, дотор муухайрвал даруй цэвэр агаарт гар.';
  dead = false;
  private open = false;
  private smoke = 0.15;

  init(): void { this.open = false; this.smoke = 0.15; }
  update(dt: number): void {
    this.smoke = this.open ? Math.max(0, this.smoke - dt * 1.5) : Math.min(1, this.smoke + dt * 0.2);
  }
  down(x: number, y: number): void {
    if (!this.open && x >= WX && x <= WX + WW && y >= WY && y <= WY + WH) { this.open = true; ctl.win(); }
  }
  resultUpdate(dt: number): void { if (this.open) this.smoke = Math.max(0, this.smoke - dt * 1.5); }

  hint(): void { if (!this.open) gesture(270, 210, 270, 210, 52); }
  draw(): void {
    layer('smoke-room', paintRoom);
    windowView(this.open);
    pipe(84, 0, 400, 22);
    stove(40, 390, 110, 110);
    if (this.open) lightShaft();
    bayraa(230, 575, 1.65, {
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

function windowView(open: boolean): void {
  ctx.save();
  ctx.beginPath(); ctx.rect(WX, WY, WW, WH); ctx.clip();
  if (open) {
    ctx.fillStyle = lin(0, WY, 0, WY + WH, [[0, '#5fb4ef'], [1, '#d6efff']]); ctx.fillRect(WX, WY, WW, WH);
    ctx.fillStyle = rad(WX + 95, WY + 25, 60, [[0, 'rgba(255,250,220,.9)'], [1, 'rgba(255,250,220,0)']]); circ(WX + 95, WY + 25, 60);
    cloud(WX + 40, WY + 38, 0.45, 1, 3); cloud(WX + 90, WY + 75, 0.35, 0.9, 8);
    ctx.fillStyle = lin(0, WY + 90, 0, WY + WH, [[0, '#9cc0d8'], [1, '#7aa0bc']]);
    ctx.beginPath(); ctx.moveTo(WX, WY + WH); ctx.lineTo(WX, WY + 100); ctx.lineTo(WX + 30, WY + 92); ctx.lineTo(WX + 70, WY + 104); ctx.lineTo(WX + 120, WY + 96); ctx.lineTo(WX + WW, WY + WH); ctx.fill();
  } else {
    ctx.fillStyle = lin(0, WY, 0, WY + WH, [[0, '#55697d'], [1, '#8b98a3']]); ctx.fillRect(WX, WY, WW, WH);
    ctx.fillStyle = 'rgba(40,52,66,.7)';
    for (const [bx, bw, bh] of [[WX, 26, 50], [WX + 30, 34, 70], [WX + 70, 22, 44], [WX + 94, 30, 60]] as const) ctx.fillRect(bx, WY + WH - bh, bw, bh);
    ctx.fillStyle = 'rgba(200,205,210,.35)'; ctx.fillRect(WX, WY, WW, WH);
    // frost creeping in from the corners
    ctx.fillStyle = rad(WX, WY + WH, 70, [[0, 'rgba(240,248,255,.75)'], [1, 'rgba(240,248,255,0)']]); ctx.fillRect(WX, WY, WW, WH);
    ctx.fillStyle = rad(WX + WW, WY + WH, 50, [[0, 'rgba(240,248,255,.6)'], [1, 'rgba(240,248,255,0)']]); ctx.fillRect(WX, WY, WW, WH);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.moveTo(WX + 10, WY); ctx.lineTo(WX + 40, WY); ctx.lineTo(WX, WY + 50); ctx.lineTo(WX, WY + 20); ctx.fill();
  }
  ctx.restore();

  const wood = (horizontal: boolean, a: number, b: number) => horizontal
    ? lin(0, a, 0, b, [[0, '#d8a06a'], [0.5, '#b07040'], [1, '#7c4a24']])
    : lin(a, 0, b, 0, [[0, '#d8a06a'], [0.5, '#b07040'], [1, '#7c4a24']]);
  ctx.strokeStyle = wood(false, WX - 4, WX + WW + 4); ctx.lineWidth = 8; ctx.strokeRect(WX, WY, WW, WH);
  ctx.strokeStyle = 'rgba(255,230,190,.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(WX - 3.5, WY - 3.5, WW + 7, WH + 7);
  ctx.lineWidth = 5;
  if (!open) {
    ctx.strokeStyle = wood(false, WX + WW / 2 - 3, WX + WW / 2 + 3); seg(WX + WW / 2, WY, WX + WW / 2, WY + WH);
    ctx.strokeStyle = wood(true, WY + WH / 2 - 3, WY + WH / 2 + 3); seg(WX, WY + WH / 2, WX + WW, WY + WH / 2);
  } else {
    for (const [a, b] of [[WX, WX - 30], [WX + WW, WX + WW + 30]] as const) {
      ctx.beginPath(); ctx.moveTo(a, WY); ctx.lineTo(b, WY + 14); ctx.lineTo(b, WY + WH - 14); ctx.lineTo(a, WY + WH); ctx.closePath();
      ctx.fillStyle = lin(a, 0, b, 0, [[0, 'rgba(210,235,255,.55)'], [1, 'rgba(160,200,230,.8)']]); ctx.fill();
      ctx.strokeStyle = wood(false, Math.min(a, b), Math.max(a, b)); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5; seg(a + (b - a) * 0.3, WY + 20, a + (b - a) * 0.6, WY + 50); ctx.lineWidth = 5;
    }
  }
  // sill
  ctx.fillStyle = lin(0, WY + WH + 2, 0, WY + WH + 14, [[0, '#e9e2d6'], [1, '#a59a88']]); rr(WX - 14, WY + WH + 2, WW + 28, 11, 3);
  ctx.fillStyle = 'rgba(40,25,10,.2)'; ell(WX + WW / 2, WY + WH + 17, WW / 2 + 10, 4);
}

function lightShaft(): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(WX, WY, WX - 100, H, [[0, 'rgba(255,248,220,.28)'], [1, 'rgba(255,248,220,0)']]);
  ctx.beginPath(); ctx.moveTo(WX, WY + 4); ctx.lineTo(WX + WW, WY + WH); ctx.lineTo(WX + 60, H); ctx.lineTo(WX - 150, H); ctx.closePath(); ctx.fill();
  ctx.restore();
}

