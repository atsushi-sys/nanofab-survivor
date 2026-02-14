import { GameState } from '../../game/engine/state';

interface Props {
  state: GameState;
  onPause: () => void;
  onSpeed: () => void;
}

export function HUD({ state, onPause, onSpeed }: Props) {
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
        <button onClick={onPause}>一時停止</button>
        <button onClick={onSpeed}>速度 x{state.speed}</button>
        <div>リロール {state.rerollCount}</div>
        <div>コイン {state.runCoins}</div>
        <div>ジェム {state.runGems}</div>
      </div>
    </div>
  );
}
