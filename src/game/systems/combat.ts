import { distance, normalize } from '../engine/math';
import { PRNG } from '../engine/prng';
import { EnemyEntity, GameState } from '../engine/state';
import { generateSpecialBonusChoices } from './specialBonus';

export function updateCombat(state: GameState, dt: number, prng: PRNG): void {
  updateEnemyMovementAndAttacks(state, dt);

  state.fireTimer -= dt;
  const fireInterval = Math.max(0.08, state.weaponStats.fireInterval * (1 - state.playerStats.fireRateBonus) * state.runWeaponBonuses.cooldownMultiplier);
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

  if (state.unlocks.orbit) orbitTick(state, dt);

  for (const p of state.projectiles) {
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
  }
  for (const p of state.enemyProjectiles) {
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
  }

  for (const enemy of state.enemies) {
    enemy.hpDisplayTimer = Math.max(0, enemy.hpDisplayTimer - dt);
  }

  handleHits(state, prng);
}

function updateEnemyMovementAndAttacks(state: GameState, dt: number): void {
  const crowdRadius = 170;
  for (const enemy of state.enemies) {
    const toPlayer = { x: state.player.pos.x - enemy.pos.x, y: state.player.pos.y - enemy.pos.y };
    const dist = Math.hypot(toPlayer.x, toPlayer.y);
    const toward = normalize(toPlayer);

    let moveX = toward.x;
    let moveY = toward.y;

    if (enemy.behavior === 'ranged') {
      const pd = enemy.preferredDistance;
      if (dist < pd - 20) {
        moveX = -toward.x;
        moveY = -toward.y;
      } else if (dist < pd + 20) {
        moveX = -toward.y;
        moveY = toward.x;
      }

      enemy.attackTimer -= dt;
      if (enemy.attackTimer <= 0 && dist < pd + 120) {
        enemy.attackTimer += enemy.attackInterval;
        state.enemyProjectiles.push({
          id: state.nextEntityId++,
          pos: { ...enemy.pos },
          vel: { x: toward.x * enemy.projectileSpeed, y: toward.y * enemy.projectileSpeed },
          damage: enemy.projectileDamage,
          radius: 4,
        });
      }
    } else if (dist < crowdRadius) {
      const tangent = normalize({ x: -toward.y, y: toward.x });
      const mix = 0.45;
      moveX = toward.x * (1 - mix) + tangent.x * mix;
      moveY = toward.y * (1 - mix) + tangent.y * mix;
    }

    const dir = normalize({ x: moveX, y: moveY });
    enemy.pos.x += dir.x * enemy.speed * dt;
    enemy.pos.y += dir.y * enemy.speed * dt;
  }
}

function nearestEnemy(state: GameState): EnemyEntity | undefined {
  let best: EnemyEntity | undefined;
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
  const target = nearestEnemy(state);
  if (!target) return;
  const aim = normalize({ x: target.pos.x - state.player.pos.x, y: target.pos.y - state.player.pos.y });
  const totalShots = state.weaponStats.count + state.runWeaponBonuses.extraShots;
  for (let i = 0; i < totalShots; i += 1) {
    const spread = (i - (totalShots - 1) / 2) * 0.12 + (prng.next() - 0.5) * 0.04;
    const angle = Math.atan2(aim.y, aim.x) + spread;
    const crit = prng.next() < state.playerStats.critChance;
    const damage = state.weaponStats.damage * (1 + state.playerStats.damageBonus) * state.runWeaponBonuses.damageMultiplier * (crit ? state.playerStats.critDamage : 1);
    state.projectiles.push({
      id: state.nextEntityId++,
      pos: { ...state.player.pos },
      vel: { x: Math.cos(angle) * state.weaponStats.projectileSpeed, y: Math.sin(angle) * state.weaponStats.projectileSpeed },
      damage,
      radius: 4,
      pierceLeft: state.weaponStats.pierce,
      knockback: state.weaponStats.knockback,
      isCrit: crit,
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
      damage: state.weaponStats.damage * 0.9 * state.runWeaponBonuses.damageMultiplier,
      radius: 3,
      pierceLeft: 0,
      knockback: 6,
      isCrit: false,
    });
  }
}

function shockwave(state: GameState): void {
  for (const e of state.enemies) {
    if (distance(e.pos, state.player.pos) < 110) {
      const dmg = 18 * (1 + state.playerStats.damageBonus) * state.runWeaponBonuses.damageMultiplier;
      e.hp -= dmg;
      e.hpDisplayTimer = 1.2;
      addFloatingDamage(state, e.pos.x, e.pos.y, dmg, false);
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
        const dmg = 24 * dt * state.runWeaponBonuses.damageMultiplier;
        e.hp -= dmg;
        e.hpDisplayTimer = 0.4;
      }
    }
  }
}

function addFloatingDamage(state: GameState, x: number, y: number, damage: number, crit: boolean): void {
  if (state.floatingTexts.length > 80) state.floatingTexts.splice(0, 20);
  state.floatingTexts.push({ id: state.nextEntityId++, pos: { x, y: y - 8 }, value: Math.round(damage), crit, life: 0.8, maxLife: 0.8 });
}

function handleHits(state: GameState, prng: PRNG): void {
  const removeProjectiles = new Set<number>();

  for (const p of state.projectiles) {
    for (const e of state.enemies) {
      if (distance(p.pos, e.pos) <= p.radius + e.radius) {
        e.hp -= p.damage;
        e.hpDisplayTimer = 1.4;
        addFloatingDamage(state, e.pos.x, e.pos.y, p.damage, p.isCrit);
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

  state.enemyProjectiles = state.enemyProjectiles.filter((p) => {
    if (distance(p.pos, state.player.pos) <= p.radius + 12) {
      const dmg = Math.max(1, p.damage - state.playerStats.armor);
      state.player.hp -= dmg;
      return false;
    }
    return Math.abs(p.pos.x - state.player.pos.x) < 1200 && Math.abs(p.pos.y - state.player.pos.y) < 1200;
  });

  let triggeredSpecial = false;
  const dead = state.enemies.filter((e) => e.hp <= 0);
  for (const e of dead) {
    state.kills += 1;
    state.runCoins += e.coinValue;
    if (prng.next() < e.gemChance) state.runGems += 1;
    state.orbs.push({ id: state.nextEntityId++, pos: { ...e.pos }, value: e.xpValue });

    if (e.isElite && !state.pendingSpecialChoices && !triggeredSpecial) {
      state.pendingSpecialChoices = generateSpecialBonusChoices(prng);
      state.paused = true;
      triggeredSpecial = true;
    }
  }
  state.enemies = state.enemies.filter((e) => e.hp > 0);
}
