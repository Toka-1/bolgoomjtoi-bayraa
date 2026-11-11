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
const { Hat, AVATAR, HEAD_Y } = load('games/hat.ts', ['Hat', 'AVATAR', 'HEAD_Y'], gameBindings);
assert.equal(HEAD_Y, AVATAR.y - 101 * AVATAR.scale, 'hat target follows the rendered head');
const hat = new Hat(); hat.init();
hat.key('Enter', true); hat.key(' ', true); assert.equal(hat.drag, false, 'keyboard activation no longer selects');
hat.select(hat.hx, hat.hy - 14); hat.move(AVATAR.x, HEAD_Y - 14); hat.select(AVATAR.x, HEAD_Y - 14);
assert.equal(ctl.wins, 1, 'hat can be picked up, moved and dropped with right-click');
const { Baby } = load('games/baby.ts', ['Baby'], gameBindings);
const baby = new Baby(); baby.init();
baby.select(290, 529); baby.move(290, 324); baby.select(290, 324);
assert.equal(baby.safe, false, 'dropping onto the wall above the cradle is not safe');
baby.init();
baby.key('Enter', true); baby.key(' ', true); assert.equal(baby.drag, false);
baby.select(290, 529); baby.move(290, 444); baby.select(290, 444);
assert.equal(ctl.wins, 2, 'baby can be rescued with right-click');
baby.init(); baby.select(290, 529); baby.move(290, 444); baby.cancelInput(); baby.up();
assert.equal(ctl.wins, 2, 'cancellation must not submit a successful drop');
const { Smoke } = load('games/smoke.ts', ['Smoke'], gameBindings);
const smoke = new Smoke(); smoke.init();
smoke.key?.('Enter', true); smoke.key?.(' ', true);
assert.equal(ctl.wins, 2, 'Enter/Space cannot escape the room');
for (const [x, y] of [[100, 400], [160, 325], [335, 210], [270, 145], [205, 275]]) smoke.down(x, y);
assert.equal(ctl.wins, 2, 'window and scenery clicks cannot solve the smoke level');
smoke.down(292, 390);
assert.equal(ctl.wins, 3);
smoke.down(292, 390); assert.equal(ctl.wins, 3, 'escape scores only once');
smoke.resultUpdate(1); assert.equal(smoke.exit, 1, 'successful result moves the child outdoors');
const { Socket, OUTLET, tipLength } = load('games/socket.ts', ['Socket', 'OUTLET', 'tipLength'], gameBindings);
const socket = new Socket(); socket.init(); socket.key(' ', false); assert.equal(ctl.losses, 0);
socket.key(' ', true); socket.key('Enter', true); socket.down(OUTLET.x, OUTLET.y);
assert.equal(ctl.losses, 0, 'keypresses and a bare socket tap are not insertion');
socket.down(socket.items[0].x, socket.items[0].y); socket.move(90, 540); socket.up();
assert.equal(ctl.losses, 0, 'picking up and dropping away from the outlet is safe');
socket.down(socket.items[0].x, socket.items[0].y);
socket.move(OUTLET.x, OUTLET.y + tipLength(socket.items[0]));
assert.equal(ctl.losses, 1, 'inserting a fork causes an electric-shock failure');
assert.equal(socket.dead, true); assert.ok(socket.zap > 0);
socket.move(OUTLET.x, OUTLET.y); assert.equal(ctl.losses, 1, 'shock is triggered only once');
socket.resultUpdate(1); assert.equal(socket.zap, 0);
{
  const actions={wins:0,losses:0,win(){this.wins++;},lose(){this.losses++;}};
  const {Socket: TestSocket}=load('games/socket.ts',['Socket'],{...gameBindings,ctl:actions});
  const m=new TestSocket();m.init();
  m.down(m.items[1].x,m.items[1].y);m.move(OUTLET.x,OUTLET.y+tipLength(m.items[1]));
  assert.equal(actions.losses,1,'key insertion also causes a shock');
  m.init();m.down(m.items[0].x,m.items[0].y);m.move(OUTLET.x,OUTLET.y);
  assert.equal(actions.losses,1,'object body over the plate is not tip insertion');
  m.cancelInput();assert.equal(m.drag,-1);assert.equal(m.items[0].x,m.items[0].homeX);
  m.init();m.down(m.items[0].x,m.items[0].y);m.move(OUTLET.x,OUTLET.y+80);m.move(OUTLET.x,OUTLET.y-40);
  assert.equal(actions.losses,2,'fast pointer movement cannot skip over the insertion area');
  const flowControls={};
  const {Socket: RoundSocket}=load('games/socket.ts',['Socket'],{...gameBindings,ctl:flowControls});
  const roundSocket=new RoundSocket();
  const f=load('flow.ts',['startRun','step','g'],{ctl:flowControls,games:[roundSocket],sfx(){},navigator:{},meta:{allowed(){return true;},unlock(){return false;}},localStorage:{getItem(){return null;},setItem(){}}});
  f.startRun();f.step(5);assert.equal(f.g.ok,true,'leaving the socket and objects alone wins');
}
const { Cow } = load('games/cow.ts', ['Cow'], gameBindings);
const cow = new Cow(); cow.init(); cow.key(' ', true); cow.key('ArrowDown', true); cow.key(' ', false);
assert.equal(cow.hold, true, 'releasing one brake key preserves another');
cow.down(); cow.key('ArrowDown', false); assert.equal(cow.hold, true);
cow.up(); assert.equal(cow.hold, false);
cow.key(' ', true); cow.cancelInput(); assert.equal(cow.hold, false);
const cowLosses = ctl.losses, cowWins = ctl.wins;
cow.init(); cow.t0 = 0.3;
for (let i = 0; i < 300 && ctl.losses === cowLosses && ctl.wins === cowWins; i++) cow.update(1 / 60);
assert.equal(ctl.losses, cowLosses + 1, 'unbraked car hits the resized cow');
cow.dead = false; cow.init(); cow.t0 = 0.3; cow.down();
for (let i = 0; i < 300 && ctl.wins === cowWins; i++) {
  if (cow.cowY >= 516) cow.up();
  cow.update(1 / 60);
}
assert.equal(ctl.wins, cowWins + 1, 'waiting for the resized cow still permits a safe crossing');
assert.equal(ctl.losses, cowLosses + 1);
const { Crossing, LANES, CAR_LEN, ZEBRA_L, ZEBRA_R, GAP } = load('games/crossing.ts', ['Crossing', 'LANES', 'CAR_LEN', 'ZEBRA_L', 'ZEBRA_R', 'GAP'], { ...gameBindings, CAR_PAINTS: [[]] });
const crossing = new Crossing(); crossing.redT = 0;
crossing.cars = [
  { x: -220, lane: 1, paint: [], v: 230 },
  { x: 400, lane: 0, paint: [], v: 230 },
];
for (let i = 0; i < 360; i++) crossing.update(1 / 60);
const near = crossing.cars.filter(c => c.lane === 1).sort((a,b) => b.x-a.x);
const far = crossing.cars.filter(c => c.lane === 0).sort((a,b) => a.x-b.x);
assert.ok(near[0].x + CAR_LEN * LANES[1].s <= ZEBRA_L - 6 + 0.01, 'enlarged cars stop before the crossing');
assert.ok(far[0].x >= ZEBRA_R + 6 - 0.01);
crossing.cars = [
  { x: 100, lane: 1, paint: [], v: 230 }, { x: 100-CAR_LEN*LANES[1].s-GAP-5, lane: 1, paint: [], v: 230 },
  { x: 10, lane: 0, paint: [], v: 230 }, { x: 10+CAR_LEN*LANES[0].s+GAP+5, lane: 0, paint: [], v: 230 },
];
for (let i = 0; i < 120; i++) {
  crossing.update(1 / 60);
  for (const lane of [0, 1]) {
    const cars = crossing.cars.filter(c => c.lane === lane).sort((a,b) => a.x-b.x);
    if (cars.length === 2) assert.ok(cars[1].x - cars[0].x >= CAR_LEN * LANES[lane].s + GAP - 0.01, 'queue spacing includes rendered car length');
  }
}
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

const { Cabinet, ITEM_SCALE, itemBottom } = load('games/cabinet.ts', ['Cabinet','ITEM_SCALE','itemBottom'], { ...gameBindings });
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
for(const it of cab.items) assert.ok([224,292].some(y=>Math.abs(it.y+itemBottom(it.kind)*ITEM_SCALE-y)<0.001),'stored object rests directly on its shelf');
cab.bx=last.x;cab.by=last.y+12;cab.update(0.016);
assert.equal(ctl.losses,cl0,'stored objects cannot be reached by the baby');
cab.init();const entryX=cab.bx,entryY=cab.by;cab.update(0.2);
assert.equal(cab.bx,entryX);assert.equal(cab.by,entryY,'baby gives a brief arrival cue before crawling');
cab.init(); cab.bx = cab.items[0].x + 10; cab.by = cab.items[0].y; cab.update(0.016);
assert.equal(ctl.losses, cl0 + 1, 'the toddler reaching an item loses');

const { River } = load('games/river.ts', ['River'], gameBindings);
const river = new River(); river.init();
const rw0 = ctl.wins, rl0 = ctl.losses;
river.down(60, 500);
for (let i = 0; i < 120 && ctl.wins === rw0; i++) river.update(1 / 60);
assert.equal(ctl.wins, rw0 + 1, 'leading the child away from water wins on dry ground');
assert.ok(river.x < 182);
river.init(); for (let i = 0; i < 600 && ctl.losses === rl0; i++) river.update(1 / 60);
assert.equal(ctl.losses, rl0 + 1, 'letting the child enter the water loses');
river.init(); river.down(250, 500);
assert.equal(ctl.losses, rl0 + 2, 'choosing the water loses immediately');
for (let i = 0; i < 120; i++) { river.down(60, 500); river.key('ArrowLeft', true); river.key(' ', true); river.update(1 / 60); }
assert.equal(ctl.wins, rw0 + 1, 'entering water cannot be turned into a swimming win');
river.init(); river.key('ArrowLeft', true); river.update(1);
assert.equal(ctl.wins, rw0 + 2, 'left arrow leads the child away from the water');

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
flow.startRun(); flow.step(5);
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
const camera=load('ui/levelView.ts',['inLevelView','levelToWorld','worldToLevel'],{W:360,H:640});
const { installInput } = load('core/input.ts', ['installInput'], { ...camera,cv, view: { offX: 0, offY: 0, scale: 1 }, g, document: doc, addEventListener: win.addEventListener.bind(win), unlockAudio() {}, startRun() {}, afterResult() {}, beginPractice() {}, goHome() {}, uiPress() { return false; }, uiKey() { return false; } });
const sync = installInput();
cv.emit('pointerdown', { pointerId: 90, button: 0, isPrimary: true, clientX: 100, clientY: 300 });
const beforeResize = cancels;
win.emit('resize');
assert.equal(cancels, beforeResize + 1, 'resizing cancels the old coordinate-space gesture');
win.emit('pointerup', { pointerId: 90, clientX: 100, clientY: 300 });
assert.equal(ups, 0, 'release after resize cannot activate an object');
downs = 0;
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

// Camera scaling must affect drawing and pointer coordinates equally.
g.state='play';doc.hidden=false;doc.activeElement=cv;inputGame.focus={zoom:1.35,y:390};
let pickedPoint=null,droppedPoint=null;
inputGame.down=(x,y)=>{pickedPoint=[x,y];};inputGame.up=(x,y)=>{droppedPoint=[x,y];};
const [sx,sy]=camera.worldToLevel(inputGame,123,398);
cv.emit('pointerdown',{...pointer(91),clientX:sx,clientY:sy});
assert.ok(Math.hypot(pickedPoint[0]-123,pickedPoint[1]-398)<1e-8,'zoomed pickup follows the drawn object');
const [ex,ey]=camera.worldToLevel(inputGame,218,451);
win.emit('pointerup',{...pointer(91),clientX:ex,clientY:ey});
assert.ok(Math.hypot(droppedPoint[0]-218,droppedPoint[1]-451)<1e-8,'zoomed final release follows the target');
pickedPoint=null;cv.emit('pointerdown',{...pointer(92),clientX:180,clientY:70});
assert.equal(pickedPoint,null,'header space cannot select a cropped object');
console.log('Focused-view pickup, release and HUD exclusion passed.');
