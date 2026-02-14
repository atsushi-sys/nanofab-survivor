import { PlayerStats, WeaponRuntimeStats } from '../types';
import { vec2, Vec2 } from './math';

export interface PlayerEntity {
  pos: Vec2;
  hp: number;
  contactTimer: number;
}

export interface EnemyEntity {
  id: number;
  defId: string;
  pos: Vec2;
  hp: number;
  radius: number;
  speed: number;
  damage: number;
  xpValue: number;
  coinValue: number;
  gemChance: number;
  color: string;
  marker: 'none' | 'fast' | 'tank';
}

export interface ProjectileEntity {
  id: number;
  pos: Vec2;
  vel: Vec2;
  damage: number;
  radius: number;
  pierceLeft: number;
  knockback: number;
}

export interface OrbEntity {
  id: number;
  pos: Vec2;
  value: number;
}

export interface RuntimeUnlocks {
  orbit: boolean;
  cone: boolean;
  shockwave: boolean;
}

export interface GameState {
  worldSize: number;
  time: number;
  paused: boolean;
  speed: 1 | 2;
  seed: number;
  player: PlayerEntity;
  playerStats: PlayerStats;
  weaponStats: WeaponRuntimeStats;
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  orbs: OrbEntity[];
  movementInput: Vec2;
  fireTimer: number;
  coneTimer: number;
  shockwaveTimer: number;
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
  unlocks: RuntimeUnlocks;
  result: null | 'win' | 'lose';
  nextEntityId: number;
}

export function initialPlayerStats(): PlayerStats {
  return {
    maxHp: 100,
    moveSpeed: 130,
    damageBonus: 0,
    fireRateBonus: 0,
    critChance: 0.05,
    critDamage: 1.5,
    armor: 0,
    regen: 0,
    pickupRadius: 32,
    xpGain: 0,
  };
}

export function initialWeaponStats(): WeaponRuntimeStats {
  return {
    damage: 14,
    fireInterval: 0.58,
    projectileSpeed: 330,
    pierce: 0,
    spread: 0,
    count: 1,
    knockback: 8,
  };
}

export function createInitialState(seed: number): GameState {
  const stats = initialPlayerStats();
  return {
    worldSize: 2200,
    time: 0,
    paused: false,
    speed: 1,
    seed,
    player: { pos: vec2(0, 0), hp: stats.maxHp, contactTimer: 0 },
    playerStats: stats,
    weaponStats: initialWeaponStats(),
    enemies: [],
    projectiles: [],
    orbs: [],
    movementInput: vec2(0, 0),
    fireTimer: 0,
    coneTimer: 0,
    shockwaveTimer: 0,
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
    unlocks: { orbit: false, cone: false, shockwave: false },
    result: null,
    nextEntityId: 1,
  };
}

export function xpCurve(level: number): number {
  return Math.floor(24 + level * 14 + level * level * 3.2);
}
