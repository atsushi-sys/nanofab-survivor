import { useEffect, useState } from 'react';
import { TitleScreen } from './ui/screens/TitleScreen';
import { StageScreen } from './ui/screens/StageScreen';
import { ResultScreen } from './ui/screens/ResultScreen';
import { MetaScreen } from './ui/screens/MetaScreen';
import { loadMeta, saveMeta } from './storage/meta';
import { MetaUpgradeState } from './game/types';

type Screen = 'title' | 'stage' | 'result' | 'meta';
interface ResultData { win: boolean; time: number; level: number; kills: number; coins: number; gems: number; seed: number }

export default function App() {
  const [meta, setMeta] = useState<MetaUpgradeState>(loadMeta());
  const [screen, setScreen] = useState<Screen>('title');
  const [seed, setSeed] = useState<number>(12345);
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    saveMeta(meta);
  }, [meta]);

  if (screen === 'title') {
    return <TitleScreen meta={meta} setMeta={setMeta} onStart={(customSeed) => { setSeed(customSeed ?? (Date.now() & 0xffffffff)); setScreen('stage'); }} onMeta={() => setScreen('meta')} />;
  }
  if (screen === 'meta') {
    return <MetaScreen meta={meta} setMeta={setMeta} onBack={() => setScreen('title')} />;
  }
  if (screen === 'stage') {
    return <StageScreen seed={seed} meta={meta} onFinish={(r) => { setResult(r); setMeta((m: MetaUpgradeState) => ({ ...m, coins: m.coins + r.coins, gems: m.gems + r.gems })); setScreen('result'); }} />;
  }
  return result ? <ResultScreen result={result} onRetry={() => setScreen('stage')} onTitle={() => setScreen('title')} onMeta={() => setScreen('meta')} /> : null;
}
