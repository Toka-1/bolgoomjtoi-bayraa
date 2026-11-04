import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

function load(path, names, bindings = {}) {
  const code = stripTypeScriptTypes(readFileSync(new URL('../src/' + path, import.meta.url), 'utf8'))
    .replace(/^import .*;$/gm, '').replace(/export /g, '');
  return runInNewContext(code + '\n({' + names.join(',') + '})', bindings);
}
const ctl = { wins: 0, losses: 0, win() { this.wins++; }, lose() { this.losses++; } };
const { DragKeys } = load('core/dragKeys.ts', ['DragKeys']);
const gameBindings = { ctl, DragKeys, sfx() {}, W: 360, H: 640, rand: (a,b) => (a+b)/2, dist: (a,b,c,d) => Math.hypot(a-c,b-d) };
const { Hat } = load('games/hat.ts', ['Hat'], gameBindings);
const hat = new Hat(); hat.init();
hat.key('Enter', true); hat.key(' ', true); assert.equal(hat.drag, false, 'keyboard activation no longer selects');
hat.select(hat.hx, hat.hy - 14); hat.move(180, 455); hat.select(180, 455);
assert.equal(ctl.wins, 1, 'hat can be picked up, moved and dropped with right-click');
const { Baby } = load('games/baby.ts', ['Baby'], gameBindings);
const baby = new Baby(); baby.init();
baby.key('Enter', true); baby.key(' ', true); assert.equal(baby.drag, false);
baby.select(290, 529); baby.move(290, 324); baby.select(290, 324);
assert.equal(ctl.wins, 2, 'baby can be rescued with right-click');
baby.init(); baby.select(290, 529); baby.move(290, 324); baby.cancelInput(); baby.up();
assert.equal(ctl.wins, 2, 'cancellation must not submit a successful drop');
const { Smoke } = load('games/smoke.ts', ['Smoke'], gameBindings);
const smoke = new Smoke(); smoke.init();
smoke.key?.('Enter', true); smoke.key?.(' ', true);
assert.equal(ctl.wins, 2, 'Enter/Space cannot open the window');
for (const [x, y] of [[100, 400], [205, 210], [335, 210], [270, 145], [270, 275]]) smoke.down(x, y);
assert.equal(ctl.wins, 2, 'clicks outside the visible window cannot open it');
smoke.down(270, 210);
assert.equal(ctl.wins, 3);
smoke.down(270, 210); assert.equal(ctl.wins, 3, 'window opens only once');
const { Socket } = load('games/socket.ts', ['Socket'], gameBindings);
const socket = new Socket(); socket.init(); socket.key(' ', false); assert.equal(ctl.losses, 0);
socket.key(' ', true); assert.equal(ctl.losses, 1);
socket.resultUpdate(1); assert.equal(socket.zap, 0);
const { Cow } = load('games/cow.ts', ['Cow'], gameBindings);
const cow = new Cow(); cow.init(); cow.key(' ', true); cow.key('ArrowDown', true); cow.key(' ', false);
assert.equal(cow.hold, true, 'releasing one brake key preserves another');
cow.down(); cow.key('ArrowDown', false); assert.equal(cow.hold, true);
cow.up(); assert.equal(cow.hold, false);
cow.key(' ', true); cow.cancelInput(); assert.equal(cow.hold, false);
const { Ice } = load('games/ice.ts', ['Ice'], gameBindings);
const ice = new Ice(); ice.init(); ice.key('ArrowLeft', true); assert.ok(ice.w < 0, 'Left leans Bayraa left');
ice.dead = true; ice.a = 0.3; ice.w = 0; const lean = Math.abs(ice.a); ice.resultUpdate(0.1); assert.ok(Math.abs(ice.a) > lean, 'fall finishes during result');

const { Dust } = load('games/dust.ts', ['Dust'], gameBindings);
const dust = new Dust(); dust.init();
const gerAt = dust.kinds.indexOf('ger'), wrong = dust.kinds.findIndex(k => k !== 'ger');
const w0 = ctl.wins, l0 = ctl.losses;
dust.pick(wrong); assert.equal(ctl.losses, l0 + 1, 'running to the sheep or tree loses');
dust.pick(gerAt); assert.equal(ctl.wins, w0, 'only one choice per round');
dust.init(); dust.t = 10; dust.pick(dust.kinds.indexOf('ger')); assert.equal(ctl.wins, w0, 'cannot pick what the storm has hidden');
dust.init(); dust.pick(dust.kinds.indexOf('ger')); assert.equal(ctl.wins, w0 + 1, 'running to the ger wins');

const { Cabinet } = load('games/cabinet.ts', ['Cabinet'], { ...gameBindings, CAB: undefined });
const cab = new Cabinet(); cab.init();
const cw0 = ctl.wins, cl0 = ctl.losses;
for (let i = 0; i < 2; i++) { const it = cab.items.find(t => !t.stored); cab.select(it.x, it.y); cab.move(270, 220); cab.select(270, 220); }
assert.equal(cab.items.filter(t => t.stored).length, 2, 'items dropped in the cabinet are stored');
const last = cab.items.find(t => !t.stored);
cab.select(last.x, last.y); cab.move(270, 220); cab.cancelInput(); cab.up();
assert.equal(ctl.wins, cw0, 'cancelling a drag does not store the item');
assert.ok(last.y >= 440, 'a cancelled item falls back to the floor');
cab.select(last.x, last.y); cab.move(270, 220); cab.select(270, 220);
assert.equal(ctl.wins, cw0 + 1, 'storing all three wins');
cab.init(); cab.bx = cab.items[0].x + 10; cab.by = cab.items[0].y; cab.update(0.016);
assert.equal(ctl.losses, cl0 + 1, 'the toddler reaching an item loses');

const { River } = load('games/river.ts', ['River'], gameBindings);
const river = new River(); river.init();
const rw0 = ctl.wins, rl0 = ctl.losses;
for (let i = 0; i < 120 && ctl.wins === rw0; i++) { if (i % 6 === 0) river.down(); river.update(1 / 60); }
assert.equal(ctl.wins, rw0 + 1, 'swimming steadily reaches the bank');
river.init(); for (let i = 0; i < 600 && ctl.losses === rl0; i++) river.update(1 / 60);
assert.equal(ctl.losses, rl0 + 1, 'doing nothing drifts into deep water');

// end-of-run quiz and teacher-mode topic filter
{
  const qctl = {};
  const mk = cmd => ({ cmd, lose: 'x', dead: false, init() {}, update() {} });
  const home = mk('home-game'), street = mk('street-game');
  const quiz = [{ cmd: 'home-game', q: '?', a: ['a', 'b', 'c'], ok: 1 }, { cmd: 'street-game', q: '?', a: ['a', 'b', 'c'], ok: 2 }];
  const qflow = load('flow.ts', ['g', 'startRun', 'step', 'afterResult', 'answerQuiz'], {
    ctl: qctl, games: [home, street], sfx() {}, navigator: {},
    meta: { unlock() { return false; }, allowed: m => m === home, quiz: () => quiz },
    localStorage: { getItem(k) { return k === 'bayraa-learned-v1' ? '["home-game","street-game"]' : null; }, setItem() {} },
  });
  qflow.startRun();
  for (let i = 0; i < 3; i++) {
    assert.equal(qflow.g.game, home, 'teacher mode plays only the chosen topic');
    qflow.step(1.5); qctl.lose('miss'); qflow.afterResult();
  }
  assert.equal(qflow.g.state, 'quiz', 'losing the last life opens the quiz');
  qflow.answerQuiz(1); qflow.answerQuiz(0);
  assert.equal(qflow.g.quiz.right, 1, 'only the first answer counts');
  qflow.step(1.3); assert.equal(qflow.g.quiz.i, 1);
  qflow.answerQuiz(0); qflow.step(1.3);
  assert.equal(qflow.g.state, 'over'); assert.equal(qflow.g.score, 1, 'each right answer is a bonus point');
}

const flowCtl = {};
let gameplay = 0, cosmetics = 0;
const micro = { cmd: 'test', lose: 'miss', dead: false, timeoutWin: true, init() {}, update() { gameplay++; }, resultUpdate() { cosmetics++; } };
const flow = load('flow.ts', ['g','startRun','step','afterResult'], { ctl: flowCtl, games: [micro], sfx() {}, meta: { unlock() { return false; }, allowed() { return true; }, quiz() { return []; } }, localStorage: { getItem(k) { return k === 'bayraa-learned-v1' ? '["test"]' : null; }, setItem() {} }, navigator: {} });
flow.startRun(); flow.step(1.5); flow.step(5);
assert.equal(flow.g.score, 1); assert.equal(flowCtl.playing, false);
flow.step(0.1); assert.equal(gameplay, 1); assert.equal(cosmetics, 1);
flowCtl.lose('late collision'); assert.equal(flow.g.lives, 3);
flowCtl.win(); assert.equal(flow.g.score, 1, 'result cannot score twice');

class Events {
  listeners = new Map();
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(fn); }
  emit(type, fields = {}) { const event = { preventDefault() {}, ...fields }; for (const fn of this.listeners.get(type) ?? []) fn(event); }
}
const win = new Events(), cv = new Events(), doc = new Events();
const captures = new Set();
cv.getBoundingClientRect = () => ({ left: 0, top: 0 });
cv.focus = () => { doc.activeElement = cv; };
cv.setPointerCapture = id => captures.add(id);
cv.hasPointerCapture = id => captures.has(id);
cv.releasePointerCapture = id => { captures.delete(id); cv.emit('lostpointercapture', { pointerId: id }); };
doc.activeElement = cv;
let downs = 0, moves = 0, ups = 0, cancels = 0;
const keyEvents = [];
const inputGame = { down() { downs++; }, move() { moves++; }, up() { ups++; }, cancelInput() { cancels++; }, key(...args) { keyEvents.push(args); } };
const g = { game: inputGame, state: 'play', round: 1, st: 0 };
const { installInput } = load('core/input.ts', ['installInput'], { cv, view: { offX: 0, offY: 0, scale: 1 }, g, document: doc, addEventListener: win.addEventListener.bind(win), unlockAudio() {}, startRun() {}, afterResult() {}, beginPractice() {}, goHome() {}, uiPress() { return false; }, uiKey() { return false; } });
const sync = installInput();
const pointer = id => ({ pointerId: id, button: 0, isPrimary: true, clientX: 100, clientY: 300 });
cv.emit('pointerdown', pointer(1)); cv.emit('pointerdown', pointer(2));
cv.emit('pointermove', pointer(2)); win.emit('pointerup', pointer(2));
assert.equal(downs, 1); assert.equal(moves, 0); assert.equal(ups, 0);
cv.emit('pointercancel', pointer(1)); win.emit('pointerup', pointer(1)); assert.equal(ups, 0);
cv.emit('pointerdown', pointer(3)); win.emit('pointerup', pointer(3)); assert.equal(ups, 1); assert.equal(moves, 1);
cv.emit('pointerdown', pointer(4)); g.round++; sync(); win.emit('pointerup', pointer(4)); assert.equal(ups, 1, 'stale release cannot affect a new round');
win.emit('keydown', { key: ' ', repeat: false }); win.emit('keydown', { key: ' ', repeat: true });
assert.equal(keyEvents.length, 1);
const beforeBlur = cancels; win.emit('blur'); assert.equal(cancels, beforeBlur + 1);
win.emit('keyup', { key: ' ' }); assert.equal(keyEvents.length, 1, 'release after blur is ignored');
win.emit('keydown', { key: 'ArrowUp' }); g.state = 'result'; sync(); win.emit('keyup', { key: 'ArrowUp' });
assert.equal(keyEvents.length, 2, 'keyup cannot reach a result or new round');
g.state = 'play'; doc.activeElement = {}; win.emit('keydown', { key: 'Enter' }); assert.equal(keyEvents.length, 2);
doc.activeElement = cv; win.emit('keydown', { key: 'ArrowDown' }); doc.hidden = true; doc.emit('visibilitychange');
assert.ok(cancels > beforeBlur + 1);
console.log('Gameplay/result, keyboard, pointer ownership and focus checks passed.');

// Right-click selection survives button release and follows mouse hover.
g.state = 'play'; doc.hidden = false; sync();
let selected = false;
inputGame.select = () => { selected = !selected; return selected; };
const right = { ...pointer(10), pointerType: 'mouse', button: 2 };
cv.emit('pointerdown', right);
win.emit('pointerup', right);
const beforeMove = moves;
cv.emit('pointermove', { ...right, buttons: 0 });
assert.equal(moves, beforeMove + 1, 'selected object follows mouse after release');
let menuBlocked = false;
cv.emit('contextmenu', { preventDefault() { menuBlocked = true; } });
assert.equal(menuBlocked, true);
cv.emit('pointerdown', right);
cv.emit('pointermove', right);
assert.equal(moves, beforeMove + 1, 'second right-click ends mouse selection');
cv.emit('pointerdown', right);
win.emit('blur');
cv.emit('pointermove', right);
assert.equal(moves, beforeMove + 1, 'blur cancels mouse selection');
console.log('Right-click selection checks passed.');
