import { dangerZone } from '../art/danger';
import { gesture } from '../ui/gesture';
import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { lin, rad, circ, ell, seg, rr, shadow } from '../core/draw';
import { ctl } from '../core/ctl';
import { rng } from '../core/rng';
import { bayraa } from '../art/bayraa';
import { ger } from '../art/props';
import { sun, ridge, mottle, puffSprite, drawPuff } from '../art/scenery';
import type { Micro } from './types';

/** Three spots on the horizon; one is the ger, the others are tempting mistakes. */
const SLOTS = [70, 180, 290];
const HY = 420;
/** The storm front starts off the left edge and sweeps right at this speed (game units / s). */
const FRONT0 = -40, FRONT_V = 80;

type Kind = 'ger' | 'sheep' | 'tree';
const LOSE: Record<Exclude<Kind, 'ger'>, string> = {
  sheep: 'Шуурганд төөрчихлөө!',
  tree: 'Салхинд мөчир хугарч унав!',
};

export class Dust implements Micro {
  readonly cmd = 'ГЭРТЭЭ ОР!';
  readonly sub = 'Шуурга ирж байна, гэр рүү дар';
  readonly lose = 'Шуурганд хоцорлоо!';
  readonly tip = 'Шороон шуургатай үед малаа хөөж гэрээсээ бүү хол яв. Хамгийн ойрын гэр, байшинд орж хаалгаа хаа. Гадаа байвал нүүр амаа ороолтоор боож хүлээ.';
  readonly keys = '← ↑ → — сонгох';
  readonly winText = 'ГЭРТЭЭ ОРЛОО!';
  dead = false;
  private kinds: Kind[] = ['tree', 'ger', 'sheep'];
  private t = 0;
  private choice = -1;
  private run = 0;

  init(): void {
    const k: Kind[] = ['ger', 'sheep', 'tree'];
    for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; }
    this.kinds = k;
    this.t = 0; this.choice = -1; this.run = 0; this.dead = false;
  }

  private get front(): number { return FRONT0 + this.t * FRONT_V; }
  /** 1 = clear, 0 = swallowed by the storm. */
  visibility(i: number): number { return Math.max(0, Math.min(1, (SLOTS[i] + 30 - this.front) / 60)); }

  update(dt: number): void { this.t += dt; }
  /** Cosmetic: the storm keeps rolling and Bayraa runs to what he picked. */
  resultUpdate(dt: number): void {
    this.t += dt;
    if (this.choice >= 0) this.run = Math.min(1, this.run + dt / 1.2);
  }

  pick(i: number): void {
    if (this.choice >= 0 || this.dead || this.visibility(i) < 0.35) return;
    this.choice = i;
    const kind = this.kinds[i];
    if (kind === 'ger') ctl.win();
    else { this.dead = true; ctl.lose(LOSE[kind]); }
  }
  down(x: number, y: number): void {
    if (y < 300 || y > 500) return;
    let best = -1, bd = 60;
    SLOTS.forEach((sx, i) => { const d = Math.abs(x - sx); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) this.pick(best);
  }
  key(k: string, isDown: boolean): void {
    if (!isDown) return;
    if (k === 'ArrowLeft') this.pick(0);
    else if (k === 'ArrowUp' || k === 'ArrowDown') this.pick(1);
    else if (k === 'ArrowRight') this.pick(2);
  }
  hint(): void {
    if (this.choice >= 0) return;
    const i = this.kinds.indexOf('ger');
    gesture(SLOTS[i], HY - 22, SLOTS[i], HY - 22, 44);
  }

  danger(): void { if (this.choice < 0) dangerZone(Math.max(6, Math.min(275, this.front)), 230, 76, 100, 'wind'); }
  draw(): void {
    layer('dust-gobi', paintGobi);
    const t = clock.t, frac = Math.min(1, this.t / 5);
    // the air thickens as the storm nears
    ctx.fillStyle = `rgba(200,150,90,${0.08 + frac * 0.3})`;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 3; i++) {
      const v = this.visibility(i);
      if (v <= 0) continue;
      ctx.save();
      ctx.globalAlpha = v;
      drawKind(this.kinds[i], SLOTS[i], HY, this.choice === i && this.kinds[i] === 'tree' && this.run > 0.7);
      ctx.restore();
    }

    stormWall(this.front, t);
    // Bayraa stays in front of the storm so the player never loses him; he runs toward what was picked
    const c = this.choice;
    const e = this.run * this.run * (3 - 2 * this.run);
    const tx = c >= 0 ? SLOTS[c] : 180, ty = c >= 0 ? HY + 12 : 590;
    const bx = 180 + (tx - 180) * e, by = 590 + (ty - 590) * e, bs = 1.6 - 1.18 * e;
    const kind = c >= 0 ? this.kinds[c] : null;
    const hidden = kind === 'ger' && this.run > 0.92;
    if (!hidden) {
      ctx.save();
      if (kind === 'sheep') ctx.globalAlpha = 1 - this.run * 0.85;
      const lean = reduce ? 0 : Math.sin(t * 3) * 0.04 + 0.06;
      bayraa(bx + (this.run > 0 && this.run < 1 && !reduce ? Math.sin(t * 20) * 1.5 : 0), by, bs, {
        mood: kind === 'ger' ? 'happy' : kind === 'tree' && this.run > 0.7 ? 'dead' : this.dead || frac > 0.5 ? 'scared' : 'ok',
        rot: kind === 'tree' && this.run > 0.7 ? -0.5 : lean,
        arms: c < 0 ? 0.3 : 0,
      });
      ctx.restore();
    }

    grit(t, frac);
  }
}

function drawKind(kind: Kind, x: number, y: number, broken: boolean): void {
  if (kind === 'ger') { ger(x, y, 1); return; }
  if (kind === 'sheep') { sheep(x + (reduce ? 0 : Math.sin(clock.t * 1.3) * 6), y); return; }
  tree(x, y, broken);
}

function sheep(x: number, y: number): void {
  shadow(x, y + 1, 16, 3, 0.3);
  ctx.fillStyle = '#3a2a20'; for (const lx of [-8, -3, 4, 9]) rr(x + lx, y - 9, 3, 9, 1);
  ctx.fillStyle = rad(x, y - 14, 16, [[0, '#ffffff'], [1, '#d9cfbf']], x - 4, y - 18);
  for (const [dx, dy, r] of [[-8, -14, 7], [0, -17, 8], [8, -14, 7], [-3, -11, 7], [5, -11, 7]] as const) circ(x + dx, y + dy, r);
  ctx.fillStyle = '#2a1d16'; ell(x + 15, y - 16, 5, 4, 0.3);
  ctx.fillStyle = '#fff'; circ(x + 16.5, y - 17, 0.9);
}

function tree(x: number, y: number, broken: boolean): void {
  const sway = reduce ? 0 : Math.sin(clock.t * 4) * 3 + 3;
  shadow(x, y + 1, 26, 4, 0.3);
  ctx.strokeStyle = lin(x - 4, 0, x + 4, 0, [[0, '#6b4a2e'], [1, '#3e2814']]);
  ctx.lineCap = 'round'; ctx.lineWidth = 7; seg(x, y, x + sway * 0.4, y - 46);
  ctx.lineWidth = 4; seg(x + sway * 0.3, y - 34, x - 16 + sway, y - 52);
  if (!broken) seg(x + sway * 0.4, y - 40, x + 18 + sway, y - 58);
  const canopy = (cx: number, cy: number, r: number) => {
    ctx.fillStyle = rad(cx, cy, r, [[0, '#9aa45a'], [1, '#5d6a2c']], cx - r * 0.3, cy - r * 0.4); circ(cx, cy, r);
  };
  canopy(x - 14 + sway, y - 58, 14); canopy(x + 4 + sway, y - 66, 17);
  if (!broken) canopy(x + 20 + sway, y - 60, 13);
  else {
    // the snapped branch lying on the ground
    ctx.save(); ctx.translate(x + 24, y - 2); ctx.rotate(0.15);
    ctx.strokeStyle = '#4a311a'; ctx.lineWidth = 4; seg(-18, 0, 14, 0);
    ctx.fillStyle = '#6a7834'; circ(14, -6, 10);
    ctx.restore();
  }
}

/** A towering wall of dust whose leading edge is at x = front. */
function stormWall(front: number, t: number): void {
  if (front > -140) {
    const img = puffSprite('150,105,62');
    if (front > 0) {
      ctx.fillStyle = lin(0, 0, front, 0, [[0, 'rgba(120,82,48,.88)'], [1, 'rgba(150,105,62,.72)']]);
      ctx.fillRect(0, 0, front, H);
    }
    for (let i = 0; i < 15; i++) {
      const y = i * 46 - 10 + Math.sin(t * 1.7 + i) * 8;
      const x = front + Math.sin(t * 1.3 + i * 1.9) * 16;
      drawPuff(img, x, y, 70 + (i % 3) * 18, 0.85, t * 0.25 + i);
    }
    const img2 = puffSprite('190,140,85');
    for (let i = 0; i < 8; i++) {
      const y = i * 86 + 20 + Math.sin(t * 2.3 + i * 2) * 10;
      drawPuff(img2, front + 40 + Math.sin(t * 1.1 + i) * 20, y, 55, 0.55, -t * 0.3 + i);
    }
  }
}

/** Wind-blown grit streaking across the screen. */
function grit(t: number, frac: number): void {
  const r = rng(12);
  ctx.strokeStyle = `rgba(110,75,40,${0.25 + frac * 0.35})`;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 46; i++) {
    const speed = r(380, 720), y = r(0, H), len = r(8, 22);
    const x = ((r(0, W + 100) + (reduce ? 0 : t * speed)) % (W + 100)) - 50;
    seg(x, y, x + len, y + len * 0.08);
  }
}

function paintGobi(): void {
  ctx.fillStyle = lin(0, 0, 0, HY, [[0, '#c9a46e'], [0.6, '#e5c993'], [1, '#f0dcb0']]);
  ctx.fillRect(0, 0, W, H);
  sun(270, 150, 16, '#fff3d0', '255,230,170', 0.3);
  ridge(HY - 6, 70, 71, [[0, '#b58f63'], [1, '#c9a678']]);
  ridge(HY, 34, 77, [[0, '#a98256'], [1, '#bf9a6a']]);
  ctx.fillStyle = lin(0, HY, 0, H, [[0, '#d9b57e'], [0.5, '#cfa46a'], [1, '#b98a52']]);
  ctx.fillRect(0, HY, W, H - HY);
  mottle(0, HY, W, H - HY, 33, '120,80,40', 40, 0.12);
  // two-track dirt road toward the horizon
  ctx.strokeStyle = 'rgba(120,85,50,.35)'; ctx.lineWidth = 4;
  for (const off of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(180 + off * 5, HY + 6); ctx.quadraticCurveTo(170 + off * 20, 520, 180 + off * 46, H); ctx.stroke();
  }
  // saxaul shrubs and pebbles
  const r = rng(8);
  for (let i = 0; i < 26; i++) {
    const y = r(HY + 10, H), x = r(0, W), k = 0.4 + (y - HY) / (H - HY);
    if (Math.abs(x - 180) < 50 * k && y > 520) continue;
    ctx.strokeStyle = 'rgba(80,72,36,.8)'; ctx.lineWidth = 1.4 * k; ctx.lineCap = 'round';
    for (let b = -3; b <= 3; b++) seg(x, y, x + b * 3 * k, y - r(5, 12) * k);
    ctx.fillStyle = 'rgba(110,105,55,.7)'; ell(x, y - 6 * k, 7 * k, 4 * k);
  }
  for (let i = 0; i < 90; i++) { ctx.fillStyle = r() < 0.5 ? 'rgba(90,60,30,.35)' : 'rgba(255,240,210,.35)'; circ(r(0, W), r(HY + 4, H), r(0.6, 1.8)); }
  // power poles fading into the haze
  for (const [x, h] of [[24, 70], [118, 40], [196, 26]] as const) {
    ctx.strokeStyle = 'rgba(70,50,30,.55)'; ctx.lineWidth = 2; seg(x, HY + 2, x, HY + 2 - h); seg(x - 6, HY + 2 - h + 4, x + 6, HY + 2 - h + 4);
  }
  ctx.strokeStyle = 'rgba(70,50,30,.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-10, HY - 74); ctx.quadraticCurveTo(70, HY - 50, 118, HY - 34); ctx.quadraticCurveTo(160, HY - 22, 196, HY - 20); ctx.stroke();
}
