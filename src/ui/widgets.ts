import { ctx } from '../core/canvas';
import { C, FONT, lin, rad, rr, circ, text, shadow, type Paint } from '../core/draw';

export interface Btn { x: number; y: number; w: number; h: number }
export const PLAY_BTN: Btn = { x: 26, y: 526, w: 152, h: 58 };
export const PRACTICE_BTN: Btn = { x: 186, y: 526, w: 148, h: 58 };
export const CARDS_BTN: Btn = { x: 26, y: 594, w: 152, h: 38 };
export const TEACH_BTN: Btn = { x: 186, y: 594, w: 148, h: 38 };
/** Sound toggle: top-right on the title, next to the home button during play. */
export const SOUND_BTN = { x: 324, y: 36, r: 20 };
export const HUD_SOUND = { x: 140, y: 36, r: 20 };
export const inCircle = (c: { x: number; y: number; r: number }, x: number, y: number): boolean => Math.hypot(x - c.x, y - c.y) < c.r + 10;
export const AGAIN_BTN: Btn = { x: 60, y: 470, w: 240, h: 64 };
export const HOME_BTN: Btn = { x: 100, y: 556, w: 160, h: 48 };
/** Small round home button in the HUD, next to the score. */
export const HUD_HOME = { x: 88, y: 36, r: 20 };
export const inHudHome = (x: number, y: number): boolean => Math.hypot(x - HUD_HOME.x, y - HUD_HOME.y) < HUD_HOME.r + 10;
export const inBtn = (b: Btn, x: number, y: number): boolean => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h + 6;

export const goldFace = (y0: number, y1: number): Paint => lin(0, y0, 0, y1, [[0, '#ffd75a'], [0.5, C.gold], [1, '#d18f00']]);


/** Round glassy button with a house pictogram. */
export function homeIcon(x: number, y: number, r: number): void {
  ctx.fillStyle = 'rgba(10,12,30,.3)'; circ(x + 1, y + 3, r);
  ctx.fillStyle = rad(x, y, r, [[0, '#ffffff'], [0.7, '#e6e9f2'], [1, '#b9bfd0']], x - 6, y - 7); circ(x, y, r);
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.moveTo(x - 10, y - 1); ctx.lineTo(x, y - 10); ctx.lineTo(x + 10, y - 1); ctx.closePath(); ctx.fill();
  rr(x - 7, y - 2, 14, 11, 1.5);
  ctx.fillStyle = '#e6e9f2'; rr(x - 2.5, y + 2, 5, 7, 1);
}

export function panel(x: number, y: number, w: number, h: number, r: number, fill: Paint, line: string = C.ink): void {
  ctx.save();
  ctx.shadowColor = 'rgba(10,12,30,.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.fillStyle = fill; rr(x, y, w, h, r);
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = line; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x + 6, y + 6, w - 12, h - 12, Math.max(2, r - 6)); ctx.stroke();
}

export function button(b: Btn, label: string, secondary = false): void {
  if (secondary) {
    ctx.fillStyle = '#0f1230'; rr(b.x, b.y + 5, b.w, b.h, b.h / 2);
    ctx.fillStyle = lin(0, b.y, 0, b.y + b.h, [[0, '#ffffff'], [1, '#cfd4e2']]); rr(b.x, b.y, b.w, b.h, b.h / 2);
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, b.h / 2); ctx.stroke();
    // shrink long labels so they stay inside the pill
    let size = 19;
    ctx.font = `900 ${size}px ${FONT}`;
    const tw = ctx.measureText(label).width;
    if (tw > b.w - 24) size = Math.max(11, Math.floor(size * (b.w - 24) / tw));
    text(label, b.x + b.w / 2, b.y + b.h / 2 + 1, size, C.ink);
    return;
  }
  shadow(b.x + b.w / 2, b.y + b.h + 10, b.w * 0.5, 8, 0.35);
  ctx.fillStyle = '#0f1230'; rr(b.x, b.y + 6, b.w, b.h, b.h / 2);
  ctx.fillStyle = goldFace(b.y, b.y + b.h); rr(b.x, b.y, b.w, b.h, b.h / 2);
  ctx.fillStyle = lin(0, b.y, 0, b.y + b.h * 0.5, [[0, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]);
  rr(b.x + 10, b.y + 4, b.w - 20, b.h * 0.45, b.h / 3);
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, b.h / 2); ctx.stroke();
  text(label, b.x + b.w / 2, b.y + b.h / 2 + 1, 24, C.ink);
}


/** Round glassy button with a speaker pictogram; crossed out when muted. */
export function soundIcon(x: number, y: number, r: number, on: boolean): void {
  ctx.fillStyle = 'rgba(10,12,30,.3)'; circ(x + 1, y + 3, r);
  ctx.fillStyle = rad(x, y, r, [[0, '#ffffff'], [0.7, '#e6e9f2'], [1, '#b9bfd0']], x - 6, y - 7); circ(x, y, r);
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.moveTo(x - 9, y - 4); ctx.lineTo(x - 4, y - 4); ctx.lineTo(x + 2, y - 10); ctx.lineTo(x + 2, y + 10); ctx.lineTo(x - 4, y + 4); ctx.lineTo(x - 9, y + 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.lineCap = 'round';
  if (on) {
    ctx.beginPath(); ctx.arc(x + 3, y, 6, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 3, y, 10, -0.9, 0.9); ctx.stroke();
  } else {
    ctx.strokeStyle = C.red; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 5, y - 6); ctx.lineTo(x + 13, y + 6); ctx.moveTo(x + 13, y - 6); ctx.lineTo(x + 5, y + 6); ctx.stroke();
  }
}

/** A small round back arrow, used top-left on menu screens. */
export const BACK_BTN = { x: 36, y: 36, r: 20 };
export function backIcon(x: number, y: number, r: number): void {
  ctx.fillStyle = 'rgba(10,12,30,.3)'; circ(x + 1, y + 3, r);
  ctx.fillStyle = rad(x, y, r, [[0, '#ffffff'], [0.7, '#e6e9f2'], [1, '#b9bfd0']], x - 6, y - 7); circ(x, y, r);
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x + 7, y); ctx.lineTo(x - 7, y); ctx.moveTo(x - 1, y - 7); ctx.lineTo(x - 8, y); ctx.lineTo(x - 1, y + 7); ctx.stroke();
}
