import { clamp } from '../engine/math';
import { GameState } from '../engine/state';

export function updateMovement(state: GameState, dt: number): void {
  const dirX = Math.max(-1, Math.min(1, state.movementInput.x));
  const speed = state.playerStats.moveSpeed;
  state.player.pos.x += dirX * speed * dt;
  state.player.pos.y = state.playerLaneY;

  const half = state.worldSize / 2;
  state.player.pos.x = clamp(state.player.pos.x, -half, half);
}
