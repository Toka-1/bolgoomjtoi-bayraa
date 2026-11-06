import { ctx } from '../core/canvas';
import { rr, circ, seg } from '../core/draw';
import { car } from './props';

/** Right-facing car: the white rear lamp indicates reversing to the left. */
export function reversingCar(x: number, y: number, scale = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  car(0, 0, false);
  ctx.fillStyle = '#fff8d9'; rr(2, -28, 7, 10, 2);
  ctx.fillStyle = 'rgba(255,245,197,.22)';
  ctx.beginPath(); ctx.moveTo(1, -28); ctx.lineTo(-24, -38); ctx.lineTo(-24, -5); ctx.lineTo(1, -18); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/** Insulation is visibly torn; exposed copper is not a draggable object. */
export function damagedCord(x: number, y: number, scale = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = '#596570';
  ctx.beginPath(); ctx.moveTo(-66, -15); ctx.bezierCurveTo(-45, -36, -42, 12, -13, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, 0); ctx.bezierCurveTo(42, -14, 38, 22, 69, 6); ctx.stroke();
  ctx.strokeStyle = '#be7f43'; ctx.lineWidth = 2;
  for (const dy of [-4, 0, 4]) { seg(-14, dy, -2, dy - 3); seg(14, dy, 5, dy + 2); }
  ctx.fillStyle = '#596570'; rr(64, -4, 17, 20, 4);
  ctx.strokeStyle = '#91a1a8'; ctx.lineWidth = 3; seg(81, 1, 89, 1); seg(81, 10, 89, 10);
  ctx.restore();
}

export function icicle(x: number, y: number, length: number): void {
  ctx.save(); ctx.fillStyle = '#bad7e2'; ctx.strokeStyle = '#779daa'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.lineTo(x + 1, y + length); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#f2f5ed'; ctx.lineWidth = 2; seg(x - 4, y + 4, x, y + length * .65);
  ctx.restore();
}

export function snowRoof(x: number, y: number, w: number, looseIndex = -1): void {
  ctx.fillStyle = '#b79a86'; rr(x, y, w, 230, 3);
  ctx.fillStyle = '#7e929c'; rr(x - 7, y - 9, w + 14, 18, 4);
  ctx.fillStyle = '#eef1e9'; rr(x - 10, y - 15, w + 20, 13, 5);
  for (let i = 0; i < 4; i++) if (i !== looseIndex) icicle(x + 18 + i * 31, y + 7, 35 + i % 2 * 24);
  ctx.fillStyle = '#7893a0'; rr(x + 28, y + 90, 54, 76, 4);
  ctx.strokeStyle = '#e7decb'; ctx.lineWidth = 4; seg(x + 55, y + 90, x + 55, y + 166);
  ctx.fillStyle = '#efe7d5'; circ(x + 55, y + 172, 3);
}
