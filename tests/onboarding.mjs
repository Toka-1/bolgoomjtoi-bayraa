import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
const source = stripTypeScriptTypes(readFileSync(new URL('../src/flow.ts', import.meta.url), 'utf8')).replace(/^import .*;$/gm, '').replace(/export /g, '');
function setup(saved = '[]', blocked = false) {
  const ctl = {}; let unlocks=0, narrations=0;
  const games = ['first','second'].map(cmd=>({cmd,lose:'miss',dead:false,init(){},update(){}}));
  const flow=runInNewContext(source+'\n({g,startRun,startPractice,step,afterResult,goHome})',{
    ctl,games,sfx(){},navigator:{},
    meta:{readingQuiz:false,unlock(){unlocks++;return true;},narrate(){narrations++;},allowed(){return true;},quiz(){return [];}},
    localStorage:{getItem(){if(blocked)throw Error('blocked');return saved;},setItem(){}},
  });
  return {...flow,ctl,games,unlocks:()=>unlocks,narrations:()=>narrations};
}
for(const [saved,blocked] of [['[]',false],['invalid JSON',false],['null',false],['[]',true]]) {
  const f=setup(saved,blocked); f.startRun();
  assert.equal(f.g.state,'play','normal run starts immediately without instructions');
  assert.equal(f.g.practice,false); assert.equal(f.narrations(),0,'no instruction narration at round start');
  f.ctl.win();assert.equal(f.g.score,1);f.afterResult();
  assert.equal(f.g.state,'play');assert.equal(f.g.practice,false,'next round never inserts practice');
  f.startPractice(1);assert.equal(f.g.state,'play');assert.equal(f.g.game,f.games[1]);assert.equal(f.g.practice,true);
  assert.equal(f.g.speed,1);assert.equal(f.g.score,0);
  const unlocks=f.unlocks();f.ctl.lose('miss');assert.equal(f.g.lives,3);
  f.step(60);assert.equal(f.g.state,'result','practice failures still show the explanation');
  f.afterResult();assert.equal(f.g.state,'play');assert.equal(f.g.game,f.games[1]);assert.equal(f.g.practice,true,'retry remains in practice');
  f.ctl.win();assert.equal(f.g.score,0);assert.equal(f.unlocks(),unlocks,'practice cannot earn cards');
  f.step(2);assert.equal(f.g.state,'practice','practice win returns to selection');
  f.startPractice(0);assert.equal(f.g.game,f.games[0]);f.goHome();f.startRun();
  assert.equal(f.g.practice,false);assert.equal(f.g.state,'play');
  const round=f.g.round;f.startPractice(-1);f.startPractice(999);f.startPractice(NaN);assert.equal(f.g.round,round);
}
const survival=setup();survival.games[0].timeoutWin=true;survival.startPractice(0);survival.step(5);
assert.equal(survival.g.ok,true);assert.equal(survival.g.score,0);assert.equal(survival.g.lives,3);

const hints=setup();hints.startPractice(0);
for(let attempt=1;attempt<=3;attempt++){
  hints.ctl.lose('miss');hints.ctl.lose('duplicate');
  assert.equal(hints.g.failures.get('first'),attempt,'each failed round counts once');
  hints.afterResult();
}
assert.equal(hints.g.failures.get('first')>=3,true,'third failure enables hints on retry');
hints.startPractice(1);
assert.equal(hints.g.failures.get('second')??0,0,'levels track failures separately');
hints.step(5);assert.equal(hints.g.failures.get('second'),1,'timeouts count as failures');
hints.goHome();hints.startRun();
assert.equal(hints.g.failures.get('first'),3,'failures survive new runs');

const harder=setup();harder.startRun();
assert.equal(harder.g.speed,1.35);
assert.equal(harder.g.dur,5/1.35);
let simulated=0;harder.g.game.update=dt=>{simulated+=dt;};
harder.step(.5);assert.equal(simulated,.675,'hazards use the same faster pace as the timer');
for(let wins=1;wins<=30;wins++) {
  const previous=harder.g.speed;
  harder.ctl.win();
  assert.equal(harder.g.faster,wins%3===0 && previous<2.3);
  assert.equal(harder.g.speed,wins%3===0?Math.min(2.3,previous*1.15):previous);
  harder.afterResult();assert.equal(harder.g.dur,5/harder.g.speed);
}
assert.equal(harder.g.speed,2.3,'difficulty remains capped');
harder.startRun();assert.equal(harder.g.speed,1.35,'new runs reset the difficulty');
harder.step(harder.g.dur);assert.equal(harder.g.ok,false);assert.equal(harder.g.lives,2);
const failedGame=harder.g.game;
harder.afterResult();assert.notEqual(harder.g.game,failedGame,'a mistake moves on to another available level');
assert.equal(harder.g.state,'play');assert.equal(harder.g.lives,2);assert.equal(harder.g.st,0);
harder.ctl.lose('miss');harder.afterResult();assert.equal(harder.g.lives,1);
harder.ctl.lose('miss');harder.afterResult();assert.equal(harder.g.state,'over','the final life ends the run instead of retrying forever');
harder.startPractice(0);assert.equal(harder.g.dur,5);assert.equal(harder.g.speed,1);
harder.ctl.lose('miss');harder.afterResult();assert.equal(harder.g.dur,5);
console.log('Immediate gameplay and separate practice checks passed.');

const failureSequence=setup();failureSequence.startPractice(0);failureSequence.ctl.lose('unsafe');
assert.equal(failureSequence.narrations(),0,'no lesson narration over the consequence');
failureSequence.step(failureSequence.g.effectDur-.1);assert.equal(failureSequence.narrations(),0);
failureSequence.step(.2);assert.equal(failureSequence.narrations(),1,'lesson narration starts after consequence');
failureSequence.step(10);assert.equal(failureSequence.narrations(),1,'narration starts only once');
