import { WORM_DEF } from '../data/enemies';
import { clamp, distance } from '../engine/math';
import { projectToPath, samplePath } from '../engine/path';
import { PRNG } from '../engine/prng';
import { GameState } from '../engine/state';
import { generateSpecialBonusChoices } from './specialBonus';

export function updateCombat(state: GameState, dt: number, prng: PRNG): void {
  state.fireTimer -= dt;
  const fireInterval = Math.max(0.08, state.weaponStats.fireInterval * (1 - state.playerStats.fireRateBonus) * state.runWeaponBonuses.cooldownMultiplier);
  if (state.fireTimer <= 0) {
    state.fireTimer += fireInterval;
    fireUpward(state, prng);
  }

  for (const p of state.projectiles) {
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
  }

  for (const seg of state.worm.segments) {
    seg.hpDisplayTimer = Math.max(0, seg.hpDisplayTimer - dt);
  }

  handleProjectileHits(state, prng);

  const padded = 40;
  const half = state.worldSize / 2;
  state.projectiles = state.projectiles.filter((p) => p.pos.y > -1200 && p.pos.y < 1400 && p.pos.x > -half - padded && p.pos.x < half + padded);
}

function fireUpward(state: GameState, prng: PRNG): void {
  const totalShots = state.weaponStats.count + state.runWeaponBonuses.extraShots;
  for (let i = 0; i < totalShots; i += 1) {
    const spread = (i - (totalShots - 1) / 2) * 0.12 + (prng.next() - 0.5) * 0.05;
    const angle = -Math.PI / 2 + spread;
    const crit = prng.next() < state.playerStats.critChance;
    const damage = state.weaponStats.damage * (1 + state.playerStats.damageBonus) * state.runWeaponBonuses.damageMultiplier * (crit ? state.playerStats.critDamage : 1);

    state.projectiles.push({
      id: state.nextEntityId++,
      pos: { ...state.player.pos },
      vel: { x: Math.cos(angle) * state.weaponStats.projectileSpeed, y: Math.sin(angle) * state.weaponStats.projectileSpeed },
      damage,
      radius: state.weaponStats.count > 5 ? 3 : 4,
      pierceLeft: state.weaponStats.pierce,
      knockback: state.weaponStats.knockback,
      isCrit: crit,
    });
  }
}

function addFloatingDamage(state: GameState, x: number, y: number, damage: number, crit: boolean): void {
  if (state.floatingTexts.length > 80) state.floatingTexts.splice(0, 20);
  state.floatingTexts.push({ id: state.nextEntityId++, pos: { x, y: y - 8 }, value: Math.round(damage), crit, life: 0.8, maxLife: 0.8 });
}

function handleProjectileHits(state: GameState, prng: PRNG): void {
  const removeProjectileIds = new Set<number>();
  const damageBySegment = new Map<number, { damage: number; crit: boolean }>();

  for (const p of state.projectiles) {
    const sProjection = projectToPath(state.worm.path, p.pos);
    const centerIndex = Math.round((state.worm.headS - sProjection) / state.worm.spacing);

    for (let d = -3; d <= 3; d += 1) {
      const idx = centerIndex + d;
      if (idx < 0 || idx >= state.worm.segments.length) continue;
      const seg = state.worm.segments[idx];
      const segPos = samplePath(state.worm.path, seg.s);
      if (distance(p.pos, segPos) <= p.radius + seg.radius) {
        const stack = damageBySegment.get(idx) ?? { damage: 0, crit: false };
        stack.damage += p.damage;
        stack.crit = stack.crit || p.isCrit;
        damageBySegment.set(idx, stack);

        p.pierceLeft -= 1;
        if (p.pierceLeft < 0) {
          removeProjectileIds.add(p.id);
          break;
        }
      }
    }
  }

  const broken: number[] = [];
  for (const [idx, payload] of damageBySegment.entries()) {
    if (idx < 0 || idx >= state.worm.segments.length) continue;
    const seg = state.worm.segments[idx];
    seg.hp -= payload.damage;
    seg.hpDisplayTimer = 1.5;
    const segPos = samplePath(state.worm.path, seg.s);
    addFloatingDamage(state, segPos.x, segPos.y, payload.damage, payload.crit);
    if (seg.hp <= 0) broken.push(idx);
  }

  if (broken.length > 0) {
    const ordered = [...new Set(broken)].sort((a, b) => b - a);
    let specialTriggered = false;

    for (const idx of ordered) {
      if (idx < 0 || idx >= state.worm.segments.length) continue;
      const seg = state.worm.segments[idx];
      state.kills += 1;
      state.runCoins += WORM_DEF.coinValue + (seg.isElite ? 2 : 0);
      if (prng.next() < WORM_DEF.gemChance + (seg.isElite ? 0.15 : 0)) state.runGems += 1;

      const segPos = samplePath(state.worm.path, seg.s);
      state.orbs.push({ id: state.nextEntityId++, pos: segPos, value: Math.round(WORM_DEF.xpValue * (seg.isElite ? 2.3 : 1)) });

      if (seg.isElite && !state.pendingSpecialChoices && !specialTriggered) {
        state.pendingSpecialChoices = generateSpecialBonusChoices(prng);
        state.paused = true;
        specialTriggered = true;
      }

      state.worm.segments.splice(idx, 1);
    }

    state.worm.headS = clamp(state.worm.headS - state.worm.knockbackPerBreak * ordered.length, 0, state.worm.goalS);
    for (let i = 0; i < state.worm.segments.length; i += 1) {
      state.worm.segments[i].s = state.worm.headS - i * state.worm.spacing;
    }

    if (state.worm.segments.length === 0 && !state.clearRewardGranted) {
      state.runCoins += WORM_DEF.clearRewardCoins;
      state.clearRewardGranted = true;
      state.result = 'win';
      state.paused = true;
    }
  }

  state.projectiles = state.projectiles.filter((p) => !removeProjectileIds.has(p.id));
}
