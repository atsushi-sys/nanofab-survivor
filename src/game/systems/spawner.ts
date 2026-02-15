import { WORM_DEF } from '../data/enemies';
import { PRNG } from '../engine/prng';
import { GameState } from '../engine/state';

function hpScaleFromKills(kills: number): number {
  return 1 + kills * 0.005;
}

function appendSegment(state: GameState, prng: PRNG): void {
  state.spawnedCount += 1;
  const isElite = state.spawnedCount % WORM_DEF.eliteEvery === 0;
  const scale = hpScaleFromKills(state.kills) * (isElite ? 1.3 : 1);
  const hp = WORM_DEF.segmentHp * scale;
  state.worm.segments.push({
    id: state.nextEntityId++,
    hp,
    maxHp: hp,
    radius: WORM_DEF.segmentRadius,
    s: 0,
    isElite,
    hpDisplayTimer: isElite ? 999 : 0,
  });

  if (prng.next() < 0.01) {
    // slight jitter in future segment toughness so runs do not feel flat.
    const seg = state.worm.segments[state.worm.segments.length - 1];
    seg.hp *= 1.08;
    seg.maxHp *= 1.08;
  }
}

export function updateSpawner(state: GameState, dt: number, prng: PRNG): void {
  state.worm.headS += state.worm.speed * dt;

  const maxSegments = 92;
  if (state.worm.segments.length < maxSegments) {
    state.spawnAccumulator += dt * 0.85;
    while (state.spawnAccumulator >= 1 && state.worm.segments.length < maxSegments) {
      state.spawnAccumulator -= 1;
      appendSegment(state, prng);
    }
  }

  for (let i = 0; i < state.worm.segments.length; i += 1) {
    state.worm.segments[i].s = state.worm.headS - i * state.worm.spacing;
  }

  if (state.worm.headS >= state.worm.goalS) {
    state.result = 'lose';
  }
}
