import { WORM_DEF } from '../data/enemies';
import { PlayerStats, WeaponRuntimeStats } from '../types';
import { buildPath, PathCache } from './path';
import { vec2, Vec2 } from './math';

export interface PlayerEntity {
  pos: Vec2;
}

export interface WormSegment {
  id: number;
  hp: number;
  maxHp: number;
  radius: number;
  s: number;
  isElite: boolean;
  hpDisplayTimer: number;
}

export interface WormEnemy {
  headS: number;
  speed: number;
  spacing: number;
  goalS: number;
  knockbackPerBreak: number;
  path: PathCache;
  segments: WormSegment[];
}

export interface ProjectileEntity {
  id: number;
  pos: Vec2;
  vel: Vec2;
  damage: number;
  radius: number;
  pierceLeft: number;
  knockback: number;
  isCrit: boolean;
}

export interface OrbEntity {
  id: number;
  pos: Vec2;
  value: number;
}

export interface SpecialPickupEntity {
  id: number;
  pos: Vec2;
  type: 'bigXp' | 'heal';
  value: number;
  life: number;
}

export interface FloatingText {
  id: number;
  pos: Vec2;
  value: number;
  crit: boolean;
  life: number;
  maxLife: number;
}

export interface SpecialBonusChoice {
  id: string;
  category: 'shots' | 'cooldown' | 'damage';
  label: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic';
  addShots?: number;
  cooldownMul?: number;
  damageMul?: number;
}

export interface RuntimeUnlocks {
  orbit: boolean;
  cone: boolean;
  shockwave: boolean;
}

export interface RunWeaponBonuses {
  extraShots: number;
  cooldownMultiplier: number;
  damageMultiplier: number;
}

export interface GameState {
  worldSize: number;
  time: number;
  paused: boolean;
  speed: 1 | 2;
  cameraZoom: number;
  seed: number;
  player: PlayerEntity;
  playerLaneY: number;
  playerStats: PlayerStats;
  weaponStats: WeaponRuntimeStats;
  runWeaponBonuses: RunWeaponBonuses;
  worm: WormEnemy;
  clearRewardGranted: boolean;
  projectiles: ProjectileEntity[];
  orbs: OrbEntity[];
  specialPickups: SpecialPickupEntity[];
  floatingTexts: FloatingText[];
  movementInput: Vec2;
  fireTimer: number;
  specialSpawnTimer: number;
  level: number;
  xp: number;
  xpToNext: number;
  kills: number;
  runCoins: number;
  runGems: number;
  rerollCount: number;
  upgradeStacks: Record<string, number>;
  selectedUpgrades: string[];
  pendingUpgradeChoices: string[] | null;
  pendingSpecialChoices: SpecialBonusChoice[] | null;
  unlocks: RuntimeUnlocks;
  result: null | 'win' | 'lose';
  resultReason: string | null;
  defendLineWorldY: number;
  nextEntityId: number;
  spawnAccumulator: number;
  spawnedCount: number;
}

export function initialPlayerStats(): PlayerStats {
  return { maxHp: 100, moveSpeed: 130, damageBonus: 0, fireRateBonus: 0, critChance: 0.05, critDamage: 1.5, armor: 0, regen: 0, pickupRadius: 32, xpGain: 0 };
}

export function initialWeaponStats(): WeaponRuntimeStats {
  return { damage: 14, fireInterval: 0.58, projectileSpeed: 330, pierce: 0, spread: 0, count: 1, knockback: 8, parallelSpacing: 10 };
}

function createWorm(state: { nextEntityId: number }): WormEnemy {
  const path = buildPath([
    vec2(-380, -120),
    vec2(380, -120),
    vec2(380, 40),
    vec2(-380, 40),
    vec2(-380, 190),
    vec2(380, 190),
    vec2(380, 330),
    vec2(-380, 330),
    vec2(-380, 470),
    vec2(280, 470),
    vec2(280, 620),
  ]);

  const segments: WormSegment[] = [];
  for (let i = 0; i < WORM_DEF.initialSegments; i += 1) {
    const isElite = i % WORM_DEF.eliteEvery === 0;
    const hp = Math.floor(WORM_DEF.baseSegmentHp * Math.pow(WORM_DEF.hpGrowthRate, i));
    segments.push({
      id: state.nextEntityId + i,
      hp,
      maxHp: hp,
      radius: WORM_DEF.segmentRadius,
      s: 0,
      isElite,
      hpDisplayTimer: isElite ? 999 : 0,
    });
  }

  return {
    headS: 90,
    speed: WORM_DEF.headSpeed,
    spacing: WORM_DEF.spacing,
    goalS: path.totalLength - 6,
    knockbackPerBreak: 16,
    path,
    segments,
  };
}

export function createInitialState(seed: number): GameState {
  const stats = initialPlayerStats();
  const playerLaneY = 760;
  const stateSeed = { nextEntityId: 1 };
  const worm = createWorm(stateSeed);

  return {
    worldSize: 2200,
    time: 0,
    paused: false,
    speed: 1,
    cameraZoom: 0.78,
    seed,
    player: { pos: vec2(0, playerLaneY) },
    playerLaneY,
    playerStats: stats,
    weaponStats: initialWeaponStats(),
    runWeaponBonuses: { extraShots: 0, cooldownMultiplier: 1, damageMultiplier: 1 },
    worm,
    clearRewardGranted: false,
    projectiles: [],
    orbs: [],
    specialPickups: [],
    floatingTexts: [],
    movementInput: vec2(0, 0),
    fireTimer: 0,
    specialSpawnTimer: 12,
    level: 1,
    xp: 0,
    xpToNext: 24,
    kills: 0,
    runCoins: 0,
    runGems: 0,
    rerollCount: 3,
    upgradeStacks: {},
    selectedUpgrades: [],
    pendingUpgradeChoices: null,
    pendingSpecialChoices: null,
    unlocks: { orbit: false, cone: false, shockwave: false },
    result: null,
    resultReason: null,
    defendLineWorldY: Number.POSITIVE_INFINITY,
    nextEntityId: stateSeed.nextEntityId + worm.segments.length,
    spawnAccumulator: 0,
    spawnedCount: worm.segments.length,
  };
}

export function xpCurve(level: number): number {
  return Math.floor(24 + level * 14 + level * level * 3.2);
}
