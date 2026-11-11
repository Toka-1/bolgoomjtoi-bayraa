/** What a microgame can tell the game flow, and read back from it. Wired up in flow.ts. */
export const ctl = {
  win: (): void => {},
  lose: (_msg: string): void => {},
  /** 0→1 progress of the current round's timer. */
  frac: 0,
  /** True while the player can act, outside menus and results. */
  playing: false,
  /** Mechanic challenge: practice/early rounds 0, then 1 and 2. */
  stage: 0,
  /** Small layout/timing variation; zero in practice. */
  variation: 0,
};
