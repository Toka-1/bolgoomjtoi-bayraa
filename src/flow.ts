import { ctl } from './core/ctl';
import { sfx } from './core/audio';
import { games, type Micro } from './games';

export type State = 'title' | 'intro' | 'play' | 'result' | 'over';

export const g = {
  state: 'title' as State,
  score: 0, lives: 3, speed: 1,
  game: games[0] as Micro,
  /** seconds in the current state */
  st: 0,
  dur: 5, introDur: 1.4, resDur: 1.1, frac: 0,
  bag: [] as number[],
  ok: false, msg: '', faster: false, winText: '',
  best: 0,
};

const BEST_KEY = 'bayraa-best';
try { g.best = Number(localStorage.getItem(BEST_KEY)) || 0; } catch { /* storage blocked */ }

export function startRun(): void {
  g.score = 0; g.lives = 3; g.speed = 1; g.bag = []; g.faster = false;
  next(true);
}

function next(first = false): void {
  if (!g.bag.length) {
    g.bag = games.map((_, i) => i).sort(() => Math.random() - 0.5);
    if (!first && games[g.bag[0]] === g.game) g.bag.push(g.bag.shift()!);
  }
  g.game = games[g.bag.shift()!];
  g.game.dead = false;
  g.game.init();
  g.state = 'intro'; g.st = 0;
  g.introDur = 1.4 / Math.sqrt(g.speed);
  g.dur = 5 / g.speed;
  g.frac = 0;
}

function win(): void {
  if (g.state !== 'play') return;
  g.state = 'result'; g.ok = true; g.st = 0; g.resDur = 1.1; g.score++;
  g.winText = g.game.winText ?? ['ЗӨВ!', 'ГОЁ!', 'САЙН БАЙНА!'][Math.floor(Math.random() * 3)];
  g.faster = false;
  if (g.score % 4 === 0) { g.speed = Math.min(2.3, g.speed * 1.15); g.faster = true; }
  sfx('win');
}

function lose(msg: string): void {
  if (g.state !== 'play') return;
  g.state = 'result'; g.ok = false; g.msg = msg; g.st = 0; g.resDur = 3.2; g.lives--; g.faster = false;
  sfx('lose');
  try { navigator.vibrate?.(120); } catch { /* unsupported */ }
}

ctl.win = win;
ctl.lose = lose;

function saveBest(): void {
  if (g.score > g.best) { g.best = g.score; try { localStorage.setItem(BEST_KEY, String(g.best)); } catch { /* storage blocked */ } }
}

export function afterResult(): void {
  if (g.lives <= 0) { g.state = 'over'; g.st = 0; saveBest(); }
  else next();
}

/** Leave the run and go back to the title screen; the score still counts toward the best. */
export function goHome(): void {
  saveBest();
  g.state = 'title'; g.st = 0; g.frac = 0;
  ctl.playing = false;
}

export function step(dt: number): void {
  g.st += dt;
  if (g.state === 'intro' && g.st >= g.introDur) { g.state = 'play'; g.st = 0; sfx('go'); }
  else if (g.state === 'play') {
    g.frac = Math.min(1, g.st / g.dur);
    ctl.frac = g.frac; ctl.playing = true;
    g.game.update(dt * g.speed);
    if (g.state === 'play' && g.st >= g.dur) {
      if (g.game.timeoutWin) win();
      else { g.game.dead = true; lose(g.game.lose); }
    }
  } else if (g.state === 'result') {
    g.game.update(dt * g.speed);
    if (g.st >= g.resDur) afterResult();
  }
  ctl.playing = g.state === 'play';
}

/** Dev only: jump straight into microgame `i` (used by ?g=N). */
export function debugStart(i: number): void {
  startRun();
  g.game = games[i % games.length];
  g.game.dead = false; g.game.init();
  g.state = 'play'; g.st = 0;
}
