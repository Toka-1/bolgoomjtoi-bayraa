import { gesture, highlight } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rad, rr, circ, ell, seg, dist, shadow, C } from '../core/draw';
import { ctl } from '../core/ctl';
import { sfx } from '../core/audio';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { baby } from '../art/props';
import { planks, skirting, mottle } from '../art/scenery';
import { DragKeys } from '../core/dragKeys';
import type { Micro } from './types';

/** The wall cabinet's open interior; dropping an item inside it stores it. */
const CAB = { x: 214, y: 140, w: 126, h: 160 };
/** Where stored items sit on the shelves. */
const SHELF: ReadonlyArray<readonly [number, number]> = [[244, 224], [300, 224], [272, 292]];
const FLOOR_Y0 = 440, FLOOR_Y1 = 600;
const BABY_V = 32, REACH = 28, GRAB = 36;
const ITEM_SCALE = 0.95;
const itemBottom = (kind: Kind): number => kind === 'lighter' ? 14 : kind === 'pills' ? 10 : 8;

type Kind = 'matches' | 'pills' | 'lighter';
const LOSE: Record<Kind, string> = {
  matches: 'Шүдэнзээр тоглочихлоо!',
  pills: 'Эм залгичихлаа!',
  lighter: 'Асаагуураар тоглочихлоо!',
};
interface Item { kind: Kind; x: number; y: number; stored: boolean; slot: number }

export class Cabinet implements Micro {
  readonly cmd = 'ШҮҮГЭЭНД ХИЙ!';
  readonly sub = 'Аюултай зүйлсийг шүүгээ рүү чир';
  readonly lose = 'Амжсангүй!';
  readonly tip = 'Шүдэнз, асаагуур, эм, угаалгын бодисыг хүүхдийн гар хүрэхгүй өндөр, түгжээтэй шүүгээнд хадгал. Хүүхэд эм залгисан бол яаралтай 103-т залга.';
  readonly keys = 'Баруун товч: авах / тавих';
  readonly winText = 'ХАМГААЛЛАА!';
  dead = false;
  items: Item[] = [];
  private arrows = new DragKeys();
  /** index of the item being dragged, or -1 */
  drag = -1;
  bx = 300; by = 580;
  private door = 0;
  private grabbed: Item | null = null;
  private arrival = 0;

  init(): void {
    this.drag = -1; this.arrows.clear();
    const kinds: Kind[] = ['matches', 'pills', 'lighter'];
    // three floor spots, shuffled, on the left two-thirds of the room
    const spots: Array<[number, number]> = [[56, 470], [130, 560], [205, 500]];
    for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
    this.items = kinds.map((kind, i) => ({ kind, x: spots[i][0] + (Math.random() - 0.5) * 20, y: spots[i][1] + (Math.random() - 0.5) * 16, stored: false, slot: -1 }));
    this.bx = 300; this.by = 580; this.door = 0; this.grabbed = null; this.dead = false; this.arrival = 0;
  }

  private get stored(): number { return this.items.filter(i => i.stored).length; }

  update(dt: number): void {
    if (this.dead) return;
    if (this.drag >= 0) {
      const it = this.items[this.drag], [dx, dy] = this.arrows.delta(dt);
      it.x = Math.max(16, Math.min(W - 16, it.x + dx));
      it.y = Math.max(120, Math.min(H - 30, it.y + dy));
    }
    this.arrival += dt;
    // the toddler crawls to the nearest item still on the floor (not one in your hand)
    const free = this.items.filter((it, i) => !it.stored && i !== this.drag);
    if (!free.length) return;
    let target = free[0];
    for (const it of free) if (dist(it.x, it.y, this.bx, this.by - 12) < dist(target.x, target.y, this.bx, this.by - 12)) target = it;
    const dx = target.x - this.bx, dy = target.y + 12 - this.by;
    const d = Math.hypot(dx, dy);
    if (d < REACH) { this.dead = true; this.grabbed = target; ctl.lose(LOSE[target.kind]); return; }
    if (this.arrival < 0.45) return;
    this.bx += (dx / d) * BABY_V * dt;
    this.by += (dy / d) * BABY_V * dt;
  }
  /** Cosmetic: the cabinet door swings shut once everything is stored. */
  resultUpdate(dt: number): void { if (this.stored === 3) this.door = Math.min(1, this.door + dt * 3); }

  down(x: number, y: number): void {
    if (this.dead || this.drag >= 0) return;
    let best = -1, bd = GRAB;
    this.items.forEach((it, i) => { if (!it.stored) { const d = dist(x, y, it.x, it.y); if (d < bd) { bd = d; best = i; } } });
    this.drag = best;
  }
  move(x: number, y: number): void { if (this.drag >= 0) { const it = this.items[this.drag]; it.x = x; it.y = y; } }
  up(): void {
    if (this.drag < 0 || this.dead) return;
    const it = this.items[this.drag];
    this.drag = -1; this.arrows.clear();
    if (it.x > CAB.x && it.x < CAB.x + CAB.w && it.y > CAB.y && it.y < CAB.y + CAB.h) {
      it.stored = true; it.slot = this.stored - 1;
      [it.x, it.y] = SHELF[it.slot];
      it.y -= itemBottom(it.kind) * ITEM_SCALE;
      sfx(this.stored === 3 ? 'door' : 'tap');
      if (this.stored === 3) ctl.win();
    } else dropToFloor(it);
  }
  cancelInput(): void {
    if (this.drag >= 0) dropToFloor(this.items[this.drag]);
    this.drag = -1; this.arrows.clear();
  }
  key(k: string, isDown: boolean): void { this.arrows.key(k, isDown); }
  select(x: number, y: number): boolean {
    if (this.dead) return false;
    if (this.drag >= 0) { this.move(x, y); this.up(); } else this.down(x, y);
    return this.drag >= 0;
  }
  hint(): void {
    if (this.drag >= 0) { highlight(CAB.x + CAB.w / 2, CAB.y + CAB.h / 2, 60); return; }
    const it = this.items.find(i => !i.stored);
    if (it) gesture(it.x, it.y, CAB.x + CAB.w / 2, CAB.y + CAB.h / 2, 46);
  }

  draw(): void {
    layer('cabinet-room-grounded', paintRoom);
    cabinetBody(this.door);
    for (const it of this.items) if (it.stored) item(it.kind, it.x, it.y, ITEM_SCALE);
    if (this.door > 0) cabinetDoor(this.door);
    if (this.drag >= 0) {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([6, 5]);
      ctx.strokeRect(CAB.x + 4, CAB.y + 4, CAB.w - 8, CAB.h - 8); ctx.setLineDash([]);
    }
    const danger = this.dead || this.items.some(it => !it.stored && dist(it.x, it.y, this.bx, this.by) < 90);
    // Sort people and objects on their floor contact point so nearer things occlude farther ones.
    const actors: Array<[number, () => void]> = [];
    actors.push([470, () => bayraa(112, 470, 1.5, { mood: this.stored === 3 ? 'happy' : danger ? 'scared' : 'ok', arms: danger ? 1 : 0 })]);
    for (const [i, it] of this.items.entries()) if (!it.stored && it !== this.grabbed && i !== this.drag) {
      actors.push([it.y + itemBottom(it.kind) * ITEM_SCALE, () => {
        shadow(it.x, it.y + itemBottom(it.kind) * ITEM_SCALE, 14, 4, 0.3);
        item(it.kind, it.x, it.y, ITEM_SCALE);
      }]);
    }
    const crawl = this.dead || reduce ? 0 : Math.sin(clock.t * 10) * 2;
    actors.push([this.by, () => {
      baby(this.bx + 16, this.by, crawl);
      if (this.grabbed) item(this.grabbed.kind, this.bx - 8, this.by - 6, ITEM_SCALE, -0.4);
    }]);
    actors.sort((a, b) => a[0] - b[0]);
    for (const [, paint] of actors) paint();
    if (this.drag >= 0) {
      const it = this.items[this.drag];
      ctx.fillStyle = 'rgba(10,20,40,.18)'; ell(it.x + 6, it.y + 16, 18, 6);
      item(it.kind, it.x, it.y, ITEM_SCALE);
    }
    if (this.dead) { ctx.fillStyle = 'rgba(229,51,42,.18)'; ctx.fillRect(0, 0, W, H); }
  }
}

function dropToFloor(it: Item): void {
  it.y = Math.max(FLOOR_Y0, Math.min(FLOOR_Y1, it.y));
  it.x = Math.max(24, Math.min(W - 24, it.x));
}

/* ---------- items ---------- */
function item(kind: Kind, x: number, y: number, s: number, rot = 0): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (rot) ctx.rotate(rot);
  if (kind === 'matches') {
    // a matchbox, drawer half open with red-tipped sticks
    ctx.fillStyle = lin(-14, 0, 14, 0, [[0, '#e9e1cf'], [1, '#bfb49a']]); rr(-14, -6, 28, 14, 2);
    ctx.fillStyle = '#c2b28a'; rr(-12, -11, 22, 6, 1);
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = '#e8cfa0'; ctx.lineWidth = 2; seg(-10 + i * 4, -9, -10 + i * 4 - 1, -15);
      ctx.fillStyle = C.red; circ(-11 + i * 4, -16, 1.8);
    }
    ctx.fillStyle = lin(-14, 0, 14, 0, [[0, '#2856c9'], [1, '#1a3f99']]); rr(-14, -2, 28, 10, 2);
    ctx.fillStyle = '#7a3b2a'; ctx.fillRect(-14, 6, 28, 2);
    ctx.fillStyle = '#fff'; ctx.font = '700 6px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('ШҮДЭНЗ', 0, 3);
  } else if (kind === 'pills') {
    // amber pill bottle with a white cap and two spilled pills
    ctx.fillStyle = lin(-9, 0, 9, 0, [[0, 'rgba(255,170,60,.95)'], [0.5, 'rgba(235,130,30,.95)'], [1, 'rgba(170,80,10,.95)']]);
    rr(-9, -12, 18, 22, 3);
    ctx.fillStyle = '#fff'; rr(-7, -6, 14, 9, 1);
    ctx.fillStyle = C.red; ctx.fillRect(-2, -5, 4, 7); ctx.fillRect(-5, -3, 10, 3);
    ctx.fillStyle = lin(0, -18, 0, -11, [[0, '#ffffff'], [1, '#cfd4dc']]); rr(-10, -18, 20, 7, 2);
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(-7, -10, 2, 18);
    ctx.fillStyle = '#fff'; ell(14, 8, 3.5, 2.2, 0.4); ctx.fillStyle = '#7fc3ff'; ell(19, 5, 3.5, 2.2, -0.3);
  } else {
    // a plastic lighter with a metal hood
    ctx.fillStyle = lin(-6, 0, 6, 0, [[0, '#ff6aa8'], [0.5, '#e2337f'], [1, '#9c1a54']]); rr(-6, -8, 12, 22, 3);
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-4, -6, 2, 18);
    ctx.fillStyle = lin(-6, 0, 6, 0, [[0, '#f2f4f7'], [1, '#8a919c']]); rr(-6, -15, 12, 8, 1.5);
    ctx.fillStyle = '#5c636d'; for (let i = 0; i < 3; i++) ctx.fillRect(-4 + i * 3, -14, 1.5, 6);
    ctx.fillStyle = '#2a2a30'; circ(5, -14, 2.2);
  }
  ctx.restore();
}

/* ---------- cabinet ---------- */
const woodV = (x0: number, x1: number) => lin(x0, 0, x1, 0, [[0, '#d39a62'], [0.5, '#b4733d'], [1, '#7f4c22']]);

function cabinetBody(door: number): void {
  const { x, y, w, h } = CAB;
  ctx.fillStyle = 'rgba(40,25,10,.3)'; rr(x - 4, y - 2, w + 16, h + 16, 6);
  ctx.fillStyle = woodV(x - 8, x + w + 8); rr(x - 8, y - 10, w + 16, h + 20, 6);
  ctx.fillStyle = lin(0, y, 0, y + h, [[0, '#4a2c14'], [1, '#6b4320']]); ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lin(0, y, 0, y + 40, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(x, y, w, 40);
  for (const sy of [228, 296]) {
    ctx.fillStyle = lin(0, sy - 4, 0, sy + 4, [[0, '#d9a46c'], [1, '#8a5a30']]); ctx.fillRect(x, sy - 4, w, 8);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, sy + 4, w, 4);
  }
  // open door hanging to the left, foreshortened
  if (door < 1) {
    const ow = 26;
    ctx.fillStyle = woodV(x - 8 - ow, x - 8);
    ctx.beginPath(); ctx.moveTo(x - 8, y - 10); ctx.lineTo(x - 8 - ow, y - 2); ctx.lineTo(x - 8 - ow, y + h + 2); ctx.lineTo(x - 8, y + h + 10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,10,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  // child lock on the frame
  ctx.fillStyle = '#e9eef5'; rr(x + w + 2, y + h / 2 - 12, 8, 24, 3);
  ctx.fillStyle = C.red; circ(x + w + 6, y + h / 2, 2.5);
}

function cabinetDoor(k: number): void {
  const { x, y, w, h } = CAB;
  const dw = (w + 16) * k;
  ctx.fillStyle = woodV(x - 8, x - 8 + dw); rr(x - 8, y - 10, dw, h + 20, 6);
  if (k > 0.6) {
    ctx.strokeStyle = 'rgba(255,230,190,.35)'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 2, w - 8, h - 4);
    ctx.fillStyle = '#e9eef5'; rr(x + w - 6, y + h / 2 - 12, 8, 24, 3);
    ctx.fillStyle = '#4cd07a'; circ(x + w - 2, y + h / 2, 2.5);
  }
}

function paintRoom(): void {
  ctx.fillStyle = lin(0, 0, 0, 430, [[0, '#e6cfa8'], [1, '#f3e4c8']]); ctx.fillRect(0, 0, W, 430);
  // wallpaper diamonds
  ctx.fillStyle = 'rgba(190,140,80,.18)';
  for (let yy = 30; yy < 420; yy += 40) for (let xx = (yy / 40) % 2 ? 20 : 0; xx < W; xx += 40) {
    ctx.beginPath(); ctx.moveTo(xx, yy - 6); ctx.lineTo(xx + 5, yy); ctx.lineTo(xx, yy + 6); ctx.lineTo(xx - 5, yy); ctx.closePath(); ctx.fill();
  }
  mottle(0, 0, W, 430, 61, '130,90,40', 40, 0.05);
  // a framed family photo and a wall clock
  ctx.fillStyle = 'rgba(40,25,10,.25)'; rr(34, 124, 64, 50, 3);
  ctx.fillStyle = lin(30, 0, 94, 0, [[0, '#8a5a2e'], [1, '#55331a']]); rr(30, 120, 64, 50, 3);
  ctx.fillStyle = lin(0, 126, 0, 164, [[0, '#9fd2f2'], [1, '#86b84a']]); ctx.fillRect(36, 126, 52, 38);
  ctx.fillStyle = '#2856c9'; rr(48, 140, 10, 20, 3); ctx.fillStyle = '#e5332a'; rr(64, 144, 10, 16, 3);
  ctx.fillStyle = '#f0c39a'; circ(53, 137, 4); circ(69, 141, 4);
  ctx.fillStyle = 'rgba(40,25,10,.25)'; circ(152, 234, 24);
  ctx.fillStyle = rad(150, 230, 24, [[0, '#ffffff'], [1, '#d8dce4']]); circ(150, 230, 22);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(150, 230, 22, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.lineCap = 'round'; seg(150, 230, 150, 216); seg(150, 230, 160, 234);
  skirting(430);
  planks(430, H, 180, 27, '#c89562', '#8a5c32');
  // a rug
  const r = rng(4);
  ctx.fillStyle = lin(0, 470, 0, 620, [[0, '#2f5aa8'], [1, '#1d3f80']]); rr(20, 470, 320, 150, 10);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(32, 482, 296, 126);
  ctx.strokeStyle = 'rgba(244,180,0,.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(42, 492, 276, 106);
  for (let i = 0; i < 160; i++) { ctx.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'; ctx.fillRect(r(22, 338), r(472, 618), 2, 1); }
}
