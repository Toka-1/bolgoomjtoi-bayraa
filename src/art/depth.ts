import { ctx, W, H } from '../core/canvas';

function face(points: readonly (readonly [number, number])[], color: string): void {
  ctx.beginPath(); ctx.moveTo(...points[0]);
  for (const p of points.slice(1)) ctx.lineTo(...p);
  ctx.closePath();
  const ys = points.map(p => p[1]);
  ctx.fillStyle = color; ctx.fill();
  ctx.save(); ctx.clip();
  const light = ctx.createLinearGradient(points[0][0], Math.min(...ys), points[0][0] + 150, Math.max(...ys) + 1);
  light.addColorStop(0, 'rgba(255,255,255,.16)'); light.addColorStop(1, 'rgba(20,28,42,.1)');
  ctx.fillStyle = light; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(48,35,29,.16)'; ctx.lineWidth = 1; ctx.stroke();
}

/** Cabinet-like solid: front dimensions stay in the same screen-space hit area. */
export function solidBox(x: number, y: number, w: number, h: number, depth: number,
  front: string, top: string, side: string): void {
  ctx.save(); ctx.lineJoin = 'round';
  face([[x, y], [x + depth, y - depth * .6], [x + w + depth, y - depth * .6], [x + w, y]], top);
  face([[x + w, y], [x + w + depth, y - depth * .6], [x + w + depth, y + h - depth * .6], [x + w, y + h]], side);
  face([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], front);
  ctx.restore();
}

/** Converging joints and progressively spaced seams establish a floor plane. */
export function perspectiveFloor(back: number, color: string, seam = 'rgba(73,47,32,.2)'): void {
  ctx.save(); ctx.fillStyle = color; ctx.fillRect(0, back, W, H - back);
  ctx.beginPath(); ctx.rect(0, back, W, H - back); ctx.clip();
  ctx.strokeStyle = seam; ctx.lineWidth = 1.2;
  const horizon = back - 140;
  for (let x = -720; x <= 1080; x += 120) {
    ctx.beginPath(); ctx.moveTo(W / 2, horizon); ctx.lineTo(x, H); ctx.stroke();
  }
  for (const depth of [.08, .23, .44, .71, 1]) {
    const y = back + (H - back) * depth;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(46,31,27,.17)'; ctx.fillRect(0, back, W, 4);
  ctx.restore();
}
