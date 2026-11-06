import { ctx, reduce } from '../core/canvas';
import { C, rr, circ, ell, seg } from '../core/draw';
import { bayraa, winterHat } from '../art/bayraa';
import { baby, cradle, stove, car, cow, ger } from '../art/props';
import { caregiver, noSwimmingSign } from '../art/safety';
import { dog, hotCup, manhole, cleaningBottle, boosterSeat } from '../art/hazards';
import { reversingCar, damagedCord, snowRoof, icicle } from '../art/prevention';

/** A self-contained safe-action demonstration. Never advances or changes a live game. */
export const LESSONS: Record<string, string> = {
  'МАШИНЫ АРААС ХОЛД!': 'reversing', 'ЭВДЭРСЭН УТАСНААС ХОЛД!': 'cord', 'ДЭЭВРЭЭС ХОЛД!': 'icicles',
  'ГАДАГШ ГАР!': 'smoke', 'ТЭНЦВЭРЭЭ БАРИ!': 'ice', 'БИТГИЙ ХҮР!': 'socket',
  'МАЛГАЙГАА ӨМС!': 'hat', 'МАЛЫГ ХҮЛЭЭ!': 'cow', 'ХҮҮХДИЙГ ХАМГААЛ!': 'baby',
  'НОГООНЫГ ХҮЛЭЭ!': 'crossing', 'ГЭРТЭЭ ОР!': 'dust', 'ШҮҮГЭЭНД ХИЙ!': 'cabinet',
  'ГОЛ РУУ БҮҮ ОР!': 'river',
  'НОХОЙНООС ХОЛ БАЙ!': 'dog', 'ТОМ ХҮНЭЭ ДУУД!': 'drink', 'НҮХИЙГ ТОЙР!': 'manhole',
  'БҮСЭЭ ЗҮҮ!': 'seatbelt', 'ДОТОГШ ОР!': 'balcony', 'ШҮҮГЭЭГ ТҮГЖ!': 'cleaner',
};

export const LESSON_CONTINUE = { x: 218, y: 526, r: 32 };
export const LESSON_REPLAY = { x: 110, y: 526, r: 32 };

export function check(x: number, y: number, r = 18): void {
  ctx.fillStyle = '#19844b'; circ(x, y, r);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - r * 0.5, y); ctx.lineTo(x - r * 0.1, y + r * 0.4); ctx.lineTo(x + r * 0.55, y - r * 0.4); ctx.stroke();
}

export function lessonButton(x: number, y: number, r: number, replay: boolean): void {
  ctx.fillStyle = replay ? '#fff' : C.gold; circ(x, y, r);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (replay) {
    ctx.beginPath(); ctx.arc(x, y, 13, -0.7, Math.PI * 1.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 2, y - 20); ctx.lineTo(x + 3, y - 12); ctx.lineTo(x - 7, y - 9); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(x - 11, y); ctx.lineTo(x + 13, y); ctx.moveTo(x + 3, y - 11); ctx.lineTo(x + 14, y); ctx.lineTo(x + 3, y + 11); ctx.stroke();
  }
}

function cabinet(): void {
  ctx.fillStyle = '#ae6935'; rr(198, 22, 104, 114, 8);
  ctx.fillStyle = '#f5dcb6'; rr(206, 30, 88, 98, 5);
  ctx.strokeStyle = '#ae6935'; ctx.lineWidth = 6; seg(206, 84, 294, 84);
}
function lock(x: number, y: number): void {
  ctx.strokeStyle = '#254674'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y - 7, 10, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = C.gold; rr(x - 15, y - 5, 30, 26, 5);
  ctx.fillStyle = C.ink; circ(x, y + 5, 3);
}

/** Draw into a fixed 320×240 scene, scaled to fit any card. */
export function drawLesson(cmd: string, x: number, y: number, w: number, h: number, elapsed: number): void {
  const kind = LESSONS[cmd];
  const t = reduce ? 1 : Math.min(1, Math.max(0, elapsed) / 2.8);
  const action = Math.min(1, Math.max(0, (t - .1) / .7));
  const p = action * action * (3 - 2 * action);
  const phase = (start: number, duration: number) => { const v = Math.min(1, Math.max(0, (t - start) / duration)); return v * v * (3 - 2 * v); };
  // Fit the illustration without stretching people or circular props.
  const scale = Math.min(w / 320, h / 240);
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, 16); ctx.clip();
  ctx.fillStyle = '#e9f3ff'; ctx.fillRect(0, 0, w, h);
  ctx.translate((w - 320 * scale) / 2, (h - 240 * scale) / 2); ctx.scale(scale, scale);
  ctx.fillStyle = '#e9f3ff'; ctx.fillRect(0, 0, 320, 240);
  ctx.fillStyle = '#d1e5c7'; ctx.fillRect(0, 190, 320, 50);
  switch (kind) {
    case 'reversing':
      ctx.fillStyle = '#b4b8b3'; rr(170, 160, 150, 80, 0);
      reversingCar(225, 222, 2.1);
      caregiver(43, 217, 1.05);
      bayraa(174 - p * 59, 222, .85, { mood: 'happy' });
      break;
    case 'cord':
      damagedCord(245, 202, .65);
      caregiver(43, 217, 1.05);
      bayraa(161 - p * 46, 222, .85, { mood: 'happy', arms: p * .5 });
      break;
    case 'icicles':
      snowRoof(187, 35, 120); icicle(272, 50, 56);
      caregiver(43, 217, 1.05);
      bayraa(176 - p * 61, 222, .85, { mood: 'happy', hat: 'winter' });
      break;
    case 'seatbelt':
      boosterSeat(160, 180, 0.7);
      bayraa(160, 195, 1.1, { mood: 'happy', noShadow: true, seated: true });
      ctx.strokeStyle = '#23394b'; ctx.lineWidth = 7;
      seg(132, 128, 108 + p * 80, 150 + p * 33);
      if (t > .8) seg(137, 183, 188, 183);
      ctx.fillStyle = '#d34e42'; rr(180, 177, 16, 16, 4);
      break;
    case 'balcony':
      ctx.fillStyle = '#dfc49b'; rr(5, 30, 115, 200, 4);
      ctx.fillStyle = '#fff0d0'; rr(14, 42, 94, 180, 2);
      ctx.strokeStyle = '#66828f'; ctx.lineWidth = 5;
      seg(190, 104, 310, 104); seg(190, 185, 310, 185);
      for (let bx = 197; bx < 310; bx += 20) seg(bx, 104, bx, 185);
      caregiver(49, 218, 1.05);
      bayraa(225 - p * 112, 226, 0.95, { mood: 'happy' });
      break;
    case 'cleaner': {
      caregiver(48, 222, 1.2);
      ctx.fillStyle = '#a87b4e'; rr(150, 142, 151, 78, 5);
      ctx.fillStyle = '#d6dbd2'; rr(146, 130, 159, 13, 4);
      ctx.fillStyle = '#8198a0'; ell(225, 128, 36, 5);
      ctx.fillStyle = '#514536'; rr(158, 150, 135, 62, 3);
      cleaningBottle(201, 207, .65); cleaningBottle(257, 207, .6);
      baby(112, 230, 0);
      const edge = 153 - 30 * (1 - p) + 145 * p;
      ctx.fillStyle = '#c99a68'; ctx.beginPath(); ctx.moveTo(153, 146);
      ctx.lineTo(edge, 146 + 10 * (1 - p)); ctx.lineTo(edge, 218 + 10 * (1 - p)); ctx.lineTo(153, 218); ctx.closePath(); ctx.fill();
      if (t > .85) lock(277, 178);
      break;
    }
    case 'dog':
      caregiver(49, 219, 1.05);
      ctx.save(); ctx.translate(267, 216); ctx.scale(-1, 1); dog(0, 0, .68); ctx.restore();
      bayraa(170 - p * 42, 222, 0.95, { mood: 'happy' });
      break;
    case 'drink':
      caregiver(49 + p * 93, 205, 1.1);
      ctx.fillStyle = '#a6794b'; rr(128, 138, 173, 13, 4); rr(137, 151, 10, 70, 2); rr(282, 151, 10, 70, 2);
      hotCup(265 - p * 85, 138 - Math.sin(p * Math.PI) * 12, 0.8);
      baby(265, 230, 0);
      break;
    case 'manhole':
      ctx.fillStyle = '#bdc9d5'; ctx.fillRect(0, 120, 320, 120);
      manhole(176, 179, 0.65);
      bayraa(70, 225 - p * 72, 0.95, { mood: 'happy' });
      break;
    case 'hat':
      bayraa(160, 218, 1.35, { mood: t > 0.7 ? 'happy' : 'scared', hat: t >= 1 ? 'winter' : false });
      if (t < 1) winterHat(70 + p * 90, 60 + p * (218 - 101 * 1.35 - 60), 1.35);
      break;
    case 'baby':
      stove(12, 133, 70, 65);
      ctx.fillStyle = '#b67b4d'; rr(218, 168, 90, 52, 4);
      cradle(218, 135, 90, 35);
      const lift = phase(.1, .2), carry = phase(.3, .35), place = phase(.65, .15);
      bayraa(155 + carry * 70, 220, 1.2, { mood: 'happy', arms: .3 + place * .6 });
      baby(108 + lift * 47 + carry * 105, 208 - lift * 22 - place * 31, 0, t < .1);
      break;
    case 'smoke':
      ctx.fillStyle = '#dfcdb4'; rr(0, 0, 210, 222, 0);
      stove(20, 149, 54, 48);
      ctx.fillStyle = '#7c5437'; rr(205, 69, 69, 153, 3);
      ctx.fillStyle = '#b8d8df'; rr(212, 76, 55, 146, 2);
      ctx.fillStyle = '#a7bd8c'; rr(274, 190, 46, 50, 0);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 205, 190); ctx.clip();
      ctx.globalAlpha = .35 * (1 - p); ctx.fillStyle = '#65707a';
      for (let i = 0; i < 4; i++) ell(50 + i * 30, 120 - i * 17, 35, 22);
      ctx.restore();
      bayraa(112 + p * 162, 222, 1, { mood: p > .7 ? 'happy' : 'scared' });
      break;
    case 'ice':
      ctx.fillStyle = '#b9e6fa'; ell(160, 219, 130, 17);
      bayraa(116 + p * 70, 212, 1.45, { arms: 0.5, mood: 'ok' });
      ctx.fillStyle = '#457c9e';
      for (let i = 0; i < 5; i++) ell(110 + i * 16, 224 + (i % 2) * 7, 4, 7);
      break;
    case 'socket':
      ctx.fillStyle = '#fff'; rr(225, 100, 49, 49, 7);
      ctx.fillStyle = C.ink; circ(241, 124, 3); circ(258, 124, 3);
      caregiver(43, 222, 1.05);
      bayraa(166 - p * 48, 222, .85, { mood: 'happy', arms: p * .3 });
      // Metal stays on the floor. The child leaves it alone and tells an adult.
      ctx.strokeStyle = '#778da4'; ctx.lineWidth = 4;
      seg(234, 195, 260, 209);
      for (let i = -1; i <= 1; i++) seg(229, 191 + i * 4, 237, 195 + i * 3);
      break;
    case 'cow': {
      ctx.fillStyle = '#596578'; ctx.fillRect(0, 136, 320, 68);
      const cx = t < 0.75 ? 30 : 30 + (t - 0.75) * 560;
      car(cx, 191, t < 0.75);
      cow(200, 137 + p * 140, 0.75);
      if (t < 0.75) { ctx.fillStyle = '#c63431'; circ(67, 92, 25); ctx.fillStyle = '#fff'; rr(48, 87, 38, 9, 3); }
      break;
    }
    case 'crossing':
      ctx.fillStyle = '#596578'; ctx.fillRect(0, 116, 320, 88);
      ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(131, 122 + i * 21, 58, 11);
      ctx.fillStyle = C.ink; rr(244, 27, 46, 91, 8);
      ctx.fillStyle = t < 0.4 ? '#ee473f' : '#6b292d'; circ(267, 50, 14);
      ctx.fillStyle = t >= 0.4 ? '#43d477' : '#27533d'; circ(267, 93, 14);
      bayraa(160, 228 - phase(.45, .35) * 110, .9 - phase(.45, .35) * .25, { mood: 'happy' });
      break;
    case 'dust':
      ger(235, 192, 1.05);
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#ad854f';
      for (let i = 0; i < 5; i++) ell(i * 23, 80 + i * 18, 35, 55);
      ctx.globalAlpha = 1;
      if (t < 0.95) bayraa(70 + p * 165, 220 - p * 28, 1.35 - p * 0.95, { mood: 'ok' });
      break;
    case 'cabinet':
      cabinet(); caregiver(54, 222, 1.2); baby(119, 232, 0);
      for (let i = 0; i < 3; i++) {
        const move = phase(.1 + i * .2, .18);
        const ix = 151 + i * 25 + move * (225 + i * 23 - (151 + i * 25));
        const iy = 204 - move * (i === 2 ? 93 : 150);
        ctx.fillStyle = ['#c6894f', '#ece9df', '#a56c59'][i]; rr(ix, iy, 16, 23, 3);
        ctx.fillStyle = '#7f969e'; rr(ix - 1, iy - 4, 18, 5, 2);
      }
      if (t > .78) { ctx.fillStyle = '#c58a51'; rr(198, 22, 104, 114, 8); lock(274, 71); }
      break;
    case 'river':
      ctx.fillStyle = '#4ba3cd'; ctx.fillRect(200, 166, 120, 74);
      ctx.fillStyle = '#ebd5a2'; ctx.fillRect(0, 182, 200, 58);
      // Both caregiver and child remain on dry ground, away from the river.
      caregiver(52, 217, 1.05);
      bayraa(160 - p * 12, 219, 0.95, { mood: 'happy', arms: 0.4 });
      noSwimmingSign(259, 105, 40);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) seg(214 + i * 28, 202 + (i % 2) * 15, 234 + i * 28, 202 + (i % 2) * 15);
      break;
    default:
      bayraa(160, 220, 1.6, { mood: 'happy', wave: true });
  }
  // A shape as well as colour confirms the demonstrated safe action.
  if (t >= 1) check(289, 212, 19);
  ctx.restore();
}
