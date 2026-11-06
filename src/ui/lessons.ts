import { ctx, reduce } from '../core/canvas';
import { C, rr, circ, ell, seg } from '../core/draw';
import { bayraa, winterHat } from '../art/bayraa';
import { baby, cradle, stove, car, cow, ger } from '../art/props';
import { caregiver, noSwimmingSign } from '../art/safety';
import { dog, hotCup, manhole, cleaningBottle, boosterSeat } from '../art/hazards';

/** A self-contained safe-action demonstration. Never advances or changes a live game. */
export const LESSONS: Record<string, string> = {
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
  const p = t * t * (3 - 2 * t);
  ctx.save(); ctx.translate(x, y); ctx.scale(w / 320, h / 240);
  ctx.beginPath(); ctx.roundRect(0, 0, 320, 240, 16); ctx.clip();
  ctx.fillStyle = '#e9f3ff'; ctx.fillRect(0, 0, 320, 240);
  ctx.fillStyle = '#d1e5c7'; ctx.fillRect(0, 190, 320, 50);
  switch (kind) {
    case 'seatbelt':
      boosterSeat(160, 180, 0.7);
      bayraa(160, 220, 1.1, { mood: 'happy', noShadow: true });
      ctx.strokeStyle = '#23394b'; ctx.lineWidth = 7;
      seg(104, 155, 104 + p * 101, 165 + p * 18);
      if (t > 0.8) seg(135, 183, 205, 183);
      ctx.fillStyle = '#d34e42'; rr(196, 177, 18, 18, 4);
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
    case 'cleaner':
      caregiver(48, 220, 1.1);
      ctx.fillStyle = '#a87b4e'; rr(150, 82, 151, 138, 5);
      ctx.fillStyle = '#514536'; rr(158, 90, 135, 122, 3);
      cleaningBottle(201, 207, 0.8); cleaningBottle(257, 207, 0.7);
      baby(110, 236, 0);
      if (t > 0.4) { ctx.fillStyle = '#c99a68'; rr(153, 85, 145 * p, 132, 4); }
      if (t > 0.85) lock(277, 143);
      break;
    case 'dog':
      caregiver(49, 219, 1.05);
      dog(267, 216, 0.68);
      bayraa(170 - p * 55, 222, 0.95, { mood: 'happy' });
      break;
    case 'drink':
      caregiver(49, 222, 1.1);
      ctx.fillStyle = '#a6794b'; rr(128, 138, 173, 13, 4); rr(137, 151, 10, 70, 2); rr(282, 151, 10, 70, 2);
      hotCup(265 - p * 85, 138, 0.8);
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
      stove(12, 133, 70, 65); cradle(218, 99, 90, 60);
      bayraa(155, 220, 1.2, { mood: 'happy' });
      baby(108 + p * 152, 208 - p * 75, 0, t < 0.05);
      break;
    case 'smoke':
      ctx.fillStyle = '#c0d4e4'; rr(12, 20, 168, 172, 8);
      ctx.fillStyle = '#71869a'; rr(30, 42, 50, 57, 3);
      ctx.fillStyle = '#e9f9ff'; ctx.fillRect(34, 46, 42, 49);
      ctx.strokeStyle = '#517b94'; ctx.lineWidth = 5; seg(55, 46, 55, 95); seg(34, 70, 76, 70);
      ctx.fillStyle = '#7c5437'; rr(110, 86, 57, 106, 3);
      ctx.fillStyle = '#b8e5ff'; rr(116, 92, 45, 100, 2);
      ctx.globalAlpha = 0.5 * (1 - p); ctx.fillStyle = '#65707a';
      for (let i = 0; i < 4; i++) ell(50 + i * 30, 120 - i * 17, 35, 22);
      ctx.globalAlpha = 1;
      bayraa(90 + p * 164, 222, 1.15, { mood: p > 0.5 ? 'happy' : 'scared' });
      break;
    case 'ice':
      ctx.fillStyle = '#b9e6fa'; ell(160, 219, 130, 17);
      bayraa(116 + p * 70, 212, 1.45, { arms: 0.5, mood: 'ok' });
      ctx.fillStyle = '#457c9e';
      for (let i = 0; i < 5; i++) ell(110 + i * 16, 224 + (i % 2) * 7, 4, 7);
      break;
    case 'socket':
      ctx.fillStyle = '#fff'; rr(204, 63, 58, 58, 9);
      ctx.fillStyle = C.ink; circ(224, 90, 4); circ(243, 90, 4);
      bayraa(84, 218, 1.35, { mood: 'happy' });
      // The metal object moves away; a protective cover closes over the socket.
      ctx.strokeStyle = '#778da4'; ctx.lineWidth = 5;
      const fx = 190 - p * 44;
      seg(fx, 178, fx, 217); for (let i = -1; i <= 1; i++) seg(fx + i * 6, 170, fx + i * 6, 183);
      ctx.globalAlpha = p; ctx.fillStyle = '#9fd1ed'; rr(207, 66, 52, 52, 8); lock(233, 87); ctx.globalAlpha = 1;
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
      bayraa(160, 228 - Math.max(0, (p - 0.35) / 0.65) * 110, 0.9, { mood: 'happy' });
      break;
    case 'dust':
      ger(235, 192, 1.05);
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#ad854f';
      for (let i = 0; i < 5; i++) ell(i * 23, 80 + i * 18, 35, 55);
      ctx.globalAlpha = 1;
      if (t < 0.95) bayraa(70 + p * 165, 220 - p * 28, 1.35 - p * 0.95, { mood: 'ok' });
      break;
    case 'cabinet':
      cabinet(); bayraa(87, 218, 1.4, { mood: 'happy' });
      ctx.fillStyle = '#e88c34'; rr(147 + p * 94, 191 - p * 136, 22, 30, 4);
      ctx.fillStyle = '#fff'; rr(146 + p * 94, 185 - p * 136, 24, 8, 2);
      if (t > 0.8) { ctx.fillStyle = '#c58a51'; rr(198, 22, 104, 114, 8); lock(274, 71); }
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
