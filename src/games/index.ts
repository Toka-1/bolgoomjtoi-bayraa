import type { Micro } from './types';
import { Smoke } from './smoke';
import { Ice } from './ice';
import { Socket } from './socket';
import { Hat } from './hat';
import { Cow } from './cow';
import { Baby } from './baby';

export const games: Micro[] = [new Smoke(), new Ice(), new Socket(), new Hat(), new Cow(), new Baby()];
export type { Micro };
