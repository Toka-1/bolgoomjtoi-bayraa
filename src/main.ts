import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import '@fontsource/rubik/900.css';
import './style.css';
import { cv, clock, resize, beginFrame } from './core/canvas';
import { C } from './core/draw';
import { installInput } from './core/input';
import { step, debugStart } from './flow';
import { render } from './ui/screens';

addEventListener('resize', resize);
resize();

// Canvas text does not trigger webfont loading; ask for every weight and the Mongolian letters up front.
for (const w of [500, 700, 900]) void document.fonts?.load(`${w} 20px Rubik`, 'АБВӨҮабвөү').catch(() => {});

const syncInput = installInput();

/* ---------- loop ---------- */
let last = performance.now();
function frame(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now; clock.t += dt;
  step(dt);
  syncInput();
  beginFrame(C.ink);
  render();
  requestAnimationFrame(frame);
}
if (import.meta.env.DEV) {
  const q = new URLSearchParams(location.search).get('g');
  if (q !== null) {
    debugStart(Number(q));
    // ?t=N fast-forwards N seconds of game time (for screenshots)
    const ff = Number(new URLSearchParams(location.search).get('t')) || 0;
    for (let i = 0; i < ff * 60; i++) { clock.t += 1 / 60; step(1 / 60); }
  }
}
cv.focus();
requestAnimationFrame(frame);
