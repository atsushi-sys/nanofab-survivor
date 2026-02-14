import { distance } from '../engine/math';
import { xpCurve, GameState } from '../engine/state';

export function updatePickups(state: GameState, dt: number): void {
  state.player.hp = Math.min(state.playerStats.maxHp, state.player.hp + state.playerStats.regen * dt);

  state.orbs = state.orbs.filter((orb) => {
    const d = distance(orb.pos, state.player.pos);
    if (d <= state.playerStats.pickupRadius) {
      state.xp += orb.value * (1 + state.playerStats.xpGain);
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

  for (const e of state.enemies) {
    if (distance(e.pos, state.player.pos) <= e.radius + 14) {
      state.player.contactTimer -= dt;
      if (state.player.contactTimer <= 0) {
        state.player.contactTimer = 0.35;
        const dmg = Math.max(1, e.damage - state.playerStats.armor);
        state.player.hp -= dmg;
      }
    }
  }

  if (state.player.hp <= 0) state.result = 'lose';
  if (state.time >= 180) state.result = 'win';
}
