import { WormDefinition } from '../types';

export const WORM_DEF: WormDefinition = {
  id: 'dust-crawler',
  name: 'ダストキャタピラ',
  segmentHp: 58,
  segmentRadius: 16,
  spacing: 30,
  headSpeed: 34,
  contactDamage: 8,
  xpValue: 5,
  coinValue: 1,
  gemChance: 0.05,
  normalColor: '#b45309',
  eliteColor: '#a855f7',
  eliteEvery: 10,
  initialSegments: 100,
  eliteHpBonus: 1.3,
  hpScaleEveryKills: 10,
  hpScaleStep: 0.16,
  clearRewardCoins: 3000,
};
