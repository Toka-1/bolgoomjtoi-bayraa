/** Bayraa's deel colours. Unlocked by collecting safety cards. */
export type OutfitId = 'blue' | 'green' | 'maroon' | 'gold';
export interface Outfit { id: OutfitId; label: string; need: number; lt: string; md: string; dk: string; trim: string; cuff: string }

export const OUTFITS: readonly Outfit[] = [
  { id: 'blue', label: 'Цэнхэр', need: 0, lt: '#5a8cf0', md: '#2856c9', dk: '#142f78', trim: '#f4b400', cuff: '#f28c1b' },
  { id: 'green', label: 'Ногоон', need: 3, lt: '#5fcf8a', md: '#1f9a55', dk: '#0c5a30', trim: '#f4b400', cuff: '#e5332a' },
  { id: 'maroon', label: 'Хүрэн улаан', need: 6, lt: '#d0566a', md: '#9a1f36', dk: '#55101e', trim: '#f4b400', cuff: '#2856c9' },
  { id: 'gold', label: 'Алтан торго', need: 10, lt: '#ffe58a', md: '#e0a812', dk: '#94660a', trim: '#2856c9', cuff: '#e5332a' },
];

/** The outfit currently worn. Set from saved progress. */
export const look: { outfit: Outfit } = { outfit: OUTFITS[0] };
