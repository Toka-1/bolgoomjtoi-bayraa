import {ctx, W, H, reduce, clock, layer} from '../core/canvas';
import {rr, circ, ell, seg, lin} from '../core/draw';
import {planks, skirting, mottle} from './scenery';
import {perspectiveFloor} from './depth';
import {bayraa} from './bayraa';
import {caregiver} from './safety';
import type {ExtraKind} from '../meta/extra';
import {car} from './props';
import {outdoorBackdrop} from './outdoors';
import {stopHint} from '../ui/gesture';

export const HELMET_HEAD = {x:170,y:580-101*1.05};
export function helmet(x:number,y:number,s=1):void {
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.fillStyle='#e9a432';ctx.beginPath();ctx.ellipse(0,-8,27,20,0,Math.PI,Math.PI*2);ctx.lineTo(27,0);ctx.lineTo(-27,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#253b58';rr(-27,-3,54,5,2);
  for(const x of [-15,0,15]){ctx.fillStyle='#94652b';rr(x-2,-21,4,10,2);}
  ctx.strokeStyle='#253b58';ctx.lineWidth=3;seg(-21,1,-10,19);seg(21,1,10,19);seg(-10,19,10,19);
  ctx.restore();
}
export function hazardPoint(kind:ExtraKind):{x:number;y:number} {
  return {x:274,y:['glass','battery','bag','oven'].includes(kind)?568:kind==='kettle'?459:468};
}
function prop(kind:ExtraKind,x:number,y:number):void {
  ctx.save();ctx.translate(x,y);
  const scale=kind==='battery'?1.05:kind==='oven'?1:.85;
  ctx.scale(scale,scale);
  ctx.strokeStyle='#43525c';ctx.lineWidth=3;ctx.lineCap='round';
  switch(kind){
    case 'knife':ctx.fillStyle='#d4dee1';ctx.beginPath();ctx.moveTo(-28,0);ctx.lineTo(8,-9);ctx.lineTo(8,2);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#654733';rr(8,-8,25,11,3);break;
    case 'iron':ctx.fillStyle='#eb9d71';ctx.beginPath();ctx.moveTo(-29,5);ctx.lineTo(17,-22);ctx.lineTo(30,4);ctx.closePath();ctx.fill();ctx.strokeRect(-1,-25,17,15);seg(-30,8,30,8);break;
    case 'kettle':ctx.fillStyle='#6597b4';ell(0,-10,22,28);ctx.strokeStyle='#36586e';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,-32,19,Math.PI,0);ctx.stroke();seg(17,-17,32,-28);ctx.fillStyle='#36586e';rr(-17,-37,34,5,2);break;
    case 'glass':ctx.fillStyle='#bad6db';ctx.strokeStyle='#476c78';ctx.lineWidth=1.8;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-29+i*16,6);ctx.lineTo(-23+i*16,-11-i%2*10);ctx.lineTo(-14+i*16,5);ctx.closePath();ctx.fill();ctx.stroke();}break;
    case 'battery':ctx.fillStyle='#657783';ell(0,0,11,7);ctx.fillStyle='#e5edf0';ell(0,-3,10,6);ctx.strokeStyle='#354d5e';ctx.lineWidth=2;seg(-4,-3,4,-3);seg(0,-7,0,1);break;
    case 'bag':ctx.fillStyle='rgba(158,184,194,.88)';rr(-23,-43,46,48,5);ctx.strokeStyle='#4b6e7c';ctx.lineWidth=2;ctx.strokeRect(-23,-43,46,48);ctx.strokeRect(-17,-52,12,15);ctx.strokeRect(5,-52,12,15);break;
    case 'medicine':ctx.fillStyle='#ac773d';rr(-13,-28,26,33,4);ctx.fillStyle='#eee9dd';rr(-15,-35,30,9,2);rr(-11,-20,22,17,2);ctx.fillStyle='#bd5347';rr(-2,-17,4,11,1);rr(-6,-13,12,4,1);break;
    case 'oven':ctx.fillStyle='#637383';rr(-53,-68,106,80,7);ctx.fillStyle='#263946';rr(-42,-42,84,43,4);ctx.fillStyle='#eaa05e';rr(-34,-32,68,19,3);ctx.strokeStyle='#cad6dc';seg(-32,-50,32,-50);for(const x of [-31,-10,11,32])circ(x,-60,4);break;
  }
  if(['iron','kettle','oven'].includes(kind)){
    ctx.strokeStyle='#b57448';ctx.lineWidth=2.5;
    for(const dx of [-12,0,12]){const sway=reduce?0:Math.sin(clock.t*3+dx)*2;ctx.beginPath();ctx.moveTo(dx,-45);ctx.quadraticCurveTo(dx-5+sway,-55,dx,-65);ctx.stroke();}
  }
  ctx.restore();
}

/** One compact stop cue, attached to the actual hazard rather than a large warning box. */
export function extraDanger(kind:ExtraKind):void {
  ctx.save();
  if(kind==='helmet'){stopHint(85,528,13);ctx.restore();return;}
  if(kind==='sidewalk'){
    ctx.strokeStyle='#b6614e';ctx.lineWidth=3;seg(199,350,199,610);stopHint(223,540,13);
    ctx.restore();return;
  }
  if(kind==='stairs'){
    ctx.strokeStyle='#b67055';ctx.lineWidth=2.5;
    for(let i=1;i<6;i++)seg(92+i*22,435+i*25,302,435+i*25);
    stopHint(274,450,13);ctx.restore();return;
  }
  const point=hazardPoint(kind);
  const top=kind==='oven'?68:kind==='kettle'?38:kind==='bag'?45:kind==='medicine'?30:kind==='iron'?23:kind==='glass'?18:kind==='battery'?10:10;
  ctx.fillStyle='rgba(175,68,48,.12)';ell(point.x,point.y+8,kind==='oven'?49:kind==='battery'?17:30,7);
  stopHint(point.x-(kind==='oven'?48:28),point.y-top-17,13);
  ctx.restore();
}

const KITCHEN:readonly ExtraKind[]=['knife','kettle','oven'];

/** Window with sky and a soft city silhouette; curtains in the living room. */
function roomWindow(x:number,y:number,w:number,h:number,curtains:boolean):void {
  ctx.fillStyle='rgba(60,40,20,.18)';rr(x-4,y-2,w+12,h+12,4);
  ctx.fillStyle='#f4efe4';rr(x-6,y-6,w+12,h+12,4);
  ctx.fillStyle=lin(0,y,0,y+h,[[0,'#8fc6ea'],[1,'#d8eef8']]);ctx.fillRect(x,y,w,h);
  ctx.fillStyle='rgba(120,150,175,.45)';
  for(let i=0;i<5;i++){const bw=w/5,bh=h*(.25+((i*7)%3)*.12);ctx.fillRect(x+i*bw+1,y+h-bh,bw-3,bh);}
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.moveTo(x+8,y);ctx.lineTo(x+26,y);ctx.lineTo(x+8,y+h*.45);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#f4efe4';ctx.lineWidth=5;seg(x+w/2,y,x+w/2,y+h);seg(x,y+h*.42,x+w,y+h*.42);
  ctx.fillStyle='#e8e0cf';rr(x-10,y+h+4,w+20,7,2);
  if(curtains){
    ctx.fillStyle='#8a5a8c';ctx.fillRect(x-14,y-14,w+28,6);
    for(const side of [0,1]){
      const cx=side?x+w-6:x-12;
      ctx.fillStyle=lin(cx,0,cx+20,0,[[0,'#b4657a'],[.5,'#cf8597'],[1,'#a65a6e']]);
      ctx.beginPath();ctx.moveTo(cx,y-10);ctx.lineTo(cx+18,y-10);ctx.quadraticCurveTo(cx+(side?2:22),y+h*.6,cx+18,y+h+14);ctx.lineTo(cx,y+h+14);ctx.closePath();ctx.fill();
    }
  }
}

/** Baked indoor backdrops: wall detail stays above the play line (y 520), the floor stays quiet. */
function paintRoom(kitchen:boolean):void {
  ctx.fillStyle=lin(0,0,0,520,[[0,kitchen?'#e7dcc6':'#e6cfa8'],[1,kitchen?'#f6eedd':'#f3e4c8']]);ctx.fillRect(0,0,W,520);
  if(kitchen){
    // tiled backsplash behind the counter
    ctx.fillStyle='#eef0ea';ctx.fillRect(0,396,W,112);
    ctx.strokeStyle='rgba(110,130,130,.22)';ctx.lineWidth=1;
    for(let y=396,row=0;y<508;y+=22,row++){seg(0,y,W,y);for(let x=row%2?14:0;x<W;x+=28)seg(x,y,x,y+22);}
    // wall cupboards
    ctx.fillStyle='rgba(60,40,20,.2)';rr(200,272,154,96,5);
    ctx.fillStyle=lin(0,262,0,360,[[0,'#d3a676'],[1,'#b9895a']]);rr(196,262,154,96,5);
    ctx.strokeStyle='rgba(80,50,25,.45)';ctx.lineWidth=2;seg(273,266,273,354);
    ctx.strokeRect(204,270,62,80);ctx.strokeRect(280,270,62,80);
    ctx.fillStyle='#6b4a2c';rr(258,330,4,14,2);rr(284,330,4,14,2);
    roomWindow(20,286,92,96,false);
    // a small shelf with jars
    ctx.fillStyle='#a77d52';rr(130,350,52,6,2);
    for(const [jx,c] of [[138,'#e1a95f'],[152,'#c95f4a'],[166,'#7aa36a']] as const){ctx.fillStyle=c;rr(jx,330,11,20,3);ctx.fillStyle='#f4efe4';rr(jx-1,327,13,5,2);}
  } else {
    ctx.fillStyle='rgba(190,140,80,.16)';
    for(let yy=30;yy<510;yy+=40)for(let xx=(yy/40)%2?20:0;xx<W;xx+=40){ctx.beginPath();ctx.moveTo(xx,yy-6);ctx.lineTo(xx+5,yy);ctx.lineTo(xx,yy+6);ctx.lineTo(xx-5,yy);ctx.closePath();ctx.fill();}
    mottle(0,0,W,520,73,'130,90,40',40,.05);
    roomWindow(238,296,84,104,true);
    // framed photo of the steppe
    ctx.fillStyle='rgba(40,25,10,.22)';rr(152,298,60,46,3);
    ctx.fillStyle=lin(150,0,210,0,[[0,'#8a5a2e'],[1,'#55331a']]);rr(148,294,60,46,3);
    ctx.fillStyle=lin(0,300,0,334,[[0,'#9fd2f2'],[1,'#86b84a']]);ctx.fillRect(154,300,48,34);
    ctx.fillStyle='#f4efe4';ell(170,326,9,5);ctx.fillStyle='#e5332a';rr(166,318,8,4,1);
  }
  skirting(520);
  if(kitchen)perspectiveFloor(520,'#d9c9ad','rgba(120,95,70,.25)');
  else planks(520,H,180,31,'#c89562','#8a5c32');
}

/** Full-size scene used by gameplay, menu snapshots and the safe-action animation. */
export function extraScene(kind:ExtraKind,p=0,failed=false,hx=280,hy=470,helmetOn=false,sidewalkX=130):void {
  const outdoor=kind==='helmet'||kind==='sidewalk';
  if(outdoor){
    ctx.fillStyle=lin(0,0,0,H,[[0,'#a8d5e9'],[1,'#f8eddb']]);ctx.fillRect(0,0,W,H);
    ctx.save();ctx.globalAlpha=.85;outdoorBackdrop(kind==='helmet'?'park':'city',W,H,kind==='helmet'?520:320);ctx.restore();
    ctx.fillStyle='#c6cbbb';ctx.fillRect(0,520,W,H-520);
    ctx.strokeStyle='#abb69d';ctx.lineWidth=2;seg(0,520,W,520);
  } else {
    const kitchen=KITCHEN.includes(kind);
    layer(kitchen?'extra-room-kitchen':'extra-room-living',()=>paintRoom(kitchen));
  }
  if(kind==='sidewalk'){
    ctx.fillStyle='#d5cbb4';ctx.fillRect(0,320,190,320);
    ctx.fillStyle='#667382';ctx.fillRect(205,320,155,320);ctx.fillStyle='#ede4c9';rr(190,320,15,320,0);
    ctx.strokeStyle='#edf0e9';ctx.lineWidth=4;for(let y=340;y<640;y+=70)seg(282,y,282,y+32);
    // A single vehicle makes the road legible without a field of warning markers.
    ctx.fillStyle='#516b7e';rr(236,360,65,106,12);ctx.fillStyle='#b6d0d9';rr(244,379,49,24,5);rr(244,431,49,16,4);
    ctx.fillStyle='#34444f';rr(231,377,6,24,2);rr(300,377,6,24,2);rr(231,433,6,24,2);rr(300,433,6,24,2);
    ctx.fillStyle='#cc7760';rr(244,454,11,5,2);rr(282,454,11,5,2);
    caregiver(82,430,.9);bayraa(failed?220:sidewalkX,580-p*170,1.05-p*.15,{mood:failed?'scared':p>=1?'happy':'ok'});return;
  }
  if(kind==='stairs'){
    for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#b29270':'#c5a887';rr(92+i*22,410+i*25,210-i*22,25,2);}
    ctx.strokeStyle='#523e31';ctx.lineWidth=9;seg(72,365,228,545);
    for(let i=0;i<5;i++){ctx.lineWidth=4;seg(82+i*32,377+i*36,82+i*32,425+i*36);}
    caregiver(305,598,1.1);bayraa(110+p*132,435+p*150,1.0,{mood:failed?'scared':p>=1?'happy':'ok',arms:.55});return;
  }
  if(kind==='helmet'){
    ctx.fillStyle='#99724f';rr(230,480,113,12,3);rr(239,492,9,69,2);rr(324,492,9,69,2);
    ctx.save();ctx.globalAlpha=.62;ctx.strokeStyle='#63787c';ctx.lineWidth=4;ctx.beginPath();ctx.arc(50,580,25,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(118,580,25,0,Math.PI*2);ctx.stroke();seg(50,580,82,541);seg(82,541,118,580);seg(50,580,97,580);seg(97,580,82,541);seg(82,541,103,537);ctx.restore();
    bayraa(170,580,1.05,{mood:helmetOn?'happy':failed?'scared':'ok',hat:false});
    helmet(helmetOn?HELMET_HEAD.x:hx,helmetOn?HELMET_HEAD.y:hy,1.05);return;
  }
  if(!['glass','battery','bag','oven'].includes(kind)){
    ctx.fillStyle='#99724e';rr(213,472,124,13,4);rr(222,485,10,95,2);rr(317,485,10,95,2);
  }
  caregiver(100+p*140,550,1.15,failed);
  const point=hazardPoint(kind);
  if(p<.85||kind==='oven')prop(kind,point.x,point.y);
  bayraa(170-p*40,590,1.05,{mood:failed?'scared':p>=1?'happy':'ok'});
}
export function extraLesson(kind:ExtraKind,p:number,failed=false):void {
  ctx.fillStyle=['helmet','sidewalk'].includes(kind)?'#c5dfe7':'#e8dbc3';ctx.fillRect(0,0,320,240);
  ctx.fillStyle=['helmet','sidewalk'].includes(kind)?'#bbbfad':'#c39b73';ctx.fillRect(0,160,320,80);
  if(kind==='helmet'||kind==='sidewalk')outdoorBackdrop(kind==='helmet'?'park':'city',320,240,160);
  ctx.save();ctx.translate(40,0);ctx.scale(2/3,2/3);ctx.translate(0,-280);
  extraScene(kind,kind==='helmet'||failed&&kind!=='stairs'&&kind!=='sidewalk'?0:p,failed,280+(HELMET_HEAD.x-280)*p,470+(HELMET_HEAD.y-470)*p,kind==='helmet'&&p>=1);
  if(failed){const h=hazardPoint(kind);ctx.strokeStyle='#be4b3e';ctx.lineWidth=3;for(let i=0;i<3;i++){const a=-2+i*.7;seg(h.x+Math.cos(a)*40,h.y+Math.sin(a)*40,h.x+Math.cos(a)*52,h.y+Math.sin(a)*52);}}
  ctx.restore();
}

/** Hazard-specific failure stories. Parameters are elapsed-time phases, never game state. */
export function extraConsequence(kind:ExtraKind,p:number,r:number,settle:number):void {
  ctx.save();
  ctx.fillStyle='#f0e2ce';ctx.fillRect(0,0,320,240);
  ctx.fillStyle='#c6aa86';ctx.fillRect(0,202,320,38);
  if(kind==='helmet'||kind==='sidewalk')outdoorBackdrop(kind==='helmet'?'park':'city');
  const marks=(x:number,y:number,color='#bc6547')=>{
    ctx.strokeStyle=color;ctx.lineWidth=3;
    for(let i=0;i<3;i++){const a=-2.4+i*.8;seg(x+Math.cos(a)*9,y+Math.sin(a)*9,x+Math.cos(a)*19,y+Math.sin(a)*19);}
  };
  const table=(y:number)=>{ctx.fillStyle='#a77d52';rr(169,y,137,10,3);rr(181,y+10,9,220-y,2);rr(290,y+10,9,220-y,2);};
  switch(kind){
    case 'helmet': {
      ctx.fillStyle='#b6c5c4';ctx.fillRect(0,185,320,55);
      ctx.save();ctx.translate(100+p*26,211);ctx.rotate(r*.65);ctx.strokeStyle='#507c93';ctx.lineWidth=4;
      for(const x of [-35,35]){ctx.beginPath();ctx.arc(x,-5,23,0,Math.PI*2);ctx.stroke();}
      seg(-35,-5,-7,-43);seg(-7,-43,35,-5);seg(-35,-5,20,-5);seg(20,-5,-7,-43);seg(-7,-43,15,-47);ctx.restore();
      bayraa(110+p*18+r*15,190+r*24,1,{seated:r<.1,mood:r>.1?'hurt':'ok',injury:r>.1?'head':undefined,rot:r*1.4,hat:false,noShadow:true});
      helmet(274,147,.7);
      if(r>.5)marks(246,198);
      break;
    }
    case 'stairs':
      for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#b39878':'#cbb494';rr(65+i*25,130+i*15,230-i*25,16,1);}
      ctx.strokeStyle='#7e5c42';ctx.lineWidth=6;seg(56,78,213,181);
      for(let i=0;i<5;i++){ctx.lineWidth=3;seg(65+i*31,85+i*20,65+i*31,137+i*20);}
      bayraa(95+p*20+r*55,145+p*10+r*64,1,{rot:r*1.4,mood:r>.1?'hurt':'ok',injury:r>.1?'head':undefined,arms:r,noShadow:true});
      if(r>.5)marks(275,204);
      break;
    case 'sidewalk':
      ctx.fillStyle='#697987';ctx.fillRect(0,132,320,108);ctx.fillStyle='#eee2c7';rr(0,124,320,8,0);
      ctx.fillStyle='#e7e9d9';for(let i=0;i<4;i++)rr(15+i*87,202,45,5,1);
      ctx.save();ctx.translate(330-p*140,208);ctx.scale(1.7,1.7);car(0,0,true);ctx.restore();
      bayraa(160-r*15,128+p*60+r*31,1,{rot:-r*1.35,mood:r>.1?'hurt':'ok',injury:r>.1?'foot':undefined,noShadow:true});
      if(r>.4)marks(188,185);
      break;
    case 'knife':
    case 'iron':
      table(168);prop(kind,kind==='knife'?210-p*55:185,kind==='knife'?145+p*19:164);
      bayraa(119+p*15-r*23,220,1,{arms:p*.7,mood:r>.1?'hurt':'ok',injury:r>.1?'hand':undefined,noShadow:true});
      if(r>.1){marks(145,174,kind==='iron'?'#d28742':'#a06c57');
        if(kind==='knife'){ctx.fillStyle='#e4c493';rr(125,177,13,6,2);}
        else{ctx.fillStyle='rgba(221,128,62,.35)';ell(129,181,9,6);}
      }
      break;
    case 'kettle':
      table(144);ctx.strokeStyle='#536b76';ctx.lineWidth=3;seg(210,140,158,180);
      ctx.save();ctx.translate(223-p*15,132+p*16);ctx.rotate(p*.6);prop('kettle',0,0);ctx.restore();
      bayraa(124+p*10-r*25,220-r*10,1,{arms:p*.2,mood:r>.1?'hurt':'ok',injury:r>.1?'foot':undefined,noShadow:true});
      if(r>.05){ctx.fillStyle='#9ec9d7';for(let i=0;i<7;i++)ell(198-i*7,163+i*7,2,5);ell(153,218,22*settle,4);marks(162,205,'#cf8a45');}
      break;
    case 'oven':
      prop('oven',215,200);
      bayraa(110+p*21-r*22,220,1,{arms:p*.5,mood:r>.1?'hurt':'ok',injury:r>.1?'hand':undefined,noShadow:true});
      if(r>.1){ctx.fillStyle='rgba(221,128,62,.35)';ell(138,178,8,6);marks(153,172,'#cf8a45');}
      break;
    case 'glass':
      prop('glass',192,216);
      bayraa(136+p*32-r*22,220-Math.sin(r*Math.PI)*7,1,{rot:-r*.1,mood:r>.1?'hurt':'ok',injury:r>.1?'foot':undefined,noShadow:true});
      if(r>.1){marks(174,208);ctx.fillStyle='#e6c99d';rr(161,207,12,5,2);}
      break;
    case 'battery':
    case 'medicine':
      prop(kind,230,213);
      bayraa(155,220+r*7,1,{mood:r>.1?(kind==='battery'?'breathless':'dizzy'):'ok',green:kind==='medicine'&&r>.1,pale:kind==='battery'&&r>.1,injury:r>.1?(kind==='battery'?'throat':'stomach'):undefined,cough:p>.6&&r<.1,rot:r*.15,noShadow:true});
      if(r<.1){ctx.fillStyle=kind==='battery'?'#a7bac4':'#d49f85';ell(218-p*63,184-p*40,kind==='battery'?6:5,3);}
      if(r>.1){marks(kind==='battery'?170:164,kind==='battery'?159:187);ctx.strokeStyle='#b58242';ctx.lineWidth=2;ctx.beginPath();ctx.arc(166,kind==='battery'?160:185,12+settle*5,-1,1);ctx.stroke();}
      break;
    case 'bag':
      bayraa(160,220+r*9,1,{mood:r>.1?'breathless':'ok',pale:r>.1,injury:r>.1?'head':undefined,noShadow:true});
      ctx.fillStyle='rgba(156,183,191,.5)';ctx.strokeStyle='#758f98';ctx.lineWidth=2;
      rr(235-p*107,161-p*67+r*9,64,70,5);ctx.strokeRect(235-p*107,161-p*67+r*9,64,70);
      if(r>.1)marks(202,140);
      break;
  }
  ctx.restore();
}
