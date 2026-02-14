import { GameState } from '../../game/engine/state';

export interface HudDebugInfo {
  running: boolean;
  paused: boolean;
  elapsedTimeSec: number;
  lastDtMs: number;
  enemyCount: number;
  projectileCount: number;
  pickupCount: number;
  spawnAccumulator: number;
}

interface Props {
  state: GameState;
  onPause: () => void;
  onSpeed: () => void;
  debugInfo?: HudDebugInfo;
}

export function HUD({ state, onPause, onSpeed, debugInfo }: Props) {
  const mm = String(Math.floor(state.time / 60)).padStart(2, '0');
  const ss = String(Math.floor(state.time % 60)).padStart(2, '0');

  return (
    <div className="hud-wrap">
      <div className="hud-top">
        <div>
          <div>HP {Math.ceil(state.player.hp)}/{Math.ceil(state.playerStats.maxHp)}</div>
          <div className="bar"><span style={{ width: `${(state.player.hp / state.playerStats.maxHp) * 100}%` }} /></div>
        </div>
        <div className="timer">{mm}:{ss}</div>
        <div>
          <div>Lv {state.level}</div>
          <div className="bar"><span style={{ width: `${(state.xp / state.xpToNext) * 100}%` }} /></div>
        </div>
      </div>

      <div className="hud-bottom">
        <button onClick={onPause}>{state.paused ? '再開' : '一時停止'}</button>
        <button onClick={onSpeed}>速度 x{state.speed}</button>
        <div>リロール {state.rerollCount}</div>
        <div>コイン {state.runCoins}</div>
        <div>ジェム {state.runGems}</div>
      </div>

      {debugInfo && (
        <div className="debug-box">
          <div>{debugInfo.running ? 'running' : 'stopped'} / {debugInfo.paused ? 'paused' : 'active'}</div>
          <div>elapsed {debugInfo.elapsedTimeSec.toFixed(2)}s / dt {debugInfo.lastDtMs.toFixed(2)}ms</div>
          <div>enemy {debugInfo.enemyCount} / projectile {debugInfo.projectileCount} / pickup {debugInfo.pickupCount}</div>
          <div>spawnAcc {debugInfo.spawnAccumulator.toFixed(3)}</div>
        </div>
      )}
    </div>
  );
}
