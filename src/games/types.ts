/** One microgame. Coordinates are in the 360×640 game frame. */
export interface Micro {
  readonly cmd: string;
  readonly sub: string;
  /** Message shown when the timer runs out (unless timeoutWin). */
  readonly lose: string;
  /** Safety tip shown after losing. */
  readonly tip: string;
  /** Surviving until the timer ends counts as a win. */
  readonly timeoutWin?: boolean;
  readonly winText?: string;
  dead: boolean;
  init(): void;
  update(dt: number): void;
  draw(): void;
  down?(x: number, y: number): void;
  move?(x: number, y: number): void;
  up?(x: number, y: number): void;
  key?(k: string, isDown: boolean): void;
}
