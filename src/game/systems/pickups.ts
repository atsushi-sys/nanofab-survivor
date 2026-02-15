import { distance } from '../engine/math';
import { GameState, xpCurve } from '../engine/state';
import { PRNG } from '../engine/prng';

export function updatePickups(state: GameState, dt: number, prng: PRNG): void {
  state.orbs = state.orbs.filter((orb) => {
    const d = distance(orb.pos, state.player.pos);
    if (d <= state.playerStats.pickupRadius + 18) {
      state.xp += orb.value * (1 + state.playerStats.xpGain);
      return false;
    }
    return true;
  });

  state.specialSpawnTimer -= dt;
  if (state.specialSpawnTimer <= 0) {
    state.specialSpawnTimer = 14 - Math.min(6, state.time * 0.02);
    const x = -440 + prng.next() * 880;
    state.specialPickups.push({
      id: state.nextEntityId++,
      pos: { x, y: state.playerLaneY - 40 },
      type: 'bigXp',
      value: 24,
      life: 10,
    });
  }

  state.specialPickups = state.specialPickups.filter((p) => {
    p.life -= dt;
    if (p.life <= 0) return false;
    if (distance(p.pos, state.player.pos) <= state.playerStats.pickupRadius + 12) {
      state.xp += p.value * (1 + state.playerStats.xpGain);
      return false;
    }
    return true;
  });

  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = xpCurve(state.level);
    state.pendingUpgradeChoices = [];
  }

  state.floatingTexts = state.floatingTexts.filter((t) => {
    t.life -= dt;
    t.pos.y -= 26 * dt;
    return t.life > 0;
  });
}
