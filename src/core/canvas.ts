/** The game is drawn in a fixed 360×640 frame, centred and letterboxed on a full-screen canvas. */
export const W = 360;
export const H = 640;

export const cv = document.getElementById('c') as HTMLCanvasElement;
const screen = cv.getContext('2d')!;

/** The context every drawing helper paints into. Swapped while baking a cached layer. */
export let ctx: CanvasRenderingContext2D = screen;

export const view = { dpr: 1, scale: 1, offX: 0, offY: 0 };
export const clock = { t: 0 };
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Pixel density for baked layers: enough for the current screen, capped to keep memory sane. */
let bakeK = 0;
const baked = new Map<string, HTMLCanvasElement>();

export function resize(): void {
  view.dpr = Math.min(window.devicePixelRatio || 1, 3);
  const iw = innerWidth, ih = innerHeight;
  cv.width = Math.round(iw * view.dpr);
  cv.height = Math.round(ih * view.dpr);
  view.scale = Math.min(iw / W, ih / H);
  view.offX = (iw - W * view.scale) / 2;
  view.offY = (ih - H * view.scale) / 2;
  const k = Math.min(3, Math.max(1, Math.ceil(view.dpr * view.scale)));
  if (k !== bakeK) { bakeK = k; baked.clear(); }
}

/** Begin a frame: clear to the letterbox colour and set up game coordinates. */
export function beginFrame(bg: string): void {
  ctx = screen;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cv.width, cv.height);
  const s = view.dpr * view.scale;
  ctx.setTransform(s, 0, 0, s, view.dpr * view.offX, view.dpr * view.offY);
}

/** Draw `paint` into an off-screen canvas once, then reuse it. For static scenery only. */
export function layer(key: string, paint: () => void): void {
  let c = baked.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = W * bakeK; c.height = H * bakeK;
    const bx = c.getContext('2d')!;
    bx.scale(bakeK, bakeK);
    const prev = ctx;
    ctx = bx;
    try { paint(); } finally { ctx = prev; }
    baked.set(key, c);
  }
  ctx.drawImage(c, 0, 0, W, H);
}

/** A small off-screen sprite, cached forever (sizes are in sprite pixels). */
const sprites = new Map<string, HTMLCanvasElement>();
export function sprite(key: string, w: number, h: number, paint: (c: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  let c = sprites.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = w; c.height = h;
    paint(c.getContext('2d')!);
    sprites.set(key, c);
  }
  return c;
}

/** Render `paint` (in game coordinates) once into a scaled-down canvas, e.g. a card thumbnail. */
const snaps = new Map<string, HTMLCanvasElement>();
export function snapshot(key: string, s: number, paint: () => void): HTMLCanvasElement {
  let c = snaps.get(key);
  if (!c) {
    const k = Math.min(2, Math.max(1, Math.ceil(view.dpr * view.scale)));
    c = document.createElement('canvas');
    c.width = Math.ceil(W * s * k); c.height = Math.ceil(H * s * k);
    const bx = c.getContext('2d')!;
    bx.scale(s * k, s * k);
    bx.beginPath(); bx.rect(0, 0, W, H); bx.clip();
    const prev = ctx;
    ctx = bx;
    try { paint(); } finally { ctx = prev; }
    snaps.set(key, c);
  }
  return c;
}
