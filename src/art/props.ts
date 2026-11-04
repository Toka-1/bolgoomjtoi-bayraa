import { ctx, clock, reduce } from '../core/canvas';
import { C, lin, rad, circ, ell, seg, rr, shadow, glow, TAU } from '../core/draw';

/* ---------- ger (exterior) ---------- */
export function ger(x: number, y: number, s: number): void {
  shadow(x, y + 2, 80 * s, 10 * s, 0.3);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // wall: a felt cylinder, lit from the left
  ctx.beginPath(); ctx.moveTo(-60, -50); ctx.lineTo(60, -50); ctx.lineTo(60, -2);
  ctx.quadraticCurveTo(0, 4, -60, -2); ctx.closePath();
  ctx.fillStyle = lin(-60, 0, 60, 0, [[0, '#d6c9ae'], [0.28, '#fdf9ef'], [0.7, '#eadfc8'], [1, '#b6a785']]);
  ctx.fill();
  ctx.strokeStyle = '#4f3f30'; ctx.lineWidth = 2;
  for (const yy of [-36, -14]) { ctx.beginPath(); ctx.moveTo(-60, yy); ctx.quadraticCurveTo(0, yy + 4, 60, yy); ctx.stroke(); }
  ctx.fillStyle = C.deel; ctx.fillRect(-60, -50, 120, 4);
  // roof
  ctx.beginPath(); ctx.moveTo(-67, -46); ctx.quadraticCurveTo(-32, -78, -12, -88); ctx.lineTo(12, -88);
  ctx.quadraticCurveTo(32, -78, 67, -46); ctx.quadraticCurveTo(0, -40, -67, -46); ctx.closePath();
  ctx.fillStyle = lin(-66, 0, 66, 0, [[0, '#cbbd9f'], [0.32, '#fffbf2'], [1, '#ad9e7d']]);
  ctx.fill();
  ctx.fillStyle = 'rgba(60,40,20,.2)'; ell(0, -45, 62, 4);
  ctx.strokeStyle = 'rgba(80,62,45,.55)'; ctx.lineWidth = 1.3;
  for (let k = -3; k <= 3; k++) seg(k * 4, -86, k * 20, -49);
  ctx.fillStyle = lin(-12, -92, 12, -84, [[0, '#8f6c45'], [1, '#553b22']]); ell(0, -88, 12, 4);
  // stovepipe
  ctx.fillStyle = lin(18, 0, 25, 0, [[0, '#4a4a50'], [0.5, '#a5a7ae'], [1, '#3c3c42']]);
  ctx.fillRect(18, -106, 7, 22);
  ctx.fillStyle = '#2c2c30'; ctx.fillRect(16.5, -108, 10, 3);
  // painted door
  ctx.fillStyle = '#4a2c12'; rr(-17, -42, 34, 42, 2);
  ctx.fillStyle = lin(-15, 0, 15, 0, [[0, '#ffa040'], [0.5, '#e57818'], [1, '#b0540c']]); rr(-14, -39, 28, 39, 2);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.strokeRect(-10.5, -35.5, 21, 32);
  ctx.save(); ctx.translate(0, -20); ctx.rotate(Math.PI / 4); ctx.strokeRect(-4, -4, 8, 8); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(1, -39, 13, 39);
  ctx.restore();
}

/* ---------- livestock ---------- */
/** A brown-and-white cow, facing right. (x, y) is under the body. */
export function cow(x: number, y: number, s: number): void {
  const bob = reduce ? 0 : Math.sin(clock.t * 10) * 2;
  shadow(x + 8 * s, y + 1, 48 * s, 8 * s, 0.35);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const leg = (lx: number, dy: number, far: boolean) => {
    ctx.fillStyle = lin(lx, 0, lx + 8, 0, far ? [[0, '#c9bfae'], [1, '#8d8371']] : [[0, '#fffaf0'], [1, '#cfc5b3']]);
    rr(lx, -24, 8, 24 + dy, 3);
    ctx.fillStyle = '#2a1d14'; rr(lx - 0.5, -4 + dy, 9, 5, 2);
  };
  // tail
  ctx.strokeStyle = '#e0d7c8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-32, -52); ctx.quadraticCurveTo(-42, -40 + bob, -40, -22); ctx.stroke();
  ctx.fillStyle = '#3b2a20'; ell(-40, -20, 3, 5);
  leg(-12, -bob, true); leg(22, -bob, true);
  // body
  ctx.fillStyle = rad(-4, -40, 46, [[0, '#ffffff'], [0.7, '#efe8dc'], [1, '#c4b8a4']], -12, -54);
  rr(-34, -58, 68, 40, 18);
  ctx.save(); ctx.beginPath(); ctx.roundRect(-34, -58, 68, 40, 18); ctx.clip();
  ctx.fillStyle = lin(-30, -60, 30, -18, [[0, '#7a4e2e'], [1, '#4a2c18']]);
  ell(-12, -47, 14, 10, 0.3); ell(16, -32, 9, 7, -0.2); ell(-30, -27, 9, 10); ell(26, -56, 10, 6);
  ctx.fillStyle = lin(0, -32, 0, -18, [[0, 'rgba(70,50,30,0)'], [1, 'rgba(70,50,30,.3)']]);
  ctx.fillRect(-34, -32, 68, 14);
  ctx.restore();
  ctx.fillStyle = '#f0b3ad'; ell(4, -19, 6, 3);
  leg(-26, bob, false); leg(10, bob, false);
  // head
  ctx.fillStyle = '#e4d9c9'; ell(22, -62, 7, 4, -0.5); ell(58, -62, 7, 4, 0.5);
  ctx.strokeStyle = lin(0, -80, 0, -64, [[0, '#fbf3dc'], [1, '#c8b88e']]); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(30, -66); ctx.quadraticCurveTo(24, -72, 22, -80); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50, -66); ctx.quadraticCurveTo(56, -72, 58, -80); ctx.stroke();
  ctx.fillStyle = rad(40, -56, 21, [[0, '#ffffff'], [0.72, '#efe8dc'], [1, '#c6b9a5']], 34, -64);
  rr(25, -70, 30, 30, 11);
  ctx.fillStyle = '#6a4228'; ell(47, -64, 6, 5, 0.4);
  ctx.fillStyle = lin(0, -51, 0, -37, [[0, '#f8bdb5'], [1, '#d4857c']]); ell(40, -44, 11, 7);
  ctx.fillStyle = '#7a3a34'; ell(36, -44, 1.8, 2.5); ell(44, -44, 1.8, 2.5);
  ctx.fillStyle = '#140d08'; circ(33, -58, 2.8); circ(47, -58, 2.8);
  ctx.fillStyle = '#fff'; circ(32.1, -58.9, 0.9); circ(46.1, -58.9, 0.9);
  ctx.restore();
}

/* ---------- vehicles ---------- */
/** Body paint: highlight, base, shade, deep shadow. */
export type CarPaint = readonly [string, string, string, string];
export const CAR_RED: CarPaint = ['#ff7a6c', C.red, '#b21c14', '#6e100b'];
export const CAR_PAINTS: readonly CarPaint[] = [
  CAR_RED,
  ['#8fb8ff', '#2f6fe0', '#1a47a8', '#0e2a66'],
  ['#ffffff', '#e4e7ec', '#a9b0bb', '#5e6570'],
  ['#ffe27a', '#f5c400', '#c48f00', '#7a5500'],
  ['#7a7f8c', '#3d414c', '#24272f', '#101216'],
];

/** A sedan seen from the side, facing right. (x, y) is the rear bumper at road level. */
export function car(x: number, y: number, brake: boolean, shake = 0, paint: CarPaint = CAR_RED): void {
  shadow(x + 40, y + 1, 46, 6, 0.45);
  ctx.save(); ctx.translate(x + shake, y);
  ctx.beginPath();
  ctx.moveTo(2, -12); ctx.lineTo(2, -26); ctx.quadraticCurveTo(2, -32, 10, -33); ctx.lineTo(19, -34);
  ctx.lineTo(27, -50); ctx.quadraticCurveTo(29, -54, 34, -54); ctx.lineTo(52, -54);
  ctx.quadraticCurveTo(57, -54, 60, -50); ctx.lineTo(68, -35); ctx.lineTo(74, -33);
  ctx.quadraticCurveTo(79, -31, 79, -24); ctx.lineTo(79, -12); ctx.quadraticCurveTo(79, -8, 75, -8);
  ctx.lineTo(5, -8); ctx.quadraticCurveTo(2, -8, 2, -12); ctx.closePath();
  ctx.fillStyle = lin(0, -54, 0, -8, [[0, paint[0]], [0.32, paint[1]], [0.72, paint[2]], [1, paint[3]]]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5; seg(8, -30, 72, -30);
  ctx.strokeStyle = 'rgba(60,0,0,.35)'; ctx.lineWidth = 1; seg(4, -17, 77, -17);
  // windows, driver, reflection
  ctx.beginPath(); ctx.moveTo(23, -35); ctx.lineTo(30, -49); ctx.quadraticCurveTo(31, -51, 34, -51);
  ctx.lineTo(51, -51); ctx.quadraticCurveTo(54, -51, 56, -48); ctx.lineTo(63, -35); ctx.closePath();
  ctx.fillStyle = lin(0, -51, 0, -35, [[0, '#a9d2ee'], [1, '#34587c']]); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = rad(50, -42, 7, [[0, '#ffd9b5'], [1, '#c98d66']], 48, -45); circ(50, -42, 6.5);
  ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(50, -43, 6.8, Math.PI, 0); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  ctx.beginPath(); ctx.moveTo(30, -35); ctx.lineTo(40, -51); ctx.lineTo(46, -51); ctx.lineTo(36, -35); ctx.fill();
  ctx.restore();
  ctx.fillStyle = paint[3]; ctx.fillRect(41, -51, 3, 16);
  ctx.strokeStyle = 'rgba(60,0,0,.5)'; ctx.lineWidth = 1; seg(43, -34, 43, -12);
  ctx.fillStyle = '#d9d9de'; rr(46, -28, 6, 2, 1);
  // lights, bumpers
  ctx.fillStyle = rad(76, -24, 5, [[0, '#fffbe6'], [1, '#ffcf3a']]); rr(74, -27, 5, 6, 2);
  ctx.fillStyle = brake ? '#ff3030' : '#8e0f0f'; rr(1, -28, 4, 7, 2);
  if (brake) glow(3, -24, 26, '255,40,40', 0.7);
  ctx.fillStyle = '#26262c'; rr(0, -14, 9, 5, 2); rr(71, -14, 9, 5, 2);
  const spin = x / 9;
  wheel(18, -6, 9, spin); wheel(60, -6, 9, spin);
  ctx.restore();
}
function wheel(x: number, y: number, r: number, rot: number): void {
  ctx.fillStyle = 'rgba(10,8,8,.75)'; ctx.beginPath(); ctx.arc(x, y, r + 2.5, Math.PI, 0); ctx.fill();
  ctx.fillStyle = rad(x, y, r, [[0, '#2c2c32'], [0.8, '#18181c'], [1, '#0c0c0e']]); circ(x, y, r);
  ctx.fillStyle = rad(x, y, r * 0.58, [[0, '#f2f3f6'], [1, '#8a8f98']], x - 1.5, y - 1.5); circ(x, y, r * 0.56);
  ctx.strokeStyle = '#6a6f78'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) { const a = rot + (i * TAU) / 5; seg(x, y, x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5); }
  ctx.fillStyle = '#4a4e56'; circ(x, y, 1.6);
}

/* ---------- baby & cradle ---------- */
export function baby(bx: number, by: number, crawl: number, onGround = true): void {
  if (onGround) shadow(bx + 4, by + 1, 36, 5, 0.3);
  const skin = (x: number, y: number, r: number) => rad(x, y, r, [[0, '#ffe0c4'], [0.65, C.skin], [1, '#cf9470']], x - r * 0.35, y - r * 0.4);
  ctx.fillStyle = skin(bx + 31, by - 4, 5); circ(bx + 31, by - 4, 5);
  ctx.fillStyle = rad(bx + 10, by - 12, 27, [[0, '#ffd6e4'], [0.6, '#f4a6c0'], [1, '#c4708f']], bx + 3, by - 22);
  ell(bx + 10, by - 12 + crawl, 24, 14);
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(bx + 10, by - 12 + crawl, 18, Math.PI * 1.15, Math.PI * 1.55); ctx.stroke();
  ctx.fillStyle = skin(bx - 4, by - 2 - crawl, 5); circ(bx - 4, by - 2 - crawl, 5);
  ctx.fillStyle = skin(bx - 16, by - 20, 15); circ(bx - 16, by - 20, 15);
  ctx.fillStyle = lin(bx - 32, 0, bx, 0, [[0, '#ffc0d6'], [1, '#d97c9f']]);
  ctx.beginPath(); ctx.arc(bx - 16, by - 23, 15.5, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#fff'; circ(bx - 16, by - 39, 4);
  ctx.fillStyle = '#1b130e'; circ(bx - 21, by - 18, 2.2); circ(bx - 12, by - 18, 2.2);
  ctx.fillStyle = '#fff'; circ(bx - 21.7, by - 18.8, 0.8); circ(bx - 12.7, by - 18.8, 0.8);
  ctx.fillStyle = 'rgba(232,110,96,.45)'; circ(bx - 25, by - 13, 3.5); circ(bx - 8, by - 13, 3.5);
}

/** A painted wooden cradle (өлгий). */
export function cradle(x: number, y: number, w: number, h: number): void {
  shadow(x + w / 2, y + h, w * 0.6, 6, 0.3);
  ctx.fillStyle = lin(0, y, 0, y + h, [[0, '#ffa64a'], [0.6, C.sash], [1, '#a9520c']]);
  rr(x, y, w, h, 10);
  ctx.fillStyle = lin(0, y + 6, 0, y + h - 18, [[0, '#e9dcc4'], [1, '#fff7ea']]);
  rr(x + 8, y + 6, w - 16, h - 24, 6);
  ctx.fillStyle = lin(0, y + 6, 0, y + 14, [[0, '#ffe07a'], [1, '#c48a00']]);
  rr(x + 10, y + 6, w - 20, 8, 4);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const cx = x + 16 + i * ((w - 32) / 5), cy = y + h - 9;
    ctx.beginPath(); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx + 4, cy); ctx.lineTo(cx, cy + 4); ctx.lineTo(cx - 4, cy); ctx.closePath(); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; seg(x + 8, y + 2.5, x + w - 8, y + 2.5);
}

/* ---------- stove ---------- */
/** Cast-iron stove with a live fire; (x, y) top-left. */
export function stove(x: number, y: number, w: number, h: number): void {
  const t = clock.t;
  const fl = reduce ? 0.5 : (Math.sin(t * 17) + Math.sin(t * 29 + 1) * 0.6 + 1.6) / 3.2;
  shadow(x + w / 2, y + h + 3, w * 0.62, 9, 0.5);
  ctx.fillStyle = '#121216'; rr(x + 8, y + h - 8, 10, 12, 2); rr(x + w - 18, y + h - 8, 10, 12, 2);
  ctx.fillStyle = lin(x, 0, x + w, 0, [[0, '#2a2b33'], [0.3, '#50535f'], [0.55, '#3a3c46'], [1, '#18191e']]);
  rr(x, y, w, h - 4, 8);
  ctx.fillStyle = lin(0, y - 5, 0, y + 7, [[0, '#7a7e8c'], [1, '#2e3038']]);
  rr(x - 5, y - 5, w + 10, 11, 4);
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5; seg(x + 4, y + 10, x + 4, y + h - 10);
  // firebox
  const fx = x + w * 0.2, fy = y + h * 0.3, fw = w * 0.6, fh = h * 0.4;
  ctx.fillStyle = '#0e0908'; rr(fx - 4, fy - 4, fw + 8, fh + 8, 6);
  ctx.save();
  ctx.beginPath(); ctx.roundRect(fx, fy, fw, fh, 4); ctx.clip();
  ctx.fillStyle = rad(fx + fw / 2, fy + fh, fw * 0.8, [[0, '#fff2b0'], [0.3, '#ffad2a'], [0.65, `rgb(220,${(60 + fl * 50) | 0},20)`], [1, '#2a0904']]);
  ctx.fillRect(fx, fy, fw, fh);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const cx = fx + fw * (0.12 + 0.19 * i), fhh = fh * (0.55 + 0.3 * Math.sin(t * 9 + i * 2.1) * (reduce ? 0 : 1));
    ctx.fillStyle = lin(0, fy + fh, 0, fy + fh - fhh, [[0, 'rgba(255,230,120,.9)'], [0.5, 'rgba(255,140,30,.6)'], [1, 'rgba(255,60,10,0)']]);
    ctx.beginPath(); ctx.moveTo(cx - 7, fy + fh);
    ctx.quadraticCurveTo(cx - 8, fy + fh - fhh * 0.5, cx + Math.sin(t * 7 + i) * 3, fy + fh - fhh);
    ctx.quadraticCurveTo(cx + 8, fy + fh - fhh * 0.5, cx + 7, fy + fh); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(18,12,10,.9)'; ctx.lineWidth = 3;
  for (let i = 1; i < 5; i++) seg(fx + (fw * i) / 5, fy, fx + (fw * i) / 5, fy + fh);
  ctx.fillStyle = lin(0, fy + fh + 10, 0, fy + fh + 16, [[0, '#8a8e9c'], [1, '#3a3c46']]);
  rr(x + w / 2 - 12, fy + fh + 10, 24, 5, 2);
  glow(fx + fw / 2, fy + fh / 2, w * 1.4, '255,130,40', 0.16 + fl * 0.12);
}

/** Vertical stovepipe with joints; drawn from y0 down to y1. */
export function pipe(x: number, y0: number, y1: number, w: number): void {
  ctx.fillStyle = lin(x, 0, x + w, 0, [[0, '#1c1c22'], [0.35, '#5c5e68'], [0.6, '#33343c'], [1, '#141418']]);
  ctx.fillRect(x, y0, w, y1 - y0);
  for (let y = y0 + 60; y < y1 - 10; y += 90) {
    ctx.fillStyle = lin(x, 0, x + w, 0, [[0, '#2a2a30'], [0.4, '#7a7c88'], [1, '#202024']]);
    ctx.fillRect(x - 2, y, w + 4, 5);
  }
}

