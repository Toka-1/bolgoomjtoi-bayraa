import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
function load(file,names,bindings={}) {
 const code=stripTypeScriptTypes(readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).replace(/^import[\s\S]*?;\r?$/gm,'').replace(/export /g,'');
 return runInNewContext(code+'\n({'+names.join(',')+'})',bindings);
}
const {DragKeys}=load('core/dragKeys.ts',['DragKeys']);
function setup(file,name) {
 const events={wins:0,losses:0,win(){this.wins++;},lose(){this.losses++;}};
 const people=[];
 const noop=()=>{};
 const { [name]: Game }=load('games/'+file+'.ts',[name],{
   ctl:events,DragKeys,W:360,H:640,dist:(a,b,c,d)=>Math.hypot(a-c,b-d),
   ctx:{save(){},restore(){},fillRect(){},set globalAlpha(v){}},layer(){},
   bayraa(...args){people.push(args);},caregiver:noop,dog:noop,hotCup:noop,baby:noop,manhole:noop,
   rr:noop,lin:noop,
 });
 return {m:new Game(),events,people};
}
{
 const {m,events}=setup('dog','Dog');m.init();m.down(180,200);assert.equal(events.wins,0);
 m.down(60,450);assert.equal(events.wins,1);m.down(275,535);assert.equal(events.losses,0);
 m.init();m.down(275,535);assert.equal(events.losses,1);m.down(60,450);assert.equal(events.wins,1);
 m.init();m.key('ArrowLeft',false);assert.equal(events.wins,1);m.key('ArrowLeft',true);assert.equal(events.wins,2);
}
{
 const {m,events}=setup('drink','Drink');m.init();m.down(60,430);assert.equal(events.wins,1);
 const reach=m.reach;m.update(10);assert.equal(m.reach,reach,'adult assistance stops the baby reaching the cloth');
 m.resultUpdate(1);assert.equal(m.moved,1);
 m.init();m.down(269,385);assert.equal(events.losses,1,'child touching the hot cup fails');
 m.down(60,430);assert.equal(events.wins,1,'cannot reverse a failure');
 m.init();m.update(4.3);assert.equal(events.losses,2,'baby reaching the tablecloth causes a spill');
 m.init();m.key('ArrowLeft',true);assert.equal(events.wins,2);
}
for(const side of [65,295]) {
 const {m,events,people}=setup('manhole','Manhole');m.init();m.down(side,470);
 for(let i=0;i<130;i++) {
   m.update(1/60);m.draw();const [x,y]=people.at(-1);
   assert.ok(((x-180)/62)**2+((y-465)/35)**2>1,'safe route never crosses the opening');
 }
 assert.equal(events.wins,1,'either side route wins once');assert.equal(events.losses,0);
 m.init();m.down(180,465);assert.equal(events.losses,1,'clicking the opening fails');
 m.down(side,470);m.update(3);assert.equal(events.wins,1);
}
{
 const {m,events}=setup('seatbelt','Seatbelt');m.init();
 m.down(123,398);m.move(140,490);m.up();assert.equal(events.wins,0,'dropping away from buckle does not fasten');
 m.select(123,398);m.move(218,451);m.cancelInput();m.up();assert.equal(events.wins,0,'cancel cannot fasten a belt');
 m.select(123,398);m.move(218,451);m.select(218,451);assert.equal(events.wins,1);
 m.up();m.select(218,451);assert.equal(events.wins,1,'belt scores once');
 m.init();m.key('Enter',true);assert.equal(m.drag,false,'Enter does not select the belt');
 m.down(123,398);m.key('ArrowRight',true);m.update(0.2);m.key('ArrowRight',false);assert.ok(m.x>123);
 m.cancelInput();assert.equal(m.drag,false);assert.equal(m.x,123);
}
{
 const {m,events}=setup('balcony','Balcony');m.init();m.down(65,460);assert.equal(events.wins,1);
 m.resultUpdate(1);assert.equal(m.walk,1,'child returns indoors');
 m.down(260,430);assert.equal(events.losses,0,'safe child cannot fail again');
 m.init();m.down(260,430);assert.equal(events.losses,1,'climbing the rail fails');
 m.down(65,460);assert.equal(events.wins,1);m.init();m.key('ArrowLeft',true);assert.equal(events.wins,2);
}
{
 const {m,events}=setup('cleaner','Cleaner');m.init();m.down(321,443);assert.equal(events.wins,1);
 m.update(10);assert.equal(m.approach,0,'closing cabinet stops the approach');
 m.resultUpdate(1);assert.equal(m.door,1,'door fully covers stored bottles');
 m.down(216,490);assert.equal(events.losses,0);
 m.init();m.down(216,490);assert.equal(events.losses,1,'touching the cleaning bottles fails');
 m.down(321,443);assert.equal(events.wins,1);m.init();m.update(4.2);assert.equal(events.losses,2);
 m.init();m.key('ArrowUp',true);assert.equal(events.wins,2);
}
for(const [name,point] of [['Reversing',[300,550]],['Cord',[270,578]],['Icicles',[260,570]]]) {
 const {m,events}=setup('prevention',name);m.init();
 m.down(180,100);assert.equal(events.wins,0,'background is not a safe-action button');
 m.down(60,450);assert.equal(events.wins,1);
 const approach=m.approach;m.update(10);assert.equal(m.approach,approach,'safe choice stops hazard approach');
 m.down(...point);assert.equal(events.losses,0,'safe result cannot fail');
 m.resultUpdate(1);assert.equal(m.walk,1);
 m.init();m.down(...point);assert.equal(events.losses,1,'dangerous choice fails');
 m.down(60,450);m.down(...point);m.update(10);
 assert.equal(events.wins,1);assert.equal(events.losses,1,'failure resolves once');
 m.init();m.key('ArrowLeft',false);assert.equal(events.wins,1);
 m.key('ArrowLeft',true);assert.equal(events.wins,2);
 m.init();m.update(4.4);assert.equal(events.losses,name==='Cord'?1:2,'approaching danger has a deadline; leaving cord alone is safe');
}
{
 const {m,events}=setup('prevention','Cord');m.init();
 m.down(267,532);assert.equal(events.losses,0,'empty space above the floor cord is not live wire');
 m.down(270,578);assert.equal(events.losses,1,'exposed copper shares the drawn floor anchor');
}
{
 const {m,events}=setup('prevention','Icicles');m.init();
 m.down(260,450);assert.equal(events.losses,0,'the wall below the roof is not the falling-ice target');
 for(let i=0;i<430&&!m.dead;i++)m.update(.01);
 assert.equal(events.losses,1);
 assert.ok(m.fallingTip().y>=591-109*1.1&&m.fallingTip().y<473,'failure starts at head height rather than after ground impact');
}
for(const name of ['Reversing','Cord','Icicles']) {
 const {m,people}=setup('prevention',name);m.init();m.down(60,450);
 for(let i=0;i<60;i++) {
  m.resultUpdate(1/60);m.people();const [x,y]=people.at(-1);
  assert.equal(y,591,'retreat does not float up the floor');
  assert.ok(x>=146&&x<=182,'retreat stays on the clear path');
 }
 if(name==='Reversing')assert.ok(m.vehicle().x>xRight(182),'car starts beyond the child footprint');
}
function xRight(x){return x+37*1.1;}
for(const [file,name] of [['dog','Dog'],['drink','Drink'],['manhole','Manhole'],['seatbelt','Seatbelt'],['balcony','Balcony'],['cleaner','Cleaner'],['prevention','Reversing'],['prevention','Cord'],['prevention','Icicles']]) {
 const {m,events}=setup(file,name);
 const f=load('flow.ts',['g','startRun','step'],{ctl:events,games:[m],sfx(){},navigator:{},meta:{allowed(){return true;},unlock(){return false;},readingQuiz:false},localStorage:{getItem(){return null;},setItem(){}}});
 f.startRun();f.step(5.1);assert.equal(f.g.state,'result');assert.equal(f.g.ok,name==='Cord');
 if(name==='Cord')continue;
 f.step(60);assert.equal(f.g.state,'result','timeout lesson waits for the child');
}
// Every new game remains reachable on the second practice page.
const widgets=load('ui/widgets.ts',['PRACTICE_BTN','SOUND_BTN','CARDS_BTN','TEACH_BTN','BACK_BTN','inBtn','inCircle']);
const g={state:'title'},picked=[],games=Array.from({length:19},(_,i)=>({cmd:String(i)}));
const menus=load('ui/meta.ts',['uiPress','uiKey','drawPractice'],{
 ...widgets,g,games,W:360,H:640,OUTFITS:[],infoOf:()=>({card:'test'}),
 openScreen(s){g.state=s;},startPractice(i){picked.push(i);},sfx(){},
});
menus.uiPress(260,550);menus.uiPress(290,526);menus.uiKey('Enter');assert.equal(picked.at(-1),9);
menus.uiKey('ArrowRight');menus.uiKey('Enter');assert.equal(picked.at(-1),10);
menus.uiKey('ArrowRight');menus.uiKey('Enter');assert.equal(picked.at(-1),11);
menus.uiKey('ArrowRight');menus.uiKey('Enter');assert.equal(picked.at(-1),12);
for(let i=13;i<=15;i++){menus.uiKey('ArrowRight');menus.uiKey('Enter');assert.equal(picked.at(-1),i);}
menus.uiPress(64,380);assert.equal(picked.at(-1),15,'third-row practice tile is visible and clickable');
for(let i=16;i<=18;i++){menus.uiKey('ArrowRight');menus.uiKey('Enter');assert.equal(picked.at(-1),i);}
menus.uiPress(180,140);assert.equal(picked.at(-1),18,'third page exposes the nineteenth round');
menus.uiPress(70,526);
menus.uiPress(70,526);menus.uiKey('Enter');assert.equal(picked.at(-1),0);
console.log('New levels: win/failure paths, safe routes, timeouts and menu pagination passed.');
