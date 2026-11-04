import { ctx, W, H } from './canvas';

export type Paint = string | CanvasGradient | CanvasPattern;
export type Stops = ReadonlyArray<readonly [number, string]>;

export const TAU = Math.PI * 2;
export const FONT = '"Rubik", system-ui, sans-serif';

export const C = {
  ink: '#1b1f3b', gold: '#f4b400', deel: '#2856c9', deel2: '#1d3f99', sash: '#f28c1b', red: '#e5332a',
  skin: '#f0c39a', cheek: '#e8786a', hair: '#22180f', snow: '#f4f8fc', ice: '#a8e4ff', felt: '#f7f1e3',
  wood: '#b5713a', steppe: '#9ccc5a', steppe2: '#7cb342', sky: '#8fd0f5',
} as const;

export const rand = (a: number, b: number): number => a + Math.random() * (b - a);
export const dist = (x1: number, y1: number, x2: number, y2: number): number => Math.hypot(x1 - x2, y1 - y2);
export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

/* ---------- shapes ---------- */
export function rr(x: number, y: number, w: number, h: number, r: number | number[]): void {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}
export function circ(x: number, y: number, r: number): void {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
export function ell(x: number, y: number, rx: number, ry: number, rot = 0): void {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fill();
}
export function seg(x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

/* ---------- gradients ---------- */
export function lin(x0: number, y0: number, x1: number, y1: number, stops: Stops): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
/** Radial gradient; the inner circle may be offset (hx, hy) for a highlight look. */
export function rad(x: number, y: number, r: number, stops: Stops, hx = x, hy = y, r0 = 0): CanvasGradient {
  const g = ctx.createRadialGradient(hx, hy, r0, x, y, r);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

/** Soft elliptical contact shadow on the ground. */
export function shadow(x: number, y: number, rx: number, ry: number, a = 0.35): void {
  ctx.save();
  ctx.translate(x, y); ctx.scale(1, ry / rx);
  ctx.fillStyle = rad(0, 0, rx, [[0, `rgba(10,12,30,${a})`], [0.6, `rgba(10,12,30,${a * 0.5})`], [1, 'rgba(10,12,30,0)']]);
  circ(0, 0, rx);
  ctx.restore();
}

/** Additive light bloom. `rgb` is "r,g,b". */
export function glow(x: number, y: number, r: number, rgb: string, a: number): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rad(x, y, r, [[0, `rgba(${rgb},${a})`], [0.4, `rgba(${rgb},${a * 0.35})`], [1, `rgba(${rgb},0)`]]);
  circ(x, y, r);
  ctx.restore();
}

/* ---------- text ---------- */
export interface TextOpts { w?: number; align?: CanvasTextAlign; stroke?: string; sw?: number; drop?: boolean }
export function text(s: string, x: number, y: number, size: number, color: Paint, o: TextOpts = {}): void {
  ctx.font = `${o.w ?? 900} ${size}px ${FONT}`;
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const sw = o.sw ?? size * 0.24;
  if (o.drop) {
    const d = Math.max(2, size * 0.07);
    ctx.fillStyle = 'rgba(10,12,30,.35)';
    if (o.stroke) { ctx.lineWidth = sw; ctx.strokeStyle = 'rgba(10,12,30,.35)'; ctx.strokeText(s, x, y + d); }
    ctx.fillText(s, x, y + d);
  }
  if (o.stroke) { ctx.lineWidth = sw; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}
export function wrap(s: string, x: number, y: number, maxW: number, size: number, color: string, w = 500, lh = 1.32): void {
  ctx.font = `${w} ${size}px ${FONT}`;
  const lines: string[] = [];
  let line = '';
  for (const word of s.split(' ')) {
    const t = line ? line + ' ' + word : word;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = word; } else line = t;
  }
  lines.push(line);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * lh));
}

/** Full-frame vertical gradient. */
export function skyFill(stops: Stops, y0 = 0, y1 = H): void {
  ctx.fillStyle = lin(0, y0, 0, y1, stops);
  ctx.fillRect(0, 0, W, H);
}
