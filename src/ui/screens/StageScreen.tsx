import { useEffect, useRef, useState } from 'react';
import { GameRuntime } from '../../game/engine/runtime';
import { renderGame } from '../../game/engine/render';
import { GameState } from '../../game/engine/state';
import { MetaUpgradeState } from '../../game/types';
import { HUD } from '../components/HUD';
import { Joystick } from '../components/Joystick';
import { UpgradeModal } from '../components/UpgradeModal';
import { UPGRADES } from '../../game/data/upgrades';

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

  useEffect(() => {
    const runtime = new GameRuntime(seed, meta, {
      onState: (s) => setState({ ...s }),
      onUpgradeOffer: (c) => setChoices(c),
      onResult: (s) => onFinish({ win: s.result === 'win', time: s.time, level: s.level, kills: s.kills, coins: s.runCoins, gems: s.runGems, seed: s.seed }),
    });
    runtimeRef.current = runtime;
    setState({ ...runtime.state });

    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const fixed = 1 / 60;

    const tick = (now: number) => {
      const rt = runtimeRef.current;
      const canvas = canvasRef.current;
      if (!rt || !canvas) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += dt;
      while (acc >= fixed) {
        for (let i = 0; i < rt.state.speed; i += 1) rt.step(fixed);
        acc -= fixed;
      }
      const ctx = canvas.getContext('2d');
      if (ctx) renderGame(ctx, rt.state, canvas.width, canvas.height);
      raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);

    const key = (e: KeyboardEvent) => {
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
        if ((e.key === 'w' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'ArrowDown')) m.y = 0;
        if ((e.key === 'a' || e.key === 'ArrowLeft' || e.key === 'd' || e.key === 'ArrowRight')) m.x = 0;
      }
    };

    window.addEventListener('keydown', key);
    window.addEventListener('keyup', key);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', key);
      window.removeEventListener('keyup', key);
    };
  }, [meta, onFinish, seed]);

  if (!state) return null;

  return (
    <div className="stage">
      <canvas ref={canvasRef} />
      <HUD state={state} onPause={() => { if (runtimeRef.current) runtimeRef.current.state.paused = !runtimeRef.current.state.paused; }} onSpeed={() => { if (runtimeRef.current) runtimeRef.current.state.speed = runtimeRef.current.state.speed === 1 ? 2 : 1; }} />
      <Joystick onMove={(x, y) => { if (runtimeRef.current) runtimeRef.current.state.movementInput = { x, y }; }} />
      <button className="build-toggle" onClick={() => setShowBuild((v: boolean) => !v)}>ビルド</button>
      {showBuild && (
        <div className="build-panel">
          {Object.entries(state.upgradeStacks).map(([id, stack]) => (
            <div key={id}>{UPGRADES.find((u) => u.id === id)?.name} x{stack}</div>
          ))}
        </div>
      )}
      {choices && (
        <UpgradeModal
          choices={choices}
          onPick={(id) => {
            runtimeRef.current?.chooseUpgrade(id);
            setChoices(null);
          }}
          canReroll={state.rerollCount > 0 && state.runGems > 0}
          onReroll={() => {
            if (runtimeRef.current?.reroll()) setChoices(runtimeRef.current.state.pendingUpgradeChoices ?? null);
          }}
        />
      )}
    </div>
  );
}
