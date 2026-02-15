import { GameState } from '../engine/state';
import { PRNG } from '../engine/prng';

export function updateSpawner(state: GameState, dt: number, _prng: PRNG): void {
  state.worm.headS += state.worm.speed * dt;

  for (let i = 0; i < state.worm.segments.length; i += 1) {
    state.worm.segments[i].s = state.worm.headS - i * state.worm.spacing;
  }

  if (state.worm.headS >= state.worm.goalS) {
    state.result = 'lose';
  }
}
