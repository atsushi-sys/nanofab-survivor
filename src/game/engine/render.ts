import { clamp } from './math';
import { samplePath } from './path';
import { GameState } from './state';

export interface RenderOptions {
  showEnemyHp: boolean;
  showDamageText: boolean;
  showPathDebug?: boolean;
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number, options: RenderOptions): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);

  const zoom = state.cameraZoom;
  const camX = 0;
  const camY = state.player.pos.y - 420;
  const toScreenX = (x: number) => (x - camX) * zoom + w / 2;
  const toScreenY = (y: number) => (y - camY) * zoom + h / 2;
  const sr = (r: number) => r * zoom;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let x = -1200; x <= 1200; x += 80) {
    ctx.beginPath();
    ctx.moveTo(toScreenX(x), toScreenY(-1400));
    ctx.lineTo(toScreenX(x), toScreenY(1800));
    ctx.stroke();
  }

  if (options.showPathDebug) {
    ctx.save();
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2;
    ctx.beginPath();
    state.worm.path.points.forEach((pt, i) => {
      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.stroke();
    ctx.restore();
  }

  for (let i = state.worm.segments.length - 1; i >= 0; i -= 1) {
    const seg = state.worm.segments[i];
    const pos = samplePath(state.worm.path, seg.s);
    if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) continue;
    const sx = toScreenX(pos.x);
    const sy = toScreenY(pos.y);

    ctx.beginPath();
    ctx.fillStyle = seg.isElite ? '#a855f7' : '#b45309';
    ctx.arc(sx, sy, Math.max(2, sr(seg.radius)), 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = i === 0 ? '#fef08a' : '#7c2d12';
    ctx.stroke();

    if (options.showEnemyHp && (seg.hpDisplayTimer > 0 || seg.isElite)) {
      const hpText = `${Math.ceil(clamp(seg.hp, 0, seg.maxHp))}/${Math.ceil(seg.maxHp)}`;
      ctx.textAlign = 'center';
      ctx.font = `${Math.max(11, sr(11))}px system-ui`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#020617';
      ctx.strokeText(hpText, sx, sy - sr(seg.radius + 10));
      ctx.fillStyle = seg.isElite ? '#f5d0fe' : '#ffffff';
      ctx.fillText(hpText, sx, sy - sr(seg.radius + 10));
    }
  }

  for (const p of state.specialPickups) {
    ctx.fillStyle = p.type === 'bigXp' ? '#facc15' : '#34d399';
    ctx.beginPath();
    ctx.arc(toScreenX(p.pos.x), toScreenY(p.pos.y), sr(8), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const orb of state.orbs) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(toScreenX(orb.pos.x), toScreenY(orb.pos.y), sr(4), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const p of state.projectiles) {
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(toScreenX(p.pos.x), toScreenY(p.pos.y), sr(p.radius), 0, Math.PI * 2);
    ctx.fill();
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
