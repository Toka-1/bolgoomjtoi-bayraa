import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

function load(file, names, bindings = {}) {
  const code = stripTypeScriptTypes(readFileSync(new URL('../src/' + file, import.meta.url), 'utf8'))
    .replace(/^import[\s\S]*?;\r?$/gm, '').replace(/^export \{[^\n]*\} from[^\n]*$/gm, '').replace(/export /g, '');
  return runInNewContext(code + '\n({' + names.join(',') + '})', {...bindings});
}

const ctl = {}, games = Array.from({length: 3}, (_, i) => ({cmd: String(i), init(){}, update(){}}));
let eligible = games;
const flow = load('flow.ts', ['g', 'startRun', 'startPractice', 'afterResult', 'ACTIONS'], {
  ctl, games, sfx(){}, navigator: {}, localStorage: {getItem(){return null;}},
  meta: {allowed: m => eligible.includes(m), unlock(){return true;}, reward(){return 4;}},
});
flow.startRun();
for (let bag = 0; bag < 4; bag++) {
  const seen = new Set();
  for (let i = 0; i < games.length; i++) {
    const index = games.indexOf(flow.g.game);
    assert.ok(!seen.has(index), 'a bag never repeats a game'); seen.add(index);
    assert.equal(ctl.stage, Math.min(2, 1 + Math.floor(flow.g.score / 6)));
    ctl.win();
    assert.equal(flow.g.reward, 4); assert.equal(flow.g.resDur, 2.8, 'new clothing gets time to preview');
    const alternatives = flow.g.bag.filter(n => flow.ACTIONS[n] !== flow.ACTIONS[index]);
    flow.afterResult();
    if (alternatives.length) assert.notEqual(flow.ACTIONS[games.indexOf(flow.g.game)], flow.ACTIONS[index]);
  }
}
eligible = [games[0]]; flow.startRun();
for (let i = 0; i < 3; i++) { assert.equal(flow.g.game, games[0]); ctl.win(); flow.afterResult(); }
flow.startPractice(1); assert.equal(ctl.stage, 1); assert.equal(flow.g.reward, -1);
assert.equal(ctl.variation, 0, 'practice resets layout variations');
assert.equal(flow.ACTIONS.length,30);
assert.deepEqual(Array.from(flow.ACTIONS).slice(19,22),['drag','hold','drag']);

const { OUTFITS, look } = load('art/look.ts', ['OUTFITS', 'look']);
let stored = null;
const storage = {getItem(){return stored;}, setItem(k,v){stored=v;}};
const bindings = {OUTFITS, look, TOPICS: [{id:'home'}], infoOf: () => ({}), localStorage: storage};
const progress = load('meta/progress.ts', ['progress', 'unlockCard', 'wear'], bindings);
assert.equal(progress.wear('winter'), false);
for (let i = 0; i < 20; i++) progress.unlockCard(String(i));
assert.equal(progress.wear('winter'), true); assert.equal(look.outfit.hat, 'winter');
look.outfit = OUTFITS[0];
load('meta/progress.ts', ['progress'], bindings);
assert.equal(look.outfit.id, 'winter', 'earned outfit survives a reload');
for(let i=20;i<30;i++)progress.unlockCard(String(i));
assert.equal(progress.wear('festival'), true);
assert.equal(look.outfit.celebration, 2);

const {DragKeys} = load('core/dragKeys.ts', ['DragKeys']);
const events = {stage:2, wins:0, win(){this.wins++;}};
const effects = [];
const {Hat, HEAD_Y} = load('games/hat.ts', ['Hat','HEAD_Y'], {
  ctl:events, DragKeys, W:360,H:640,rand:(a,b)=>(a+b)/2,
  dist:(a,b,c,d)=>Math.hypot(a-c,b-d),sfx:name=>effects.push(name),
});
const hat = new Hat(); hat.init(); const x = hat.hx;hat.update(.25);
assert.notEqual(hat.hx,x,'late-round wind moves the loose hat');
hat.down(hat.hx,hat.hy-14);const held=hat.hx;hat.update(.25);
assert.equal(hat.hx,held,'wind never fights a held pointer');
hat.move(180,HEAD_Y-14);hat.cancelInput();hat.up();assert.equal(events.wins,0);
hat.down(hat.hx,hat.hy-14);hat.up();assert.equal(events.wins,1);assert.deepEqual(effects,['settle']);
hat.resultUpdate(1);assert.equal(hat.settled,1);hat.init();assert.equal(hat.settled,0);
events.stage=0;hat.init();const practiceX=hat.hx;hat.update(1);assert.equal(hat.hx,practiceX);

const {Crossing}=load('games/crossing.ts',['Crossing'],{
  ctl:events,rand:(a,b)=>(a+b)/2,CAR_PAINTS:['blue'],W:360,sfx(){},
});
events.stage=2;const crossing=new Crossing();crossing.init();
crossing.update(crossing.redT-.01);assert.equal(crossing.green,false);
crossing.update(.02);assert.equal(crossing.green,true);crossing.down();assert.equal(events.wins,2);
assert.ok(crossing.redT<5,'even the latest green leaves a response window');

const fixedMath = Object.create(Math);fixedMath.random=()=>.75;
const {Ice}=load('games/ice.ts',['Ice'],{ctl:events,Math:fixedMath});
events.stage=0;const easyIce=new Ice();easyIce.init();easyIce.update(.36);
events.stage=2;const hardIce=new Ice();hardIce.init();hardIce.update(.36);
assert.ok(hardIce.w>easyIce.w,'later ice stages have stronger slips');
assert.ok(hardIce.slipIn<easyIce.slipIn,'later ice stages have more frequent slips');

const notes=[];const intervals=[];
const param={setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}};
const node=()=>({connect(){return this;},start(t){assert.ok(Number.isFinite(t));},stop(t){assert.ok(Number.isFinite(t));},gain:{...param,value:0},frequency:{...param,value:0},Q:{value:0}});
class Audio {
  currentTime=0;state='running';destination={};
  createGain(){return node();}createBiquadFilter(){return node();}
  createOscillator(){const n=node();notes.push(n);return n;}
}
const audio=load('core/audio.ts',['unlockAudio','setMusicScene','schedule'],{
  window:{AudioContext:Audio,setInterval(fn){intervals.push(fn);return 1;}},
});
audio.unlockAudio();audio.setMusicScene(false,1,false);audio.schedule();
const menuNotes=notes.length;
// Fresh context lets us compare equal scheduler windows.
notes.length=0;
const fastAudio=load('core/audio.ts',['unlockAudio','setMusicScene','schedule'],{
  window:{AudioContext:Audio,setInterval(){return 1;}},
});
fastAudio.unlockAudio();fastAudio.setMusicScene(true,2.3,true);fastAudio.schedule();
assert.ok(notes.length>menuNotes,'urgent gameplay adds a faster pulse');

for (const variation of [-1,0,1]) {
  const outcome={stage:2,variation,wins:0,losses:0,win(){this.wins++;},lose(){this.losses++;}};
  const bindings={ctl:outcome,DragKeys,W:360,H:640,sfx(){},dist:(a,b,c,d)=>Math.hypot(a-c,b-d)};
  const {Baby}=load('games/baby.ts',['Baby'],bindings);
  const baby=new Baby();baby.init();
  assert.equal(baby.bx,290+variation*15);
  baby.down(baby.bx,baby.by-16);baby.move(290,444);baby.up();assert.equal(outcome.wins,1);
  baby.init();baby.update(5);assert.equal(outcome.losses,1);baby.init();assert.equal(baby.dead,false);

  const {Seatbelt}=load('games/seatbelt.ts',['Seatbelt'],bindings);
  const belt=new Seatbelt();belt.init();const home=[belt.x,belt.y];
  belt.down(belt.x,belt.y);belt.move(218,451);belt.cancelInput();belt.up();
  assert.deepEqual([belt.x,belt.y],home);assert.equal(outcome.wins,1);
  belt.down(belt.x,belt.y);belt.move(218,451);belt.up();assert.equal(outcome.wins,2);

  const {Dog}=load('games/dog.ts',['Dog'],bindings);
  const dog=new Dog();dog.init();dog.down(variation>0?300:60,450);assert.equal(outcome.wins,3);
  dog.init();dog.down(variation>0?85:275,535);assert.equal(outcome.losses,2);
  dog.init();dog.key(variation>0?'ArrowRight':'ArrowLeft',true);assert.equal(outcome.wins,4);
}

for (const [file,name,seconds] of [
  ['drink','Drink',3.5],['cleaner','Cleaner',3.4],
  ['prevention','Reversing',3.5],['prevention','Icicles',3.7],
]) {
  const outcome={stage:2,wins:0,losses:0,win(){this.wins++;},lose(){this.losses++;}};
  const {[name]:Game}=load('games/'+file+'.ts',[name],{
    ctl:outcome,DragKeys,W:360,H:640,sfx(){},dist:(a,b,c,d)=>Math.hypot(a-c,b-d),
  });
  const m=new Game();m.init();m.update(seconds+.01);assert.equal(outcome.losses,1,name+' has an advanced failure path');
  m.init();if(name==='Cleaner')m.key('ArrowUp',true);else m.down(60,450);
  assert.equal(outcome.wins,1,name+' retains a reachable safe action');m.update(10);assert.equal(outcome.losses,1);
}

// Verify the actual render loop calls action highlights only while a round is active.
const noop=()=>{};let hints=0;
const canvas=new Proxy({}, {get:()=>noop,set:()=>true});
const scene={state:'play',score:0,lives:3,frac:0,practice:false,st:0,effectDur:2.4,ok:false,failures:new Map(),
  game:{draw:noop,danger:noop,hint(){hints++;}}};
const {render}=load('ui/screens.ts',['render'],{
  levelFrame:()=>({x:8,y:96,w:344,h:500}),drawLevelView:(m,active,showHints)=>{m.draw();if(active){m.danger?.();if(showHints)m.hint?.();}},ctx:canvas,W:360,H:640,C:{ink:'#123',gold:'#fc0'},g:scene,reduce:true,
  games,HUD_HOME:{},HUD_SOUND:{},circ:noop,rad:noop,lin:noop,rr:noop,text:noop,
  grain:noop,vignette:noop,goldFace:noop,homeIcon:noop,soundIcon:noop,audioEnabled:()=>false,drawConsequence:noop,
});
render();assert.equal(hints,0,'scored rounds leave the solution for the player to discover');
scene.practice=true;render();assert.equal(hints,0,'practice uses the same gameplay UI as scored play');
scene.failures.set(scene.game.cmd,2);render();assert.equal(hints,0,'two failures do not reveal hints');
scene.failures.set(scene.game.cmd,3);render();assert.equal(hints,1,'three failures reveal hints');
scene.practice=false;render();assert.equal(hints,2,'scored play also shows unlocked hints');
scene.state='result';render();assert.equal(hints,2,'results do not draw gameplay hints');
console.log('Round variety, difficulty stages, persistent outfits, wind and crossing checks passed.');
