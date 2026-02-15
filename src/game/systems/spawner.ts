import { GameState } from '../engine/state';
import { samplePath } from '../engine/path';
import { PRNG } from '../engine/prng';

export function updateSpawner(state: GameState, dt: number, _prng: PRNG): void {
  state.worm.headS += state.worm.speed * dt;

  for (let i = 0; i < state.worm.segments.length; i += 1) {
    state.worm.segments[i].s = state.worm.headS - i * state.worm.spacing;
  }

  if (state.worm.segments.length > 0) {
    const headPos = samplePath(state.worm.path, state.worm.segments[0].s);
    state.headWorldY = headPos.y;
    if (headPos.y >= state.defendLineWorldY) {
      state.result = 'lose';
      state.resultReason = 'Head Breach';
    }
  } else {
    state.headWorldY = Number.NEGATIVE_INFINITY;
  }
}
