import { EnemyDefinition } from '../types';

export const ENEMIES: EnemyDefinition[] = [
  {
    id: 'dustlet',
    name: 'ダストレット',
    hp: 16,
    speed: 52,
    damage: 7,
    radius: 10,
    xpValue: 4,
    coinValue: 1,
    gemChance: 0.04,
    color: '#f97316',
    marker: 'none',
    spawnWeightByTime: [
      { start: 0, end: 180, weight: 1 },
    ],
  },
  {
    id: 'quickmote',
    name: 'クイックモート',
    hp: 12,
    speed: 78,
    damage: 5,
    radius: 8,
    xpValue: 5,
    coinValue: 1,
    gemChance: 0.05,
    color: '#22d3ee',
    marker: 'fast',
    spawnWeightByTime: [
      { start: 60, end: 180, weight: 0.85 },
    ],
  },
  {
    id: 'tarclump',
    name: 'タールクランプ',
    hp: 52,
    speed: 34,
    damage: 14,
    radius: 14,
    xpValue: 10,
    coinValue: 3,
    gemChance: 0.08,
    color: '#a855f7',
    marker: 'tank',
    spawnWeightByTime: [
      { start: 120, end: 180, weight: 0.7 },
    ],
  },
];
