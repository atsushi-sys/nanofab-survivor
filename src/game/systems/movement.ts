import { clamp, normalize } from '../engine/math';
import { GameState } from '../engine/state';

export function updateMovement(state: GameState, dt: number): void {
  const dir = normalize(state.movementInput);
  const speed = state.playerStats.moveSpeed;
  state.player.pos.x += dir.x * speed * dt;
  state.player.pos.y += dir.y * speed * dt;
  const half = state.worldSize / 2;
  state.player.pos.x = clamp(state.player.pos.x, -half, half);
  state.player.pos.y = clamp(state.player.pos.y, -half, half);
}
