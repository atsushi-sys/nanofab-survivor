import { RARITY_WEIGHT, UPGRADES } from '../data/upgrades';
import { PRNG } from '../engine/prng';
import { GameState } from '../engine/state';

export function rollUpgradeChoices(state: GameState, prng: PRNG): string[] {
  const pool = UPGRADES.filter((u) => (state.upgradeStacks[u.id] ?? 0) < u.maxStacks);
  const choices: string[] = [];
  const local = [...pool];

  while (choices.length < 3 && local.length > 0) {
    const rarityRoll = prng.next();
    const target = rarityRoll < RARITY_WEIGHT.common ? 'common' : rarityRoll < RARITY_WEIGHT.common + RARITY_WEIGHT.rare ? 'rare' : 'epic';
    const filtered = local.filter((u) => u.rarity === target);
    const pickFrom = filtered.length > 0 ? filtered : local;
    const idx = Math.floor(prng.next() * pickFrom.length);
    const picked = pickFrom[idx];
    choices.push(picked.id);
    const removeIdx = local.findIndex((x) => x.id === picked.id);
    local.splice(removeIdx, 1);
  }
  return choices;
}

export function applyUpgrade(state: GameState, upgradeId: string): void {
  const def = UPGRADES.find((u) => u.id === upgradeId);
  if (!def) return;
  state.upgradeStacks[upgradeId] = (state.upgradeStacks[upgradeId] ?? 0) + 1;
  state.selectedUpgrades.push(upgradeId);

  for (const effect of def.effects) {
    if (effect.type === 'stat') {
      if (effect.add) state.playerStats[effect.stat] += effect.add;
      if (effect.mul) state.playerStats[effect.stat] *= effect.mul;
    } else if (effect.type === 'weapon') {
      if (effect.add) state.weaponStats[effect.stat] += effect.add;
      if (effect.mul) state.weaponStats[effect.stat] *= effect.mul;
    } else {
      state.unlocks[effect.unlock] = true;
    }
  }
}
