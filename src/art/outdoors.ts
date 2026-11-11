import {ctx} from '../core/canvas';
import {rr,ell,seg} from '../core/draw';

export type OutdoorKind='city'|'courtyard'|'park'|'steppe'|'winter-city'|'winter-steppe'|'river';
/** Scenery only: no new targets, hazards, arrows or input regions. */
export function outdoorFor(scene:string|undefined):OutdoorKind|undefined {
  switch(scene){
    case 'crossing':case 'manhole':case 'reversing':case 'balcony':case 'extra:sidewalk':return 'city';
    case 'dog':return 'courtyard';
    case 'ice':case 'icicles':return 'winter-city';
    case 'hat':return 'winter-steppe';
    case 'cow':case 'dust':return 'steppe';
    case 'river':return 'river';
    case 'extra:helmet':return 'park';
    default:return undefined;
  }
}

/** Relative dimensions let the same quiet setting support live scenes and picture lessons. */
export function outdoorBackdrop(kind:OutdoorKind,w=320,h=240,ground=190):void {
  const winter=kind.startsWith('winter'),city=kind==='city'||kind==='winter-city';
  const prairie=kind==='steppe'||kind==='winter-steppe';
  ctx.save();
  ctx.fillStyle=winter?'#d8e8f2':prairie?'#e4e4ce':'#c8e3ec';ctx.fillRect(0,0,w,h);
  // Soft clouds stay above the main action.
  ctx.fillStyle=winter?'#f3f7f7':'#f6f6e9';
  for(let i=0;i<3;i++){
    const x=w*(.12+i*.34),y=ground*(.22+i%2*.14);
    ell(x,y,w*.06,ground*.025);ell(x+w*.035,y-ground*.014,w*.04,ground*.032);
  }
  const horizon=ground*.74;
  ctx.fillStyle=winter?'#aebfcc':prairie?'#aebca2':'#9ebaa9';
  ctx.beginPath();ctx.moveTo(0,ground);
  for(let i=0;i<=8;i++)ctx.lineTo(w*i/8,horizon-ground*(i%3===0?.22:i%2?.09:.04));
  ctx.lineTo(w,ground);ctx.closePath();ctx.fill();
  if(winter){ctx.strokeStyle='#eef5f8';ctx.lineWidth=Math.max(2,w*.012);ctx.beginPath();ctx.moveTo(0,horizon-ground*.22);ctx.lineTo(w/8,horizon-ground*.09);ctx.lineTo(w/4,horizon-ground*.04);ctx.stroke();}
  ctx.fillStyle=winter?'#e3edf0':prairie?'#c4c7a0':'#bdcfb0';ctx.fillRect(0,horizon,w,ground-horizon);
  if(city){
    for(let i=0;i<6;i++){
      const x=w*(i*.19-.035),bw=w*.16,base=ground*.89,bh=ground*(.31+(i%3)*.07);
      ctx.fillStyle=['#b4bfc0','#c1b9a7','#a6b8bf'][i%3];rr(x,base-bh,bw,bh,2);
      ctx.fillStyle='#7f9ca8';
      for(let row=0;row<3;row++)for(let col=0;col<2;col++)rr(x+bw*(.18+col*.43),base-bh+bh*(.13+row*.27),bw*.22,bh*.15,1);
      ctx.fillStyle=winter?'#f1f5f5':'#dce3d8';rr(x-1,base-bh-3,bw+2,4,1);
    }
  }
  if(kind==='courtyard'||kind==='park'||kind==='river'){
    for(const [fx,fh] of [[.08,.38],[.87,.3]] as const){
      const x=w*fx,base=ground*.91,height=ground*fh;
      ctx.strokeStyle='#8c9475';ctx.lineWidth=Math.max(2,w*.009);seg(x,base,x,base-height*.7);
      ctx.fillStyle='#91af8c';ell(x,base-height*.77,w*.055,height*.27);ell(x-w*.025,base-height*.54,w*.045,height*.2);
    }
  }
  if(kind==='park'||kind==='courtyard'){
    const top=ground*.76;
    ctx.strokeStyle='#aaa58a';ctx.lineWidth=Math.max(2,w*.012);seg(0,top+w*.025,w,top+w*.025);
    for(let i=0;i<12;i++){ctx.fillStyle='#b5ad8e';rr(w*i/11-w*.008,top,w*.016,ground-top,2);}
  }
  ctx.fillStyle=winter?'#edf3f3':city?'#c2cbca':prairie?'#d5c4a0':'#d8d5bb';ctx.fillRect(0,ground,w,h-ground);
  ctx.fillStyle=winter?'#ccdce4':city?'#9caeae':'#b1bc96';ctx.fillRect(0,ground,w,Math.max(2,h*.012));
  if(city||kind==='park'||kind==='courtyard'){
    ctx.strokeStyle='rgba(98,120,119,.15)';ctx.lineWidth=1;
    for(let i=0;i<5;i++)seg(w*(.1+i*.2),ground,w*(-.2+i*.35),h);
    seg(0,ground+(h-ground)*.55,w,ground+(h-ground)*.55);
  }
  if(kind==='river'){
    ctx.strokeStyle='#aabf95';ctx.lineWidth=Math.max(2,w*.008);
    for(let i=0;i<8;i++){const x=w*(.02+i*.14);seg(x,ground-2,x+w*.012,ground-ground*.04);}
  }
  ctx.restore();
}
