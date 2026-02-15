export type Rarity = 'common' | 'rare' | 'epic';

export interface WormDefinition {
  id: string;
  name: string;
  segmentHp: number;
  segmentRadius: number;
  spacing: number;
  headSpeed: number;
  contactDamage: number;
  xpValue: number;
  coinValue: number;
  gemChance: number;
  normalColor: string;
  eliteColor: string;
  eliteEvery: number;
  initialSegments: number;
  eliteHpBonus: number;
  hpScaleEveryKills: number;
  hpScaleStep: number;
  clearRewardCoins: number;
}

export interface WeaponDefinition {
  id: string;
  name: string;
  baseDamage: number;
  fireInterval: number;
  projectileSpeed: number;
  projectileRadius: number;
  pierce: number;
  spread: number;
  count: number;
  knockback: number;
}

export type UpgradeEffect =
  | { type: 'stat'; stat: keyof PlayerStats; add?: number; mul?: number }
  | { type: 'weapon'; stat: keyof WeaponRuntimeStats; add?: number; mul?: number }
  | { type: 'unlock'; unlock: 'orbit' | 'cone' | 'shockwave' };

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  tags: string[];
  maxStacks: number;
  effects: UpgradeEffect[];
}

export interface PlayerStats {
  maxHp: number;
  moveSpeed: number;
  damageBonus: number;
  fireRateBonus: number;
  critChance: number;
  critDamage: number;
  armor: number;
  regen: number;
  pickupRadius: number;
  xpGain: number;
}

export interface WeaponRuntimeStats {
  damage: number;
  fireInterval: number;
  projectileSpeed: number;
  pierce: number;
  spread: number;
  count: number;
  knockback: number;
}

export interface MetaUpgradeState {
  hp: number;
  move: number;
  damage: number;
  xp: number;
  coins: number;
  gems: number;
  settings: { sound: boolean; vibration: boolean };
}
