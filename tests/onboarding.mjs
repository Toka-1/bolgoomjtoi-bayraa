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
console.log('Immediate gameplay and separate practice checks passed.');
