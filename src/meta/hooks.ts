import type { Micro } from '../games/types';
import { infoOf, type Quiz } from './content';
import { progress, unlockCard } from './progress';
import { games } from '../games';
import { speak, stopSpeaking } from '../core/audio';
import { OUTFITS } from '../art/look';
import { recordAttempt, recordQuiz } from './learning';

export interface QuizItem extends Quiz { cmd: string }

/**
 * The flow's only window onto meta-game features (cards, topics, quiz), kept to one object
 * so the flow tests can stub it.
 */
export const meta = {
  narrate: (message: string): void => speak(message),
  /** Read the round's command aloud, for children who cannot read it yet. */
  announce: (cmd: string): void => speak(cmd),
  silence: (): void => stopSpeaking(),
  /** Learning record for the progress screen (first try vs after the lesson). */
  record: (cmd: string, ok: boolean): void => recordAttempt(cmd, ok),
  recordQuiz: (right: number, total: number): void => recordQuiz(right, total),
  /** Reading questions belong to the adult-led mode. */
  readingQuiz: false,
  unlock: (cmd: string): boolean => unlockCard(cmd),
  reward: (): number => OUTFITS.findIndex(f => f.need > 0 && f.need === progress.cards.size),
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
