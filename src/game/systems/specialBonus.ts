import { PRNG } from '../engine/prng';
import { GameState, SpecialBonusChoice } from '../engine/state';

function rarityByMagnitude(v: number): 'common' | 'rare' | 'epic' {
  if (v > 0.72) return 'epic';
  if (v > 0.42) return 'rare';
  return 'common';
}

export function generateSpecialBonusChoices(prng: PRNG): SpecialBonusChoice[] {
  const shotAdd = prng.int(1, 10);
  const cooldownReduction = 0.2 + prng.next() * 0.7;
  const damageBonus = 0.2 + prng.next() * 4.8;

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
      id: `cooldown-${Math.round(cooldownReduction * 100)}`,
      category: 'cooldown',
      label: 'クール短縮',
      description: `発射間隔 ${Math.round(cooldownReduction * 100)}%短縮`,
      rarity: rarityByMagnitude(cooldownReduction),
      cooldownMul: Math.max(0.1, 1 - cooldownReduction),
    },
    {
      id: `damage-${Math.round(damageBonus * 100)}`,
      category: 'damage',
      label: '火力増幅',
      description: `与ダメ +${Math.round(damageBonus * 100)}%`,
      rarity: rarityByMagnitude(Math.min(1, damageBonus / 5)),
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
