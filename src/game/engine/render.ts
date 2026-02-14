import { clamp } from './math';
import { GameState } from './state';

export interface RenderOptions {
  showEnemyHp: boolean;
  showDamageText: boolean;
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number, options: RenderOptions): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);

  const zoom = state.cameraZoom;
  const camX = state.player.pos.x;
  const camY = state.player.pos.y;
  const toScreenX = (x: number) => (x - camX) * zoom + w / 2;
  const toScreenY = (y: number) => (y - camY) * zoom + h / 2;
  const sr = (r: number) => r * zoom;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let x = -1200; x <= 1200; x += 80) {
    ctx.beginPath();
    ctx.moveTo(toScreenX(x), toScreenY(-1200));
    ctx.lineTo(toScreenX(x), toScreenY(1200));
    ctx.stroke();
  }

  for (const p of state.specialPickups) {
    ctx.fillStyle = p.type === 'bigXp' ? '#facc15' : '#34d399';
    ctx.beginPath();
    ctx.arc(toScreenX(p.pos.x), toScreenY(p.pos.y), sr(7), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const orb of state.orbs) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(toScreenX(orb.pos.x), toScreenY(orb.pos.y), sr(4), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const p of state.projectiles) {
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(toScreenX(p.pos.x), toScreenY(p.pos.y), sr(p.radius), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const p of state.enemyProjectiles) {
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(toScreenX(p.pos.x), toScreenY(p.pos.y), sr(p.radius), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const e of state.enemies) {
    const sx = toScreenX(e.pos.x);
    const sy = toScreenY(e.pos.y);
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(sx, sy, sr(e.radius), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';

    if (e.marker === 'fast') ctx.fillRect(sx - sr(2), sy - sr(e.radius) - sr(5), sr(4), sr(4));
    if (e.marker === 'tank') {
      ctx.beginPath();
      ctx.arc(sx, sy, sr(3), 0, Math.PI * 2);
      ctx.fill();
    }
    if (e.marker === 'ranged') {
      ctx.beginPath();
      ctx.moveTo(sx, sy - sr(e.radius + 4));
      ctx.lineTo(sx - sr(4), sy - sr(e.radius + 10));
      ctx.lineTo(sx + sr(4), sy - sr(e.radius + 10));
      ctx.closePath();
      ctx.fill();
    }

    if (options.showEnemyHp && (e.hpDisplayTimer > 0 || e.isElite)) {
      const hpText = `${Math.ceil(clamp(e.hp, 0, e.maxHp))}/${Math.ceil(e.maxHp)}`;
      ctx.textAlign = 'center';
      ctx.font = `${Math.max(10, sr(11))}px system-ui`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#020617';
      ctx.strokeText(hpText, sx, sy - sr(e.radius + 12));
      ctx.fillStyle = e.isElite ? '#fde68a' : '#e2e8f0';
      ctx.fillText(hpText, sx, sy - sr(e.radius + 12));
    }
  }

  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.arc(toScreenX(state.player.pos.x), toScreenY(state.player.pos.y), sr(12), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (options.showDamageText) {
    for (const t of state.floatingTexts) {
      const alpha = clamp(t.life / t.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.crit ? '#f59e0b' : '#f8fafc';
      ctx.font = `${t.crit ? 16 : 13}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(String(t.value), toScreenX(t.pos.x), toScreenY(t.pos.y));
    }
    ctx.globalAlpha = 1;
  }
}
