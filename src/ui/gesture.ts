import { ctx, clock, reduce } from '../core/canvas';
import { C, circ } from '../core/draw';

/** High-contrast outline around the object needed to finish the round. */
export function highlight(x: number, y: number, r: number): void {
  const pulse = reduce ? 0 : (Math.sin(clock.t * 4) + 1) * 2;
  ctx.save(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,211,70,.1)'; circ(x, y, r + pulse);
  ctx.shadowColor = C.gold; ctx.shadowBlur = 14;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(x, y, r + pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0; ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}

/** Raised palm: wait / do not touch, without written instructions. */
export function stopHint(x: number, y: number, r = 25): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(r / 25, r / 25);
  ctx.fillStyle = '#ce302e'; circ(0, 0, 25);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-9, -6, 18, 20, 5); ctx.fill();
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect(-9 + i * 4.5, -18 + Math.abs(1.5 - i) * 3, 4, 19, 2); ctx.fill(); }
  ctx.translate(-11, 4); ctx.rotate(-0.6); ctx.beginPath(); ctx.roundRect(-3, -8, 6, 17, 3); ctx.fill();
  ctx.restore();
}

export function highlightRect(x: number, y: number, w: number, h: number): void {
  ctx.save(); ctx.setLineDash([]);
  ctx.shadowColor = C.gold; ctx.shadowBlur = reduce ? 10 : 14 + Math.sin(clock.t * 4) * 4;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.stroke();
  ctx.shadowBlur = 0; ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}

/** Highlight the source and destination without arrows or a moving trail. */
export function gesture(x: number, y: number, tx: number, ty: number, radius = 40): void {
  highlight(tx, ty, radius);
  if (Math.hypot(tx - x, ty - y) > 4) highlight(x, y, Math.min(34, radius));
}
