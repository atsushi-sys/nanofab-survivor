import { WEAPONS } from '../data/weapons';
import { updateCombat } from '../systems/combat';
import { updateMovement } from '../systems/movement';
import { updatePickups } from '../systems/pickups';
import { updateSpawner } from '../systems/spawner';
import { applySpecialBonus } from '../systems/specialBonus';
import { applyUpgrade, rollUpgradeChoices } from '../systems/upgrades';
import { MetaUpgradeState } from '../types';
import { createInitialState, GameState } from './state';
import { PRNG } from './prng';

export interface RuntimeCallbacks {
  onState: (state: GameState) => void;
  onUpgradeOffer: (choices: string[]) => void;
  onResult: (state: GameState) => void;
}

export class GameRuntime {
  state: GameState;
  prng: PRNG;
  callbacks: RuntimeCallbacks;

  constructor(seed: number, meta: MetaUpgradeState, callbacks: RuntimeCallbacks) {
    this.state = createInitialState(seed);
    this.prng = new PRNG(seed);
    this.callbacks = callbacks;

    const weapon = WEAPONS[0];
    this.state.weaponStats.damage = weapon.baseDamage;
    this.state.weaponStats.fireInterval = weapon.fireInterval;
    this.state.weaponStats.projectileSpeed = weapon.projectileSpeed;
    this.state.weaponStats.pierce = weapon.pierce;
    this.state.weaponStats.count = weapon.count;
    this.state.weaponStats.knockback = weapon.knockback;
    this.state.weaponStats.parallelSpacing = weapon.parallelSpacing;

    this.state.playerStats.moveSpeed *= 1 + meta.move * 0.03;
    this.state.playerStats.damageBonus += meta.damage * 0.04;
    this.state.playerStats.xpGain += meta.xp * 0.05;

    this.state.paused = false;
    this.state.speed = this.state.speed === 2 ? 2 : 1;
  }

  step(dt: number): void {
    if (this.state.result) {
      this.callbacks.onState(this.state);
      return;
    }

    if (this.state.paused) {
      this.callbacks.onState(this.state);
      return;
    }

    if (this.state.pendingSpecialChoices) {
      this.callbacks.onState(this.state);
      return;
    }

    if (this.state.pendingUpgradeChoices) {
      if (this.state.pendingUpgradeChoices.length === 0) {
        this.state.pendingUpgradeChoices = rollUpgradeChoices(this.state, this.prng);
        this.callbacks.onUpgradeOffer(this.state.pendingUpgradeChoices);
      }
      this.callbacks.onState(this.state);
      return;
    }

    this.state.time += dt;
    updateSpawner(this.state, dt, this.prng);
    updateMovement(this.state, dt);
    updateCombat(this.state, dt, this.prng);
    updatePickups(this.state, dt, this.prng);

    if (this.state.result) {
      this.callbacks.onResult(this.state);
    }

    this.callbacks.onState(this.state);
  }

  chooseUpgrade(id: string): void {
    if (!this.state.pendingUpgradeChoices) return;
    applyUpgrade(this.state, id);
    this.state.pendingUpgradeChoices = null;
    this.callbacks.onState(this.state);
  }

  chooseSpecialBonus(id: string): void {
    if (!this.state.pendingSpecialChoices) return;
    applySpecialBonus(this.state, id);
    this.callbacks.onState(this.state);
  }

  reroll(): boolean {
    if (!this.state.pendingUpgradeChoices || this.state.rerollCount <= 0 || this.state.runGems <= 0) return false;
    this.state.rerollCount -= 1;
    this.state.runGems -= 1;
    this.state.pendingUpgradeChoices = rollUpgradeChoices(this.state, this.prng);
    this.callbacks.onUpgradeOffer(this.state.pendingUpgradeChoices);
    this.callbacks.onState(this.state);
    return true;
  }
}
