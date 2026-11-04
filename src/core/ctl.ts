/** What a microgame can tell the game flow, and read back from it. Wired up in flow.ts. */
export const ctl = {
  win: (): void => {},
  lose: (_msg: string): void => {},
  /** 0→1 progress of the current round's timer. */
  frac: 0,
  /** True while the player can act (not intro / result). */
  playing: false,
};
