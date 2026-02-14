import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { UPGRADES } from '../../game/data/upgrades';
import { renderGame } from '../../game/engine/render';
import { GameRuntime } from '../../game/engine/runtime';
import { GameState } from '../../game/engine/state';
import { MetaUpgradeState } from '../../game/types';
import { HUD, HudDebugInfo } from '../components/HUD';
import { Joystick } from '../components/Joystick';
import { SpecialBonusModal } from '../components/SpecialBonusModal';
import { UpgradeModal } from '../components/UpgradeModal';

interface Props {
  seed: number;
  meta: MetaUpgradeState;
  onFinish: (result: { win: boolean; time: number; level: number; kills: number; coins: number; gems: number; seed: number }) => void;
}

export function StageScreen({ seed, meta, onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [choices, setChoices] = useState<string[] | null>(null);
  const [showBuild, setShowBuild] = useState(false);
  const [debugInfo, setDebugInfo] = useState<HudDebugInfo | undefined>(undefined);
  const [showEnemyHp, setShowEnemyHp] = useState(true);
  const [showDamageText, setShowDamageText] = useState(true);
  const showEnemyHpRef = useRef(true);
  const showDamageTextRef = useRef(true);

  useEffect(() => {
    const runtime = new GameRuntime(seed, meta, {
      onState: (nextState) => setState({ ...nextState }),
      onUpgradeOffer: (nextChoices) => setChoices(nextChoices),
      onResult: (resultState) => onFinish({ win: resultState.result === 'win', time: resultState.time, level: resultState.level, kills: resultState.kills, coins: resultState.runCoins, gems: resultState.runGems, seed: resultState.seed }),
    });

    runtimeRef.current = runtime;
    setState({ ...runtime.state });

    let running = true;
    let rafId: number | null = null;
    let accumulator = 0;
    let lastTime = 0;
    let lastDtMs = 0;
    const fixed = 1 / 60;

    const tick = (now: number) => {
      if (!running) return;
      const canvas = canvasRef.current;
      const rt = runtimeRef.current;
      if (lastTime === 0) lastTime = now;
      const dtSec = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      lastDtMs = dtSec * 1000;
      accumulator += dtSec;

      if (rt) {
        const speed = rt.state.speed === 2 ? 2 : 1;
        while (accumulator >= fixed) {
          for (let i = 0; i < speed; i += 1) rt.step(fixed);
          accumulator -= fixed;
        }

        if (import.meta.env.DEV) {
          setDebugInfo({
            running,
            paused: rt.state.paused,
            elapsedTimeSec: rt.state.time,
            lastDtMs,
            enemyCount: rt.state.enemies.length,
            projectileCount: rt.state.projectiles.length + rt.state.enemyProjectiles.length,
            pickupCount: rt.state.orbs.length + rt.state.specialPickups.length,
            spawnAccumulator: rt.state.spawnAccumulator,
            zoom: rt.state.cameraZoom,
          });
        }

        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) renderGame(ctx, rt.state, canvas.width, canvas.height, { showEnemyHp: showEnemyHpRef.current, showDamageText: showDamageTextRef.current });
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const onKey = (e: KeyboardEvent) => {
      const rt = runtimeRef.current;
      if (!rt) return;
      const m = rt.state.movementInput;
      if (e.type === 'keydown') {
        if (e.key === 'w' || e.key === 'ArrowUp') m.y = -1;
        if (e.key === 's' || e.key === 'ArrowDown') m.y = 1;
        if (e.key === 'a' || e.key === 'ArrowLeft') m.x = -1;
        if (e.key === 'd' || e.key === 'ArrowRight') m.x = 1;
        if (e.key === ' ') rt.state.paused = !rt.state.paused;
        if (e.key === '1') rt.state.speed = 1;
        if (e.key === '2') rt.state.speed = 2;
      }
      if (e.type === 'keyup') {
        if (e.key === 'w' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'ArrowDown') m.y = 0;
        if (e.key === 'a' || e.key === 'ArrowLeft' || e.key === 'd' || e.key === 'ArrowRight') m.x = 0;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    runtime.state.paused = false;
    runtime.state.speed = runtime.state.speed === 2 ? 2 : 1;
    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      runtimeRef.current = null;
    };
  }, [meta, onFinish, seed]);

  if (!state) return null;

  return (
    <div className="stage">
      <canvas ref={canvasRef} />
      <HUD state={state} onPause={() => { if (runtimeRef.current) { runtimeRef.current.state.paused = !runtimeRef.current.state.paused; setState({ ...runtimeRef.current.state }); } }} onSpeed={() => { if (runtimeRef.current) { runtimeRef.current.state.speed = runtimeRef.current.state.speed === 1 ? 2 : 1; setState({ ...runtimeRef.current.state }); } }} debugInfo={import.meta.env.DEV ? debugInfo : undefined} />

      {import.meta.env.DEV && (
        <div className="render-toggle">
          <label><input type="checkbox" checked={showEnemyHp} onChange={(e: ChangeEvent<HTMLInputElement>) => { setShowEnemyHp(e.target.checked); showEnemyHpRef.current = e.target.checked; }} />敵HP表示</label>
          <label><input type="checkbox" checked={showDamageText} onChange={(e: ChangeEvent<HTMLInputElement>) => { setShowDamageText(e.target.checked); showDamageTextRef.current = e.target.checked; }} />ダメージ表示</label>
        </div>
      )}

      <Joystick onMove={(x, y) => { if (runtimeRef.current) runtimeRef.current.state.movementInput = { x, y }; }} />

      <button className="build-toggle" onClick={() => setShowBuild((v: boolean) => !v)}>ビルド</button>
      {showBuild && <div className="build-panel">{Object.entries(state.upgradeStacks).map(([id, stack]) => <div key={id}>{UPGRADES.find((u) => u.id === id)?.name} x{stack}</div>)}</div>}

      {choices && (
        <UpgradeModal
          choices={choices}
          onPick={(id) => { runtimeRef.current?.chooseUpgrade(id); setChoices(null); }}
          canReroll={state.rerollCount > 0 && state.runGems > 0}
          onReroll={() => { if (runtimeRef.current?.reroll()) setChoices(runtimeRef.current.state.pendingUpgradeChoices ?? null); }}
        />
      )}

      {state.pendingSpecialChoices && (
        <SpecialBonusModal
          choices={state.pendingSpecialChoices}
          onPick={(id) => runtimeRef.current?.chooseSpecialBonus(id)}
        />
      )}
    </div>
  );
}
