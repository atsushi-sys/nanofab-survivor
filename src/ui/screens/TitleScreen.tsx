import { ChangeEvent } from 'react';
import { Button } from '../components/Button';
import { MetaUpgradeState } from '../../game/types';

interface Props {
  meta: MetaUpgradeState;
  setMeta: (meta: MetaUpgradeState) => void;
  onStart: (seed?: number) => void;
  onMeta: () => void;
}

export function TitleScreen({ meta, setMeta, onStart, onMeta }: Props) {
  const toggle = (key: 'sound' | 'vibration') => (e: ChangeEvent<HTMLInputElement>) => {
    setMeta({ ...meta, settings: { ...meta.settings, [key]: e.target.checked } });
  };

  return (
    <div className="screen center">
      <h1>Nanofab Survivor</h1>
      <p>ナノ工場を守り抜け。</p>
      <div className="stack">
        <Button onClick={() => onStart()}>開始</Button>
        <Button onClick={onMeta}>強化へ</Button>
        <label><input type="checkbox" checked={meta.settings.sound} onChange={toggle('sound')} /> 効果音</label>
        <label><input type="checkbox" checked={meta.settings.vibration} onChange={toggle('vibration')} /> 振動</label>
      </div>
    </div>
  );
}
