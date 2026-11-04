import type { Micro } from './types';
import { Smoke } from './smoke';
import { Ice } from './ice';
import { Socket } from './socket';
import { Hat } from './hat';
import { Cow } from './cow';
import { Baby } from './baby';
import { Crossing } from './crossing';
import { Dust } from './dust';
import { Cabinet } from './cabinet';
import { River } from './river';

export const games: Micro[] = [new Smoke(), new Ice(), new Socket(), new Hat(), new Cow(), new Baby(), new Crossing(), new Dust(), new Cabinet(), new River()];
export type { Micro };
