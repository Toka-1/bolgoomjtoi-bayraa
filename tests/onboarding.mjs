import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const source = stripTypeScriptTypes(readFileSync(new URL('../src/flow.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;$/gm, '').replace(/export /g, '');
function setup(saved = '[]', blocked = false) {
  const storage = new Map([['bayraa-learned-v1', saved]]);
  const ctl = {};
  let updates = 0;
  const game = { cmd: 'test-game', lose: 'try again', dead: false, init() {}, update() { updates++; } };
  const flow = runInNewContext(source + '\n({ g, startRun, beginPractice, step, afterResult });', {
    ctl, games: [game], sfx() {}, navigator: {},
    localStorage: {
      getItem(key) { if (blocked) throw Error('blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw Error('blocked'); storage.set(key, value); },
    },
  });
  return { ...flow, ctl, game, storage, updates: () => updates };
}

for (const [saved, blocked] of [['[]', false], ['invalid JSON', false], ['null', false], ['[]', true]]) {
  const f = setup(saved, blocked);
  f.startRun();
  assert.equal(f.g.practice, true);
  f.step(30);
  assert.equal(f.g.state, 'intro', 'first instruction waits for the player');
  f.beginPractice();
  f.ctl.lose('miss');
  assert.equal(f.g.lives, 3);
  f.afterResult();
  assert.equal(f.g.practice, true, 'failure repeats practice');
  f.beginPractice();
  f.ctl.win();
  assert.equal(f.g.score, 0);
  assert.equal(f.g.speed, 1);
  f.step(0.1);
  assert.equal(f.updates(), 0, 'result freezes gameplay');
  f.afterResult();
  assert.equal(f.g.practice, false);
  assert.equal(f.g.game, f.game, 'practice leads to the same scored game');
  f.step(1.5);
  assert.equal(f.g.state, 'play');
  f.ctl.win();
  assert.equal(f.g.score, 1);
  f.afterResult();
  assert.equal(f.g.practice, false, 'learned game skips practice');
  if (!blocked) assert.deepEqual(JSON.parse(f.storage.get('bayraa-learned-v1')), ['test-game']);
}
const returning = setup('["test-game"]');
returning.startRun();
assert.equal(returning.g.practice, false, 'saved learning survives reload');
returning.step(1.5);
returning.ctl.lose('miss');
assert.equal(returning.g.lives, 2, 'normal failures still cost lives');
const survival = setup();
survival.game.timeoutWin = true;
survival.startRun(); survival.beginPractice(); survival.step(5);
assert.equal(survival.g.ok, true);
assert.equal(survival.g.score, 0);
console.log('Practice flow checks passed.');
