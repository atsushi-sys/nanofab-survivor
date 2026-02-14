import { GameState } from './state';

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);

  const camX = state.player.pos.x - w / 2;
  const camY = state.player.pos.y - h / 2;
  const toScreenX = (x: number) => x - camX;
  const toScreenY = (y: number) => y - camY;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let x = -1200; x <= 1200; x += 80) {
    ctx.beginPath();
    ctx.moveTo(toScreenX(x), toScreenY(-1200));
    ctx.lineTo(toScreenX(x), toScreenY(1200));
    ctx.stroke();
  }

  for (const orb of state.orbs) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(toScreenX(orb.pos.x), toScreenY(orb.pos.y), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const p of state.projectiles) {
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(toScreenX(p.pos.x), toScreenY(p.pos.y), p.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const e of state.enemies) {
    const sx = toScreenX(e.pos.x);
    const sy = toScreenY(e.pos.y);
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(sx, sy, e.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    if (e.marker === 'fast') ctx.fillRect(sx - 2, sy - e.radius - 5, 4, 4);
    if (e.marker === 'tank') {
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.arc(toScreenX(state.player.pos.x), toScreenY(state.player.pos.y), 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
