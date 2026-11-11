import { ctx, clock, reduce } from '../core/canvas';
import { C, lin, rad, circ, ell, seg, rr, shadow } from '../core/draw';
import { rng } from '../core/rng';
import { look } from './look';

export type Mood = 'ok' | 'dead' | 'scared' | 'happy' | 'hurt' | 'dizzy' | 'breathless';
export interface BayraaOpts {
  rot?: number; shiver?: boolean; frozen?: boolean; green?: boolean;
  mood?: Mood; arms?: number; wave?: boolean; /** true = festive hat, 'winter' = fox-fur лоовууз with ear flaps */
  hat?: boolean | 'winter'; noShadow?: boolean; seated?: boolean;
  injury?: 'hand' | 'foot' | 'head' | 'stomach' | 'throat';
  cough?: boolean; wet?: boolean; pale?: boolean;
}

type Skin = readonly [string, string, string];
const SKIN: Skin = ['#ffdcbc', C.skin, '#cf9470'];
const SKIN_FROZEN: Skin = ['#eef8fe', '#c4e6f8', '#8fbfdc'];
const SKIN_SICK: Skin = ['#e2ebb8', '#c9d99a', '#97a86c'];

/** Bayraa: a kid in a blue deel with an orange sash. (x, y) is between the feet; ~125 units tall. */
export function bayraa(x: number, y: number, s = 1, o: BayraaOpts = {}): void {
  const t = clock.t;
  if (!o.noShadow) shadow(x, y + 1, 34 * s, 7 * s, 0.32);
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  // Expression stays cosmetic: feet and interaction anchors never move during play.
  const joyful = o.mood === 'happy' && !o.seated;
  if (joyful && !reduce && o.hat !== false) {
    const dance = look.outfit.celebration ?? 0;
    ctx.rotate(Math.sin(t * (dance === 2 ? 12 : 7)) * (dance === 1 ? .065 : .035));
    ctx.scale(1 + Math.sin(t * 8) * .015, 1 - Math.sin(t * 8) * .015);
  }
  if (o.rot) ctx.rotate(o.rot);
  if (o.shiver && !reduce) ctx.translate(Math.sin(t * 70) * 1.6, 0);

  const pal = o.frozen
    ? { lt: '#cdeafc', md: '#8fc7ef', dk: '#5b98c6', trim: '#f2fbff', cuff: '#b8dcf3' }
    : look.outfit;
  const skin = o.frozen ? SKIN_FROZEN : o.green ? SKIN_SICK : o.pale ? ['#ede8da','#d8d6cb','#b3b4ad'] as const : SKIN;

  if (o.seated) {
    // Foreshortened thighs rest on the cushion; shins hang over its front edge.
    for (const d of [-1, 1]) {
      ctx.save(); ctx.scale(d, 1);
      ctx.fillStyle = pal.dk; rr(5, -18, 18, 23, 6);
      ctx.fillStyle = pal.md; ell(14, -13, 13, 8);
      ctx.fillStyle = '#512b18'; rr(6, 3, 17, 18, 4);
      ctx.fillStyle = '#7a4424'; rr(5, 15, 24, 11, 5);
      ctx.fillStyle = '#28160e'; rr(5, 23, 24, 3, 1);
      ctx.restore();
    }
  } else { boot(-1); boot(1); }

  // deel
  ctx.beginPath();
  ctx.moveTo(-18, -66); ctx.quadraticCurveTo(-21, -40, -28, -13);
  ctx.quadraticCurveTo(0, -7, 28, -13);
  ctx.quadraticCurveTo(21, -40, 18, -66);
  ctx.quadraticCurveTo(0, -70, -18, -66);
  ctx.closePath();
  ctx.fillStyle = lin(-28, 0, 28, 0, [[0, pal.lt], [0.42, pal.md], [1, pal.dk]]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(57,51,64,.3)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.fillStyle = lin(0, -70, 0, -10, [[0, 'rgba(255,255,255,.10)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,30,.22)']]);
  ctx.fillRect(-30, -72, 60, 64);
  ctx.strokeStyle = 'rgba(5,15,55,.22)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  seg(-9, -33, -13, -15); seg(9, -33, 14, -15); seg(1, -32, 2, -16);
  ctx.fillStyle = pal.dk; ctx.fillRect(-30, -20, 60, 12);
  ctx.fillStyle = pal.trim; ctx.fillRect(-30, -21, 60, 1.8);
  ctx.restore();

  // collar (энгэр) with trim and buttons
  ctx.lineCap = 'round';
  const collar = () => { ctx.beginPath(); ctx.moveTo(-4, -66); ctx.quadraticCurveTo(12, -60, 15, -44); ctx.stroke(); };
  ctx.strokeStyle = 'rgba(8,12,40,.55)'; ctx.lineWidth = 6.5; collar();
  ctx.strokeStyle = pal.trim; ctx.lineWidth = 3; collar();
  ctx.fillStyle = pal.trim; circ(9, -60, 1.9); circ(14, -51, 1.9);
  ctx.fillStyle = pal.dk; rr(-9, -71, 18, 7, 3);
  ctx.fillStyle = pal.trim; ctx.fillRect(-9, -65.5, 18, 1.2);

  // sash (бүс) with hanging tails
  ctx.fillStyle = lin(0, -45, 0, -35, [[0, '#e7b879'], [0.5, C.sash], [1, '#bb5c0a']]);
  rr(-23, -45, 46, 10, 3);
  ctx.fillStyle = lin(-18, 0, -9, 0, [[0, '#c9640c'], [1, '#f08a1e']]);
  ctx.beginPath(); ctx.moveTo(-15, -36); ctx.quadraticCurveTo(-19, -26, -17, -17); ctx.lineTo(-11, -18);
  ctx.quadraticCurveTo(-12, -27, -9, -36); ctx.closePath(); ctx.fill();

  // arms
  const up = o.arms ?? (joyful ? .55 : 0), wave = o.wave && !reduce ? Math.sin(t * 8) * 10 : 0;
  let lx = -31, ly = -32 - up * 34;
  let rx = 31 + (o.wave ? 6 : 0), ry = -32 - up * 34 - (o.wave ? 22 : 0) + wave;
  if(o.injury==='hand'){lx=-5;ly=-39;rx=-12;ry=-38;}
  if(o.injury==='head'){lx=-23;ly=-88;rx=23;ry=-88;}
  if(o.injury==='stomach'){lx=-5;ly=-37;rx=5;ry=-32;}
  if(o.injury==='throat'){lx=-5;ly=-65;rx=8;ry=-64;}
  if(o.cough){lx=-5;ly=-77;}
  arm(-17, -58, lx, ly, pal, skin);
  arm(17, -58, rx, ry, pal, skin);

  // neck, ears, head
  ctx.fillStyle = skin[2]; rr(-6, -70, 12, 8, 3);
  for (const ex of [-22, 22]) {
    ctx.fillStyle = rad(ex, -85, 6, [[0, skin[1]], [1, skin[2]]]); circ(ex, -85, 5);
    ctx.fillStyle = 'rgba(150,70,40,.25)'; circ(ex, -85, 2.4);
  }
  ctx.fillStyle = rad(0, -86, 24, [[0, skin[0]], [0.62, skin[1]], [1, skin[2]]], -7, -96, 2);
  circ(0, -86, 23);
  ctx.strokeStyle = 'rgba(117,79,65,.25)'; ctx.lineWidth = 1.1; ctx.stroke();

  // hair
  ctx.fillStyle = lin(0, -112, 0, -82, [[0, '#3d2c1e'], [1, '#110b06']]);
  ctx.beginPath(); ctx.arc(0, -88, 23.5, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-23, -90); ctx.quadraticCurveTo(-8, -80, 4, -97);
  ctx.quadraticCurveTo(14, -83, 23, -90); ctx.lineTo(23, -98); ctx.lineTo(-23, -98); ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,220,.22)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(0, -88, 19, Math.PI * 1.2, Math.PI * 1.45); ctx.stroke();

  // blush, nose
  for (const cx of [-13, 13]) { ctx.fillStyle = rad(cx, -77, 7, [[0, 'rgba(232,110,96,.5)'], [1, 'rgba(232,110,96,0)']]); circ(cx, -77, 7); }
  ctx.strokeStyle = 'rgba(160,80,50,.55)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(0, -82, 2.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();

  face(o.mood ?? 'ok');
  if(o.cough){ctx.fillStyle=skin[1];circ(-4,-77,5);}
  if(o.wet){
    ctx.strokeStyle='#69b6d6';ctx.lineWidth=2;
    for(const [dx,dy] of [[-21,-74],[19,-64],[-23,-38],[24,-26]])seg(dx,dy,dx-1,dy+7);
  }
  if (o.frozen) {
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    const r = rng(3);
    for (let i = 0; i < 9; i++) circ(r(-20, 20), r(-108, -66), r(0.8, 1.8));
  }
  const hat = o.hat ?? look.outfit.hat;
  if (hat === 'winter') winterHat(0, -101, 1);
  else if (hat) mongolHat(0, -101, 1);
  ctx.restore();

  function boot(d: number): void {
    ctx.save(); ctx.scale(d, 1);
    if(o.injury==='foot'&&d===1)ctx.translate(0,-7);
    ctx.beginPath();
    ctx.moveTo(4, -17); ctx.lineTo(18, -17); ctx.lineTo(20, -6);
    ctx.quadraticCurveTo(27, -6, 30, -12); ctx.quadraticCurveTo(30, -1, 20, 0);
    ctx.lineTo(4, 0); ctx.closePath();
    ctx.fillStyle = lin(0, -17, 0, 0, [[0, '#7a4424'], [1, '#3a1c0c']]); ctx.fill();
    ctx.fillStyle = '#1e0e06'; ctx.fillRect(4, -3, 17, 3);
    ctx.strokeStyle = 'rgba(244,180,90,.55)'; ctx.lineWidth = 1.2; seg(6, -11, 18, -11);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.5; seg(7, -15, 7, -5);
    ctx.restore();
  }
}

function arm(x0: number, y0: number, x1: number, y1: number,
  pal: { md: string; dk: string; cuff: string }, skin: Skin): void {
  const at = (k: number): [number, number] => [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
  const [ex, ey] = at(0.8), [c0x, c0y] = at(0.62), [c1x, c1y] = at(0.84);
  ctx.lineCap = 'round';
  ctx.strokeStyle = pal.dk; ctx.lineWidth = 12; seg(x0, y0, ex, ey);
  ctx.strokeStyle = pal.md; ctx.lineWidth = 7; seg(x0 - 1, y0 - 1, ex - 1, ey - 1);
  ctx.lineCap = 'butt';
  ctx.strokeStyle = pal.cuff; ctx.lineWidth = 13; seg(c0x, c0y, c1x, c1y);
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2; seg(c0x, c0y, c1x, c1y);
  ctx.fillStyle = rad(x1, y1, 7, [[0, skin[0]], [0.6, skin[1]], [1, skin[2]]], x1 - 2, y1 - 2);
  circ(x1, y1, 6);
}

function eye(x: number, y: number, r = 4.4, iris = 3.1): void {
  ctx.fillStyle = '#fff'; ell(x, y, r, r * 1.1);
  ctx.fillStyle = rad(x, y + 0.5, iris, [[0, '#7a4c2a'], [1, '#22130a']]); circ(x, y + 0.5, iris);
  ctx.fillStyle = '#0b0705'; circ(x, y + 0.5, iris * 0.48);
  ctx.fillStyle = '#fff'; circ(x - iris * 0.35, y - iris * 0.3, iris * 0.34);
  ctx.strokeStyle = '#1b130e'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(x, y + 0.3, r * 1.08, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
}

function face(m: Mood): void {
  ctx.strokeStyle = '#22150c'; ctx.lineCap = 'round';
  if(m==='hurt'){
    ctx.lineWidth=2.3;
    for(const x of [-9,9]){seg(x-4,-91,x+3,-88);seg(x+3,-88,x-4,-85);}
    ctx.beginPath();ctx.moveTo(-6,-73);ctx.quadraticCurveTo(0,-79,6,-73);ctx.stroke();
    ctx.fillStyle='#8abed5';ell(-18,-82,2,4);
  } else if(m==='dizzy'){
    ctx.lineWidth=2;seg(-14,-89,-5,-89);seg(5,-89,14,-89);
    ctx.beginPath();ctx.moveTo(-5,-73);ctx.quadraticCurveTo(0,-78,6,-73);ctx.stroke();
  } else if(m==='breathless'){
    ctx.lineWidth=2;seg(-13,-90,-5,-88);seg(5,-88,13,-90);
    ctx.fillStyle='#63433b';ell(0,-74,4,6);
  } else if (m === 'dead') {
    ctx.lineWidth = 2.6;
    seg(-12, -92, -6, -86); seg(-6, -92, -12, -86); seg(6, -92, 12, -86); seg(12, -92, 6, -86);
    ctx.beginPath(); ctx.moveTo(-6, -73); ctx.quadraticCurveTo(0, -77, 6, -73); ctx.stroke();
  } else if (m === 'scared') {
    ctx.lineWidth = 2; seg(-14, -99, -5, -101); seg(14, -99, 5, -101);
    eye(-9, -89, 5.6, 2.4); eye(9, -89, 5.6, 2.4);
    const breath = reduce ? 0 : Math.sin(clock.t * 5) * .5;
    ctx.fillStyle = '#5a1e1a'; ell(0, -73, 4.2, 5.4 + breath);
    ctx.fillStyle = '#e07a74'; ell(0, -70.5, 2.6, 1.8);
  } else if (m === 'happy') {
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(-9, -86, 4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(9, -86, 4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.lineWidth = 2; seg(-13, -96, -5, -97); seg(13, -96, 5, -97);
    ctx.fillStyle = '#6a1f1a';
    ctx.beginPath(); ctx.moveTo(-7, -78); ctx.quadraticCurveTo(0, -66, 7, -78); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e88078'; ell(0, -72.5, 3.2, 1.8);
    ctx.fillStyle = '#fff'; ctx.fillRect(-5, -78, 10, 2);
  } else {
    ctx.lineWidth = 2; seg(-13, -96, -5, -97); seg(13, -96, 5, -97);
    const blink = !reduce && clock.t % 4.7 > 4.55;
    if (blink) { seg(-13, -88, -5, -88); seg(5, -88, 13, -88); }
    else { eye(-9, -88); eye(9, -88); }
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, -79, 5, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  }
}

/** A red Mongolian hat with a fur brim, gold knot and ribbons; (x, y) is the bottom of the brim. */
export function mongolHat(x: number, y: number, s: number): void {
  const sway = reduce ? 0 : Math.sin(clock.t * 3) * 2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // ribbons (залаа) behind
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#a3170f'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(3, -30); ctx.quadraticCurveTo(22, -22 + sway, 27, -3 + sway); ctx.stroke();
  ctx.strokeStyle = '#d0281f';
  ctx.beginPath(); ctx.moveTo(1, -30); ctx.quadraticCurveTo(17, -17, 21, 2 + sway * 0.6); ctx.stroke();
  // crown
  ctx.beginPath();
  ctx.moveTo(-19, 0); ctx.quadraticCurveTo(-15, -26, 0, -34); ctx.quadraticCurveTo(15, -26, 19, 0); ctx.closePath();
  ctx.fillStyle = lin(-19, 0, 19, 0, [[0, '#ff6a5c'], [0.45, C.red], [1, '#851209']]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,180,0,.9)'; ctx.lineWidth = 1.5;
  seg(0, -31, 0, -6);
  ctx.beginPath(); ctx.moveTo(-2, -31); ctx.quadraticCurveTo(-10, -20, -11, -6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, -31); ctx.quadraticCurveTo(10, -20, 11, -6); ctx.stroke();
  // fur brim
  ctx.fillStyle = lin(0, -10, 0, 4, [[0, '#a87646'], [0.5, '#7d5029'], [1, '#4d2e14']]);
  rr(-27, -10, 54, 14, 7);
  const r = rng(11);
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 34; i++) {
    const fx = r(-25, 25), fy = r(-8, 3);
    ctx.strokeStyle = i % 3 ? 'rgba(255,228,190,.32)' : 'rgba(35,18,5,.4)';
    seg(fx, fy, fx + r(-1.6, 1.6), fy - r(2, 4.5));
  }
  // knot (дэнс)
  ctx.fillStyle = rad(0, -37, 6, [[0, '#fff3b8'], [0.4, C.gold], [1, '#9a6600']], -2, -39);
  circ(0, -37, 5.5);
  ctx.restore();
}

/**
 * Winter лоовууз: fox-fur band and ear flaps under a red cloth crown.
 * (x, y) is the bottom of the fur band, same anchor as mongolHat; the flaps hang down over the ears.
 */
export function winterHat(x: number, y: number, s: number): void {
  const sway = reduce ? 0 : Math.sin(clock.t * 2.5) * 1.2;
  const fox = (y0: number, y1: number) => lin(0, y0, 0, y1, [[0, '#e8a860'], [0.45, '#c47a3a'], [1, '#7a4420']]);
  const fur = (x0: number, x1: number, y0: number, y1: number, seed: number, n: number) => {
    const r = rng(seed);
    ctx.lineWidth = 1.1;
    for (let i = 0; i < n; i++) {
      const fx = r(x0, x1), fy = r(y0, y1);
      ctx.strokeStyle = i % 3 ? 'rgba(255,236,205,.4)' : 'rgba(60,28,8,.35)';
      seg(fx, fy, fx + r(-1.8, 1.8), fy + r(2, 5));
    }
  };
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // ear flaps, with ties
  for (const d of [-1, 1]) {
    ctx.save(); ctx.scale(d, 1);
    ctx.beginPath();
    ctx.moveTo(13, -4); ctx.lineTo(27, -4);
    ctx.quadraticCurveTo(30, 12, 26 + sway * d * 0.3, 26);
    ctx.quadraticCurveTo(19, 31, 13, 25);
    ctx.quadraticCurveTo(11, 10, 13, -4); ctx.closePath();
    ctx.fillStyle = fox(-4, 30); ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,12,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    fur(14, 26, -2, 24, 21, 18);
    ctx.strokeStyle = '#a3170f'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(19, 27); ctx.quadraticCurveTo(18 + sway, 34, 16 + sway, 40); ctx.stroke();
    ctx.restore();
  }
  // crown (red cloth, tall and rounded)
  ctx.beginPath();
  ctx.moveTo(-20, -10); ctx.quadraticCurveTo(-20, -38, 0, -44); ctx.quadraticCurveTo(20, -38, 20, -10); ctx.closePath();
  ctx.fillStyle = lin(-20, 0, 20, 0, [[0, '#ff6a5c'], [0.45, C.red], [1, '#851209']]); ctx.fill();
  ctx.strokeStyle = 'rgba(244,180,0,.9)'; ctx.lineWidth = 1.5;
  seg(0, -41, 0, -12);
  ctx.beginPath(); ctx.moveTo(-3, -41); ctx.quadraticCurveTo(-12, -30, -13, -12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, -41); ctx.quadraticCurveTo(12, -30, 13, -12); ctx.stroke();
  // thick fox-fur band
  ctx.fillStyle = fox(-18, 4); rr(-29, -18, 58, 22, 11);
  ctx.fillStyle = 'rgba(255,240,215,.35)'; rr(-25, -16, 50, 5, 3);
  fur(-27, 27, -17, 0, 31, 46);
  // knot (дэнс)
  ctx.fillStyle = rad(0, -47, 6, [[0, '#fff3b8'], [0.4, C.gold], [1, '#9a6600']], -2, -49);
  circ(0, -47, 5.5);
  ctx.restore();
}
