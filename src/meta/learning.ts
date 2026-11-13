/**
 * Learning record: how each hazard went the first time (before any lesson) versus afterwards.
 * The first attempt at a hazard works as a pre-test; later attempts, after the "learn together"
 * lesson, work as the post-test. Everything stays on the device.
 */

export interface HazardStat {
  /** attempts, wins */
  a: number; w: number;
  /** result of the very first attempt: 1 safe, 0 not */
  first: 0 | 1;
  /** current run of safe results */
  streak: number;
  /** results after the first attempt, newest last, at most RECENT entries */
  later: (0 | 1)[];
}
export interface QuizResult { right: number; total: number }

const KEY = 'bayraa-learning-v1';
const RECENT = 6;
/** Two safe results in a row after a hazard has been seen counts as learned. */
const LEARNED_STREAK = 2;

export const learning = {
  stats: {} as Record<string, HazardStat>,
  quizFirst: null as QuizResult | null,
  quizLast: null as QuizResult | null,
};

function save(): void {
  try { localStorage.setItem(KEY, JSON.stringify(learning)); } catch { /* storage blocked */ }
}

const bit = (v: unknown): 0 | 1 => (v === 1 ? 1 : 0);
const count = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
function quizOf(v: unknown): QuizResult | null {
  if (!v || typeof v !== 'object') return null;
  const q = v as { right?: unknown; total?: unknown };
  const total = count(q.total), right = Math.min(count(q.right), total);
  return total ? { right, total } : null;
}

/** Restore saved progress, ignoring anything malformed. */
export function loadLearning(raw: unknown): void {
  learning.stats = {}; learning.quizFirst = null; learning.quizLast = null;
  if (!raw || typeof raw !== 'object') return;
  const o = raw as { stats?: unknown; quizFirst?: unknown; quizLast?: unknown };
  if (o.stats && typeof o.stats === 'object') {
    for (const [cmd, v] of Object.entries(o.stats as Record<string, unknown>)) {
      if (!v || typeof v !== 'object') continue;
      const s = v as Partial<Record<keyof HazardStat, unknown>>;
      const a = count(s.a);
      if (!a) continue;
      const later = Array.isArray(s.later) ? s.later.map(bit).slice(-RECENT) : [];
      learning.stats[cmd] = { a, w: Math.min(count(s.w), a), first: bit(s.first), streak: count(s.streak), later };
    }
  }
  learning.quizFirst = quizOf(o.quizFirst);
  learning.quizLast = quizOf(o.quizLast);
}

try { loadLearning(JSON.parse(localStorage.getItem(KEY) ?? 'null')); } catch { /* storage blocked or invalid */ }

/** Record one finished attempt at a hazard. */
export function recordAttempt(cmd: string, ok: boolean): void {
  const r: 0 | 1 = ok ? 1 : 0;
  const s = learning.stats[cmd];
  if (!s) learning.stats[cmd] = { a: 1, w: r, first: r, streak: r, later: [] };
  else {
    s.a++; s.w += r; s.streak = ok ? s.streak + 1 : 0;
    s.later.push(r); if (s.later.length > RECENT) s.later.shift();
  }
  save();
}

export function recordQuiz(right: number, total: number): void {
  if (total <= 0) return;
  const q = { right: Math.max(0, Math.min(right, total)), total };
  learning.quizFirst ??= q;
  learning.quizLast = q;
  save();
}

export type Mastery = 'new' | 'learning' | 'learned';
export function masteryOf(cmd: string): Mastery {
  const s = learning.stats[cmd];
  if (!s) return 'new';
  return s.streak >= LEARNED_STREAK ? 'learned' : 'learning';
}

export interface LearningSummary {
  /** hazards attempted at least once */
  tried: number;
  learned: number;
  /** share of hazards handled safely on the very first try (0–1) */
  firstRate: number;
  /** share of safe results in recent attempts after the first one (0–1); null until there is enough data */
  laterRate: number | null;
  laterAttempts: number;
}

/** Minimum repeat attempts before the "after" rate is shown, so one lucky round does not read as progress. */
export const MIN_LATER = 4;

export function summary(cmds: readonly string[]): LearningSummary {
  let tried = 0, learned = 0, firstOk = 0, laterOk = 0, laterN = 0;
  for (const c of cmds) {
    const s = learning.stats[c];
    if (!s) continue;
    tried++; firstOk += s.first;
    if (s.streak >= LEARNED_STREAK) learned++;
    for (const r of s.later) { laterOk += r; laterN++; }
  }
  return {
    tried, learned,
    firstRate: tried ? firstOk / tried : 0,
    laterRate: laterN >= MIN_LATER ? laterOk / laterN : null,
    laterAttempts: laterN,
  };
}

/** Hazards to revisit: tried, not yet learned, weakest recent record first. */
export function weakest(cmds: readonly string[], n = 3): string[] {
  const rate = (s: HazardStat): number => {
    const rs = s.later.length ? s.later : [s.first];
    return rs.reduce<number>((a, b) => a + b, 0) / rs.length;
  };
  return cmds
    .filter(c => learning.stats[c] && masteryOf(c) !== 'learned')
    .sort((a, b) => rate(learning.stats[a]) - rate(learning.stats[b]) || learning.stats[b].a - learning.stats[a].a)
    .slice(0, n);
}

/** Dev and test helper. */
export function resetLearning(): void { loadLearning(null); save(); }
