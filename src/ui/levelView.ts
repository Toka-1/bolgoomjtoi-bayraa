import {ctx, W, H} from '../core/canvas';
import type {Micro} from '../games/types';

export const LEVEL_VIEW = {x:8,y:96,w:344,h:500};
export function levelFrame(game:Micro):typeof LEVEL_VIEW {
  const h=game.focus?.height??LEVEL_VIEW.h;
  return {...LEVEL_VIEW,y:LEVEL_VIEW.y+(LEVEL_VIEW.h-h)/2,h};
}
export function levelCamera(game:Micro):{scale:number;x:number;y:number} {
  const frame=levelFrame(game);
  const scale=game.focus?.zoom??1;
  const requested=frame.y+frame.h/2-(game.focus?.y??420)*scale;
  const y=Math.min(frame.y,Math.max(requested,frame.y+frame.h-H*scale));
  return {scale,x:W/2-180*scale,y};
}
export function levelToWorld(game:Micro,x:number,y:number):[number,number] {
  const c=levelCamera(game);return [(x-c.x)/c.scale,(y-c.y)/c.scale];
}
export function worldToLevel(game:Micro,x:number,y:number):[number,number] {
  const c=levelCamera(game);return [x*c.scale+c.x,y*c.scale+c.y];
}
export function inLevelView(x:number,y:number,game?:Micro):boolean {
  const f=game?levelFrame(game):LEVEL_VIEW;
  return x>=f.x&&x<=f.x+f.w&&y>=f.y&&y<=f.y+f.h;
}
export function drawLevelView(game:Micro,active:boolean,showHints=false):void {
  ctx.fillStyle='#253942';ctx.fillRect(0,0,W,H);
  const f=levelFrame(game);
  ctx.save();ctx.beginPath();ctx.roundRect(f.x,f.y,f.w,f.h,18);ctx.clip();
  ctx.fillStyle='#d7ded8';ctx.fillRect(f.x,f.y,f.w,f.h);
  const c=levelCamera(game);ctx.translate(c.x,c.y);ctx.scale(c.scale,c.scale);
  game.draw();if(active){game.danger?.();if(showHints)game.hint?.();}ctx.restore();
  ctx.strokeStyle='rgba(245,235,204,.22)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(f.x,f.y,f.w,f.h,18);ctx.stroke();
}
