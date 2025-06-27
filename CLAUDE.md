# Web3DExplorer - Claude Code Assistant Guide

## 📋 プロジェクト概要

Web3DExplorerは、**TDD駆動の3D Webビジュアライゼーションライブラリ**です。

### 🎯 主要目標
- **Primary**: 東京駅周辺の3D可視化アプリケーション開発
- **Secondary**: Three.js用の再利用可能なTDDテストフレームワーク構築

### 📊 現在の状況
- ✅ **メインプロジェクト**: v0.1.1完成（テスト独立性確保済み）
- 🔄 **現在**: `src/learning/`でTypeScript単体テスト学習中
- 🎯 **次期**: WebXR対応とGIS統合強化予定

---

## 🛠️ 技術スタック

### コア技術
- **TypeScript 5.0+**: 完全型安全性
- **Three.js 0.163+**: 3Dレンダリング・シーン管理
- **React 18.2+**: UIフレームワーク
- **React Three Fiber**: React Three.js統合
- **Cesium**: GIS統合・地理座標系

### 開発・ビルド環境
- **Vite**: 高速ビルドシステム
- **Jest + jsdom**: TypeScript対応テスト環境
- **ESLint + Prettier**: TypeScript対応リンター・フォーマッター
- **GitHub Actions**: CI/CD対応

### テスト基盤
- **MockBrowserManager**: 高速独立ブラウザ環境 ✅
- **Jest Custom Matchers**: 3Dオブジェクト用カスタムマッチャー ✅
- **WebGL API Mock**: jsdom環境でのWebGL完全モック ✅
- **Test Independence**: Issue #24対応済み（完全なテスト独立性） ✅

---

## 📁 フォルダ構成とClaude Codeでの扱い方

### 🎯 メインプロジェクト（完成済み - v0.1.1）

```
src/
├── core/                    # 核となるExplorerクラス
│   └── Explorer.ts         ✅ 完了
├── components/             # React統合コンポーネント
│   ├── Web3DExplorerComponent.tsx ✅ 完了
│   └── TokyoStationExplorer.tsx   ✅ 完了
├── gis/                    # GIS機能とCesium連携
│   └── GISManager.ts       ✅ 完了
├── types/                  # TypeScript型定義
│   ├── index.ts           ✅ 完了
│   ├── gis.ts            ✅ 完了
│   └── testing.ts        ✅ 完了
└── utils/                  # ユーティリティ
    └── EventEmitter.ts     ✅ 完了

three-test-suite/           # 独立したTDDフレームワーク
├── src/utils/TestUtils.js  ✅ 完了（Issue #24対応）
├── src/mocks/MockBrowserManager.js ✅ 完了
└── __tests__/             # テストファイル群
```

### 📚 学習エリア（現在活動中）

```
src/learning/               # 🔄 現在活動中の学習環境
├── package.json           # 独立したパッケージ管理
├── jest.config.js         # 学習用Jest設定
├── jest.setup.js          # WebGLモック環境
├── vite.config.ts         # 学習用Vite設定
├── step1-basic/           # React + Three.js基礎
│   ├── BasicCube.tsx      ✅ 基本3Dセットアップ習得済み
│   └── README.md          # 詳細な学習メモ
├── step1-testing/         # インタラクティブ機能
│   ├── InteractiveCube.tsx ✅ 状態管理・useRef問題解決済み
│   └── README.md          # 高度な実装ノウハウ記録
└── step1-testing-foundation/ # テスト環境構築
    ├── InteractiveCube.test.tsx ✅ Jest基盤完成
    ├── test-utils.tsx     ✅ テストユーティリティ
    └── README.md          # Jest・WebGLモック詳細解説
```

### ⚠️ **重要**: 環境の独立性
- `src/learning/`は**独立したTypeScript学習環境**
- 専用のpackage.json、jest.config.js、WebGLモック環境を保持
- 操作時は必ず適切なディレクトリで作業すること

---

## 🚀 開発ワークフロー

### メインプロジェクト作業
```bash
# プロジェクトルートで実行
cd /Users/usagani/Documents/projects/Web3DExplorer

# 開発
npm run dev              # 開発サーバー起動
npm run type-check       # TypeScript型チェック
npm run build           # プロダクションビルド

# テスト
npm test                # 全テスト実行（独立性保証済み）
npm run test:coverage   # カバレッジ付きテスト
npm run test:suite      # Three.jsテストスイート

# 並列実行も安全（Issue #24対応済み）
npm test -- --maxWorkers=4
```

### 学習環境作業
```bash
# 学習環境に移動してから実行
cd /Users/usagani/Documents/projects/Web3DExplorer/src/learning

# 開発
npm run dev             # 学習用開発サーバー
npm run build          # 学習用ビルド

# テスト（WebGLモック環境使用）
npm test               # Jest + jsdom + WebGLモック
npm run test:watch     # テスト監視モード
npm run test:coverage  # カバレッジレポート
```

---

## 🧪 テスト環境の重要な特徴

### WebGLモック環境（完全構築済み）
- **場所**: `src/learning/jest.setup.js`
- **機能**: jsdom環境でWebGL APIを完全モック化
- **対応API**: WebGLRenderingContext全般、getShaderPrecisionFormat、getProgramParameter等
- **効果**: Three.js WebGLRendererが正常動作

### テスト独立性保証（Issue #24対応済み）
- **MockBrowserManager**: 高速で独立したテスト環境
- **TestUtils**: 統一的なセットアップ・クリーンアップ
- **完全な独立性**: 全テストが任意の順序で実行可能
- **並列実行対応**: 複数テストの同時実行が安全

### テスト実行のコツ
```bash
# 環境に応じたテスト実行
# 学習環境
cd src/learning && npm test

# メイン環境  
npm test  # プロジェクトルートで

# デバッグモード
npm run test:watch     # ファイル変更監視
npm run test:coverage  # カバレッジ確認
```

---

## 💡 Claude Codeでの効果的な作業方法

### よくあるタスクパターン

#### 1. 新しい学習ステップの追加
```bash
# パターン: step{番号}-{テーマ}/
# 例: step2-advanced-testing/, step3-webxr-integration/

# 必要ファイル構成:
step*-*/
├── README.md           # 学習メモ（必須）
├── *.tsx              # 実装ファイル  
└── *.test.tsx         # テストファイル（推奨）
```

#### 2. テスト実装支援
- **WebGLモック活用**: `jest.setup.js`の既存モック利用
- **Testing Library**: ユーザー視点のセレクター優先
- **型安全**: TypeScriptとの適切な連携

#### 3. Three.jsコンポーネント開発
- **TDDアプローチ**: テストファースト開発
- **型安全性**: Three.js + TypeScriptの完全活用
- **再利用性**: コンポーネントの独立性重視

### 作業時の注意点
1. **ディレクトリ確認**: 作業前に`pwd`で現在地確認
2. **環境差異**: learning/とmainの設定差異に注意
3. **テスト実行**: 適切なディレクトリでの実行
4. **依存関係**: 各環境の独立したpackage.json管理
5. **目的**: learning/ フォルダ配下の作業はユーザーが学習するために行われるため、コードの直接の修正やテストは行わず作業の提案だけを行う

---

## 📋 プロジェクト固有の重要事項

### 🎓 学習の現状と到達レベル
- ✅ **基本実装**: React + Three.js基本セットアップ完全習得
- ✅ **高度な状態管理**: useRefによるstate同期問題解決済み
- ✅ **テスト環境**: Jest + WebGLモック環境完全構築
- 🔄 **現在の課題**: Three.jsオブジェクトテストの「壁」を発見・対策検討中

### 💭 設計思想とアプローチ
- **TDD駆動開発**: テストファースト、Red-Green-Refactorサイクル
- **テスト独立性**: 各テストが独立するようにテストを設計する
- **型安全性優先**: TypeScript型システムの完全活用
- **動作重視**: 実装の詳細より、期待される動作に着目

### 📊 品質基準と要件
- **テストカバレッジ**: 90%以上必須
- **コードスタイル**: ESLint + Prettier完全準拠
- **ドキュメント**: TypeDoc形式のコメント必須
- **パフォーマンス**: テスト実行時間10秒以内
- **並列実行**: 全テストが並列で安全に実行可能


**Last Updated**: 2025-06-23  
**Version**: 0.1.1  
**Status**: ✅ Test Independence Complete + 🔄 Learning Phase Active