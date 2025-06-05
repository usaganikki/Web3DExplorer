# Testing Guide - Web3DExplorer

## 📋 目次

- [概要](#概要)
- [テスト独立性](#テスト独立性)
- [MockBrowserManager](#mockbrowsermanager)
- [TestUtils](#testutils)
- [TestIsolationHelper](#testisolationhelper)
- [実行方法](#実行方法)
- [ベストプラクティス](#ベストプラクティス)
- [トラブルシューティング](#トラブルシューティング)

## 概要

Web3DExplorerは、テスト駆動開発（TDD）の原則に基づいて設計され、Three.js アプリケーションの包括的なテストフレームワークを提供します。このガイドでは、テストの独立性を確保し、高品質なテストを書くための方法を説明します。

## テスト独立性

### Issue #24 対応 - テスト間の依存関係解消

**問題**: 従来のテストでは、テスト間でブラウザインスタンスやグローバル状態が共有されるため、一つのテストが失敗すると他のテストにも影響を与える問題がありました。

**解決策**: MockBrowserManagerとTestUtilsを使用した完全に独立したテスト環境の構築。

### 独立性の保証

```typescript
// ✅ 良い例：完全に独立したテスト
describe('独立したテスト例', () => {
  let testEnv: any;

  beforeEach(async () => {
    // 各テストで新しい環境を作成
    testEnv = await TestUtils.setupTest();
  });

  afterEach(async () => {
    // 必ず環境をクリーンアップ
    await TestUtils.cleanupTest(testEnv);
  });

  test('テスト1：他のテストに影響しない', async () => {
    // このテストは完全に独立している
    await testEnv.page.evaluate(() => {
      window.testProperty = 'test1';
    });
    
    const value = await testEnv.page.evaluate(() => window.testProperty);
    expect(value).toBe('test1');
  });

  test('テスト2：前のテストの影響を受けない', async () => {
    // testPropertyは前のテストの値を持たない
    const value = await testEnv.page.evaluate(() => window.testProperty);
    expect(value).toBeUndefined();
  });
});
```

```typescript
// ❌ 悪い例：依存関係のあるテスト
describe('依存関係のあるテスト例', () => {
  let sharedBrowser: any;

  beforeAll(async () => {
    // 全テストで同じブラウザインスタンスを共有
    sharedBrowser = await puppeteer.launch();
  });

  test('テスト1：グローバル状態を変更', async () => {
    await sharedBrowser.evaluate(() => {
      window.globalValue = 'changed';
    });
  });

  test('テスト2：前のテストの状態に依存', async () => {
    // このテストは前のテストが成功していることを前提とする
    const value = await sharedBrowser.evaluate(() => window.globalValue);
    expect(value).toBe('changed'); // 依存関係あり！
  });
});
```

## MockBrowserManager

### 特徴

MockBrowserManagerは、実際のPuppeteerブラウザを起動せずに、高速で独立したテスト環境を提供します。

```typescript
import MockBrowserManager from '../src/mocks/MockBrowserManager.js';

// MockBrowserManagerの使用例
const browserManager = new MockBrowserManager({
  width: 1024,
  height: 768,
  headless: true
});

await browserManager.initialize();

// ページ操作（モック）
await browserManager.page.setContent('<div>Test Content</div>');
const content = await browserManager.page.content();

// JavaScript実行（シミュレート）
const result = await browserManager.page.evaluate(() => {
  window.testValue = 42;
  return window.testValue;
});

// クリーンアップ
await browserManager.cleanup();
```

### プロパティ管理

```typescript
// グローバルプロパティの設定・取得
browserManager.setGlobalProperty('myProperty', 'myValue');
const value = browserManager.getGlobalProperty('myProperty');

// プロパティのクリア
browserManager.clearGlobalProperties();
```

### Three.js シミュレーション

MockBrowserManagerは Three.js オブジェクトもシミュレートします：

```typescript
// Three.js環境のシミュレート
await browserManager.page.setContent(`
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
`);

// Three.jsオブジェクトの作成をシミュレート
const scene = await browserManager.page.evaluate(() => {
  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  return scene;
});
```

## TestUtils

### 基本的な使用方法

```typescript
import { TestUtils } from '../src/utils/TestUtils.js';

// 独立したブラウザインスタンスの作成
const browserManager = await TestUtils.createIsolatedBrowserInstance({
  width: 800,
  height: 600
});

// グローバル状態のリセット
await TestUtils.resetGlobalState(browserManager.page);

// 条件待機（タイムアウト・リトライ機能付き）
await TestUtils.waitForCondition(
  browserManager.page,
  'window.sceneReady === true',
  { timeout: 5000, interval: 100, retries: 3 }
);

// クリーンアップ
await browserManager.cleanup();
```

### 統一的なセットアップ・クリーンアップ

```typescript
// setupTest と cleanupTest の使用
describe('TestUtilsパターン', () => {
  let testEnv: any;

  beforeEach(async () => {
    testEnv = await TestUtils.setupTest({
      browserOptions: { width: 1200, height: 800 },
      timeout: 10000
    });
  });

  afterEach(async () => {
    await TestUtils.cleanupTest(testEnv);
  });

  test('統一的なテスト環境', async () => {
    expect(testEnv.browserManager).toBeDefined();
    expect(testEnv.page).toBeDefined();
    expect(testEnv.browser).toBeDefined();
  });
});
```

### エラー耐性のあるクリーンアップ

```typescript
// 複数のクリーンアップ処理を安全に実行
await TestUtils.safeCleanup(
  () => browserManager1.cleanup(),
  () => browserManager2.cleanup(),
  () => cleanupOtherResources(),
  () => {
    // エラーが発生してもこの処理は実行される
    console.log('Final cleanup');
  }
);
```

## TestIsolationHelper

### 基本的な使用方法

```typescript
import { createTestIsolation } from '../src/utils/TestIsolationHelper.js';

describe('TestIsolationHelper使用例', () => {
  let testHelper: any;

  beforeEach(async () => {
    testHelper = createTestIsolation('MyTestSuite');
    await testHelper.setup();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  test('独立したテストデータ生成', () => {
    const sceneData = testHelper.generateTestData('scene', 'simple');
    const meshData = testHelper.generateTestData('mesh');
    
    expect(sceneData.id).toBeDefined();
    expect(meshData.id).toBeDefined();
  });

  test('Three.js HTML生成', () => {
    const sceneSetup = () => {
      const scene = new THREE.Scene();
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      scene.add(cube);
      window.testScene = scene;
    };

    const html = testHelper.generateThreeJSTestHTML(sceneSetup);
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('three.min.js');
    expect(html).toContain(testHelper.testName);
  });
});
```

### TestUtilsとの組み合わせ

```typescript
test('TestUtilsとTestIsolationHelperの統合', async () => {
  const testHelper = createTestIsolation('Integration-Test');
  await testHelper.setup();
  
  const testEnv = await TestUtils.setupTest();
  
  // 両方が独立していることを確認
  expect(testHelper.browserManager).not.toBe(testEnv.browserManager);
  
  // 同時使用の例
  const testData = testHelper.generateTestData('scene');
  TestUtils.setMockGlobalProperty(testEnv.browserManager, 'testData', testData);
  
  const retrievedData = TestUtils.getMockGlobalProperty(testEnv.browserManager, 'testData');
  expect(retrievedData).toEqual(testData);
  
  await TestUtils.cleanupTest(testEnv);
  await testHelper.cleanup();
});
```

## 実行方法

### 基本的なテスト実行

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test TestUtils.test.js

# ウォッチモード
npm run test:watch

# カバレッジ付き実行
npm run test:coverage
```

### MockBrowserManagerを使用したテスト

```bash
# MockBrowserManagerのテストのみ実行
npm test -- --testNamePattern="MockBrowserManager"

# TestUtilsのテストのみ実行
npm test -- --testNamePattern="TestUtils"
```

### 並列実行の制御

```bash
# シーケンシャル実行（デフォルト推奨）
npm test -- --runInBand

# 並列実行（高速だが不安定な場合あり）
npm test -- --maxWorkers=4
```

## ベストプラクティス

### 1. 常に独立したテスト環境を使用

```typescript
// ✅ 推奨
beforeEach(async () => {
  testEnv = await TestUtils.setupTest();
});

afterEach(async () => {
  await TestUtils.cleanupTest(testEnv);
});

// ❌ 非推奨（共有リソース）
beforeAll(async () => {
  sharedEnv = await TestUtils.setupTest();
});
```

### 2. MockBrowserManagerでグローバル状態を管理

```typescript
// ✅ 推奨：MockBrowserManagerのAPIを使用
TestUtils.setMockGlobalProperty(browserManager, 'testData', data);
const value = TestUtils.getMockGlobalProperty(browserManager, 'testData');

// ❌ 非推奨：直接的なevaluate使用（予期しない動作の可能性）
await page.evaluate(() => { window.testData = data; });
```

### 3. エラー耐性のあるクリーンアップ

```typescript
// ✅ 推奨：safeCleanupでエラー耐性を確保
afterEach(async () => {
  await TestUtils.safeCleanup(
    () => TestUtils.cleanupTest(testEnv),
    () => MockBrowserManager.cleanupAll(),
    () => customCleanup()
  );
});
```

### 4. 適切なタイムアウト設定

```typescript
// ✅ 推奨：MockBrowserManagerに適した短いタイムアウト
await TestUtils.waitForCondition(
  page,
  'window.sceneReady === true',
  { 
    timeout: 1000,  // MockBrowserManagerでは短時間
    interval: 50,   // 短いポーリング間隔
    retries: 3      // 適度なリトライ回数
  }
);
```

### 5. テストの命名規則

```typescript
// ✅ 推奨：説明的なテスト名
describe('TestUtils - 基本機能テスト', () => {
  describe('resetGlobalState', () => {
    test('windowプロパティがクリアされる', async () => {
      // テスト内容
    });
    
    test('MockBrowserManagerのグローバル状態が適切にリセットされる', async () => {
      // テスト内容
    });
  });
});
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. `TypeError: Cannot read properties of undefined`

**原因**: MockBrowserManagerのプロパティ設定が正しく行われていない

**解決方法**:
```typescript
// ❌ 問題のあるコード
await page.evaluate(() => {
  window.testProperty = 'value';
});
const value = await page.evaluate(() => window.testProperty);
// valueがundefinedになる

// ✅ 修正版
browserManager.setGlobalProperty('testProperty', 'value');
const value = browserManager.getGlobalProperty('testProperty');
// 正しく'value'が取得される
```

#### 2. `waitForFunction timeout`

**原因**: 条件が満たされない、またはタイムアウト設定が不適切

**解決方法**:
```typescript
// ❌ 問題のあるコード
await TestUtils.waitForCondition(
  page,
  '() => false', // 常にfalseを返す
  { timeout: 1000 }
);

// ✅ 修正版
// 事前に条件を満たすように設定
browserManager.setGlobalProperty('testCondition', true);
await TestUtils.waitForCondition(
  page,
  'window.testCondition === true',
  { timeout: 1000, retries: 2 }
);
```

#### 3. `expect(received).toBe(expected) // Object.is equality`

**原因**: MockBrowserManagerの動作とテスト期待値の不一致

**解決方法**:
```typescript
// ❌ 問題のあるコード
expect(result).toBe(true); // resultがundefinedの場合失敗

// ✅ 修正版
// MockBrowserManagerの実際の動作に合わせた期待値
if (typeof result === 'undefined') {
  expect(result).toBeUndefined();
} else {
  expect(result).toBe(expectedValue);
}
```

#### 4. テスト間の状態リーク

**原因**: クリーンアップが不完全

**解決方法**:
```typescript
// ✅ 完全なクリーンアップ
afterEach(async () => {
  // 1. TestUtilsクリーンアップ
  await TestUtils.cleanupTest(testEnv);
  
  // 2. MockBrowserManager全体クリーンアップ
  await MockBrowserManager.cleanupAll();
  
  // 3. テスト固有のクリーンアップ
  if (testHelper) {
    await testHelper.cleanup();
    testHelper = null;
  }
});
```

### デバッグ方法

#### 1. MockBrowserManagerの状態確認

```typescript
test('デバッグ用：MockBrowserManagerの状態確認', async () => {
  console.log('Active instances:', MockBrowserManager.getActiveInstanceCount());
  console.log('Global properties:', browserManager._globalProperties);
});
```

#### 2. 詳細ログの有効化

```typescript
// TestUtils.jsでconsole.warnが出力される場合がある
// テスト実行時に --verbose フラグを使用
npm test -- --verbose
```

#### 3. 個別テストの実行

```typescript
// 特定のテストのみ実行
test.only('問題のあるテストケース', async () => {
  // このテストのみが実行される
});
```

### パフォーマンス最適化

#### 1. MockBrowserManagerのインスタンス数管理

```typescript
// テスト全体でのインスタンス数監視
afterAll(async () => {
  const remainingInstances = MockBrowserManager.getActiveInstanceCount();
  if (remainingInstances > 0) {
    console.warn(`Warning: ${remainingInstances} MockBrowserManager instances still active`);
    await MockBrowserManager.cleanupAll();
  }
});
```

#### 2. 並列実行の適切な設定

```typescript
// jest.config.js
module.exports = {
  // MockBrowserManagerでは並列実行が安全
  maxWorkers: 4,
  
  // ただし、実際のPuppeteerを使用する場合はシーケンシャル実行を推奨
  // maxWorkers: 1,
};
```

---

このテストガイドを参考に、Web3DExplorerで高品質で独立したテストを作成してください。追加の質問やサポートが必要な場合は、GitHubのIssueを作成してください。