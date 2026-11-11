import {extraConsequence} from '../art/extra';
import {outdoorBackdrop,outdoorFor} from '../art/outdoors';
import { ctx, reduce } from '../core/canvas';
import { rr, circ, ell, seg } from '../core/draw';
import { bayraa, type BayraaOpts } from '../art/bayraa';
import { baby, stove, car, cow } from '../art/props';
import { dog, hotCup, manhole, cleaningBottle, boosterSeat } from '../art/hazards';
import { LESSONS } from './lessons';
import { reversingCar, damagedCord, snowRoof, icicle } from '../art/prevention';

/** Approach, reaction, then a readable hold; independent of frame rate. */
export function consequenceMotion(elapsed: number, still = reduce): { approach: number; reaction: number; aftermath:number } {
  const ease = (n: number) => { const t = Math.min(1, Math.max(0, n)); return t * t * (3 - 2 * t); };
  return still ? { approach: 1, reaction: 1, aftermath:1 } : {
    approach: ease((elapsed - .2) / .85),
    reaction: ease((elapsed - 1.05) / .65),
    aftermath:ease((elapsed-1.7)/.9),
  };
}

/** A brief cause-and-effect vignette, separate from simulation and the safe lesson. */
export function drawConsequence(cmd: string, x: number, y: number, w: number, h: number, elapsed: number, reason = ''): void {
  const { approach: p, reaction: r, aftermath:a } = consequenceMotion(elapsed);
  // Fit the illustration without stretching people or circular props.
  const scale = Math.min(w / 320, h / 240);
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, 16); ctx.clip();
  ctx.fillStyle = '#fff1df'; ctx.fillRect(0, 0, w, h);
  ctx.translate((w - 320 * scale) / 2, (h - 240 * scale) / 2); ctx.scale(scale, scale);
  ctx.fillStyle = '#fff1df'; ctx.fillRect(0, 0, 320, 240);
  ctx.fillStyle = '#dbc5a4'; ctx.fillRect(0, 190, 320, 50);
  const outside=outdoorFor(LESSONS[cmd]);if(outside)outdoorBackdrop(outside);
  const child = (cx: number, cy: number, rot = 0, green = false, injury?:BayraaOpts['injury']) => bayraa(cx, cy, 1, { mood: r > .1 ? 'hurt' : 'ok', rot, green, injury, noShadow: true, arms: r * .8 });
  const ache = (cx: number, cy: number) => {
    ctx.save(); ctx.strokeStyle = '#c54337'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = -.8 + i * .8;
      seg(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, cx + Math.cos(a) * 18, cy + Math.sin(a) * 18);
    }
    ctx.restore();
  };
  switch (LESSONS[cmd]) {
    case 'reversing':
      ctx.fillStyle = '#b4b8b3'; rr(0, 170, 320, 70, 0);
      child(160 - r * 12, 218, -r * 1.35,false,r>.1?'foot':undefined);
      reversingCar(251 - p * 72, 219, 2.8);
      if (r > .1) ache(175, 184);
      break;
    case 'cord':
      damagedCord(125, 192, .65);
      bayraa(198 - p * 38 + r * 12, 218, 1.1, { mood: r > .1 ? 'hurt' : 'ok', injury:r>.1?'hand':undefined,rot:r*.18,arms: r * .7, noShadow: true });
      if (r > .1) {
        ctx.strokeStyle = '#d19412'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(134, 165); ctx.lineTo(145, 177); ctx.lineTo(137, 181); ctx.lineTo(153, 193); ctx.stroke();
        ache(126, 183);
      }
      break;
    case 'icicles':
      snowRoof(177, 16, 137, 0, 207);
      child(194 - r * 12, 223+r*6, -r * .16,false,r>.1?'head':undefined);
      icicle(195+r*35, 23 + p * 52+r*87, 43);
      if (r > .1) ache(213, 112);
      break;
    case 'smoke':
      stove(25, 133, 69, 64);
      bayraa(196-r*12,218+r*14,1,{rot:-r*.3,green:r>.15,cough:r>.1,mood:r>.1?'breathless':'ok',injury:r>.1?'stomach':undefined,noShadow:true});
      ctx.fillStyle = 'rgba(89,87,91,.25)';
      for (let i = 0; i < 6; i++) circ(65 + i * 33, 130 - (i % 3) * 28, 25 + p * 12);
      if(r>.1){ctx.fillStyle='rgba(154,150,136,.55)';for(let i=0;i<3;i++)circ(198+i*13,151-i*7,3+i*2);}
      if (r > .1) ache(227, 128);
      break;
    case 'ice':
      ctx.fillStyle = '#87cfe5'; ell(167, 207, 113, 16);
      child(148 + p * 20, 211+r*8, r * 1.4,false,r>.1?'foot':undefined);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; seg(74, 201, 110, 201); seg(206, 216, 246, 216);
      if (r > .5) ache(214, 201);
      break;
    case 'socket':
      ctx.fillStyle = '#e2e7e7'; rr(75, 148, 24, 26, 4);
      ctx.fillStyle = '#263943'; circ(82, 160, 2); circ(91, 160, 2);
      bayraa(130 + r * 12, 217, 1, { mood: r > .1 ? 'hurt' : 'ok', injury:r>.1?'hand':undefined,rot:-r*.12, arms: .65, noShadow: true });
      // The metal fork approaches the holes before the shock reaction.
      ctx.save(); ctx.translate(122 - p * 31, 160);
      ctx.strokeStyle = '#7d929d'; ctx.lineWidth = 5;
      seg(3, 0, 99 + r * 12 - (122 - p * 31), 3);
      ctx.lineWidth = 2;
      for (const dy of [-5, 0, 5]) seg(-9, dy, 4, dy * .3);
      ctx.restore();
      if (r > .05) {
        ctx.strokeStyle = '#d19412'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(103, 93); ctx.lineTo(118, 113); ctx.lineTo(109, 116); ctx.lineTo(130, 137); ctx.stroke();
        ache(146, 155);
      }
      break;
    case 'hat':
      bayraa(160, 218+r*5, 1.2, { mood: r > .1 ? 'hurt' : 'ok', arms:r*.65,rot:r*.1,frozen: r > .2, shiver: true, hat: false });
      ctx.fillStyle = '#a5d1e9';
      for (let i = 0; i < 12; i++) circ(20 + i * 25, 25 + (i % 4) * 42, 2.5);
      if (r > .2) ache(188, 111);
      break;
    case 'cow': {
      ctx.fillStyle = '#707780'; ctx.fillRect(0, 147, 320, 64);
      const cx=12+p*52-r*5;
      cow(216+r*10, 195, .7); car(cx, 198, true, 0);
      ctx.save();ctx.beginPath();ctx.rect(cx+36,145,66,21);ctx.clip();
      bayraa(cx+80+r*6,183,.32,{mood:r>.1?'hurt':'ok',seated:true,rot:r*.3,noShadow:true});ctx.restore();
      if (r > .1) ache(204, 172);
      break;
    }
    case 'baby':
      stove(23, 117, 85, 80); baby(195 - p * 60 + r * 14, 205-r*4, 0,true,r>.1?'hurt':undefined);
      if (r > .1) ache(116, 185);
      break;
    case 'crossing':
      ctx.fillStyle = '#707780'; ctx.fillRect(0, 148, 320, 92);
      ctx.fillStyle = '#fff5df'; for (let i = 0; i < 5; i++) rr(162, 150 + i * 18, 65, 9, 1);
      ctx.save(); ctx.translate(-220 + p * 200, 217); ctx.scale(2.5, 2.5); car(0, 0, true, 0); ctx.restore();
      child(217-r*50, 221+r*3, -r * 1.3,false,r>.1?'foot':undefined);
      if (r > .1) ache(206, 185);
      break;
    case 'dust':
      bayraa(180+p*12-r*20,219+r*10,1,{rot:p*.13+r*.18,mood:r>.1?(reason.includes('мөчир')?'hurt':'breathless'):'ok',cough:r>.1&&!reason.includes('мөчир'),injury:r>.1&&reason.includes('мөчир')?'head':undefined,noShadow:true});
      ctx.fillStyle = `rgba(157,119,75,${.12 + p * .35})`; ctx.fillRect(0, 0, 320, 240);
      ctx.strokeStyle = '#a47846'; ctx.lineWidth = 3;
      for (let i = 0; i < 9; i++) seg(15 + (i % 3) * 85, 25 + i * 22, 84 + (i % 3) * 85, 14 + i * 22);
      if (reason.includes('мөчир')) {
        ctx.strokeStyle = '#785634'; ctx.lineWidth = 8;
        seg(130, 35 + p * 65, 230, 47 + p * 80);
        ctx.lineWidth = 4; seg(180, 41 + p * 72, 193, 18 + p * 72);
      }
      break;
    case 'cabinet':
      baby(172 - p * 12+r*9, 205+r*4, 0,true,r>.1?(/[Ээ]м/.test(reason)?'sick':'hurt'):undefined);
      if (/[Ээ]м/.test(reason)) {
        ctx.fillStyle = '#f4f2e7'; rr(112, 163, 25, 36, 5);
        ctx.fillStyle = '#537eb1'; rr(110, 158, 29, 9, 2);
        ctx.fillStyle = '#d45550'; ell(125, 180, 7, 3, -.5);
        if (r > .1) ache(198, 186);
      } else {
        ctx.fillStyle = '#b95d3c'; rr(112, 177, 24, 18, 3);
        if (r > .05) {
          ctx.fillStyle = '#ed8e26';
          ctx.beginPath(); ctx.moveTo(116, 178); ctx.quadraticCurveTo(110, 164, 124, 151);
          ctx.quadraticCurveTo(140, 169, 131, 178); ctx.closePath(); ctx.fill(); ache(146, 184);
        }
      }
      break;
    case 'cleaner':
      baby(172 - p * 12+r*8, 205+r*5, 0,true,r>.1?'sick':undefined);
      cleaningBottle(111 + p * 14, 204 - p * 14, .65);
      if (r > .1) { ctx.fillStyle = 'rgba(126,165,72,.35)'; ell(175, 193, 20, 12); ache(198, 186); }
      break;
    case 'river':
      outdoorBackdrop('river',320,240,110);
      ctx.fillStyle = '#359abc'; ctx.fillRect(0, 95, 320, 145);
      // The current carries the child sideways; the foreground waves cover legs.
      bayraa(122+p*55+r*28,205+r*22+a*80,1,{rot:r*.38,mood:r>.1?'breathless':'ok',wet:r>.1,arms:.8,noShadow:true});
      ctx.fillStyle = `rgba(56,156,187,${.65+a*.35})`; ctx.fillRect(0, 187, 320, 53);
      ctx.strokeStyle = '#e6f8ff'; ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) seg(15 + i * 50, 190 + (i % 2) * 24, 42 + i * 50, 190 + (i % 2) * 24);
      if(a>.05){ctx.strokeStyle='#e2f5fc';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(196+i*7,184-i*9,2+(i%2)*2,0,Math.PI*2);ctx.stroke();}}
      break;
    case 'dog':
      child(147 - r * 10, 220-Math.sin(r*Math.PI)*8, -r * .15,false,r>.1?'foot':undefined);
      ctx.save(); ctx.translate(258 - p * 44+r*15, 220); ctx.scale(-1, 1); dog(0, 0, .8); ctx.restore();
      if (r > .1) {
        // Bark marks sit at the dog's muzzle; the child recoils afterward.
        ctx.strokeStyle = '#a84e32'; ctx.lineWidth = 2.5;
        seg(179, 170, 167, 166); seg(180, 177, 166, 178); seg(182, 184, 172, 190);
      }
      break;
    case 'drink':
      ctx.fillStyle = '#986a43'; rr(28, 126, 178, 14, 4); rr(45, 140, 12, 82, 3);
      // A hanging cloth is pulled first, then the cup tips and the child recoils.
      ctx.fillStyle = '#e0e9f2'; rr(184, 133, 18, 65 + p * 13, 3);
      baby(238 + r * 12, 219-r*5, 0,true,r>.1?'hurt':undefined);
      ctx.save(); ctx.translate(174 + p * 24, 124 + p * 44); ctx.rotate(p * 1.1); hotCup(0, 0, .42); ctx.restore();
      if (r > .05) {
        ctx.fillStyle = '#a86f32'; for (let i = 0; i < 4; i++) ell(204 + i * 5, 166 + i * 8, 2, 5);
        ache(228, 191);
      }
      break;
    case 'manhole':
      manhole(160, 203, 1);
      ctx.save(); ctx.beginPath(); ctx.rect(75, 20, 170, 190); ctx.clip();
      child(160, 193 + r * 82+a*90, r * .13); ctx.restore();
      ctx.strokeStyle = '#77818d'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(160, 207, 56, 18, 0, 0, Math.PI); ctx.stroke();
      break;
    case 'seatbelt':
      boosterSeat(125, 190, .75);
      ctx.fillStyle='#536e7c';rr(263,118,57,122,6);
      // The loose belt stays behind as the unrestrained child moves forward.
      ctx.strokeStyle = '#526474'; ctx.lineWidth = 6; seg(72, 128, 78, 193);
      ctx.fillStyle = '#cd5048'; rr(72, 187, 12, 14, 3);
      bayraa(125 + r * 65, 205 + r * 25, 1.1, { mood: r > .1 ? 'hurt' : 'ok', injury:r>.1?'head':undefined,seated: true, noShadow: true, rot: r * .85 });
      if (r > .4) ache(204, 166);
      break;
    case 'balcony':
      outdoorBackdrop('city',320,240,230);
      ctx.fillStyle = '#718b9d'; rr(25, 45, 60, 195, 0); rr(240, 85, 65, 155, 0);
      child(160 + p * 15 + r * 14, 214 - p * 28 + r * 34+a*150, r * .65);
      ctx.strokeStyle = '#526e7d'; ctx.lineWidth = 6; seg(35, 161, 287, 161); seg(35, 233, 287, 233);
      for (let i = 0; i < 9; i++) seg(40 + i * 30, 161, 40 + i * 30, 233);
      break;
  }
  if (LESSONS[cmd]?.startsWith('extra:')) extraConsequence(LESSONS[cmd].slice(6) as import('../meta/extra').ExtraKind,p,r,a);
  // A steady progress strip distinguishes the consequence from the lesson.
  ctx.fillStyle = '#e5c8b6'; rr(16, 228, 288, 5, 2);
  ctx.fillStyle = '#b84135'; rr(16, 228, 288 * (reduce ? 1 : Math.max(.03, Math.min(1, elapsed / 3.4))), 5, 2);
  ctx.restore();
}
