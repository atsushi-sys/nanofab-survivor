# Nanofab Survivor

モバイル対応の Canvas 製ローグライト防衛ゲームです。ナノ清浄ラインを守る「ナノ管理ドローン」として、3分間の生存を目指します。

## セットアップ

```bash
npm install
npm run dev
```

本番ビルド:

```bash
npm run build
npm run preview
```

## 操作

### キーボード
- 移動: `WASD` / 矢印キー
- 一時停止: `Space`
- 速度切替: `1` (x1), `2` (x2)

### タッチ
- 画面左下の仮想ジョイスティックで移動
- 下部のボタンで一時停止・速度切替
- レベルアップ時はカードをタップして強化を選択

## ゲームループ

1. **タイトル**: 開始、設定（効果音/振動）
2. **ステージ**: 180秒生存、経験値回収、レベルアップ時の3択強化
3. **リザルト**: 到達時間、レベル、討伐数、コイン/ジェム、シード表示
4. **恒久強化**: コインで4種ステータスを恒久強化（localStorage保存）

## データ駆動設計

以下のデータファイルを編集することでバランス調整できます。

- `src/game/data/enemies.ts`: 敵のHP/速度/ダメージ/出現重み
- `src/game/data/upgrades.ts`: 強化候補、レア度、効果タイプ、最大スタック
- `src/game/data/weapons.ts`: 基本武器の威力/連射/弾速/貫通など

すべての実行時ロール（敵種・強化候補）はシード付き PRNG (`mulberry32`) を利用するため再現可能です。

## Balance Notes

- 出現数カーブ: `src/game/systems/spawner.ts` の `perSecond` 係数を調整
- 成長速度: `src/game/engine/state.ts` の `xpCurve` を調整
- 武器DPS: `weapons.ts` + `upgrades.ts` のダメージ/間隔系を調整
- 長期難易度: `enemies.ts` の `spawnWeightByTime` と `tank` 系HPを調整

## フォルダ構成

- `src/game/engine`: ループ、描画、PRNG、状態
- `src/game/systems`: 移動/戦闘/スポーン/回収/強化処理
- `src/game/data`: 全コンテンツ定義
- `src/ui/screens`: タイトル/ステージ/結果/強化画面
- `src/ui/components`: HUD、ジョイスティック、モーダル
- `src/storage`: localStorage 永続化
