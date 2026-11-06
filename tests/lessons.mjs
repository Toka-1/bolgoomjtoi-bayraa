import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
function load(file, names, bindings) {
 const code=stripTypeScriptTypes(readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).replace(/^import[\s\S]*?;\r?$/gm,'').replace(/^export \{[^\n]*\} from[^\n]*$/gm,'').replace(/export /g,'');
 return runInNewContext(code+'\n({'+names.join(',')+'})',bindings);
}
let depth=0, drawings=0;
const finite=(...args)=>{for(const a of args) if(typeof a==='number') assert.ok(Number.isFinite(a)); drawings++;};
const ctx=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0);}}, {get(o,k){return k in o?o[k]:finite;},set(o,k,v){o[k]=v;return true;}});
const assets={ctx,reduce:false,C:{ink:'#123',gold:'#fc0'},rr:finite,circ:finite,ell:finite,seg:finite,bayraa:finite,caregiver:finite,noSwimmingSign:finite,winterHat:finite,baby:finite,cradle:finite,stove:finite,car:finite,cow:finite,ger:finite,dog:finite,hotCup:finite,manhole:finite,cleaningBottle:finite,boosterSeat:finite,reversingCar:finite,damagedCord:finite,snowRoof:finite,icicle:finite};
const lessons=load('ui/lessons.ts',['LESSONS','drawLesson','LESSON_CONTINUE','LESSON_REPLAY'],assets);
const {INFO}=load('meta/content.ts',['INFO'],{});
assert.deepEqual(Object.keys(lessons.LESSONS).sort(),Object.keys(INFO).sort(),'every topic has a picture lesson');
for(const cmd of Object.keys(INFO)) for(const time of [0,1.4,2.8,10]) {const before=drawings;lessons.drawLesson(cmd,18,158,324,288,time);assert.ok(drawings>before);assert.equal(depth,0);}
const quiet=load('ui/lessons.ts',['drawLesson'],{...assets,reduce:true});
for(const cmd of Object.keys(INFO)) quiet.drawLesson(cmd,18,158,324,288,0);
assert.equal(depth,0,'reduced-motion lessons render their final safe state');
const people=[];
let signs=0;
const riverLesson=load('ui/lessons.ts',['drawLesson'],{...assets,caregiver(...args){people.push(args);},bayraa(...args){people.push(args);},noSwimmingSign(){signs++;}});
for (const time of [0,1.4,3]) {
 people.length=0;riverLesson.drawLesson(Object.keys(INFO).find(cmd=>lessons.LESSONS[cmd]==='river'),0,0,320,240,time);
 assert.equal(people.length,2,'river lesson shows both caregiver and child');
 const [adult,child]=people;
 assert.ok(adult[0]+37*adult[2]<child[0]-37*child[2],'people remain separately visible throughout the lesson');
 assert.ok(child[0]+37*child[2]<200,'child stays entirely on dry land');
}
assert.equal(signs,3,'no-swimming sign remains visible throughout the river lesson');
let continued=0, spoken=0;
const g={state:'result',ok:false,st:0,effectDur:2.4,game:{cmd:Object.keys(INFO)[0],tip:'tip'}};
const meta=load('ui/meta.ts',['uiPress'],{ctx,W:360,H:640,reduce:false,g,games:[],infoOf(){return undefined;},OUTFITS:[],LESSON_CONTINUE:lessons.LESSON_CONTINUE,LESSON_REPLAY:lessons.LESSON_REPLAY,inHudHome(){return false;},inCircle:(c,x,y)=>Math.hypot(c.x-x,c.y-y)<c.r+10,HUD_SOUND:{x:140,y:36,r:20},canSpeak(){return false;},afterResult(){continued++;},speak(){spoken++;}});
meta.uiPress(218,526);assert.equal(continued,0,'early tap cannot skip the demonstration');
meta.uiPress(110,526);assert.equal(spoken,0,'hidden replay cannot skip the consequence');
g.st=3;meta.uiPress(218,526);assert.equal(continued,0,'continue waits for consequence plus lesson');
g.st=10;meta.uiPress(40,400);assert.equal(continued,0,'background tap cannot dismiss a lesson');
meta.uiPress(110,526);assert.equal(g.st,2.4);assert.equal(spoken,1,'replay restarts the animation and narration');
g.st=5.4;meta.uiPress(218,526);assert.equal(continued,1,'arrow advances after demonstration');
const widgets=load('ui/widgets.ts',['PRACTICE_BTN','SOUND_BTN','CARDS_BTN','TEACH_BTN','BACK_BTN','inBtn','inCircle'],{});
const menuState={state:'title'};
const selections=[];
const menus=load('ui/meta.ts',['uiPress','uiKey'],{
 ...widgets,g:menuState,W:360,H:640,games:[{cmd:'a'},{cmd:'b'}],infoOf(){return {};},OUTFITS:[],
 openScreen(s){menuState.state=s;},startPractice(i){selections.push(i);},sfx(){},
});
menus.uiPress(260,550);assert.equal(menuState.state,'practice','title practice button opens a separate menu');
menus.uiPress(100,150);assert.equal(selections.at(-1),0,'practice picture starts its selected round');
menus.uiKey('ArrowRight');menus.uiKey('Enter');assert.equal(selections.at(-1),1,'practice menu supports keyboard selection');
const ctl={};
const flow=load('flow.ts',['g','startRun','step','afterResult'],{ctl,games:[{cmd:'test',init(){},update(){}}],sfx(){},navigator:{},meta:{readingQuiz:false,allowed(){return true;},unlock(){return false;},quiz(){throw Error('child mode must not open a reading quiz');}},localStorage:{getItem(){return '["test"]';},setItem(){}}});
flow.startRun();flow.step(2);ctl.lose('miss');flow.step(60);assert.equal(flow.g.state,'result','failure explanation waits without a timeout');
flow.g.lives=0;flow.afterResult();assert.equal(flow.g.state,'over','child mode finishes without reading questions');
// Exercise actual failure transitions and result rendering for every lesson,
// including a timeout and the last life. Consequences precede the matching safe lesson.
for (const cmd of Object.keys(INFO)) for (const failure of ['mistake', 'timeout', 'last-life']) {
 const controls = {};
 const game = {cmd, tip:'tip', lose:'miss', init(){}, update(){}};
 const f = load('flow.ts',['g','startRun','step'],{
   ctl:controls,games:[game],sfx(){},navigator:{},
   meta:{readingQuiz:false,allowed(){return true;},unlock(){return false;}},
   localStorage:{getItem(){return JSON.stringify([cmd]);},setItem(){}},
 });
 f.startRun(); f.step(2);
 if (failure === 'last-life') f.g.lives=1;
 if (failure === 'timeout') f.step(6); else controls.lose('miss');
 assert.equal(f.g.state,'result'); assert.equal(f.g.ok,false);
 if (failure === 'last-life') assert.equal(f.g.lives,0);
 let shown = null, effect = null;
 const screen = load('ui/screens.ts',['drawResult'],{
   ctx,reduce:false,W:360,H:640,INFO,g:f.g,C:{ink:'#123',gold:'#fc0'},
   text(){},drawConsequence(id){effect=id;},drawLesson(id){shown=id;},lessonButton(){},canSpeak(){return false;},
   LESSON_CONTINUE:lessons.LESSON_CONTINUE,LESSON_REPLAY:lessons.LESSON_REPLAY,
 });
 screen.drawResult(); assert.equal(effect,cmd, failure+': matching consequence appears first');
 assert.equal(shown,null,'safe lesson does not cover the consequence');
 f.step(f.g.effectDur); screen.drawResult();
 assert.equal(shown,cmd,'safe explanation appears after the consequence');
 f.step(60); assert.equal(f.g.state,'result',failure+': lesson waits even on the last life');
}
console.log('Picture lessons, reduced motion, replay/continue and child-mode flow checks passed.');

const effects=load('ui/consequences.ts',['drawConsequence','consequenceMotion'],{...assets,LESSONS:lessons.LESSONS});
for(const cmd of Object.keys(INFO)) for(const time of [0,.8,1.8,2.4]) {
 const before=drawings;effects.drawConsequence(cmd,18,158,324,288,time);
 assert.ok(drawings>before);assert.equal(depth,0,'consequence restores drawing state');
}
const quietEffects=load('ui/consequences.ts',['drawConsequence'],{...assets,reduce:true,LESSONS:lessons.LESSONS});
for(const cmd of Object.keys(INFO)) quietEffects.drawConsequence(cmd,18,158,324,288,0);
assert.equal(depth,0);
console.log('All 19 consequences and reduced-motion alternatives render.');

for (const time of [0,.2,.5,1,1.05]) assert.equal(effects.consequenceMotion(time,false).reaction,0,'reaction follows exposure');
assert.equal(effects.consequenceMotion(1.05,false).approach,1);
assert.equal(effects.consequenceMotion(1.8,false).reaction,1);
assert.equal(effects.consequenceMotion(0,true).reaction,1,'reduced motion shows the final consequence immediately');

// Result panels and tiny menu cards must preserve the same character proportions.
const scaleCalls=[];
const originalScale=ctx.scale;
ctx.scale=(sx,sy)=>{scaleCalls.push([sx,sy]);finite(sx,sy);};
for (const render of [lessons.drawLesson,effects.drawConsequence]) for (const [w,h] of [[324,288],[92,66],[320,240]]) {
 scaleCalls.length=0;render(Object.keys(INFO)[0],0,0,w,h,2.8);
 assert.equal(scaleCalls[0][0],scaleCalls[0][1],'illustration uses uniform scale');
 assert.equal(scaleCalls[0][0],Math.min(w/320,h/240));
}
ctx.scale=originalScale;
const crossingPeople=[];
const crossingDemo=load('ui/lessons.ts',['drawLesson'],{...assets,bayraa(...args){crossingPeople.push(args);}});
const crossingCmd=Object.keys(INFO).find(cmd=>lessons.LESSONS[cmd]==='crossing');
for(const time of [0,1.05,1.15]){
 crossingPeople.length=0;crossingDemo.drawLesson(crossingCmd,0,0,320,240,time);
 assert.equal(crossingPeople[0][1],228,'child waits through red and the change to green');
}
crossingPeople.length=0;crossingDemo.drawLesson(crossingCmd,0,0,320,240,2.8);
assert.equal(crossingPeople[0][1],118,'completed crossing reaches the far pavement');
