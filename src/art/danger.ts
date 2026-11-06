import { ctx, clock, reduce } from '../core/canvas';

export type DangerKind = 'heat' | 'cold' | 'electric' | 'water' | 'wind' | 'warning';

/** Red broken edges mean danger; unlike gold action hints these are not targets.
 * No flashing: only a slow change in line opacity, fixed for reduced motion. */
export function dangerZone(x: number, y: number, w: number, h: number, kind: DangerKind = 'warning'): void {
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.globalAlpha = reduce ? 0.9 : 0.82 + Math.sin(clock.t * 2.5) * 0.12;
  if (w > 0 && h > 0) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 9);
    ctx.strokeStyle = '#fff5df'; ctx.lineWidth = 5; ctx.stroke();
    ctx.setLineDash([8, 5]); ctx.strokeStyle = '#bd342d'; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  const cx = Math.max(24, Math.min(336, x + w - 12));
  const cy = Math.max(95, y - 21);
  ctx.translate(cx, cy);
  ctx.shadowColor = 'rgba(48,25,20,.25)'; ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#fff1cb'; ctx.strokeStyle = '#b8312c'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, -19); ctx.lineTo(20, 15); ctx.lineTo(-20, 15); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#7d2527'; ctx.fillStyle = '#7d2527'; ctx.lineWidth = 2.5;
  if (kind === 'electric') {
    ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(-7, 2); ctx.lineTo(0, 2);
    ctx.lineTo(-2, 11); ctx.lineTo(8, -2); ctx.lineTo(1, -2); ctx.closePath(); ctx.fill();
  } else if (kind === 'heat') {
    for (const dx of [-7, 0, 7]) {
      ctx.beginPath(); ctx.moveTo(dx, 9); ctx.bezierCurveTo(dx - 5, 3, dx + 5, 0, dx, -6); ctx.stroke();
    }
  } else if (kind === 'cold') {
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.stroke();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-3, s * 4); ctx.lineTo(0, s * 7); ctx.lineTo(3, s * 4); ctx.stroke(); }
      ctx.restore();
    }
  } else if (kind === 'water' || kind === 'wind') {
    for (const dy of [-3, 4, 11]) {
      ctx.beginPath(); ctx.moveTo(-10, dy); ctx.quadraticCurveTo(-5, dy - 5, 0, dy);
      ctx.quadraticCurveTo(5, dy + 5, 10, dy); ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 3); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 9, 1.7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Visible heat above hot objects, without suggesting they should be touched. */
export function heatWaves(x: number, y: number, w: number): void {
  ctx.save(); ctx.strokeStyle = '#d7532b'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const phase = reduce ? 0 : Math.sin(clock.t * 2) * 2;
  for (let i = 0; i < 3; i++) {
    const px = x + w * (i + 1) / 4;
    ctx.beginPath(); ctx.moveTo(px, y); ctx.bezierCurveTo(px - 7, y - 12, px + 7 + phase, y - 23, px, y - 35); ctx.stroke();
  }
  ctx.restore();
}
