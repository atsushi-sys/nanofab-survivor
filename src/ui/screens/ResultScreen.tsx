interface Props {
  result: { win: boolean; time: number; level: number; kills: number; coins: number; gems: number; seed: number; segmentsRemaining: number; reason: string | null };
  onRetry: () => void;
  onTitle: () => void;
  onMeta: () => void;
}

export function ResultScreen({ result, onRetry, onTitle, onMeta }: Props) {
  return (
    <div className="screen center">
      <h2>{result.win ? '防衛成功' : '侵入されました（Head Breach）'}</h2>
      <p>経過時間: {Math.floor(result.time)}秒 / Lv {result.level}</p>
      <p>残り体節数: {result.segmentsRemaining}</p>
      <p>討伐数: {result.kills}</p>
      <p>獲得: コイン {result.coins} / ジェム {result.gems}</p>
      <p>シード: {result.seed}</p>
      <div className="stack">
        <button onClick={onRetry}>もう一度</button>
        <button onClick={onTitle}>タイトルへ</button>
        <button onClick={onMeta}>強化へ</button>
      </div>
    </div>
  );
}
