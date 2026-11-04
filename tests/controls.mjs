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
const gameBindings = { ctl, DragKeys, W: 360, H: 640, rand: (a,b) => (a+b)/2, dist: (a,b,c,d) => Math.hypot(a-c,b-d) };
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
ice.dead = true; const lean = Math.abs(ice.a); ice.resultUpdate(0.1); assert.ok(Math.abs(ice.a) > lean, 'fall finishes during result');

const flowCtl = {};
let gameplay = 0, cosmetics = 0;
const micro = { cmd: 'test', lose: 'miss', dead: false, timeoutWin: true, init() {}, update() { gameplay++; }, resultUpdate() { cosmetics++; } };
const flow = load('flow.ts', ['g','startRun','step','afterResult'], { ctl: flowCtl, games: [micro], sfx() {}, localStorage: { getItem(k) { return k === 'bayraa-learned-v1' ? '["test"]' : null; }, setItem() {} }, navigator: {} });
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
const { installInput } = load('core/input.ts', ['installInput'], { cv, view: { offX: 0, offY: 0, scale: 1 }, g, document: doc, addEventListener: win.addEventListener.bind(win), unlockAudio() {}, startRun() {}, afterResult() {}, beginPractice() {}, goHome() {}, AGAIN_BTN: {}, HOME_BTN: {}, inBtn() { return false; }, inHudHome() { return false; } });
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
