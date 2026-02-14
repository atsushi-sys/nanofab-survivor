import { distance } from '../engine/math';
import { GameState, xpCurve } from '../engine/state';
import { PRNG } from '../engine/prng';

export function updatePickups(state: GameState, dt: number, prng: PRNG): void {
  state.player.hp = Math.min(state.playerStats.maxHp, state.player.hp + state.playerStats.regen * dt);

  state.orbs = state.orbs.filter((orb) => {
    const d = distance(orb.pos, state.player.pos);
    if (d <= state.playerStats.pickupRadius) {
      state.xp += orb.value * (1 + state.playerStats.xpGain);
      return false;
    }
    return true;
  });

  state.specialSpawnTimer -= dt;
  if (state.specialSpawnTimer <= 0) {
    state.specialSpawnTimer = 14 - Math.min(6, state.time * 0.02);
    const angle = prng.next() * Math.PI * 2;
    const dist = 120 + prng.next() * 240;
    state.specialPickups.push({
      id: state.nextEntityId++,
      pos: { x: state.player.pos.x + Math.cos(angle) * dist, y: state.player.pos.y + Math.sin(angle) * dist },
      type: prng.next() < 0.6 ? 'bigXp' : 'heal',
      value: prng.next() < 0.6 ? 22 : 20,
      life: 12,
    });
  }

  state.specialPickups = state.specialPickups.filter((p) => {
    p.life -= dt;
    if (p.life <= 0) return false;
    if (distance(p.pos, state.player.pos) <= state.playerStats.pickupRadius + 10) {
      if (p.type === 'bigXp') state.xp += p.value * (1 + state.playerStats.xpGain);
      else state.player.hp = Math.min(state.playerStats.maxHp, state.player.hp + p.value);
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

  state.floatingTexts = state.floatingTexts.filter((t) => {
    t.life -= dt;
    t.pos.y -= 26 * dt;
    return t.life > 0;
  });

  if (state.player.hp <= 0) state.result = 'lose';
  if (state.time >= 180) state.result = 'win';
}
