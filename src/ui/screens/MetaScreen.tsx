import { MetaUpgradeState } from '../../game/types';
import { metaUpgradeCost } from '../../storage/meta';
import { Button } from '../components/Button';

interface Props {
  meta: MetaUpgradeState;
  setMeta: (meta: MetaUpgradeState) => void;
  onBack: () => void;
}

export function MetaScreen({ meta, setMeta, onBack }: Props) {
  const buy = (key: 'hp' | 'move' | 'damage' | 'xp') => {
    const level = meta[key];
    const cost = metaUpgradeCost(level);
    if (meta.coins < cost) return;
    setMeta({ ...meta, [key]: level + 1, coins: meta.coins - cost });
  };

  return (
    <div className="screen">
      <h2>恒久強化</h2>
      <p>所持コイン: {meta.coins}</p>
      <div className="meta-grid">
        {([
          ['hp', '最大HP'],
          ['move', '移動速度'],
          ['damage', '基礎ダメージ'],
          ['xp', 'XP獲得'],
        ] as const).map(([key, label]) => (
          <div key={key} className="meta-item">
            <div>{label} Lv.{meta[key]}</div>
            <Button onClick={() => buy(key)}>強化 {metaUpgradeCost(meta[key])}</Button>
          </div>
        ))}
      </div>
      <Button onClick={() => { if (confirm('強化をリセットしますか？')) setMeta({ ...meta, hp: 0, move: 0, damage: 0, xp: 0 }); }}>リセット</Button>
      <Button onClick={onBack}>タイトルへ</Button>
    </div>
  );
}
