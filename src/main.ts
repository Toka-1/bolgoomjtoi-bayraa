import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import '@fontsource/rubik/900.css';
import './style.css';
import { cv, view, clock, resize, beginFrame } from './core/canvas';
import { C } from './core/draw';
import { unlockAudio } from './core/audio';
import { g, startRun, afterResult, step, debugStart, beginPractice } from './flow';
import { render, AGAIN_BTN, inBtn } from './ui/screens';

addEventListener('resize', resize);
resize();

// Canvas text does not trigger webfont loading; ask for every weight and the Mongolian letters up front.
for (const w of [500, 700, 900]) void document.fonts?.load(`${w} 20px Rubik`, 'АБВӨҮабвөү').catch(() => {});

/* ---------- input ---------- */
function pt(e: PointerEvent): [number, number] {
  const r = cv.getBoundingClientRect();
  return [(e.clientX - r.left - view.offX) / view.scale, (e.clientY - r.top - view.offY) / view.scale];
}
function press(x: number, y: number): void {
  if (g.state === 'title') startRun();
  else if (g.state === 'over') { if (g.st > 0.6 && inBtn(AGAIN_BTN, x, y)) startRun(); }
  else if (g.state === 'intro' && g.practice) beginPractice();
  else if (g.state === 'play') g.game.down?.(x, y);
  else if (g.state === 'result' && !g.ok && g.st > 0.8) afterResult();
}
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); unlockAudio();
  try { cv.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
  const [x, y] = pt(e); press(x, y);
});
cv.addEventListener('pointermove', e => {
  if (g.state === 'play' && g.game.move) { const [x, y] = pt(e); g.game.move(x, y); }
});
const release = (e: PointerEvent) => { if (g.state !== 'title' && g.game.up) { const [x, y] = pt(e); g.game.up(x, y); } };
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('keydown', e => {
  if (e.repeat) return;
  unlockAudio();
  if ((e.key === 'Enter' || e.key === ' ') && (g.state === 'title' || (g.state === 'over' && g.st > 0.6))) { e.preventDefault(); startRun(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && g.state === 'intro' && g.practice) { e.preventDefault(); beginPractice(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && g.state === 'result' && !g.ok && g.st > 0.8) { e.preventDefault(); afterResult(); return; }
  if (g.state === 'play' && g.game.key) { e.preventDefault(); g.game.key(e.key, true); }
});
addEventListener('keyup', e => { if (g.state !== 'title') g.game.key?.(e.key, false); });

/* ---------- loop ---------- */
let last = performance.now();
function frame(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now; clock.t += dt;
  step(dt);
  beginFrame(C.ink);
  render();
  requestAnimationFrame(frame);
}
if (import.meta.env.DEV) {
  const q = new URLSearchParams(location.search).get('g');
  if (q !== null) debugStart(Number(q));
}
cv.focus();
requestAnimationFrame(frame);
