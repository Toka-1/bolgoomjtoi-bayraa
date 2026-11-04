import { ctx, clock, reduce } from '../core/canvas';
import { C, circ } from '../core/draw';

/** A destination ring and a repeating touch trail; static with reduced motion. */
export function gesture(x: number, y: number, tx: number, ty: number, radius = 40): void {
  ctx.save();
  ctx.lineWidth = 3; ctx.strokeStyle = C.gold;
  ctx.fillStyle = 'rgba(244,180,0,.12)';
  ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.arc(tx, ty, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.setLineDash([]);
  const t = reduce ? 0.5 : Math.min(1, (clock.t % 2) / 1.4);
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = '#fff'; circ(x + (tx - x) * t, y + (ty - y) * t, 10);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
