import { ctl } from './core/ctl';
import { sfx } from './core/audio';
import { games, type Micro } from './games';
import { meta, type QuizItem } from './meta/hooks';

export type State = 'title' | 'intro' | 'play' | 'result' | 'quiz' | 'over' | 'cards' | 'topics';

export const g = {
  state: 'title' as State,
  score: 0, lives: 3, speed: 1,
  game: games[0] as Micro,
  /** seconds in the current state */
  st: 0,
  dur: 5, introDur: 1.4, resDur: 1.1, frac: 0,
  bag: [] as number[],
  ok: false, msg: '', faster: false, winText: '',
  best: 0, practice: false,
  /** increments every round so stale input can be ignored */
  round: 0,
  /** games seen this run, for the end-of-run quiz */
  played: [] as string[],
  /** this win earned a new safety card */
  newCard: false,
  quiz: { list: [] as QuizItem[], i: 0, picked: -1, right: 0 },
  /** quiz points added at the end of the run */
  bonus: 0,
};

const LEARNED_KEY = 'bayraa-learned-v1';
const learned = new Set<string>();
try {
  const saved: unknown = JSON.parse(localStorage.getItem(LEARNED_KEY) ?? '[]');
  if (Array.isArray(saved)) for (const id of saved) if (typeof id === 'string') learned.add(id);
} catch { /* storage blocked or invalid */ }

const BEST_KEY = 'bayraa-best';
try { g.best = Number(localStorage.getItem(BEST_KEY)) || 0; } catch { /* storage blocked */ }

export function startRun(): void {
  g.score = 0; g.lives = 3; g.speed = 1; g.bag = []; g.faster = false; g.played = []; g.bonus = 0;
  next(true);
}

function next(first = false): void {
  if (!g.bag.length) {
    // teacher mode: only the chosen topics (all of them if the filter would leave nothing)
    let pool = games.map((_, i) => i).filter(i => meta.allowed(games[i]));
    if (!pool.length) pool = games.map((_, i) => i);
    g.bag = pool.sort(() => Math.random() - 0.5);
    if (!first && g.bag.length > 1 && games[g.bag[0]] === g.game) g.bag.push(g.bag.shift()!);
  }
  g.game = games[g.bag.shift()!];
  g.practice = !learned.has(g.game.cmd);
  prepareRound();
}

function prepareRound(): void {
  g.round++;
  g.played.push(g.game.cmd);
  g.newCard = false;
  g.game.dead = false;
  g.game.init();
  ctl.playing = false; ctl.frac = 0;
  g.state = 'intro'; g.st = 0;
  g.introDur = 1.4 / Math.sqrt(g.speed);
  g.dur = g.practice ? 5 : 5 / g.speed;
  g.frac = 0;
}

function win(): void {
  if (g.state !== 'play') return;
  g.state = 'result'; g.ok = true; g.st = 0; g.resDur = g.practice ? 1.8 : 1.1;
  if (!g.practice) g.score++;
  ctl.playing = false; g.game.cancelInput?.();
  g.winText = g.game.winText ?? ['ЗӨВ!', 'ГОЁ!', 'САЙН БАЙНА!'][Math.floor(Math.random() * 3)];
  g.faster = false;
  g.newCard = meta.unlock(g.game.cmd);
  if (!g.practice && g.score % 4 === 0) { g.speed = Math.min(2.3, g.speed * 1.15); g.faster = true; }
  sfx(g.newCard ? 'card' : 'win');
}

function lose(msg: string): void {
  if (g.state !== 'play') return;
  g.state = 'result'; g.ok = false; g.msg = msg; g.st = 0; g.resDur = 3.2;
  if (!g.practice) g.lives--;
  g.faster = false;
  ctl.playing = false; g.game.cancelInput?.();
  sfx('lose');
  try { navigator.vibrate?.(120); } catch { /* unsupported */ }
}

ctl.win = win;
ctl.lose = lose;

function saveBest(): void {
  if (g.score > g.best) { g.best = g.score; try { localStorage.setItem(BEST_KEY, String(g.best)); } catch { /* storage blocked */ } }
}

export function afterResult(): void {
  if (g.practice) {
    if (g.ok) {
      learned.add(g.game.cmd);
      try { localStorage.setItem(LEARNED_KEY, JSON.stringify([...learned])); } catch { /* storage blocked */ }
      g.practice = false;
    }
    prepareRound();
    return;
  }
  if (g.lives <= 0) startQuiz();
  else next();
}

/** End of run: a few questions about what was played, each right answer is a bonus point. */
function startQuiz(): void {
  const list = meta.quiz(g.played);
  g.quiz = { list, i: 0, picked: -1, right: 0 };
  if (!list.length) { finishRun(); return; }
  g.state = 'quiz'; g.st = 0;
}

export function answerQuiz(i: number): void {
  const q = g.quiz;
  if (g.state !== 'quiz' || q.picked >= 0 || i < 0 || i > 2) return;
  q.picked = i; g.st = 0;
  const ok = i === q.list[q.i].ok;
  if (ok) q.right++;
  sfx(ok ? 'right' : 'wrong');
}

function finishRun(): void {
  g.bonus = g.quiz.right; g.score += g.bonus;
  g.state = 'over'; g.st = 0;
  saveBest();
}

export function openScreen(s: 'cards' | 'topics'): void { g.state = s; g.st = 0; }

/** Leave the run and go back to the title screen; the score still counts toward the best. */
export function goHome(): void {
  saveBest();
  g.state = 'title'; g.st = 0; g.frac = 0; g.practice = false;
  ctl.playing = false;
}

export function beginPractice(): void {
  if (g.state !== 'intro' || !g.practice) return;
  g.state = 'play'; g.st = 0; ctl.playing = true; sfx('go');
}

export function step(dt: number): void {
  g.st += dt;
  if (g.state === 'intro' && !g.practice && g.st >= g.introDur) { g.state = 'play'; g.st = 0; sfx('go'); }
  else if (g.state === 'play') {
    g.frac = Math.min(1, g.st / g.dur);
    ctl.frac = g.frac; ctl.playing = true;
    g.game.update(dt * (g.practice ? 1 : g.speed));
    if (g.state === 'play' && g.st >= g.dur) {
      if (g.game.timeoutWin) win();
      else { g.game.dead = true; lose(g.game.lose); }
    }
  } else if (g.state === 'quiz') {
    const q = g.quiz;
    if (q.picked >= 0 && g.st > 1.2) {
      if (q.i + 1 < q.list.length) { q.i++; q.picked = -1; g.st = 0; } else finishRun();
    }
  } else if (g.state === 'result') {
    g.game.resultUpdate?.(dt * (g.practice ? 1 : g.speed));
    if (g.st >= g.resDur) afterResult();
  }
  ctl.playing = g.state === 'play';
}

/** Dev only: jump straight into microgame `i` (used by ?g=N). */
export function debugStart(i: number): void {
  startRun();
  g.game = games[i % games.length];
  g.practice = false;
  g.round++;
  g.game.dead = false; g.game.init();
  g.state = 'play'; g.st = 0;
}

/** Dev only: open a menu screen directly (used by ?screen=cards|topics|quiz). */
export function debugScreen(s: string): void {
  if (s === 'cards' || s === 'topics') { openScreen(s); return; }
  if (s === 'quiz') { startRun(); g.lives = 0; startQuiz(); }
}
