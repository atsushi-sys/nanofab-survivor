import { MetaUpgradeState } from '../game/types';

const KEY = 'nanofab-meta-v1';

export const defaultMeta: MetaUpgradeState = {
  hp: 0,
  move: 0,
  damage: 0,
  xp: 0,
  coins: 0,
  gems: 0,
  settings: { sound: true, vibration: true },
};

export function loadMeta(): MetaUpgradeState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultMeta;
    return { ...defaultMeta, ...JSON.parse(raw) };
  } catch {
    return defaultMeta;
  }
}

export function saveMeta(meta: MetaUpgradeState): void {
  localStorage.setItem(KEY, JSON.stringify(meta));
}

export function metaUpgradeCost(level: number): number {
  return Math.floor(30 + level * level * 18 + level * 12);
}
