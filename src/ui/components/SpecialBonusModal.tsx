import { SpecialBonusChoice } from '../../game/engine/state';

interface Props {
  choices: SpecialBonusChoice[];
  onPick: (id: string) => void;
}

export function SpecialBonusModal({ choices, onPick }: Props) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>特殊敵撃破ボーナス</h2>
        <div className="upgrade-list">
          {choices.map((c) => (
            <button key={c.id} className={`card ${c.rarity}`} onClick={() => onPick(c.id)}>
              <b>{c.label}</b>
              <small>{c.description}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
