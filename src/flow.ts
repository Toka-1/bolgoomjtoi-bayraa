import { ctl } from './core/ctl';
import { sfx } from './core/audio';
import { games, type Micro } from './games';
import { meta, type QuizItem } from './meta/hooks';

export type State = 'title' | 'practice' | 'play' | 'result' | 'quiz' | 'over' | 'cards' | 'topics' | 'progress';

export const g = {
  state: 'title' as State,
  score: 0, lives: 3, speed: 1,
  game: games[0] as Micro,
  /** seconds in the current state */
  st: 0,
  dur: 5, resDur: 1.1, frac: 0,
  effectDur: 3.4, lessonNarrated: false,
  bag: [] as number[],
  ok: false, msg: '', faster: false, winText: '',
  best: 0, practice: false,
  /** increments every round so stale input can be ignored */
  round: 0,
  /** Per-level failures this visit, shared by practice and scored runs. */
  failures: new Map<string, number>(),
  /** games seen this run, for the end-of-run quiz */
  played: [] as string[],
  /** this win earned a new safety card */
  newCard: false,
  reward: -1,
  celebration: 0,
  quiz: { list: [] as QuizItem[], i: 0, picked: -1, right: 0 },
  /** quiz points added at the end of the run */
  bonus: 0,
};

const BEST_KEY = 'bayraa-best';
const RUN_START_SPEED = 1.35;
const WINS_PER_SPEEDUP = 3;
// Match the roster in games/index.ts: tap, balance, drag, hold, or timing.
const ACTIONS = ['tap','balance','survive','drag','hold','drag','timing','tap','drag','tap','tap','tap','tap','drag','tap','tap','tap','survive','tap','drag','hold','drag','tap','tap','tap','tap','tap','tap','tap','tap'];

/** Prefer a different action, while consuming every eligible game once per bag. */
function chooseNext(first = false): number {
  const previous = first ? -1 : games.indexOf(g.game);
  const candidates = g.bag.filter(i => i !== previous && ACTIONS[i] !== ACTIONS[previous]);
  const pool = candidates.length ? candidates : g.bag.filter(i => i !== previous);
  const index = (pool.length ? pool : g.bag)[Math.floor(Math.random() * (pool.length || g.bag.length))];
  g.bag.splice(g.bag.indexOf(index), 1);
  return index;
}
try { g.best = Number(localStorage.getItem(BEST_KEY)) || 0; } catch { /* storage blocked */ }

export function startRun(): void {
  g.practice = false;
  g.score = 0; g.lives = 3; g.speed = RUN_START_SPEED; g.bag = []; g.faster = false; g.played = []; g.bonus = 0;
  next(true);
}

function next(first = false): void {
  if (!g.bag.length) {
    // teacher mode: only the chosen topics (all of them if the filter would leave nothing)
    let pool = games.map((_, i) => i).filter(i => meta.allowed(games[i]));
    if (!pool.length) pool = games.map((_, i) => i);
    g.bag = pool;
  }
  g.game = games[chooseNext(first)];
  prepareRound();
}

function prepareRound(): void {
  g.round++;
  g.played.push(g.game.cmd);
  g.newCard = false;
  g.reward = -1;
  ctl.stage = g.practice ? 1 : Math.min(2, 1 + Math.floor(g.score / 6));
  ctl.variation = g.practice ? 0 : Math.floor(Math.random() * 3) - 1;
  g.game.dead = false;
  g.game.init();
  ctl.playing = true; ctl.frac = 0;
  g.state = 'play'; g.st = 0;
  g.dur = g.practice ? 5 : 5 / g.speed;
  g.frac = 0;
  sfx('go');
  meta.announce?.(g.game.cmd);
}

function win(): void {
  if (g.state !== 'play') return;
  g.state = 'result'; g.ok = true; g.st = 0; g.resDur = g.practice ? 1.8 : 1.1;
  if (!g.practice) g.score++;
  ctl.playing = false; g.game.cancelInput?.();
  g.winText = g.game.winText ?? ['ЗӨВ!', 'ГОЁ!', 'САЙН БАЙНА!'][Math.floor(Math.random() * 3)];
  g.faster = false;
  meta.record?.(g.game.cmd, true);
  g.newCard = !g.practice && meta.unlock(g.game.cmd);
  if (g.newCard) g.reward = meta.reward?.() ?? -1;
  if (g.reward >= 0) g.resDur = 2.8;
  g.celebration = Math.floor(Math.random() * 3);
  if (!g.practice && g.score % WINS_PER_SPEEDUP === 0) {
    const speed = Math.min(2.3, g.speed * 1.15);
    g.faster = speed > g.speed; g.speed = speed;
  }
  sfx(g.newCard ? 'card' : 'win');
}

function lose(msg: string): void {
  if (g.state !== 'play') return;
  g.failures.set(g.game.cmd, (g.failures.get(g.game.cmd) ?? 0) + 1);
  g.state = 'result'; g.ok = false; g.msg = msg; g.st = 0; g.resDur = Infinity;
  g.lessonNarrated = false;
  if (!g.practice) g.lives--;
  meta.record?.(g.game.cmd, false);
  // Spaced retry: a missed hazard returns later in the same run (never straight away).
  const missed = games.indexOf(g.game);
  if (!g.practice && g.bag.length > 0 && !g.bag.includes(missed)) g.bag.push(missed);
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
    if (g.ok) { g.state = 'practice'; g.st = 0; ctl.playing = false; }
    else prepareRound();
    return;
  }
  if (g.lives <= 0) startQuiz();
  else next();
}

/** End of run: a few questions about what was played, each right answer is a bonus point. */
function startQuiz(): void {
  if (meta.readingQuiz === false) { g.quiz = { list: [], i: 0, picked: -1, right: 0 }; finishRun(); return; }
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
  if (g.quiz.list.length) meta.recordQuiz?.(g.quiz.right, g.quiz.list.length);
  g.bonus = g.quiz.right; g.score += g.bonus;
  g.state = 'over'; g.st = 0;
  saveBest();
}

export function openScreen(s: 'cards' | 'topics' | 'practice' | 'progress'): void { g.state = s; g.st = 0; }

/** Leave the run and go back to the title screen; the score still counts toward the best. */
export function goHome(): void {
  meta.silence?.(); meta.readingQuiz = false;
  saveBest();
  g.state = 'title'; g.st = 0; g.frac = 0; g.practice = false;
  ctl.playing = false;
}

/** Explicit practice selection; never mixed into a scored run. */
export function startPractice(i: number): void {
  if (!Number.isInteger(i) || i < 0 || i >= games.length) return;
  meta.silence?.(); meta.readingQuiz = false;
  g.practice = true; g.score = 0; g.lives = 3; g.speed = 1; g.faster = false; g.bonus = 0;
  g.quiz = { list: [], i: 0, picked: -1, right: 0 };
  g.game = games[i]; prepareRound();
}

export function step(dt: number): void {
  g.st += dt;
  if (g.state === 'play') {
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
    if (!g.ok && !g.lessonNarrated && g.st >= g.effectDur) {
      g.lessonNarrated = true; meta.narrate?.(g.game.tip);
    }
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

/** Dev only: open a menu screen directly (used by ?screen=cards|topics|progress|quiz). */
export function debugScreen(s: string): void {
  if (s === 'cards' || s === 'topics' || s === 'progress') { openScreen(s); return; }
  if (s === 'quiz') { meta.readingQuiz = true; startRun(); g.lives = 0; startQuiz(); }
}
