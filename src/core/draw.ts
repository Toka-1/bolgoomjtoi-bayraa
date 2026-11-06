import { ctx, W, H } from './canvas';

export type Paint = string | CanvasGradient | CanvasPattern;
export type Stops = ReadonlyArray<readonly [number, string]>;

export const TAU = Math.PI * 2;
export const FONT = '"Rubik", system-ui, sans-serif';

export const C = {
  ink: '#393340', gold: '#e8b653', deel: '#5379ab', deel2: '#405b80', sash: '#db9955', red: '#cf4b43',
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
/** Pigment colours mixed with warm paper; dark ink and warning reds stay clear. */
function pigment(color: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  const channels = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  if (Math.max(...channels) < 90) return color;
  return `rgb(${channels.map((v, i) => Math.round(v * .86 + [248, 239, 219][i] * .14)).join(',')})`;
}
function matte(stops: Stops): string | null {
  if (!stops.every(([, c]) => /^#[0-9a-f]{6}$/i.test(c))) return null;
  const a = stops.reduce((last, stop) => stop[0] <= .5 ? stop : last, stops[0]);
  const b = stops.find(stop => stop[0] >= .5) ?? stops[stops.length - 1];
  const t = b[0] === a[0] ? 0 : (.5 - a[0]) / (b[0] - a[0]);
  const rgb = [1, 3, 5].map(i => Math.round(parseInt(a[1].slice(i, i + 2), 16) * (1 - t) + parseInt(b[1].slice(i, i + 2), 16) * t));
  return pigment('#' + rgb.map(v => v.toString(16).padStart(2, '0')).join(''));
}
export function lin(x0: number, y0: number, x1: number, y1: number, stops: Stops): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  const flat = Math.hypot(x1 - x0, y1 - y0) < 180 ? matte(stops) : null;
  if (flat) { g.addColorStop(0, flat); g.addColorStop(1, flat); }
  else for (const [o, c] of stops) g.addColorStop(o, pigment(c));
  return g;
}
/** Radial gradient; the inner circle may be offset (hx, hy) for a highlight look. */
export function rad(x: number, y: number, r: number, stops: Stops, hx = x, hy = y, r0 = 0): CanvasGradient {
  const g = ctx.createRadialGradient(hx, hy, r0, x, y, r);
  const flat = matte(stops);
  if (flat) { g.addColorStop(0, flat); g.addColorStop(1, flat); }
  else for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

/** Soft elliptical contact shadow on the ground. */
export function shadow(x: number, y: number, rx: number, ry: number, a = 0.35): void {
  ctx.save();
  ctx.translate(x, y); ctx.scale(1, ry / rx);
  ctx.fillStyle = 'rgba(94,72,60,' + a * .42 + ')';
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
