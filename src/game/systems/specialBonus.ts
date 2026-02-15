import { PRNG } from '../engine/prng';
import { GameState, SpecialBonusChoice } from '../engine/state';

function rarityByMagnitude(v: number): 'common' | 'rare' | 'epic' {
  if (v > 0.72) return 'epic';
  if (v > 0.42) return 'rare';
  return 'common';
}

function weightedPick(prng: PRNG, table: Array<{ value: number; weight: number }>): number {
  const total = table.reduce((sum, item) => sum + item.weight, 0);
  let roll = prng.next() * total;
  for (const item of table) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }
  return table[table.length - 1]?.value ?? 0;
}

export function generateSpecialBonusChoices(prng: PRNG): SpecialBonusChoice[] {
  const shotAdd = weightedPick(prng, [
    { value: 1, weight: 22 },
    { value: 2, weight: 18 },
    { value: 3, weight: 14 },
    { value: 4, weight: 12 },
    { value: 5, weight: 10 },
    { value: 6, weight: 8 },
    { value: 7, weight: 6 },
    { value: 8, weight: 4 },
    { value: 9, weight: 3 },
    { value: 10, weight: 1.5 },
  ]);

  const cooldownReductionPct = weightedPick(prng, [
    { value: 20, weight: 22 },
    { value: 30, weight: 18 },
    { value: 40, weight: 15 },
    { value: 50, weight: 12 },
    { value: 60, weight: 8 },
    { value: 70, weight: 5 },
    { value: 80, weight: 2.5 },
    { value: 90, weight: 1.2 },
  ]);

  const damageBonusPct = weightedPick(prng, [
    { value: 20, weight: 24 },
    { value: 30, weight: 20 },
    { value: 40, weight: 16 },
    { value: 50, weight: 12 },
    { value: 60, weight: 9 },
    { value: 70, weight: 6 },
    { value: 80, weight: 4 },
    { value: 90, weight: 2 },
    { value: 100, weight: 1 },
  ]);

  const cooldownReduction = cooldownReductionPct / 100;
  const damageBonus = damageBonusPct / 100;

  return [
    {
      id: `shots-${shotAdd}`,
      category: 'shots',
      label: '本数増加',
      description: `同時発射 +${shotAdd}`,
      rarity: rarityByMagnitude(shotAdd / 10),
      addShots: shotAdd,
    },
    {
      id: `cooldown-${cooldownReductionPct}`,
      category: 'cooldown',
      label: 'クール短縮',
      description: `発射間隔 ${cooldownReductionPct}%短縮`,
      rarity: rarityByMagnitude(cooldownReduction),
      cooldownMul: Math.max(0.1, 1 - cooldownReduction),
    },
    {
      id: `damage-${damageBonusPct}`,
      category: 'damage',
      label: '火力増幅',
      description: `与ダメ +${damageBonusPct}%`,
      rarity: rarityByMagnitude(damageBonus),
      damageMul: 1 + damageBonus,
    },
  ];
}

export function applySpecialBonus(state: GameState, choiceId: string): void {
  const choice = state.pendingSpecialChoices?.find((c) => c.id === choiceId);
  if (!choice) return;

  if (choice.addShots) state.runWeaponBonuses.extraShots += choice.addShots;
  if (choice.cooldownMul) state.runWeaponBonuses.cooldownMultiplier *= choice.cooldownMul;
  if (choice.damageMul) state.runWeaponBonuses.damageMultiplier *= choice.damageMul;

  state.pendingSpecialChoices = null;
  state.paused = false;
}
