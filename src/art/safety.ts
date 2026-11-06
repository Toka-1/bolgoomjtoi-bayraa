import { ctx } from '../core/canvas';
import { lin, rad, rr, circ, ell, seg, shadow } from '../core/draw';

/** Adult caregiver: longer body, smaller head, teal jacket, trousers and moustache. */
export function caregiver(x: number, y: number, s = 1, worried = false): void {
  shadow(x, y + 1, 28 * s, 6 * s, 0.28);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // Separate trouser legs and shoes, rather than Bayraa's deel silhouette.
  ctx.fillStyle = '#394354'; rr(-19, -64, 17, 59, 5); rr(3, -64, 17, 59, 5);
  ctx.fillStyle = '#30261f'; rr(-23, -10, 24, 10, 4); rr(3, -10, 25, 10, 4);
  ctx.fillStyle = lin(-25, 0, 25, 0, [[0, '#8fb2a4'], [1, '#5a8076']]); rr(-24, -116, 48, 62, 10);
  ctx.strokeStyle = '#5a8076'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  seg(-20, -105, -30, -67); seg(20, -105, 30, -67);
  ctx.fillStyle = '#e5b18b'; ell(-30, -62, 6, 8); ell(30, -62, 6, 8);
  ctx.strokeStyle = '#cde0d4'; ctx.lineWidth = 2; seg(0, -112, 0, -57);
  ctx.fillStyle = '#e5b18b'; rr(-6, -126, 12, 15, 3);
  ctx.fillStyle = rad(0, -137, 25, [[0, '#ffe3c5'], [.55, '#f0c7a5'], [1, '#c58e70']], -6, -147); ell(0, -137, 17, 23);
  ctx.fillStyle = '#46352e';
  ctx.beginPath(); ctx.ellipse(0, -147, 18, 16, 0, Math.PI, Math.PI * 2); ctx.fill();
  rr(-18, -149, 5, 16, 2); rr(13, -149, 5, 16, 2);
  ctx.fillStyle = '#bbb5ab'; rr(-18, -140, 4, 9, 2); rr(14, -140, 4, 9, 2);
  ctx.fillStyle = '#fff9ef'; ell(-6, -138, 3.7, 4.5); ell(6, -138, 3.7, 4.5);
  ctx.fillStyle = '#43342d'; ell(-5.6, -137.5, 2, 3); ell(6.4, -137.5, 2, 3);
  ctx.fillStyle = '#fff'; circ(-6.3, -139, .8); circ(5.7, -139, .8);
  ctx.strokeStyle = '#30251f'; ctx.lineWidth = 2;
  seg(-10, -145, -3, worried ? -147 : -145); seg(3, worried ? -147 : -145, 10, -145);
  ctx.fillStyle = '#634435'; ell(-4, -125, 5, 2.5, -0.15); ell(4, -125, 5, 2.5, 0.15);
  ctx.fillStyle = rad(0, -131, 5, [[0, '#ffe4c6'], [1, '#d9a180']], -1.5, -133);
  ell(0, -131, 3.5, 4.2);
  ctx.strokeStyle = '#815143'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-5, -119); ctx.quadraticCurveTo(0, worried ? -122 : -115, 5, -119); ctx.stroke();
  ctx.restore();
}

/** Swimming silhouette and waves under a red prohibition circle and diagonal. */
export function noSwimmingSign(x: number, y: number, r: number): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(r / 40, r / 40);
  ctx.fillStyle = '#fff'; circ(0, 0, 40);
  ctx.strokeStyle = '#172e44'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = '#172e44'; circ(15, -11, 6);
  ctx.beginPath(); ctx.moveTo(7, -2); ctx.lineTo(-3, -8); ctx.lineTo(-15, -18); ctx.lineTo(-26, -8); ctx.stroke();
  for (const sy of [12, 23]) {
    ctx.strokeStyle = '#337fbb'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-26, sy);
    for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(-20 + i * 13, sy - 7, -13 + i * 13, sy);
    ctx.stroke();
  }
  ctx.strokeStyle = '#ce302e'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, 37, 0, Math.PI * 2); ctx.stroke();
  seg(-26, -26, 26, 26);
  ctx.restore();
}
