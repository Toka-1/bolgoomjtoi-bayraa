import { ctx, W, H, clock, reduce, sprite, view } from '../core/canvas';
import { lin, rad, circ, seg, rand, TAU, type Stops } from '../core/draw';
import { rng } from '../core/rng';

/* ---------- sky ---------- */
export function sun(x: number, y: number, r: number, core: string, rgb: string, haloA = 0.45): void {
  ctx.fillStyle = rad(x, y, r * 5, [[0, `rgba(${rgb},${haloA})`], [0.25, `rgba(${rgb},${haloA * 0.35})`], [1, `rgba(${rgb},0)`]]);
  circ(x, y, r * 5);
  ctx.fillStyle = rad(x, y, r, [[0, '#fffef5'], [0.6, core], [1, core]]);
  circ(x, y, r);
}

/** A soft cumulus: lit from above, bluish underside. */
export function cloud(x: number, y: number, s: number, a = 1, seed = 1): void {
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y); ctx.scale(s, s);
  const puffs: Array<[number, number, number]> = [];
  for (let i = 0; i < 7; i++) puffs.push([r(-38, 38), r(-14, 4) - (1 - Math.abs(i - 3) / 3) * 8, r(14, 24)]);
  ctx.fillStyle = 'rgba(120,140,170,.18)';
  for (const [px, py, pr] of puffs) circ(px + 3, py + 6, pr);
  ctx.fillStyle = lin(0, -34, 0, 22, [[0, '#ffffff'], [0.55, '#f4f8fc'], [1, '#c9d7e8']]);
  for (const [px, py, pr] of puffs) circ(px, py, pr);
  ctx.restore();
}

/** A jagged mountain range with optional snow caps. */
export function ridge(base: number, height: number, seed: number, stops: Stops, snow = 0): void {
  const r = rng(seed);
  const f = [r(0.008, 0.014), r(0.02, 0.035), r(0.06, 0.09)], p = [r(0, TAU), r(0, TAU), r(0, TAU)];
  const pts: Array<[number, number]> = [];
  for (let x = -4; x <= W + 4; x += 4) {
    const n = 0.55 * Math.sin(x * f[0] + p[0]) + 0.3 * Math.sin(x * f[1] + p[1]) + 0.15 * Math.abs(Math.sin(x * f[2] + p[2]));
    pts.push([x, base - height * (0.5 + 0.5 * n)]);
  }
  ctx.beginPath(); ctx.moveTo(-4, H);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(W + 4, H); ctx.closePath();
  ctx.fillStyle = lin(0, base - height, 0, base + 40, stops);
  ctx.fill();
  if (snow > 0) {
    const cap = base - height * (1 - snow);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    for (let i = pts.length - 1; i >= 0; i--) {
      const [x, y] = pts[i];
      ctx.lineTo(x, Math.max(y, Math.min(y + 22, cap + Math.sin(x * 0.3) * 4)));
    }
    ctx.closePath();
    ctx.fillStyle = lin(0, base - height, 0, cap + 10, [[0, '#ffffff'], [1, '#dfe8f3']]);
    ctx.fill();
  }
  // light from the left: faint shaded faces
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-4, H);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(W + 4, H); ctx.closePath(); ctx.clip();
  ctx.fillStyle = 'rgba(20,30,60,.12)';
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    if (pts[i - 1][1] > y && pts[i + 1][1] >= y) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + height * 0.5, base + 20); ctx.lineTo(x + height * 0.9, base + 20); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}

/** Rolling hills filled with a vertical gradient. */
export function hills(y: number, amp: number, freq: number, ph: number, stops: Stops, depth = 120): void {
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) ctx.lineTo(x, y + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 2.7 + ph * 2) * amp * 0.3);
  ctx.lineTo(W, H); ctx.closePath();
  ctx.fillStyle = lin(0, y - amp, 0, y + depth, stops);
  ctx.fill();
}

/** Grass tufts scattered in a band; nearer (lower) tufts are larger. */
export function grass(y0: number, y1: number, n: number, seed: number, dark: string, light: string): void {
  const r = rng(seed);
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const y = r(y0, y1), x = r(0, W), k = 0.5 + (y - y0) / (y1 - y0 || 1);
    ctx.strokeStyle = r() < 0.5 ? dark : light;
    ctx.lineWidth = 1.2 * k;
    for (let b = -2; b <= 2; b++) seg(x + b * 1.5 * k, y, x + b * 3 * k + r(-1, 1), y - r(4, 9) * k);
  }
}

/** Soft blotches for plaster, felt, snow texture. */
export function mottle(x: number, y: number, w: number, h: number, seed: number, rgb: string, n: number, a: number): void {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const px = r(x, x + w), py = r(y, y + h), pr = r(6, 26);
    ctx.fillStyle = rad(px, py, pr, [[0, `rgba(${rgb},${a})`], [1, `rgba(${rgb},0)`]]);
    circ(px, py, pr);
  }
}

/** Wooden floor in perspective, planks converging on vpX. */
export function planks(y0: number, y1: number, vpX: number, seed: number, light = '#b98352', dark = '#7d522e'): void {
  ctx.fillStyle = lin(0, y0, 0, y1, [[0, dark], [1, light]]);
  ctx.fillRect(0, y0, W, y1 - y0);
  const r = rng(seed), pw = 46, k = 0.55;
  const at = (bx: number, t: number) => vpX + (bx - vpX) * (k + (1 - k) * t);
  // alternate plank tones
  for (let bx = -300; bx <= W + 300; bx += pw) {
    const tone = r(-1, 1);
    ctx.fillStyle = tone > 0 ? `rgba(255,220,170,${tone * 0.08})` : `rgba(40,20,5,${-tone * 0.12})`;
    ctx.beginPath(); ctx.moveTo(at(bx, 0), y0); ctx.lineTo(at(bx + pw, 0), y0); ctx.lineTo(bx + pw, y1); ctx.lineTo(bx, y1); ctx.closePath(); ctx.fill();
  }
  // grain
  ctx.lineWidth = 1;
  for (let i = 0; i < 160; i++) {
    const bx = -300 + Math.floor(r(0, (W + 600) / pw)) * pw, u = r(0.1, 0.9), t1 = r(0, 1), t2 = Math.min(1, t1 + r(0.08, 0.3));
    const x1 = at(bx + u * pw, t1), x2 = at(bx + u * pw, t2);
    ctx.strokeStyle = r() < 0.5 ? 'rgba(255,225,180,.12)' : 'rgba(50,25,8,.16)';
    seg(x1, y0 + t1 * (y1 - y0), x2, y0 + t2 * (y1 - y0));
  }
  // seams
  ctx.strokeStyle = 'rgba(45,22,6,.45)'; ctx.lineWidth = 1.4;
  for (let bx = -300; bx <= W + 300; bx += pw) seg(at(bx, 0), y0, bx, y1);
  // butt joints
  for (let bx = -300; bx <= W + 300; bx += pw) {
    const t = r(0.1, 0.9), y = y0 + t * (y1 - y0);
    seg(at(bx, t), y, at(bx + pw, t), y);
  }
  // contact shadow at the wall, gloss toward the viewer
  ctx.fillStyle = lin(0, y0, 0, y0 + 34, [[0, 'rgba(20,10,0,.45)'], [1, 'rgba(20,10,0,0)']]);
  ctx.fillRect(0, y0, W, 34);
  ctx.fillStyle = lin(0, y1 - 60, 0, y1, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(255,240,220,.08)']]);
  ctx.fillRect(0, y1 - 60, W, 60);
}

/** Skirting board where wall meets floor. */
export function skirting(y: number): void {
  ctx.fillStyle = lin(0, y - 12, 0, y, [[0, '#8a5a32'], [0.2, '#c0895a'], [1, '#6d4524']]);
  ctx.fillRect(0, y - 12, W, 12);
}

/* ---------- weather ---------- */
const flakes = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(0.7, 3.4), s: rand(25, 75), p: rand(0, TAU) }));
export function snowfall(alpha = 0.9): void {
  const t = clock.t;
  ctx.fillStyle = '#fff';
  for (const f of flakes) {
    const x = (f.x + Math.sin(t * 1.3 + f.p) * 9 * (f.r / 2) + W * 2) % W;
    const y = ((f.y + t * f.s * (0.5 + f.r / 3.4)) % (H + 10)) - 5;
    ctx.globalAlpha = alpha * (0.35 + f.r / 5.5);
    circ(x, y, f.r);
  }
  ctx.globalAlpha = 1;
}

/** A pre-blurred smoke puff sprite, tinted. Draw with drawPuff. */
export function puffSprite(rgb: string): HTMLCanvasElement {
  return sprite('puff:' + rgb, 128, 128, c => {
    const r = rng(5);
    for (let i = 0; i < 8; i++) {
      const x = 64 + r(-20, 20), y = 64 + r(-20, 20), pr = r(24, 42);
      const g = c.createRadialGradient(x, y, 0, x, y, pr);
      g.addColorStop(0, `rgba(${rgb},.5)`); g.addColorStop(0.6, `rgba(${rgb},.2)`); g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, pr, 0, TAU); c.fill();
    }
  });
}
export function drawPuff(img: HTMLCanvasElement, x: number, y: number, r: number, a: number, rot = 0): void {
  if (a <= 0.003) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, a);
  ctx.translate(x, y); if (rot) ctx.rotate(rot);
  ctx.drawImage(img, -r, -r, r * 2, r * 2);
  ctx.restore();
}

/** Rising smoke from a chimney top. */
export function chimneySmoke(x: number, y: number, s = 1, rgb = '235,235,240', a = 0.7): void {
  const img = puffSprite(rgb), t = clock.t;
  for (let i = 0; i < 7; i++) {
    const p = (t * 0.18 + i / 7) % 1;
    drawPuff(img, x + p * 40 * s + Math.sin(i * 3 + t) * 4, y - p * 90 * s, (8 + p * 26) * s, a * (1 - p) * Math.min(1, p * 6), i);
  }
}

/* ---------- post ---------- */
export function vignette(a = 0.38): void {
  ctx.fillStyle = rad(W / 2, H * 0.46, H * 0.78, [[0, 'rgba(10,12,30,0)'], [0.55, 'rgba(10,12,30,0)'], [1, `rgba(10,12,30,${a})`]]);
  ctx.fillRect(0, 0, W, H);
}

let grainPat: CanvasPattern | null = null;
export function grain(a = 0.05): void {
  if (!grainPat) {
    const img = sprite('grain', 160, 160, c => {
      const d = c.createImageData(160, 160);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
      }
      c.putImageData(d, 0, 0);
    });
    grainPat = ctx.createPattern(img, 'repeat');
  }
  if (!grainPat) return;
  const ox = reduce ? 0 : Math.floor(Math.random() * 160), oy = reduce ? 0 : Math.floor(Math.random() * 160);
  grainPat.setTransform(new DOMMatrix().scale(1 / view.scale).translate(ox, oy));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = grainPat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

