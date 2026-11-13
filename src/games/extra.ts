import {ctl} from '../core/ctl';
import {sfx} from '../core/audio';
import {DragKeys} from '../core/dragKeys';
import {dist} from '../core/draw';
import {extraScene, extraDanger, hazardPoint, HELMET_HEAD} from '../art/extra';
import {EXTRA_LEVELS, type ExtraDefinition} from '../meta/extra';
import type {Micro} from './types';
import {highlight} from '../ui/gesture';

abstract class Extra implements Micro {
  readonly focus = {zoom:1.3,y:470,height:400};
  abstract readonly definition: ExtraDefinition;
  get cmd():string{return this.definition.cmd;}
  get sub():string{return this.definition.rule;}
  get tip():string{return this.definition.rule;}
  readonly lose='Аюулаас зайлсхийж амжсангүй!';
  dead=false;safe=false;progress=0;
  init():void{this.dead=false;this.safe=false;this.progress=0;this.cancelInput();}
  cancelInput():void{}
  protected win():void{if(this.dead||this.safe)return;this.safe=true;ctl.win();}
  protected fail():void{if(this.dead||this.safe)return;this.dead=true;ctl.lose(this.lose);}
  update(_dt:number):void{}
  resultUpdate(dt:number):void{if(this.safe)this.progress=Math.min(1,this.progress+dt*1.6);}
  draw():void{extraScene(this.definition.kind,this.progress,this.dead);}
  danger():void{if(!this.safe&&!this.dead)extraDanger(this.definition.kind);}
}

export class Helmet extends Extra {
  hint():void{if(!this.safe&&!this.dead){highlight(this.x,this.y-10,36);highlight(HELMET_HEAD.x,HELMET_HEAD.y,32);}}
  readonly focus = {zoom:1.35,y:510,height:330};
  readonly definition=EXTRA_LEVELS[0];
  x=280;y=470;drag=false;private arrows=new DragKeys();
  init():void{super.init();this.x=255+(ctl.variation??0)*12;this.y=470;}
  cancelInput():void{this.drag=false;this.arrows?.clear();}
  down(x:number,y:number):void{if(!this.safe&&!this.dead&&dist(x,y,this.x,this.y-10)<36)this.drag=true;}
  move(x:number,y:number):void{if(this.drag&&!this.dead&&!this.safe){this.x=Math.max(30,Math.min(330,x));this.y=Math.max(320,Math.min(590,y+10));}}
  up():void{if(!this.drag)return;this.drag=false;this.arrows.clear();if(dist(this.x,this.y,HELMET_HEAD.x,HELMET_HEAD.y)<32){sfx('buckle');this.win();}}
  select(x:number,y:number):boolean{if(this.drag){this.move(x,y);this.up();}else this.down(x,y);return this.drag;}
  key(k:string,down:boolean):void{this.arrows.key(k,down);}
  update(dt:number):void{if(this.drag){const [dx,dy]=this.arrows.delta(dt);this.move(this.x+dx,this.y+dy-10);}}
  draw():void{extraScene('helmet',0,this.dead,this.x,this.y,this.safe);}
}

export class Stairs extends Extra {
  hint():void{if(!this.safe&&!this.dead)highlight(80,375,24);}
  readonly focus = {zoom:1.05,y:445,height:460};
  readonly definition=EXTRA_LEVELS[1];
  private pointer=false;private heldKeys=new Set<string>();private slip=0;
  init():void{super.init();this.slip=0;}
  cancelInput():void{this.pointer=false;this.heldKeys?.clear();}
  down(x:number,y:number):void{
    if(this.dead||this.safe)return;
    const t=Math.max(0,Math.min(1,((x-72)*156+(y-365)*180)/(156*156+180*180)));
    this.pointer=dist(x,y,72+t*156,365+t*180)<=24;
  }
  up():void{this.pointer=false;}
  move(x:number,y:number):void{if(this.pointer)this.down(x,y);}
  key(k:string,down:boolean):void{if(k!==' '&&k!=='ArrowDown')return;if(down)this.heldKeys.add(k);else this.heldKeys.delete(k);}
  update(dt:number):void{
    if(this.dead||this.safe)return;
    if(this.pointer||this.heldKeys.size){this.slip=Math.max(0,this.slip-dt*2);this.progress=Math.min(1,this.progress+dt/2.2);if(this.progress>=1)this.win();}
    else{this.slip+=dt;if(this.slip>.95-(ctl.stage??0)*.1)this.fail();}
  }
}

export class Sidewalk extends Extra {
  hint():void{if(!this.safe&&!this.dead){highlight(this.x,this.y-45,40);highlight(130,365,35);}}
  readonly focus = {zoom:1.05,y:435,height:460};
  readonly definition=EXTRA_LEVELS[2];
  x=130;y=580;drag=false;private arrows=new DragKeys();
  init():void{super.init();this.x=130;this.y=580;}
  cancelInput():void{this.drag=false;this.arrows?.clear();}
  down(x:number,y:number):void{if(this.dead||this.safe)return;if(x>=205&&y>=320){this.fail();return;}if(dist(x,y,this.x,this.y-45)<48)this.drag=true;}
  move(x:number,y:number):void{
    if(!this.drag||this.dead||this.safe)return;
    if(x>=195){this.fail();return;}
    this.x=Math.max(45,Math.min(175,x));this.y=Math.max(410,Math.min(590,y+45));this.progress=(580-this.y)/170;
  }
  up():void{if(!this.drag)return;this.drag=false;this.arrows.clear();if(this.y<=420)this.win();}
  select(x:number,y:number):boolean{if(this.drag){this.move(x,y);this.up();}else this.down(x,y);return this.drag;}
  key(k:string,down:boolean):void{this.arrows.key(k,down);}
  update(dt:number):void{if(this.drag){const [dx,dy]=this.arrows.delta(dt);this.move(this.x+dx,this.y+dy-45);}}
  resultUpdate(_dt:number):void{}
  draw():void{
    // The same renderer follows both horizontal and vertical dragging.
    extraScene('sidewalk',this.progress,this.dead,280,470,false,this.x);
  }
}

abstract class AskAdult extends Extra {
  hint():void{if(!this.safe&&!this.dead)highlight(100,460,44);}
  down(x:number,y:number):void{
    if(this.safe||this.dead)return;
    if(x>=55&&x<=145&&y>=355&&y<=565){this.win();return;}
    const h=hazardPoint(this.definition.kind);
    if(dist(x,y,h.x,h.y)<(this.definition.kind==='oven'?62:36))this.fail();
  }
  key(k:string,down:boolean):void{if(down&&k==='ArrowLeft')this.down(100,460);}
}
export class Knife extends AskAdult {readonly definition=EXTRA_LEVELS[3];}
export class Iron extends AskAdult {readonly definition=EXTRA_LEVELS[4];}
export class Kettle extends AskAdult {readonly definition=EXTRA_LEVELS[5];}
export class Glass extends AskAdult {readonly definition=EXTRA_LEVELS[6];}
export class Battery extends AskAdult {readonly definition=EXTRA_LEVELS[7];}
export class Bag extends AskAdult {readonly definition=EXTRA_LEVELS[8];}
export class Medicine extends AskAdult {readonly definition=EXTRA_LEVELS[9];}
export class Oven extends AskAdult {readonly focus={zoom:1.15,y:465,height:400};readonly definition=EXTRA_LEVELS[10];}
export const extraGames:Micro[]=[new Helmet(),new Stairs(),new Sidewalk(),new Knife(),new Iron(),new Kettle(),new Glass(),new Battery(),new Bag(),new Medicine(),new Oven()];
