# 単体テスト詳細ガイド

**Three.js テストフレームワークの各単体テストファイルの包括的なガイド**

## 🎯 概要

このガイドでは、8つの単体テストファイルの詳細な説明を提供します。各テストファイルの目的、対象機能、主要なテストケースを理解し、効果的なテスト開発と保守を支援します。

## 📁 単体テストファイル一覧

### 📦 BrowserManager.test.js (2KB)

```
📁 BrowserManager.test.js
├── 🎯 目的: ブラウザ管理機能のテスト
├── 🔍 テスト対象: 初期化、設定管理、クリーンアップ
├── 🌐 実行環境: Node.js (Puppeteer)
└── 📝 主要テストケース:
    ├── ブラウザインスタンス作成
    ├── 設定オプション適用
    └── リソース解放
```

**詳細:**
- **テスト対象クラス**: `BrowserManager`
- **主要機能**: ブラウザライフサイクル管理
- **テスト重点**: 初期化パラメータの検証、メモリリーク防止
- **依存関係**: Puppeteer、設定管理システム

**重要なテストシナリオ:**
- ブラウザ起動時の設定適用
- 複数インスタンスの管理
- 正常な終了処理

---

### 🔍 EnvironmentInspector.test.js (6KB)

```
📁 EnvironmentInspector.test.js
├── 🎯 目的: 環境検証機能のテスト
├── 🔍 テスト対象: WebGL検出、ブラウザ情報取得
├── 🌐 実行環境: Node.js (Puppeteer)
└── 📝 主要テストケース:
    ├── WebGL対応チェック
    ├── ブラウザ情報取得
    └── 環境固有設定の確認
```

**詳細:**
- **テスト対象クラス**: `EnvironmentInspector`
- **主要機能**: ブラウザ環境の詳細検証
- **テスト重点**: WebGL互換性、環境特性の正確な検出
- **依存関係**: WebGL API、ブラウザ固有API

**重要なテストシナリオ:**
- WebGL 1.0/2.0サポート検証
- GPU情報の取得
- ブラウザバージョン検出

---

### 🏗️ HTMLGenerator.test.js (3KB)

```
📁 HTMLGenerator.test.js
├── 🎯 目的: HTMLテンプレート生成機能のテスト
├── 🔍 テスト対象: テンプレート生成、オプション処理
├── 🌐 実行環境: Node.js (jsdom)
└── 📝 主要テストケース:
    ├── 基本HTMLテンプレート生成
    ├── カスタムオプション適用
    └── スクリプト注入の検証
```

**詳細:**
- **テスト対象クラス**: `HTMLGenerator`
- **主要機能**: テスト用HTML自動生成
- **テスト重点**: テンプレートの正確性、セキュリティ
- **依存関係**: HTMLテンプレートエンジン、文字列処理

**重要なテストシナリオ:**
- Three.js CDNリンクの挿入
- ユーザースクリプトの安全な注入
- カスタムCSS/HTML要素の追加

---

### 🎭 MockBrowserManager.test.js (19KB)

```
📁 MockBrowserManager.test.js
├── 🎯 目的: モックブラウザ環境のテスト
├── 🔍 テスト対象: モック機能、シミュレーション精度
├── 🌐 実行環境: Node.js (jsdom + mocks)
└── 📝 主要テストケース:
    ├── モックブラウザ環境構築
    ├── 実ブラウザとの互換性
    ├── パフォーマンステスト支援
    └── エラーシミュレーション
```

**詳細:**
- **テスト対象クラス**: `MockBrowserManager`
- **主要機能**: 軽量テスト環境提供
- **テスト重点**: モック精度、高速実行、リソース効率
- **依存関係**: jsdom、モッキングライブラリ

**重要なテストシナリオ:**
- DOM APIのモック実装
- WebGL機能のシミュレーション
- エラー条件の再現

---

### 🎪 PuppeteerManager.test.js (10KB)

```
📁 PuppeteerManager.test.js
├── 🎯 目的: Puppeteer操作管理のテスト
├── 🔍 テスト対象: ページ制御、スクリプト実行
├── 🌐 実行環境: Node.js (Puppeteer)
└── 📝 主要テストケース:
    ├── ページライフサイクル管理
    ├── スクリプト注入・実行
    ├── WebGLコンテキスト取得
    └── エラーハンドリング
```

**詳細:**
- **テスト対象クラス**: `PuppeteerManager`
- **主要機能**: ブラウザ自動化とページ制御
- **テスト重点**: 安定性、エラー回復、リソース管理
- **依存関係**: Puppeteer、Chrome/Chromium

**重要なテストシナリオ:**
- ページ読み込み完了の検出
- Three.jsスクリプトの実行
- WebGLレンダリング結果の取得

---

### 🎨 SceneInspector.test.js (12KB)

```
📁 SceneInspector.test.js
├── 🎯 目的: Three.jsシーン検証機能のテスト
├── 🔍 テスト対象: シーン解析、オブジェクト検証
├── 🌐 実行環境: Node.js (Puppeteer + Three.js)
└── 📝 主要テストケース:
    ├── シーン構造の解析
    ├── 3Dオブジェクトプロパティ検証
    ├── マテリアル・テクスチャ検証
    └── アニメーション状態確認
```

**詳細:**
- **テスト対象クラス**: `SceneInspector`
- **主要機能**: Three.jsシーンの詳細検証
- **テスト重点**: 3D要素の正確な検出と分析
- **依存関係**: Three.js、WebGL、シーングラフ

**重要なテストシナリオ:**
- メッシュ・ジオメトリの検証
- カメラ・ライトの設定確認
- レンダラー状態の検証

---

### 🛠️ TestUtils.test.js (19KB)

```
📁 TestUtils.test.js
├── 🎯 目的: テストユーティリティ機能のテスト
├── 🔍 テスト対象: ヘルパー関数、共通処理
├── 🌐 実行環境: Node.js (jsdom)
└── 📝 主要テストケース:
    ├── 数値比較ユーティリティ
    ├── オブジェクト検証ヘルパー
    ├── 非同期処理サポート
    └── エラー処理ユーティリティ
```

**詳細:**
- **テスト対象クラス**: `TestUtils`
- **主要機能**: テスト開発支援機能
- **テスト重点**: 汎用性、再利用性、精度
- **依存関係**: 数学ライブラリ、検証ライブラリ

**重要なテストシナリオ:**
- 浮動小数点数の比較
- Three.jsオブジェクトの深い比較
- Promise/async処理の支援

---

### 🚀 ThreeTestSuite.test.js (6KB)

```
📁 ThreeTestSuite.test.js
├── 🎯 目的: メインテストスイートのテスト
├── 🔍 テスト対象: 統合機能、API一貫性
├── 🌐 実行環境: Node.js (Puppeteer + jsdom)
└── 📝 主要テストケース:
    ├── フレームワーク初期化
    ├── API統合テスト
    ├── エンドツーエンドワークフロー
    └── 設定管理
```

**詳細:**
- **テスト対象クラス**: `ThreeTestSuite`
- **主要機能**: フレームワーク全体の統合
- **テスト重点**: API一貫性、統合動作
- **依存関係**: 全コンポーネント

**重要なテストシナリオ:**
- フレームワーク全体の初期化
- 複数コンポーネントの連携
- 設定の一貫性

## 🔧 テスト実行ガイド

### 📋 個別ファイルの実行

```bash
# 特定のテストファイルを実行
npm test -- BrowserManager.test.js
npm test -- EnvironmentInspector.test.js
npm test -- HTMLGenerator.test.js
npm test -- MockBrowserManager.test.js
npm test -- PuppeteerManager.test.js
npm test -- SceneInspector.test.js
npm test -- TestUtils.test.js
npm test -- ThreeTestSuite.test.js
```

### 🎯 機能別グルーピング

```bash
# ブラウザ管理関連
npm test -- --testPathPattern="(BrowserManager|MockBrowserManager|PuppeteerManager)"

# Three.js関連
npm test -- --testPathPattern="(SceneInspector|ThreeTestSuite)"

# ユーティリティ関連  
npm test -- --testPathPattern="(HTMLGenerator|TestUtils)"
```

### 🔍 詳細ログ付き実行

```bash
# 詳細なテスト結果を表示
npm test -- --verbose __tests__/unit/

# 特定のテストケースのみ実行
npm test -- --testNamePattern="初期化" __tests__/unit/BrowserManager.test.js
```

## 📊 テストカバレッジ情報

### 📈 ファイル別カバレッジ目標

| テストファイル | 目標カバレッジ | 重点領域 |
|---------------|----------------|----------|
| BrowserManager.test.js | 95%+ | ライフサイクル管理 |
| EnvironmentInspector.test.js | 90%+ | 環境検出精度 |
| HTMLGenerator.test.js | 95%+ | テンプレート生成 |
| MockBrowserManager.test.js | 85%+ | モック精度 |
| PuppeteerManager.test.js | 90%+ | ブラウザ制御 |
| SceneInspector.test.js | 85%+ | 3D要素検証 |
| TestUtils.test.js | 95%+ | ユーティリティ精度 |
| ThreeTestSuite.test.js | 80%+ | 統合動作 |

### 🎯 カバレッジ確認

```bash
# 全体カバレッジ確認
npm run test:coverage

# 特定ファイルのカバレッジ
npm test -- --coverage --testPathPattern="BrowserManager.test.js"
```

## 🚧 開発・保守ガイド

### ✨ 新しいテストケースの追加

```javascript
// テストケース追加のテンプレート
describe('新機能テスト', () => {
  beforeEach(async () => {
    // セットアップ
  });

  test('期待する動作の説明', async () => {
    // テストロジック
    expect(result).toBe(expected);
  });

  afterEach(async () => {
    // クリーンアップ
  });
});
```

### 🔧 既存テストの修正

1. **テスト失敗の原因分析**
2. **期待値の確認**
3. **実装の変更に伴うテスト更新**
4. **回帰テストの実行**

### 📝 テスト記述のベストプラクティス

- **明確な説明**: テストケース名は動作を明確に表現
- **独立性**: テスト間の依存関係を避ける
- **再現性**: 同じ結果を常に得られる
- **効率性**: 不要な処理を避ける

### ES Modules 環境でのモック

プロジェクトで ES Modules (ESM) を使用している場合（例: `package.json` で `"type": "module"` を指定）、Jest で依存モジュールをモックする際に注意が必要です。標準的な `jest.mock` の Hoisting (巻き上げ) が期待通りに機能しないことがあります。

このような場合は、`jest.unstable_mockModule` API と動的インポート (`await import(...)`) を組み合わせることで、ESM 環境でも効果的にモックを行うことができます。

**基本的なアプローチ例:**

```javascript
// my-module.test.js
import { jest } from '@jest/globals';
// import Dependency from '../src/dependency'; // 通常の静的インポートは避ける
// import MyModule from '../src/my-module';   // テスト対象も動的インポート

let Dependency; // モックされた依存モジュール
let MyModule;   // テスト対象モジュール

beforeAll(async () => {
  // 依存モジュールをモック
  const mockedDependency = await jest.unstable_mockModule('../src/dependency', () => ({
    // クラスの場合
    Dependency: jest.fn().mockImplementation(() => ({
      someMethod: jest.fn().mockReturnValue('mocked data'),
    })),
    // default エクスポートの場合
    // default: jest.fn().mockReturnValue('mocked default export'),
    // 名前付きエクスポートの場合
    // namedFunction: jest.fn(),
  }));
  Dependency = mockedDependency.Dependency; // または mockedDependency.default など

  // テスト対象モジュールを動的インポート
  const myModuleImport = await import('../src/my-module');
  MyModule = myModuleImport.MyModule; // または myModuleImport.default
});

describe('MyModule', () => {
  let dependencyInstance;
  let myModuleInstance;

  beforeEach(() => {
    jest.clearAllMocks(); // モックをクリア
    dependencyInstance = new Dependency();
    myModuleInstance = new MyModule(dependencyInstance);
  });

  test('should use mocked dependency', () => {
    // ... テストロジック ...
    // expect(dependencyInstance.someMethod).toHaveBeenCalled();
  });
});
```

**重要なポイント:**

*   モック対象のモジュールと、それを利用するテスト対象のモジュールは、`beforeAll` 内で `jest.unstable_mockModule` を使ってモックを設定した後に、`await import(...)` で動的にインポートします。
*   Jest の設定 (`jest.config.js`) で `globals['ts-jest'].isolatedModules: true` (ts-jest を使用している場合) や `moduleNameMapper` を適切に設定することが、このアプローチの安定動作に繋がることがあります。

詳細な設定や背景については、[Jest設定詳細ガイド](./jest-configuration-guide.md#7-es-modules-環境でのモック設定) も参照してください。

## 🔗 関連ドキュメント

- [テスト構造概要](./test-structure.md) - テスト全体の構造理解
- [設計思想](./design-philosophy.md) - フレームワークの設計理念
- [クイックスタート](./quick-start.md) - 基本的な使用方法

---

*このガイドは Three.js テストフレームワークの単体テスト開発と保守を支援するための包括的なリファレンスです。*
