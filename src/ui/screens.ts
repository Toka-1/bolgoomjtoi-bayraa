import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { C, lin, rad, rr, circ, text, wrap, shadow, type Paint } from '../core/draw';
import { bayraa } from '../art/bayraa';
import { ger } from '../art/props';
import { sun, cloud, ridge, hills, grass, chimneySmoke, vignette, grain } from '../art/scenery';
import { g } from '../flow';

export interface Btn { x: number; y: number; w: number; h: number }
export const PLAY_BTN: Btn = { x: 70, y: 540, w: 220, h: 66 };
export const AGAIN_BTN: Btn = { x: 60, y: 470, w: 240, h: 64 };
export const inBtn = (b: Btn, x: number, y: number): boolean => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h + 6;

const goldFace = (y0: number, y1: number): Paint => lin(0, y0, 0, y1, [[0, '#ffd75a'], [0.5, C.gold], [1, '#d18f00']]);

export function render(): void {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  if (g.state === 'title') { drawTitle(); vignette(0.3); grain(); }
  else {
    g.game.draw();
    vignette();
    grain();
    hud();
    if (g.state === 'intro') drawIntro();
    else if (g.state === 'play') drawPlay();
    else if (g.state === 'result') drawResult();
    else drawOver();
  }
  ctx.restore();
}

function heart(x: number, y: number, r: number, full: boolean): void {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.9);
  ctx.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.6, -r * 1.3, 0, -r * 0.4);
  ctx.bezierCurveTo(r * 0.6, -r * 1.3, r * 1.6, -r * 0.2, 0, r * 0.9);
  ctx.fillStyle = full ? rad(0, 0, r * 1.4, [[0, '#ff7a6e'], [0.6, C.red], [1, '#9e140d']], -r * 0.4, -r * 0.5) : 'rgba(27,31,59,.3)';
  ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
  if (full) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-r * 0.55, -r * 0.35, r * 0.28, r * 0.18, -0.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function hud(): void {
  ctx.fillStyle = 'rgba(10,12,30,.3)'; circ(37, 39, 23);
  ctx.fillStyle = rad(36, 36, 23, [[0, '#ffe58a'], [0.6, C.gold], [1, '#b87d00']], 30, 29); circ(36, 36, 22);
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.strokeStyle = 'rgba(120,70,0,.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(36, 36, 16, 0, Math.PI * 2); ctx.stroke();
  text(String(g.score), 36, 37, 20, C.ink);
  for (let i = 0; i < 3; i++) heart(W - 30 - i * 32, 36, 11, i < g.lives);
}

function panel(x: number, y: number, w: number, h: number, r: number, fill: Paint, line: string = C.ink): void {
  ctx.save();
  ctx.shadowColor = 'rgba(10,12,30,.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.fillStyle = fill; rr(x, y, w, h, r);
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = line; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x + 6, y + 6, w - 12, h - 12, Math.max(2, r - 6)); ctx.stroke();
}

function drawIntro(): void {
  ctx.fillStyle = 'rgba(27,31,59,.38)'; ctx.fillRect(0, 0, W, H);
  const pop = reduce ? 1 : 1 + 0.25 * Math.max(0, 1 - g.st * 6);
  ctx.save(); ctx.translate(W / 2, 300); ctx.scale(pop, pop);
  panel(-150, -60, 300, 120, 20, goldFace(-60, 60));
  const size = g.game.cmd.length > 13 ? 26 : 32;
  text(g.game.cmd, 0, -14, size, C.ink);
  text(g.game.sub, 0, 30, 15, C.ink, { w: 500 });
  ctx.restore();
  if (g.practice) {
    text('ДАДЛАГА', W / 2, 200, 26, '#fff', { stroke: C.ink, sw: 5 });
    text('Амь, оноо өөрчлөгдөхгүй', W / 2, 410, 17, '#fff', { w: 500 });
    text('Дарж эхлэх · Enter', W / 2, 455, 19, '#fff');
  }
  if (g.faster) text('ХУРДАН!', W / 2, 200, 36, C.red, { stroke: '#fff', sw: 8, drop: true });
}

function drawPlay(): void {
  if (g.practice) {
    text('ДАДЛАГА · Амь хасагдахгүй', W / 2, 112, 14, C.gold, { stroke: C.ink, sw: 4 });
    text(g.game.sub, W / 2, 585, 15, '#fff', { stroke: C.ink, sw: 4 });
    g.game.hint?.();
  }
  text(g.game.cmd, W / 2, 84, 18, '#fff', { stroke: C.ink, sw: 5, drop: true });
  const f = 1 - g.frac, bw = W - 32;
  ctx.fillStyle = 'rgba(27,31,59,.5)'; rr(16, 616, bw, 12, 6);
  ctx.fillStyle = f < 0.3 ? lin(0, 616, 0, 628, [[0, '#ff6a5c'], [1, '#b81a12']]) : goldFace(616, 628);
  rr(16, 616, Math.max(12, bw * f), 12, 6);
  ctx.fillStyle = 'rgba(255,255,255,.45)'; rr(20, 618, Math.max(4, bw * f - 8), 3, 2);
  const sx = 16 + bw * f;
  ctx.fillStyle = rad(sx, 622, 14, [[0, 'rgba(255,240,180,.9)'], [1, 'rgba(255,160,40,0)']]); circ(sx, 622, 14);
  ctx.fillStyle = reduce ? '#fff' : `rgb(255,${(200 + Math.random() * 55) | 0},120)`; circ(sx, 622, 6);
}

function drawResult(): void {
  if (g.ok) {
    const pop = reduce ? 1 : 1 + 0.3 * Math.max(0, 1 - g.st * 5);
    ctx.save(); ctx.translate(W / 2, 250); ctx.scale(pop, pop);
    const size = g.winText.length > 8 ? 34 : 54;
    text(g.winText, 0, 0, size, goldFace(-size / 2, size / 2), { stroke: C.ink, sw: 10, drop: true });
    ctx.restore();
    if (g.practice) text('Одоо оноотой тоглоё!', W / 2, 300, 19, '#fff', { stroke: C.ink, sw: 4 });
    return;
  }
  ctx.fillStyle = 'rgba(27,31,59,.62)'; ctx.fillRect(0, 0, W, H);
  text(g.practice ? 'ДАХИАД ОРОЛДЪЁ!' : 'ӨӨ, ҮГҮЙ!', W / 2, 190, g.practice ? 30 : 46, '#fff', { stroke: C.red, sw: 10, drop: true });
  text(g.msg, W / 2, 250, 22, '#fff', { w: 700 });
  panel(28, 300, W - 56, 170, 18, lin(0, 300, 0, 470, [[0, '#ffffff'], [1, '#eef0f6']]), 'rgba(27,31,59,.0)');
  text('Санаж яваарай', W / 2, 330, 16, C.red);
  wrap(g.game.tip, W / 2, 366, W - 96, 16, C.ink);
  if (g.st > 0.8) text('Дарж үргэлжлүүл', W / 2, 520, 15, '#fff', { w: 500 });
}

function button(b: Btn, label: string): void {
  shadow(b.x + b.w / 2, b.y + b.h + 10, b.w * 0.5, 8, 0.35);
  ctx.fillStyle = '#0f1230'; rr(b.x, b.y + 6, b.w, b.h, b.h / 2);
  ctx.fillStyle = goldFace(b.y, b.y + b.h); rr(b.x, b.y, b.w, b.h, b.h / 2);
  ctx.fillStyle = lin(0, b.y, 0, b.y + b.h * 0.5, [[0, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]);
  rr(b.x + 10, b.y + 4, b.w - 20, b.h * 0.45, b.h / 3);
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, b.h / 2); ctx.stroke();
  text(label, b.x + b.w / 2, b.y + b.h / 2 + 1, 24, C.ink);
}

function paintTitle(): void {
  ctx.fillStyle = lin(0, 0, 0, 470, [[0, '#3f8fd8'], [0.55, '#9fd2f2'], [1, '#ffe9c4']]); ctx.fillRect(0, 0, W, H);
  sun(300, 90, 26, '#fff1b8', '255,230,160', 0.55);
  cloud(80, 70, 0.8, 0.95, 11); cloud(250, 300, 0.55, 0.8, 12); cloud(40, 330, 0.4, 0.7, 13);
  ridge(400, 150, 61, [[0, '#7f98c4'], [1, '#a9bedb']], 0.35);
  ridge(430, 80, 67, [[0, '#6f8fa8'], [1, '#8fa9b8']], 0.15);
  hills(470, 8, 0.025, 0.5, [[0, '#a6d468'], [1, '#86bb4a']]);
  hills(505, 6, 0.04, 2, [[0, '#8fc653'], [1, '#5f9a2f']]);
  grass(500, H, 140, 5, 'rgba(50,95,20,.7)', 'rgba(190,230,120,.7)');
  ger(90, 500, 1.05);
}

function drawTitle(): void {
  layer('title', paintTitle);
  chimneySmoke(112, 386, 1);
  const t = clock.t;
  if (!reduce) {
    ctx.strokeStyle = 'rgba(27,31,59,.6)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const bx = ((t * 18 + i * 40) % (W + 80)) - 40, by = 300 - i * 14 + Math.sin(t * 2 + i) * 4, w = Math.sin(t * 9 + i) * 3;
      ctx.beginPath(); ctx.moveTo(bx - 6, by - w); ctx.quadraticCurveTo(bx - 3, by - 3, bx, by); ctx.quadraticCurveTo(bx + 3, by - 3, bx + 6, by - w); ctx.stroke();
    }
  }
  bayraa(250, 515, 1.45, { wave: true, mood: 'happy', hat: true });
  text('Болгоомжтой', W / 2, 150, 40, '#fff', { stroke: C.ink, sw: 9, drop: true });
  text('Баяраа', W / 2, 205, 60, goldFace(175, 235), { stroke: C.ink, sw: 11, drop: true });
  text('Монгол амьдралын аюулаас Баярааг авар', W / 2, 256, 15, C.ink, { w: 700, stroke: 'rgba(255,255,255,.6)', sw: 4 });
  button(PLAY_BTN, 'ТОГЛОХ');
  if (g.best) text('Шилдэг оноо: ' + g.best, W / 2, 625, 14, '#fff', { w: 700, stroke: C.ink, sw: 4 });
}

function drawOver(): void {
  ctx.fillStyle = lin(0, 0, 0, H, [[0, 'rgba(27,31,59,.92)'], [1, 'rgba(15,18,40,.95)']]); ctx.fillRect(0, 0, W, H);
  text('Тоглоом дууслаа', W / 2, 150, 30, '#fff');
  text('Оноо', W / 2, 220, 18, '#c9cbe0', { w: 500 });
  ctx.fillStyle = rad(W / 2, 290, 90, [[0, 'rgba(244,180,0,.25)'], [1, 'rgba(244,180,0,0)']]); circ(W / 2, 290, 90);
  text(String(g.score), W / 2, 290, 86, goldFace(250, 330), { stroke: '#fff', sw: 6 });
  text(g.score >= g.best && g.score > 0 ? 'Шинэ дээд амжилт!' : 'Шилдэг: ' + g.best, W / 2, 365, 18, '#fff', { w: 700 });
  bayraa(W / 2, 455, 0.7, { mood: 'happy', wave: true, noShadow: true });
  if (g.st > 0.6) button(AGAIN_BTN, 'ДАХИН ТОГЛОХ');
}
