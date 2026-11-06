import { cv, view } from './canvas';
import { unlockAudio } from './audio';
import { g, startRun, afterResult, goHome } from '../flow';
import { uiPress, uiKey } from '../ui/meta';
import type { Micro } from '../games';

const CONTROL_KEYS = new Set(['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', '1', '2', '3']);

export function installInput(): () => void {
  let pointer: number | null = null;
  let selectedPointer: number | null = null;
  let owner: Micro | null = null;
  let round = -1;
  const held = new Set<string>();
  const point = (e: PointerEvent): [number, number] => {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left - view.offX) / view.scale, (e.clientY - r.top - view.offY) / view.scale];
  };
  const clear = (): void => {
    const id = pointer;
    pointer = null;
    selectedPointer = null;
    owner?.cancelInput?.(); owner = null; held.clear();
    if (id !== null && cv.hasPointerCapture(id)) cv.releasePointerCapture(id);
  };
  const current = (): boolean => owner === g.game && round === g.round && g.state === 'play';
  const claim = (): void => { owner = g.game; round = g.round; };

  cv.addEventListener('pointerdown', e => {
    if (e.button === 2 && e.pointerType === 'mouse' && g.state === 'play' && g.game.select && pointer === null) {
      e.preventDefault(); cv.focus(); unlockAudio();
      const [x, y] = point(e);
      if (x < 0 || x > 360 || y < 0 || y > 640) return;
      if (selectedPointer !== e.pointerId || !current()) { clear(); claim(); }
      if (g.game.select(x, y)) selectedPointer = e.pointerId;
      else clear();
      return;
    }
    if (pointer !== null || e.button !== 0 || !e.isPrimary) return;
    e.preventDefault(); cv.focus(); unlockAudio();
    const [x, y] = point(e);
    if (x < 0 || x > 360 || y < 0 || y > 640) return;
    clear();
    // menus, HUD buttons and practice start are handled by the UI layer
    if (uiPress(x, y)) return;
    if (g.state === 'result') return;
    if (g.state !== 'play') return;
    pointer = e.pointerId; claim();
    try { cv.setPointerCapture(e.pointerId); } catch { /* window release still handles it */ }
    g.game.down?.(x, y);
  });
  cv.addEventListener('pointermove', e => {
    if ((e.pointerId === pointer || e.pointerId === selectedPointer) && current()) g.game.move?.(...point(e));
  });
  cv.addEventListener('contextmenu', e => { if (g.game.select) e.preventDefault(); });
  addEventListener('pointerup', e => {
    if (e.pointerId !== pointer) return;
    if (current()) {
      // Use the final release position even if no last pointermove was delivered.
      g.game.move?.(...point(e));
      g.game.up?.(...point(e));
    }
    clear();
  });
  const cancel = (e: PointerEvent): void => { if (e.pointerId === pointer || e.pointerId === selectedPointer) clear(); };
  cv.addEventListener('pointercancel', cancel);
  cv.addEventListener('lostpointercapture', cancel);
  addEventListener('blur', clear);
  cv.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  addEventListener('keydown', e => {
    if (document.activeElement !== cv || e.ctrlKey || e.metaKey || e.altKey || !CONTROL_KEYS.has(e.key)) return;
    e.preventDefault();
    if (e.repeat || held.has(e.key)) return;
    if (e.key === 'Escape') {
      // first Escape drops a held gesture; with nothing held it leaves to the title screen
      const busy = pointer !== null || selectedPointer !== null || held.size > 0;
      clear();
      if (!busy && g.state !== 'title') goHome();
      return;
    }
    if (pointer !== null) return;
    unlockAudio();
    if (uiKey(e.key)) return;
    const activate = e.key === 'Enter' || e.key === ' ';
    if (activate && (g.state === 'title' || (g.state === 'over' && g.st > 0.6))) { clear(); startRun(); return; }
    if (activate && g.state === 'result' && !g.ok && g.st >= 3) { clear(); afterResult(); return; }
    if (g.state !== 'play') return;
    if (!current()) clear();
    claim(); held.add(e.key); g.game.key?.(e.key, true);
  });
  addEventListener('keyup', e => {
    if (!held.delete(e.key)) return;
    if (current()) g.game.key?.(e.key, false);
  });
  // Called after state transitions, before the next frame can accept input.
  return () => { if (owner && !current()) clear(); };
}
