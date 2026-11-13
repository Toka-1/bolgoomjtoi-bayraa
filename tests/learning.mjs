import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

function load(file, names, bindings = {}) {
  const code = stripTypeScriptTypes(readFileSync(new URL('../src/' + file, import.meta.url), 'utf8'))
    .replace(/^import[\s\S]*?;\r?$/gm, '').replace(/^export \{[^\n]*\} from[^\n]*$/gm, '').replace(/export /g, '');
  return runInNewContext(code + '\n({' + names.join(',') + '})', { ...bindings });
}

// --- learning record ---
const store = new Map();
const localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
const L = load('meta/learning.ts', ['learning', 'recordAttempt', 'recordQuiz', 'masteryOf', 'summary', 'weakest', 'loadLearning', 'resetLearning', 'MIN_LATER'], { localStorage });
const cmds = ['A', 'B', 'C', 'D'];

let s = L.summary(cmds);
assert.equal(s.tried, 0); assert.equal(s.laterRate, null, 'no comparison before any play');
assert.equal(L.masteryOf('A'), 'new');

// First tries: A and B fail, C succeeds. That is the "before the lesson" score.
L.recordAttempt('A', false); L.recordAttempt('B', false); L.recordAttempt('C', true);
s = L.summary(cmds);
assert.equal(s.tried, 3); assert.equal(Math.round(s.firstRate * 100), 33);
assert.equal(s.laterRate, null, 'later rate waits for enough repeat attempts');
assert.equal(L.masteryOf('A'), 'learning');

// After the lesson A and B are handled safely twice.
for (const c of ['A', 'B']) { L.recordAttempt(c, true); L.recordAttempt(c, true); }
s = L.summary(cmds);
assert.equal(s.laterAttempts, 4);
assert.equal(s.laterRate, 1, 'every attempt after the first was safe');
assert.ok(s.laterRate > s.firstRate, 'progress shows as an improvement');
assert.equal(L.masteryOf('A'), 'learned'); assert.equal(L.masteryOf('C'), 'learning', 'one lucky first try is not mastery');
assert.equal(s.learned, 2);

// A fresh mistake resets the streak and puts the hazard back on the practice list.
L.recordAttempt('A', false);
assert.equal(L.masteryOf('A'), 'learning');
assert.equal(L.weakest(cmds)[0], 'A', 'the most recently missed hazard is listed first');
assert.ok(!L.weakest(cmds).includes('B'), 'learned hazards are not listed');
assert.ok(!L.weakest(cmds).includes('D'), 'untried hazards are not listed');

// Quiz before/after keeps the first result and the latest one.
L.recordQuiz(1, 3); L.recordQuiz(3, 3);
assert.deepEqual({ ...L.learning.quizFirst }, { right: 1, total: 3 });
assert.deepEqual({ ...L.learning.quizLast }, { right: 3, total: 3 });
L.recordQuiz(2, 0); assert.equal(L.learning.quizLast.right, 3, 'an empty quiz is ignored');

// Persistence round-trip and defensive loading.
const saved = JSON.parse(store.get('bayraa-learning-v1'));
L.loadLearning(saved);
assert.equal(L.learning.stats.A.a, 4); assert.equal(L.masteryOf('B'), 'learned');
L.loadLearning({ stats: { X: { a: -2 }, Y: 'bad', Z: { a: 2, w: 9, first: 7, later: [1, 'x', 0] } }, quizFirst: { right: 5, total: 2 } });
assert.equal(L.learning.stats.X, undefined); assert.equal(L.learning.stats.Y, undefined);
assert.equal(L.learning.stats.Z.w, 2, 'wins never exceed attempts'); assert.equal(L.learning.stats.Z.first, 0);
assert.deepEqual([...L.learning.stats.Z.later], [1, 0, 0]);
assert.deepEqual({ ...L.learning.quizFirst }, { right: 2, total: 2 });
L.resetLearning(); assert.equal(L.summary(cmds).tried, 0);

// --- flow: every result is recorded, and a missed hazard returns later in the run ---
const ctl = {}, games = Array.from({ length: 4 }, (_, i) => ({ cmd: 'g' + i, lose: 'x', init() {}, update() {} }));
const log = [], quizzes = [];
let metaStub;
const flow = load('flow.ts', ['g', 'startRun', 'afterResult', 'startPractice', 'answerQuiz', 'step'], {
  ctl, games, sfx() {}, navigator: {}, localStorage: { getItem() { return null; } },
  meta: metaStub = { allowed: () => true, unlock() { return false; }, reward() { return -1; }, record: (c, ok) => log.push([c, ok]),
    recordQuiz: (r, t) => quizzes.push([r, t]), readingQuiz: true, quiz: () => [{ cmd: 'g0', q: '?', a: ['1', '2', '3'], ok: 0 }] },
});
flow.startRun();
const first = flow.g.game;
ctl.lose('x');
assert.deepEqual(log.at(-1), [first.cmd, false]);
assert.ok(flow.g.bag.includes(games.indexOf(first)), 'the missed hazard is queued again');
flow.afterResult();
assert.notEqual(flow.g.game, first, 'but never straight away');
ctl.win(); assert.deepEqual(log.at(-1), [flow.g.game.cmd, true]);
let guard = 0;
while (flow.g.game !== first && guard++ < 10) { flow.afterResult(); ctl.win(); }
assert.equal(flow.g.game, first, 'the missed hazard came back in the same run');
// practice attempts are recorded but never re-queued
flow.startPractice(2); const bagBefore = [...flow.g.bag]; ctl.lose('x');
assert.deepEqual(log.at(-1), ['g2', false]); assert.deepEqual([...flow.g.bag], bagBefore);
// end of run: the quiz result is stored
metaStub.readingQuiz = true; // practice switches the reading quiz off
flow.startRun(); for (let i = 0; i < 3; i++) { ctl.lose('x'); if (flow.g.lives > 0) flow.afterResult(); }
flow.afterResult();
assert.equal(flow.g.state, 'quiz');
flow.answerQuiz(0); flow.step(1.3);
assert.equal(flow.g.state, 'over');
assert.deepEqual(quizzes, [[1, 1]], 'the end-of-run quiz is recorded once');
console.log('Learning record: first try vs after the lesson, mastery, weak list, quiz before/after and spaced retry passed.');
