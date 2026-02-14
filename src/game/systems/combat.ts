import { distance, normalize } from '../engine/math';
import { PRNG } from '../engine/prng';
import { GameState } from '../engine/state';

export function updateCombat(state: GameState, dt: number, prng: PRNG): void {
  for (const enemy of state.enemies) {
    const dir = normalize({ x: state.player.pos.x - enemy.pos.x, y: state.player.pos.y - enemy.pos.y });
    enemy.pos.x += dir.x * enemy.speed * dt;
    enemy.pos.y += dir.y * enemy.speed * dt;
  }

  state.fireTimer -= dt;
  const fireInterval = Math.max(0.1, state.weaponStats.fireInterval * (1 - state.playerStats.fireRateBonus));
  if (state.fireTimer <= 0) {
    state.fireTimer += fireInterval;
    fireBaseWeapon(state, prng);
  }

  if (state.unlocks.cone) {
    state.coneTimer -= dt;
    if (state.coneTimer <= 0) {
      state.coneTimer = 2.4;
      fireCone(state);
    }
  }

  if (state.unlocks.shockwave) {
    state.shockwaveTimer -= dt;
    if (state.shockwaveTimer <= 0) {
      state.shockwaveTimer = 4;
      shockwave(state);
    }
  }

  if (state.unlocks.orbit) {
    orbitTick(state, dt);
  }

  for (const p of state.projectiles) {
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
  }

  handleHits(state, prng);
}

function nearestEnemy(state: GameState) {
  let best = state.enemies[0];
  let bestD = Number.POSITIVE_INFINITY;
  for (const e of state.enemies) {
    const d = distance(e.pos, state.player.pos);
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

function fireBaseWeapon(state: GameState, prng: PRNG): void {
  if (state.enemies.length === 0) return;
  const target = nearestEnemy(state);
  if (!target) return;
  const aim = normalize({ x: target.pos.x - state.player.pos.x, y: target.pos.y - state.player.pos.y });
  for (let i = 0; i < state.weaponStats.count; i += 1) {
    const spread = (i - (state.weaponStats.count - 1) / 2) * 0.12 + (prng.next() - 0.5) * 0.04;
    const angle = Math.atan2(aim.y, aim.x) + spread;
    const crit = prng.next() < state.playerStats.critChance;
    const damage = (state.weaponStats.damage * (1 + state.playerStats.damageBonus)) * (crit ? state.playerStats.critDamage : 1);
    state.projectiles.push({
      id: state.nextEntityId++,
      pos: { ...state.player.pos },
      vel: { x: Math.cos(angle) * state.weaponStats.projectileSpeed, y: Math.sin(angle) * state.weaponStats.projectileSpeed },
      damage,
      radius: 4,
      pierceLeft: state.weaponStats.pierce,
      knockback: state.weaponStats.knockback,
    });
  }
}

function fireCone(state: GameState): void {
  const base = state.enemies[0] ? Math.atan2(state.enemies[0].pos.y - state.player.pos.y, state.enemies[0].pos.x - state.player.pos.x) : 0;
  for (const offset of [-0.3, 0, 0.3]) {
    state.projectiles.push({
      id: state.nextEntityId++,
      pos: { ...state.player.pos },
      vel: { x: Math.cos(base + offset) * 280, y: Math.sin(base + offset) * 280 },
      damage: state.weaponStats.damage * 0.9,
      radius: 3,
      pierceLeft: 0,
      knockback: 6,
    });
  }
}

function shockwave(state: GameState): void {
  for (const e of state.enemies) {
    if (distance(e.pos, state.player.pos) < 110) {
      e.hp -= 18 * (1 + state.playerStats.damageBonus);
    }
  }
}

function orbitTick(state: GameState, dt: number): void {
  const t = state.time * 2.2;
  const radius = 58;
  for (let i = 0; i < 2; i += 1) {
    const a = t + i * Math.PI;
    const orbPos = { x: state.player.pos.x + Math.cos(a) * radius, y: state.player.pos.y + Math.sin(a) * radius };
    for (const e of state.enemies) {
      if (distance(orbPos, e.pos) < e.radius + 10) {
        e.hp -= 24 * dt;
      }
    }
  }
}

function handleHits(state: GameState, prng: PRNG): void {
  const removeProjectiles = new Set<number>();

  for (const p of state.projectiles) {
    for (const e of state.enemies) {
      if (distance(p.pos, e.pos) <= p.radius + e.radius) {
        e.hp -= p.damage;
        const dir = normalize({ x: e.pos.x - state.player.pos.x, y: e.pos.y - state.player.pos.y });
        e.pos.x += dir.x * p.knockback;
        e.pos.y += dir.y * p.knockback;
        p.pierceLeft -= 1;
        if (p.pierceLeft < 0) {
          removeProjectiles.add(p.id);
          break;
        }
      }
    }
  }

  state.projectiles = state.projectiles.filter((p) => !removeProjectiles.has(p.id));

  const dead = state.enemies.filter((e) => e.hp <= 0);
  for (const e of dead) {
    state.kills += 1;
    state.runCoins += e.coinValue;
    if (prng.next() < e.gemChance) state.runGems += 1;
    state.orbs.push({ id: state.nextEntityId++, pos: { ...e.pos }, value: e.xpValue });
  }
  state.enemies = state.enemies.filter((e) => e.hp > 0);
}
