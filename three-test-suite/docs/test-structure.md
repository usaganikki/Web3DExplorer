# テスト構造概要

**Three.js テストフレームワークのテスト構造とコマンド実行ガイド**

## 🎯 テストタイプ別の目的と視点

### 📦 単体テスト (Unit Tests)

```
├── 単体テスト (Unit Tests)
│   ├── 🎯 目的: 個別モジュールの動作確認
│   ├── 🌐 実行環境: Node.js / jsdom
│   ├── 📁 対象: 各クラス・関数の独立した動作
│   └── 📊 ファイル数: 8ファイル
```

**テスト対象モジュール:**
- **BrowserManager**: ブラウザインスタンス管理
- **EnvironmentInspector**: WebGL環境検証
- **HTMLGenerator**: HTMLテンプレート生成
- **MockBrowserManager**: モックブラウザ管理
- **PuppeteerManager**: Puppeteer操作管理
- **SceneInspector**: Three.jsシーン検証
- **TestUtils**: テストユーティリティ機能
- **ThreeTestSuite**: メインテストスイート

### 🔗 結合テスト (Integration Tests)

```
├── 結合テスト (Integration Tests)
│   ├── 🎯 目的: モジュール間の連携確認
│   ├── 🌐 実行環境: Node.js
│   ├── 📁 対象: コンポーネント間の相互作用
│   └── 📊 ファイル数: 1ファイル
```

**テスト対象:**
- **TestPatterns**: 複数モジュールの組み合わせパターン

### ⚡ パフォーマンステスト (Performance Tests)

```
└── パフォーマンステスト (Performance Tests)
    ├── 🎯 目的: 実行速度・メモリ使用量の測定
    ├── 🌐 実行環境: Node.js
    ├── 📁 対象: 処理速度・リソース効率性
    └── 📊 ファイル数: 1ファイル
```

**テスト対象:**
- **PerformanceTester**: フレームワーク性能測定

## 🚀 テスト実行コマンドの使い分けガイド

### 👨‍💻 開発時の推奨コマンド

```bash
# 単体テスト実行（最も頻繁に使用）
npm run test:unit

# 開発中のリアルタイムテスト（ファイル変更時自動実行）
npm run test:watch

# 全テスト実行（コミット前の確認）
npm test
```

### 🎯 特定機能のテスト

```bash
# Puppeteer関連テスト
npm run test:puppeteer

# DOM関連テスト
npm run test:dom

# 結合テスト
npm run test:integration

# パフォーマンステスト
npm run test:performance
```

### 🏭 CI/CD・品質保証

```bash
# カバレッジ付きテスト（品質確認）
npm run test:coverage

# 全テスト実行（CI/CD環境）
npm test

# 特定のテストファイル実行
npm test -- BrowserManager.test.js
npm test -- __tests__/unit/PuppeteerManager.test.js
```

### 🔍 デバッグ・開発支援

```bash
# 詳細ログ付きテスト実行
npm test -- --verbose

# 失敗したテストのみ再実行
npm test -- --onlyFailures

# 特定のテストケースのみ実行
npm test -- --testNamePattern="初期化"
```

## ⚙️ Jest設定の概要

### 🏗️ 3つのプロジェクト構成

```javascript
// jest.config.js の構造
module.exports = {
  projects: [
    {
      displayName: 'unit',           // 単体テスト
      testMatch: ['**/__tests__/unit/**/*.test.js']
    },
    {
      displayName: 'integration',    // 結合テスト  
      testMatch: ['**/__tests__/integration/**/*.test.js']
    },
    {
      displayName: 'performance',    // パフォーマンステスト
      testMatch: ['**/__tests__/performance/**/*.test.js']
    }
  ]
};
```

### 📋 testMatchパターンの役割

| パターン | 対象ディレクトリ | 実行環境 | 用途 |
|----------|----------------|----------|------|
| `**/__tests__/unit/**/*.test.js` | `__tests__/unit/` | Node.js + jsdom | 個別機能テスト |
| `**/__tests__/integration/**/*.test.js` | `__tests__/integration/` | Node.js | モジュール連携テスト |
| `**/__tests__/performance/**/*.test.js` | `__tests__/performance/` | Node.js | 性能測定テスト |

### 🌐 環境別実行の仕組み

```javascript
// 単体テスト環境設定例
{
  testEnvironment: 'jsdom',        // DOM環境をシミュレート
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ]
}

// パフォーマンステスト環境設定例  
{
  testEnvironment: 'node',         // Node.js環境
  testTimeout: 30000,              // 長時間実行を許可
  collectCoverage: false           // カバレッジ測定を無効化
}
```

## 📊 テスト実行の流れ

### 🔄 開発ワークフロー

```
1. 機能開発
   ↓
2. npm run test:unit        # 単体テスト確認
   ↓
3. npm run test:integration # 結合テスト確認  
   ↓
4. npm run test:coverage    # カバレッジ確認
   ↓
5. npm test                 # 全テスト最終確認
   ↓
6. コミット・プッシュ
```

### ⚡ 効率的なテスト実行

```bash
# 段階的テスト実行（開発中）
npm run test:unit           # 高速（~10秒）
npm run test:integration    # 中速（~30秒）  
npm run test:performance    # 低速（~60秒）

# 包括的テスト実行（リリース前）
npm run test:coverage       # 全テスト + カバレッジ（~2分）
```

## 🎨 テストの特徴

### 🔧 技術的特徴

- **環境分離**: 単体・結合・パフォーマンステストで異なる実行環境
- **高速化**: テストタイプ別の最適化された設定
- **独立性**: テスト間の依存関係を排除
- **拡張性**: 新しいテストタイプの追加が容易

### 📈 品質保証

- **カバレッジ**: ソースコードの網羅性測定
- **パフォーマンス**: 処理速度とメモリ使用量の監視  
- **回帰防止**: 既存機能の動作保証
- **CI/CD対応**: 自動化された継続的テスト

## 🚀 次のステップ

詳細な単体テストガイドについては [`unit-tests-guide.md`](./unit-tests-guide.md) を参照してください。

---

*このドキュメントは Three.js テストフレームワークの包括的なテスト戦略の一部です。*