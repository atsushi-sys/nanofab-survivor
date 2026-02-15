import { UPGRADES } from '../../game/data/upgrades';

interface Props {
  choices: string[];
  onPick: (id: string) => void;
  onReroll: () => void;
  canReroll: boolean;
}

export function UpgradeModal({ choices, onPick, onReroll, canReroll }: Props) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>アップグレードを選択</h2>
        <div className="upgrade-list">
          {choices.map((id) => {
            const up = UPGRADES.find((u) => u.id === id)!;
            return (
              <button key={id} className={`card ${up.rarity}`} onClick={() => onPick(id)}>
                <b>{up.name}</b>
                <small>{up.description}</small>
              </button>
            );
          })}
        </div>
        <button disabled={!canReroll} onClick={onReroll}>リロール(ジェム1)</button>
      </div>
    </div>
  );
}
