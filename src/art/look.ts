/** Bayraa's deel colours. Unlocked by collecting safety cards. */
export type OutfitId = 'blue' | 'green' | 'maroon' | 'gold' | 'winter' | 'festival';
export interface Outfit { id: OutfitId; label: string; need: number; lt: string; md: string; dk: string; trim: string; cuff: string; hat?: true | 'winter'; celebration?: number }

export const OUTFITS: readonly Outfit[] = [
  { id: 'blue', label: 'Цэнхэр', need: 0, lt: '#83a4c7', md: '#5379ab', dk: '#405b80', trim: '#e8b653', cuff: '#db9955' },
  { id: 'green', label: 'Ногоон', need: 3, lt: '#8eb99a', md: '#659775', dk: '#486c56', trim: '#e8b653', cuff: '#e5332a' },
  { id: 'maroon', label: 'Хүрэн улаан', need: 6, lt: '#c18b93', md: '#a06173', dk: '#6d4351', trim: '#e8b653', cuff: '#5379ab' },
  { id: 'gold', label: 'Алтан торго', need: 10, lt: '#ffe58a', md: '#e0a812', dk: '#94660a', trim: '#5379ab', cuff: '#e5332a' },
  { id: 'winter', label: 'Өвлийн хувцас', need: 20, lt: '#b9dce8', md: '#4d869e', dk: '#31566e', trim: '#f5e6c9', cuff: '#f5e6c9', hat: 'winter', celebration: 1 },
  { id: 'festival', label: 'Баярын хувцас', need: 30, lt: '#e4b4f0', md: '#9361b5', dk: '#53376d', trim: '#ffdc78', cuff: '#f3b455', hat: true, celebration: 2 },
];

/** The outfit currently worn. Set from saved progress. */
export const look: { outfit: Outfit } = { outfit: OUTFITS[0] };
