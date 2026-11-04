import type { Micro } from '../games/types';
import { infoOf, type Quiz } from './content';
import { progress, unlockCard } from './progress';
import { games } from '../games';

export interface QuizItem extends Quiz { cmd: string }

/**
 * The flow's only window onto meta-game features (cards, topics, quiz), kept to one object
 * so the flow tests can stub it.
 */
export const meta = {
  unlock: (cmd: string): boolean => unlockCard(cmd),
  allowed: (m: Micro): boolean => { const i = infoOf(m.cmd); return !i || progress.topics.has(i.topic); },
  /** Three questions, preferring the games played this run. */
  quiz(played: readonly string[]): QuizItem[] {
    const pool = [...new Set(played)].filter(c => infoOf(c));
    const extra = games.map(m => m.cmd).filter(c => infoOf(c) && !pool.includes(c));
    const shuffle = <T,>(a: T[]): T[] => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const pick = [...shuffle(pool), ...shuffle(extra)].slice(0, 3);
    return pick.map(cmd => ({ cmd, ...infoOf(cmd)!.quiz }));
  },
};
