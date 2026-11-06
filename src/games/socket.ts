import { dangerZone } from '../art/danger';
import { perspectiveFloor, solidBox } from '../art/depth';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rad, rr, seg, circ, text, dist, shadow, glow } from '../core/draw';
import { ctl } from '../core/ctl';
import { sfx } from '../core/audio';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { skirting, mottle } from '../art/scenery';
import type { Micro } from './types';
import { DragKeys } from '../core/dragKeys';
import { stopHint } from '../ui/gesture';

const OUTLET = { x: 225, y: 455, radius: 13 };
type Metal = { kind: 'fork' | 'key'; x: number; y: number; homeX: number; homeY: number };
const tipLength = (m: Metal): number => m.kind === 'fork' ? 26 : 21;

export class Socket implements Micro {
  readonly cmd = 'БИТГИЙ ХҮР!';
  readonly sub = 'Залгуурт юу ч бүү хий';
  readonly lose = 'Цахилгаанд цохиулчихлаа!';
  readonly tip = 'Залгуур руу сэрээ, түлхүүр зэрэг төмөр юм хэзээ ч бүү хий. Хүүхэдтэй гэрт залгуурын хамгаалалт тавь.';
  readonly timeoutWin = true;
  readonly keys = 'Залгуурт юу ч бүү хий';
  readonly winText = 'ЗӨВ, ХҮРСЭНГҮЙ!';
  dead = false;
  private zap = 0;
  private arrows = new DragKeys();
  items: Metal[] = [];
  drag = -1;
  private inserted = -1;

  init(): void {
    this.dead = false; this.zap = 0; this.drag = -1; this.inserted = -1; this.arrows.clear();
    this.items = [
      { kind: 'fork', x: 108, y: 558, homeX: 108, homeY: 558 },
      { kind: 'key', x: 173, y: 590, homeX: 173, homeY: 590 },
    ];
  }
  update(dt: number): void {
    if (this.drag < 0 || this.dead) return;
    const m = this.items[this.drag], [dx, dy] = this.arrows.delta(dt);
    this.move(m.x + dx, m.y + dy);
  }
  hint(): void {
    if (!this.dead) stopHint(OUTLET.x - 12, OUTLET.y - 62, 24);
  }
  resultUpdate(dt: number): void { this.zap = Math.max(0, this.zap - dt); }
  key(k: string, isDown: boolean): void {
    this.arrows.key(k, isDown);
  }
  down(x: number, y: number): void {
    if (this.dead || this.drag >= 0) return;
    this.drag = this.items.findIndex(m => dist(x, y, m.x, m.y) < 28);
  }
  move(x: number, y: number): void {
    if (this.dead || this.drag < 0) return;
    const m = this.items[this.drag];
    const px = m.x, py = m.y - tipLength(m);
    m.x = Math.max(26, Math.min(W - 26, x)); m.y = Math.max(100, Math.min(H - 30, y));
    const dx = m.x - px, dy = m.y - tipLength(m) - py;
    const along = Math.max(0, Math.min(1, ((OUTLET.x - px) * dx + (OUTLET.y - py) * dy) / (dx * dx + dy * dy || 1)));
    // Sweep the actual tip so a quick drag cannot jump over the insertion area.
    if (dist(px + dx * along, py + dy * along, OUTLET.x, OUTLET.y) <= OUTLET.radius) {
      this.inserted = this.drag; this.drag = -1;
      m.x = OUTLET.x; m.y = OUTLET.y + tipLength(m);
      this.dead = true; this.zap = 0.7; this.arrows.clear(); sfx('zap'); ctl.lose(this.lose);
    }
  }
  up(): void { this.cancelInput(); }
  cancelInput(): void {
    if (this.drag >= 0) { const m = this.items[this.drag]; m.x = m.homeX; m.y = m.homeY; }
    this.drag = -1; this.arrows.clear();
  }
  select(x: number, y: number): boolean {
    if (this.dead) return false;
    if (this.drag >= 0) { this.move(x, y); this.up(); } else this.down(x, y);
    return this.drag >= 0;
  }
  danger(): void { if (!this.dead) dangerZone(196, 427, 58, 57, 'electric'); }
  draw(): void {
    layer('socket-insertion-room', paintRoom);
    for (let i = 0; i < this.items.length; i++) if (i !== this.drag && i !== this.inserted) metal(this.items[i], false);
    bayraa(300, 590, 1.65, { mood: this.dead ? 'scared' : 'ok', arms: this.dead || this.drag >= 0 ? 1 : 0 });
    if (this.drag >= 0) metal(this.items[this.drag], true);
    if (this.inserted >= 0) metal(this.items[this.inserted], true);
    if (this.zap > 0) {
      if (!reduce) { ctx.fillStyle = `rgba(255,240,120,${this.zap * 0.35})`; ctx.fillRect(0, 0, W, H); }
      glow(OUTLET.x, OUTLET.y, 90, '170,210,255', this.zap);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < (reduce ? 0 : 5); i++) {
        const a = i * 0.9 + clock.t * 3;
        bolt(250 + Math.cos(a) * 28, 470 + Math.sin(a) * 34, 250 + Math.cos(a) * 70, 470 + Math.sin(a) * 80);
      }
      if (!reduce) bolt(OUTLET.x, OUTLET.y, 249, 481);
    }
  }
}

function bolt(x1: number, y1: number, x2: number, y2: number): void {
  const pts: Array<[number, number]> = [[x1, y1]];
  for (let k = 1; k < 5; k++) pts.push([x1 + (x2 - x1) * k / 5 + (Math.random() - 0.5) * 16, y1 + (y2 - y1) * k / 5 + (Math.random() - 0.5) * 16]);
  pts.push([x2, y2]);
  for (const [w, c] of [[7, 'rgba(120,180,255,.45)'], [2.5, '#ffffff']] as const) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
}

/** Drawn tine/key tip is exactly tipLength() from the drag anchor. */
function metal(m: Metal, raised: boolean): void {
  if (!raised) shadow(m.x, m.y + 5, 24, 4, 0.22);
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(raised ? -Math.PI / 2 : m.kind === 'fork' ? -0.3 : 0.25);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = lin(0, -4, 0, 4, [[0, '#edf4fa'], [0.5, '#a0adba'], [1, '#556574']]);
  if (m.kind === 'fork') {
    ctx.lineWidth = 5; seg(-22, 0, 12, 0);
    ctx.lineWidth = 2; for (const dy of [-6, -2, 2, 6]) seg(12, dy * 0.5, 26, dy);
  } else {
    ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-15, 0, 7, 0, Math.PI * 2); ctx.stroke();
    seg(-8, 0, 21, 0); seg(12, 0, 12, 6); seg(19, 0, 19, 6);
  }
  ctx.restore();
}

function paintRoom(): void {
  // wallpaper with stripes and a small repeating motif
  ctx.fillStyle = lin(0, 0, 0, 500, [[0, '#bdd8c5'], [1, '#d4e8da']]); ctx.fillRect(0, 0, W, 500);
  ctx.fillStyle = 'rgba(140,180,152,.35)'; for (let x = 0; x < W; x += 36) ctx.fillRect(x, 0, 14, 500);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 0; x < W; x += 36) ctx.fillRect(x + 14, 0, 1.5, 500);
  ctx.fillStyle = 'rgba(110,150,122,.35)';
  for (let y = 20; y < 490; y += 40) for (let x = 25; x < W; x += 36) {
    const yy = y + ((x / 36) % 2) * 20;
    ctx.beginPath(); ctx.moveTo(x, yy - 5); ctx.quadraticCurveTo(x + 4, yy, x, yy + 5); ctx.quadraticCurveTo(x - 4, yy, x, yy - 5); ctx.fill();
  }
  mottle(0, 0, W, 500, 31, '60,90,70', 40, 0.05);
  ctx.fillStyle = lin(0, 0, 0, 70, [[0, 'rgba(30,50,40,.25)'], [1, 'rgba(30,50,40,0)']]); ctx.fillRect(0, 0, W, 70);
  skirting(500);
  perspectiveFloor(500, '#bc8a59');
  // A shallow return wall and raised plate establish the wall/floor junction.
  ctx.fillStyle = '#a9c0ad';
  ctx.beginPath(); ctx.moveTo(335, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 524); ctx.lineTo(335, 500); ctx.closePath(); ctx.fill();
  solidBox(OUTLET.x - 24, OUTLET.y - 24, 48, 48, 5, '#d4d9d9', '#fff9ec', '#8b9996');
  // socket plate
  ctx.save(); ctx.translate(OUTLET.x, OUTLET.y); ctx.scale(0.6, 0.6); ctx.translate(-250, -300);
  shadow(253, 337, 40, 6, 0.25);
  ctx.fillStyle = 'rgba(30,50,40,.25)'; rr(218, 269, 70, 70, 12);
  ctx.fillStyle = lin(215, 265, 285, 335, [[0, '#ffffff'], [1, '#d9dde2']]); rr(215, 265, 70, 70, 12);
  ctx.fillStyle = lin(222, 272, 278, 328, [[0, '#e3e7ec'], [1, '#ffffff']]); rr(222, 272, 56, 56, 9);
  ctx.fillStyle = rad(250, 300, 22, [[0, '#d0d5db'], [0.8, '#eef1f4'], [1, '#b9c0c8']], 252, 304); circ(250, 300, 21);
  ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(250, 300, 21, 0, Math.PI * 2); ctx.stroke();
  for (const hx of [240, 260]) { ctx.fillStyle = '#1c1f26'; circ(hx, 300, 3.6); ctx.fillStyle = 'rgba(255,255,255,.5)'; circ(hx + 0.8, 301.6, 1); }
  text('220V', 250, 350, 12, '#5b6b60', { w: 700 });
  ctx.restore();
  // a power cable running along the skirting
  ctx.strokeStyle = '#f4f4f4'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(OUTLET.x + 17, OUTLET.y + 20); ctx.bezierCurveTo(300, 485, 320, 486, W + 10, 492); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(OUTLET.x + 18.5, OUTLET.y + 20); ctx.bezierCurveTo(301.5, 487, 321, 488, W + 10, 494); ctx.stroke();
  const r = rng(3);
  ctx.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 20; i++) circ(r(0, W), r(520, H), r(0.5, 1.2));
}
