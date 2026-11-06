/** Bayraa's deel colours. Unlocked by collecting safety cards. */
export type OutfitId = 'blue' | 'green' | 'maroon' | 'gold';
export interface Outfit { id: OutfitId; label: string; need: number; lt: string; md: string; dk: string; trim: string; cuff: string }

export const OUTFITS: readonly Outfit[] = [
  { id: 'blue', label: 'Цэнхэр', need: 0, lt: '#83a4c7', md: '#5379ab', dk: '#405b80', trim: '#e8b653', cuff: '#db9955' },
  { id: 'green', label: 'Ногоон', need: 3, lt: '#8eb99a', md: '#659775', dk: '#486c56', trim: '#e8b653', cuff: '#e5332a' },
  { id: 'maroon', label: 'Хүрэн улаан', need: 6, lt: '#c18b93', md: '#a06173', dk: '#6d4351', trim: '#e8b653', cuff: '#5379ab' },
  { id: 'gold', label: 'Алтан торго', need: 10, lt: '#ffe58a', md: '#e0a812', dk: '#94660a', trim: '#5379ab', cuff: '#e5332a' },
];

/** The outfit currently worn. Set from saved progress. */
export const look: { outfit: Outfit } = { outfit: OUTFITS[0] };
