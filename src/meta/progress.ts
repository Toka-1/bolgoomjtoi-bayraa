import { TOPICS, type Topic } from './content';
import { OUTFITS, look, type OutfitId } from '../art/look';

/** Everything the player keeps between visits. */
export const progress = {
  cards: new Set<string>(),
  topics: new Set<Topic>(TOPICS.map(t => t.id)),
  sound: true,
};

const KEY = 'bayraa-progress-v1';

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      cards: [...progress.cards], topics: [...progress.topics], sound: progress.sound, outfit: look.outfit.id,
    }));
  } catch { /* storage blocked */ }
}

try {
  const s: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
  if (s && typeof s === 'object') {
    const o = s as { cards?: unknown; topics?: unknown; sound?: unknown; outfit?: unknown };
    if (Array.isArray(o.cards)) for (const c of o.cards) if (typeof c === 'string') progress.cards.add(c);
    if (Array.isArray(o.topics)) {
      const ok = o.topics.filter((t): t is Topic => TOPICS.some(x => x.id === t));
      if (ok.length) progress.topics = new Set(ok);
    }
    if (typeof o.sound === 'boolean') progress.sound = o.sound;
    const fit = OUTFITS.find(f => f.id === o.outfit);
    if (fit && progress.cards.size >= fit.need) look.outfit = fit;
  }
} catch { /* storage blocked or invalid */ }

/** Returns true when this is a newly earned card. */
export function unlockCard(cmd: string): boolean {
  if (progress.cards.has(cmd)) return false;
  progress.cards.add(cmd);
  save();
  return true;
}

export function wear(id: OutfitId): boolean {
  const fit = OUTFITS.find(f => f.id === id);
  if (!fit || progress.cards.size < fit.need) return false;
  look.outfit = fit; save();
  return true;
}

/** Toggle a teacher-mode topic; at least one stays selected. */
export function toggleTopic(t: Topic): void {
  if (progress.topics.has(t)) { if (progress.topics.size > 1) progress.topics.delete(t); }
  else progress.topics.add(t);
  save();
}

export function setSound(on: boolean): void { progress.sound = on; save(); }
