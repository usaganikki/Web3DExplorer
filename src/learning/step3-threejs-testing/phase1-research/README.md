# Three.js Canvas描画テスト調査 - Phase 1: 環境構築

このディレクトリは、Three.jsのCanvas描画テスト手法を調査・PoC実装するための基盤環境です。

## ディレクトリ構造

- `poc/`: PoC (Proof of Concept) 実装を格納します。
- `docs/`: 調査ドキュメントや設計に関するファイルを格納します。
- `utils/`: テスト共通ユーティリティ関数やヘルパーを格納します。
  - `test-setup.ts`: Canvas/WebGLのモック設定が含まれます。
- `components/`: テスト対象となるThree.jsコンポーネントやテスト用のダミーコンポーネントを格納します。
- `tests/`: 各テスト手法ごとのテストファイルを格納します。
  - `method1-dataurl/`: Data URL比較によるテスト手法のテスト。
  - `method2-readpixels/`: `readPixels` を用いたピクセルデータ比較によるテスト手法のテスト。
  - `method3-rendertarget/`: `WebGLRenderTarget` を用いたオフスクリーンレンダリングテスト手法のテスト。
  - `method4-visualregression/`: 視覚的リグレッションテスト手法のテスト。
- `benchmarks/`: 性能測定に関するファイルやテストを格納します。

## 設定ファイル

- `jest.config.js`: このフェーズに特化したJest設定ファイルです。
- `types.ts`: このフェーズで使用する型定義ファイルです。
- `constants.ts`: テストで使用する定数定義ファイルです。

## 依存関係

`package.json` に必要な依存関係が追加されています。`npm install` を実行してインストールしてください。

## 動作確認

- `npm install` が正常に完了すること。
- `npm test` (または `jest --config src/learning/step3-threejs-testing/phase1-research/jest.config.js`) でJest環境が正常に起動すること。
- Three.jsの基本インポートでエラーが発生しないこと。
- Canvas要素の作成・操作でエラーが発生しないこと。

---

**次のステップ**: Issue 55-2 (Three.js Canvas描画テスト手法の文献調査)
