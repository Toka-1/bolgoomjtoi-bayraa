import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import '@fontsource/rubik/900.css';
import './style.css';
import { cv, clock, resize, beginFrame } from './core/canvas';
import { C } from './core/draw';
import { installInput } from './core/input';
import { setAudioEnabled } from './core/audio';
import { progress } from './meta/progress';
import { g, step, debugStart, debugScreen } from './flow';
import { render } from './ui/screens';

addEventListener('resize', resize);
// Observe the actual drawing surface when browser chrome or safe areas change.
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(cv);
window.visualViewport?.addEventListener('resize', resize);
resize();

// Canvas text does not trigger webfont loading; ask for every weight and the Mongolian letters up front.
for (const w of [500, 700, 900]) void document.fonts?.load(`${w} 20px Rubik`, 'АБВӨҮабвөү').catch(() => {});

setAudioEnabled(progress.sound);
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
  const scr = new URLSearchParams(location.search).get('screen');
  if (scr) debugScreen(scr);
  const q = new URLSearchParams(location.search).get('g');
  if (q !== null) {
    debugStart(Number(q));
    // ?t=N fast-forwards N seconds of game time (for screenshots)
    const ff = Number(new URLSearchParams(location.search).get('t')) || 0;
    for (let i = 0; i < ff * 60; i++) { clock.t += 1 / 60; step(1 / 60); }
    // ?perf prints the average frame time for the current screen to the console
    if (new URLSearchParams(location.search).has('perf')) {
      const t0 = performance.now();
      for (let i = 0; i < 30; i++) { beginFrame(C.ink); render(); }
      console.log('PERF ms/frame', ((performance.now() - t0) / 30).toFixed(2), 'game', g.game.cmd);
    }
  }
}
// Offline / install support, production builds only (the dev server must not be cached).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => { void navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}
cv.focus();
requestAnimationFrame(frame);
