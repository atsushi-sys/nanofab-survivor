import { ENEMIES } from '../data/enemies';
import { Vec2 } from '../engine/math';
import { PRNG } from '../engine/prng';
import { GameState } from '../engine/state';

function weightForTime(defId: string, t: number): number {
  const def = ENEMIES.find((e) => e.id === defId);
  if (!def) return 0;
  return def.spawnWeightByTime.reduce((acc, r) => (t >= r.start && t < r.end ? acc + r.weight : acc), 0);
}

export function updateSpawner(state: GameState, dt: number, prng: PRNG): void {
  const perSecond = 1 + state.time * 0.032;
  state.spawnAccumulator += perSecond * dt;

  while (state.spawnAccumulator >= 1) {
    state.spawnAccumulator -= 1;
    const candidates = ENEMIES.filter((e) => weightForTime(e.id, state.time) > 0);
    if (candidates.length === 0) return;

    const def = prng.pickWeighted(candidates, (c) => weightForTime(c.id, state.time));
    const angle = prng.next() * Math.PI * 2;
    const dist = 380 + prng.next() * 180;
    const spawn: Vec2 = {
      x: state.player.pos.x + Math.cos(angle) * dist,
      y: state.player.pos.y + Math.sin(angle) * dist,
    };

    state.spawnedCount += 1;
    const eliteSpawn = state.spawnedCount % 20 === 0;
    const hpScale = 1 + Math.floor(state.kills / 20) * 0.12;
    const eliteHpBonus = eliteSpawn ? 1.35 : 1;

    state.enemies.push({
      id: state.nextEntityId++,
      defId: def.id,
      pos: spawn,
      hp: def.hp * hpScale * eliteHpBonus,
      maxHp: def.hp * hpScale * eliteHpBonus,
      radius: def.radius,
      speed: eliteSpawn ? def.speed * 1.08 : def.speed,
      damage: eliteSpawn ? def.damage * 1.15 : def.damage,
      xpValue: eliteSpawn ? Math.round(def.xpValue * 1.6) : def.xpValue,
      coinValue: eliteSpawn ? Math.round(def.coinValue * 2) : def.coinValue,
      gemChance: eliteSpawn ? Math.min(1, def.gemChance + 0.12) : def.gemChance,
      color: eliteSpawn ? '#facc15' : def.color,
      marker: def.marker,
      behavior: def.behavior,
      preferredDistance: def.rangedAttack?.preferredDistance ?? 0,
      attackInterval: def.rangedAttack?.interval ?? 0,
      attackTimer: def.rangedAttack?.interval ? 0.5 + prng.next() * def.rangedAttack.interval : 0,
      projectileSpeed: def.rangedAttack?.projectileSpeed ?? 0,
      projectileDamage: eliteSpawn ? (def.rangedAttack?.projectileDamage ?? 0) * 1.15 : def.rangedAttack?.projectileDamage ?? 0,
      hpDisplayTimer: eliteSpawn ? 999 : 0,
      isElite: eliteSpawn,
    });
  }
}
