# Phase1 Research - Three.js Canvas描画テスト手法調査

このディレクトリは、Three.jsのCanvas描画テスト手法を調査・PoC実装するための基盤環境です。

## 📋 プロジェクト構成

```
phase1-research/
├── poc/                     # PoC実装
├── docs/                    # 調査ドキュメント
├── utils/                   # 共通ユーティリティ
├── components/              # テストコンポーネント
├── tests/                   # テストファイル
│   ├── method1-dataurl/    # Method1: toDataURL手法
│   ├── method2-readpixels/ # Method2: readPixels手法
│   ├── method3-rendertarget/ # Method3: RenderTarget手法
│   └── method4-visualregression/ # Method4: Visual Regression手法
├── benchmarks/              # 性能測定
├── package.json            # 依存関係定義
├── jest.config.js          # Jest設定
├── types.ts               # 包括的型定義
├── constants.ts           # 共通定数
└── README.md              # このファイル
```

## 🚀 セットアップ

### 前提条件
- Node.js 18以上
- npm 9以上
- Three.js 0.163.0以上

### インストール
```bash
cd src/learning/step3-threejs-testing/phase1-research
npm install
```

### テスト実行
```bash
# 基本テスト実行
npm test

# ウォッチモードでテスト実行
npm run test:watch

# 詳細出力でテスト実行
npm run test:verbose
```

## 🧪 テスト構成

### 基本動作確認テスト
- `tests/basic-verification.test.ts` - Jest環境・DOM・Canvas基本動作
- `tests/threejs-import.test.ts` - Three.jsインポート・インスタンス化
- `tests/webgl-basic.test.ts` - WebGLコンテキスト基本動作

### Method別テストディレクトリ
各手法専用のテストファイルを格納：
1. **Method1 (toDataURL)** - Canvas.toDataURL()による画像取得
2. **Method2 (readPixels)** - WebGL.readPixels()による直接取得
3. **Method3 (RenderTarget)** - Three.js RenderTargetによるオフスクリーン描画
4. **Method4 (Visual Regression)** - Puppeteer/Playwrightによる回帰テスト

## 📚 型定義システム

### types.ts
包括的な型定義ファイル：
- テスト結果・エラー情報の基本型
- Canvas/WebGL関連設定型
- Three.jsシーン・オブジェクト設定型
- 各Method専用設定型
- 比較・分析結果型
- ベンチマーク・レポート型

### constants.ts
共通定数定義ファイル：
- テスト設定定数（サイズ・色・許容誤差）
- Three.js設定定数（カメラ・ライト・ジオメトリ）
- Method別設定定数
- 性能・ベンチマーク定数
- エラーコード定義

## 🔧 設定詳細

### Jest設定 (jest.config.js)
- **環境**: jsdom (ブラウザAPI模擬)
- **Mock**: Canvas/WebGL完全対応
- **Transform**: TypeScript対応
- **Timeout**: 10秒

### WebGL/Canvas Mock
`jest.setup.js`で包括的なMock実装：
- Canvas 2D/WebGLコンテキスト
- WebGLレンダリングメソッド
- DOM API拡張

## 🎯 主要機能

### 1. Mock環境でのテスト基盤
- Canvas/WebGL APIの完全Mock
- Three.jsとの統合テスト環境
- エラーハンドリング・デバッグ支援

### 2. 型安全なテスト開発
- TypeScript完全対応
- 包括的な型定義システム
- IDE支援・自動補完

### 3. スケーラブルな構成
- Method別分離設計
- 共通ユーティリティ活用
- ベンチマーク・レポート統合

## ⚠️ 重要な制約事項

### canvasパッケージ問題
Phase1では`canvas`パッケージを除去済み：
- **理由**: Node.js v23.11.0との互換性問題
- **対応**: Mock環境での開発に集中
- **将来**: Phase2以降で実環境対応

### 依存関係最適化
実描画不要なパッケージを除去：
- `puppeteer`, `playwright` - Phase2以降で追加
- `pixelmatch`, `resemblejs` - Phase2以降で追加

## 🔄 開発フロー

### Phase1: Mock環境開発
1. 基本環境構築・動作確認 ✅
2. 文献調査・手法整理
3. 基本コンポーネント実装
4. Method1-4個別実装・テスト
5. 総合比較・分析
6. 最終レポート・Phase2準備

### 次ステップ
- Issue #55-2: Canvas描画テスト手法の文献調査
- Issue #55-3: 基本検証コンポーネント・ユーティリティ作成
- Issue #55-4〜55-7: Method1-4実装・テスト
- Issue #55-8: 性能・精度総合比較
- Issue #55-9: 最終レポート作成

## 📞 トラブルシューティング

### npm install失敗
```bash
# node_modules削除・再インストール
rm -rf node_modules package-lock.json
npm install
```

### Jest実行失敗
```bash
# TypeScript型チェック
npx tsc --noEmit types.ts constants.ts

# 個別テスト実行
npm test -- tests/basic-verification.test.ts
```

### Three.jsインポートエラー
- メインプロジェクトでThree.jsがインストール済みか確認
- peerDependenciesとして設定済み

## 🎉 完了状況

### ✅ Phase1環境構築完了
- ディレクトリ構造作成
- npm install正常動作
- Jest環境構築
- WebGL/Canvas Mock実装
- TypeScript型定義システム
- 基本テスト動作確認

**次のIssue準備完了**: Issue #55-2「Canvas描画テスト手法の文献調査」
