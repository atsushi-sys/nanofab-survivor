import { ENEMIES } from '../data/enemies';
import { PRNG } from '../engine/prng';
import { GameState } from '../engine/state';
import { Vec2 } from '../engine/math';

function weightForTime(defId: string, t: number): number {
  const def = ENEMIES.find((e) => e.id === defId);
  if (!def) return 0;
  return def.spawnWeightByTime.reduce((acc, r) => {
    if (t >= r.start && t < r.end) return acc + r.weight;
    return acc;
  }, 0);
}

export function updateSpawner(state: GameState, dt: number, prng: PRNG): void {
  const perSecond = 1 + state.time * 0.032;
  const spawnBudget = perSecond * dt;
  (state as GameState & { _spawnCarry?: number })._spawnCarry = ((state as GameState & { _spawnCarry?: number })._spawnCarry ?? 0) + spawnBudget;
  const internal = state as GameState & { _spawnCarry?: number };

  while ((internal._spawnCarry ?? 0) >= 1) {
    internal._spawnCarry! -= 1;
    const candidates = ENEMIES.filter((e) => weightForTime(e.id, state.time) > 0);
    if (candidates.length === 0) return;
    const def = prng.pickWeighted(candidates, (c) => weightForTime(c.id, state.time));
    const angle = prng.next() * Math.PI * 2;
    const dist = 380 + prng.next() * 180;
    const spawn: Vec2 = {
      x: state.player.pos.x + Math.cos(angle) * dist,
      y: state.player.pos.y + Math.sin(angle) * dist,
    };
    state.enemies.push({
      id: state.nextEntityId++,
      defId: def.id,
      pos: spawn,
      hp: def.hp,
      radius: def.radius,
      speed: def.speed,
      damage: def.damage,
      xpValue: def.xpValue,
      coinValue: def.coinValue,
      gemChance: def.gemChance,
      color: def.color,
      marker: def.marker,
    });
  }
}
