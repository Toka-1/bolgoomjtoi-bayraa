/** One microgame. Coordinates are in the 360×640 game frame. */
export interface Micro {
  /** Stable framing shared by play, practice previews and pointer conversion. */
  readonly focus?: { zoom: number; y: number; height?: number };
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
  /** Cosmetic changes only: no movement, collisions, or scoring. */
  resultUpdate?(dt: number): void;
  /** Clear held controls without completing a gesture. */
  cancelInput?(): void;
  readonly keys?: string;
  draw(): void;
  /** Hazard cues during play; cosmetic only and separate from action hints. */
  danger?(): void;
  /** Highlights the action or destination needed during play. */
  hint?(): void;
  down?(x: number, y: number): void;
  /** Right-click toggles mouse selection; returns whether the object is held. */
  select?(x: number, y: number): boolean;
  move?(x: number, y: number): void;
  up?(x: number, y: number): void;
  key?(k: string, isDown: boolean): void;
}
