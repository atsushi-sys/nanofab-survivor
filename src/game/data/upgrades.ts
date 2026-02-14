import { UpgradeDefinition } from '../types';

export const UPGRADES: UpgradeDefinition[] = [
  { id: 'dmg-1', name: '集束出力', description: '与ダメージ +12%', rarity: 'common', tags: ['damage'], maxStacks: 5, effects: [{ type: 'stat', stat: 'damageBonus', add: 0.12 }] },
  { id: 'dmg-2', name: '貫通電位', description: '与ダメージ +20%', rarity: 'rare', tags: ['damage'], maxStacks: 3, effects: [{ type: 'stat', stat: 'damageBonus', add: 0.2 }] },
  { id: 'rate-1', name: '高速クロック', description: '攻撃間隔 -10%', rarity: 'common', tags: ['rate'], maxStacks: 5, effects: [{ type: 'stat', stat: 'fireRateBonus', add: 0.1 }] },
  { id: 'rate-2', name: '位相同期', description: '攻撃間隔 -16%', rarity: 'rare', tags: ['rate'], maxStacks: 3, effects: [{ type: 'stat', stat: 'fireRateBonus', add: 0.16 }] },
  { id: 'multi-1', name: '多重発射', description: '弾数 +1', rarity: 'rare', tags: ['projectile'], maxStacks: 3, effects: [{ type: 'weapon', stat: 'count', add: 1 }] },
  { id: 'pierce-1', name: '微細貫通', description: '貫通 +1', rarity: 'common', tags: ['projectile'], maxStacks: 4, effects: [{ type: 'weapon', stat: 'pierce', add: 1 }] },
  { id: 'crit-1', name: '臨界校正', description: '会心率 +5%', rarity: 'common', tags: ['crit'], maxStacks: 6, effects: [{ type: 'stat', stat: 'critChance', add: 0.05 }] },
  { id: 'crit-2', name: '破断会心', description: '会心倍率 +25%', rarity: 'rare', tags: ['crit'], maxStacks: 4, effects: [{ type: 'stat', stat: 'critDamage', add: 0.25 }] },
  { id: 'kb-1', name: '反発リング', description: 'ノックバック +4', rarity: 'common', tags: ['control'], maxStacks: 4, effects: [{ type: 'weapon', stat: 'knockback', add: 4 }] },
  { id: 'hp-1', name: '耐圧フレーム', description: '最大HP +18', rarity: 'common', tags: ['defense'], maxStacks: 4, effects: [{ type: 'stat', stat: 'maxHp', add: 18 }] },
  { id: 'armor-1', name: '粒子シールド', description: '被ダメ軽減 +1', rarity: 'rare', tags: ['defense'], maxStacks: 6, effects: [{ type: 'stat', stat: 'armor', add: 1 }] },
  { id: 'regen-1', name: '自己修復膜', description: '毎秒HP +0.45', rarity: 'rare', tags: ['defense'], maxStacks: 4, effects: [{ type: 'stat', stat: 'regen', add: 0.45 }] },
  { id: 'move-1', name: '低摩擦脚', description: '移動速度 +10%', rarity: 'common', tags: ['utility'], maxStacks: 5, effects: [{ type: 'stat', stat: 'moveSpeed', add: 0.1 }] },
  { id: 'pickup-1', name: '磁気ホロ', description: '回収範囲 +18', rarity: 'common', tags: ['utility'], maxStacks: 5, effects: [{ type: 'stat', stat: 'pickupRadius', add: 18 }] },
  { id: 'xp-1', name: '解析学習', description: '取得XP +15%', rarity: 'common', tags: ['utility'], maxStacks: 5, effects: [{ type: 'stat', stat: 'xpGain', add: 0.15 }] },
  { id: 'orbit-1', name: '周回ドローン', description: '周回ドローン起動', rarity: 'epic', tags: ['special'], maxStacks: 1, effects: [{ type: 'unlock', unlock: 'orbit' }] },
  { id: 'cone-1', name: '扇状バースト', description: '前方3連射を追加', rarity: 'epic', tags: ['special'], maxStacks: 1, effects: [{ type: 'unlock', unlock: 'cone' }] },
  { id: 'shock-1', name: '短域ショック', description: '定期衝撃波を追加', rarity: 'epic', tags: ['special'], maxStacks: 1, effects: [{ type: 'unlock', unlock: 'shockwave' }] },
];

export const RARITY_WEIGHT = {
  common: 0.7,
  rare: 0.25,
  epic: 0.05,
} as const;
