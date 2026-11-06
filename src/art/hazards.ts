import { ctx, clock, reduce } from '../core/canvas';
import { circ, ell, rr, seg, shadow } from '../core/draw';

export function dog(x: number, y: number, s = 1): void {
  shadow(x, y, 44 * s, 6 * s, 0.25);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#9e693f'; ell(-3, -31, 34, 19);
  for (const lx of [-24, -12, 15, 26]) rr(lx, -27, 7, 27, 3);
  ctx.strokeStyle = '#9e693f'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  seg(-31, -35, -46, -51);
  ctx.fillStyle = '#b77d49'; ell(30, -48, 19, 22);
  ctx.fillStyle = '#5e402a'; ell(17, -59, 7, 17, -0.3);
  ctx.fillStyle = '#e2bc88'; rr(30, -45, 26, 14, 6);
  ctx.fillStyle = '#282326'; circ(53, -40, 4); circ(32, -53, 2.5);
  ctx.fillStyle = '#fff'; circ(31, -54, 0.8);
  ctx.restore();
}

export function hotCup(x: number, y: number, s = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#e27b45'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(16, -15, 8, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  ctx.fillStyle = '#ee9a63'; rr(-16, -33, 32, 33, 5);
  ctx.fillStyle = '#fff0d5'; ell(0, -32, 16, 5);
  ctx.fillStyle = '#805433'; ell(0, -32, 12, 3);
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const sway = reduce ? 0 : Math.sin(clock.t * 3 + i) * 3;
    ctx.beginPath(); ctx.moveTo(-10 + i * 10, -43); ctx.quadraticCurveTo(-15 + i * 10 + sway, -53, -8 + i * 10, -64); ctx.stroke();
  }
  ctx.restore();
}

export function manhole(x: number, y: number, s = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#777f8d'; ell(0, 0, 62, 32);
  ctx.fillStyle = '#171d29'; ell(0, -2, 53, 25);
  ctx.fillStyle = '#070b12'; ell(0, 3, 44, 16);
  ctx.strokeStyle = '#b8c0cd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 60, 30, 0, 0, Math.PI * 2); ctx.stroke();
  // Cover lies beside the opening; it is never shown as a safe stepping stone.
  ctx.fillStyle = '#677180'; ell(81, -40, 37, 18, -0.4);
  ctx.strokeStyle = '#424e5e'; ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) seg(57 + i * 13, -47, 61 + i * 13, -30);
  ctx.restore();
}

export function cleaningBottle(x: number, y: number, s = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#6b8bc5'; rr(-18, -48, 36, 48, 7); rr(-11, -60, 22, 18, 3);
  ctx.fillStyle = '#dd6656'; rr(-13, -65, 26, 9, 3);
  ctx.fillStyle = '#fff3c3'; rr(-13, -35, 26, 23, 3);
  // A warning diamond rather than a food or drink label.
  ctx.strokeStyle = '#b23f3a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(11, -23); ctx.lineTo(0, -12); ctx.lineTo(-11, -23); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = '#7b302d'; rr(-1.5, -30, 3, 9, 1); circ(0, -17, 1.5);
  ctx.restore();
}

export function boosterSeat(x: number, y: number, s = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#283b55'; rr(-76, -188, 152, 190, 25);
  ctx.fillStyle = '#54738c'; rr(-65, -178, 130, 170, 20);
  ctx.fillStyle = '#314b65'; rr(-76, -177, 24, 100, 12); rr(52, -177, 24, 100, 12);
  ctx.fillStyle = '#7493a6'; rr(-76, -10, 152, 28, 10);
  ctx.fillStyle = '#283b55'; rr(-85, -48, 20, 55, 8); rr(65, -48, 20, 55, 8);
  ctx.restore();
}
