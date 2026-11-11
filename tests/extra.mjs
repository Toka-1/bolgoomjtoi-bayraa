import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
function load(file,names,bindings={}){
 const code=stripTypeScriptTypes(readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).replace(/^import[\s\S]*?;\r?$/gm,'').replace(/export /g,'');
 return runInNewContext(code+'\n({'+names.join(',')+'})',{...bindings});
}
const {EXTRA_LEVELS}=load('meta/extra.ts',['EXTRA_LEVELS']);
const {DragKeys}=load('core/dragKeys.ts',['DragKeys']);
let depth=0,draws=0,warnings=0;
const finite=(...a)=>{draws++;for(const n of a)if(typeof n==='number')assert.ok(Number.isFinite(n));};
const ctx=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0);}},{get:(o,k)=>k in o?o[k]:finite,set:(o,k,v)=>{o[k]=v;return true;}});
const artBindings={stopHint:(...a)=>{warnings++;finite(...a);},outdoorBackdrop:finite,ctx,W:360,H:640,reduce:false,clock:{t:0},rr:finite,circ:finite,ell:finite,seg:finite,lin:()=> '#abc',bayraa:finite,caregiver:finite,car:finite};
const art=load('art/extra.ts',['extraScene','extraDanger','extraLesson','extraConsequence','hazardPoint','HELMET_HEAD'],artBindings);
const ctl={stage:1,variation:0,wins:0,losses:0,win(){this.wins++;},lose(){this.losses++;}};
const classes=load('games/extra.ts',['Helmet','Stairs','Sidewalk','extraGames'],{ctl,DragKeys,EXTRA_LEVELS,...art,sfx(){},dangerZone:finite,dist:(a,b,c,d)=>Math.hypot(a-c,b-d)});
assert.equal(classes.extraGames.length,11);
const helmet=new classes.Helmet();helmet.init();helmet.key('Enter',true);assert.equal(helmet.drag,false);
helmet.down(helmet.x,helmet.y-10);helmet.move(170,art.HELMET_HEAD.y-10);helmet.cancelInput();helmet.up();assert.equal(ctl.wins,0);
helmet.select(helmet.x,helmet.y-10);helmet.select(170,art.HELMET_HEAD.y-10);assert.equal(ctl.wins,1);helmet.up();assert.equal(ctl.wins,1);
helmet.init();assert.equal(helmet.safe,false);assert.equal(helmet.drag,false);

const stairs=new classes.Stairs();stairs.init();stairs.down(70,380);stairs.update(2.3);assert.equal(ctl.wins,2);
stairs.init();stairs.key(' ',true);stairs.key('ArrowDown',true);stairs.key(' ',false);stairs.update(2.3);assert.equal(ctl.wins,3,'one held brake key retains the rail');
stairs.init();stairs.down(70,380);stairs.cancelInput();stairs.update(1);assert.equal(ctl.losses,1,'focus cancellation clears the railing hold');
stairs.update(10);assert.equal(ctl.losses,1);
stairs.init();stairs.down(220,370);stairs.update(.4);assert.equal(stairs.progress,0,'touching empty wall cannot hold the railing');

const sidewalk=new classes.Sidewalk();sidewalk.init();sidewalk.down(130,535);sidewalk.move(130,365);sidewalk.cancelInput();sidewalk.up();assert.equal(ctl.wins,3);
sidewalk.init();sidewalk.select(130,535);sidewalk.select(130,365);assert.equal(ctl.wins,4,'right-click can complete the sidewalk route');
sidewalk.init();sidewalk.down(130,535);sidewalk.move(230,450);assert.equal(ctl.losses,2,'dragging into the road fails');
sidewalk.up();assert.equal(ctl.wins,4);
sidewalk.init();sidewalk.down(230,500);assert.equal(ctl.losses,3);

for(const m of classes.extraGames.slice(3)){
 const wins=ctl.wins,losses=ctl.losses,h=art.hazardPoint(m.definition.kind);
 m.init();m.down(150,150);assert.equal(ctl.wins,wins);m.down(100,460);assert.equal(ctl.wins,wins+1);
 m.down(h.x,h.y);m.update(10);assert.equal(ctl.losses,losses,'adult assistance latches the safe outcome');
 m.init();m.down(h.x,h.y);assert.equal(ctl.losses,losses+1);m.down(100,460);assert.equal(ctl.wins,wins+1);
 m.init();m.key('ArrowLeft',false);assert.equal(ctl.wins,wins+1);m.key('ArrowLeft',true);assert.equal(ctl.wins,wins+2);
}
for(const m of classes.extraGames){
 m.init();m.draw();const before=warnings;m.danger?.();assert.equal(warnings,before+1,'each active scene has one danger cue');assert.equal(depth,0);
 m.safe=true;m.danger?.();assert.equal(warnings,before+1,'resolved levels hide danger cues');m.init();
 const flowCtl={};
 const {[m.constructor.name]: Game}=load('games/extra.ts',[m.constructor.name],{ctl:flowCtl,DragKeys,EXTRA_LEVELS,...art,sfx(){},dangerZone:finite,dist:(a,b,c,d)=>Math.hypot(a-c,b-d)});
 const game=new Game();
 const flow=load('flow.ts',['g','startRun','step'],{ctl:flowCtl,games:[game],sfx(){},navigator:{},localStorage:{getItem(){return null;}},meta:{allowed(){return true;},readingQuiz:false,unlock(){return false;}}});
 flow.startRun();flow.step(5);assert.equal(flow.g.state,'result');assert.equal(flow.g.ok,false,m.cmd+' has a timeout/failure path');
}
for(const reduce of [false,true]){
 const renderer=load('art/extra.ts',['extraLesson','extraConsequence'],{...artBindings,reduce});
 for(const d of EXTRA_LEVELS)for(const t of [0,.5,1])for(const failure of [false,true]){
  const before=draws;renderer.extraLesson(d.kind,t,failure);assert.ok(draws>before);assert.equal(depth,0);
  renderer.extraConsequence(d.kind,t,t,t);assert.equal(depth,0);
 }
}
console.log('Eleven new levels: success, failure, timeout, cancellation, retry and both lesson motion modes passed.');
