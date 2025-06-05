# テスト失敗時のデバッグガイド

このドキュメントは、Web3DExplorerのテスト実行時に発生する一般的なエラーパターンと、その対処法について説明します。

## 📋 目次

1. [よくあるエラーパターンと対処法](#よくあるエラーパターンと対処法)
2. [ログの読み方・解釈ガイド](#ログの読み方解釈ガイド)
3. [デバッグ手順の具体例](#デバッグ手順の具体例)
4. [環境固有の問題](#環境固有の問題)

## よくあるエラーパターンと対処法

### 🚨 Puppeteer関連エラー

#### Browser launch failed
```
Error: Failed to launch the browser process!
```

**原因**: Chrome/Chromiumが見つからない、またはアクセス権限の問題

**対処法**:
1. 環境変数の設定確認
   ```bash
   export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
   npm install puppeteer
   ```

2. パッケージの再インストール
   ```bash
   npm uninstall puppeteer
   npm install puppeteer
   ```

3. 手動でChromiumパスを指定
   ```javascript
   // PuppeteerManager.js内で
   const browser = await puppeteer.launch({
     executablePath: '/path/to/chrome',
     headless: true
   });
   ```

#### Page timeout
```
TimeoutError: Navigation timeout of 30000 ms exceeded
```

**原因**: WebGL初期化の遅延、重いThree.jsシーンの読み込み

**対処法**:
1. タイムアウト時間の調整
   ```javascript
   // jest.config.js
   module.exports = {
     testTimeout: 60000, // 30000から60000に増加
   };
   ```

2. Puppeteerのタイムアウト設定
   ```javascript
   await page.goto(testPageUrl, { 
     waitUntil: 'networkidle0',
     timeout: 60000 
   });
   ```

3. WebGL初期化の明示的な待機
   ```javascript
   await page.waitForFunction(() => {
     return window.THREE && window.scene && window.renderer;
   }, { timeout: 30000 });
   ```

#### Navigation timeout
```
TimeoutError: waiting for navigation until "load"
```

**原因**: HTMLコンテンツの読み込み失敗、無効なHTML生成

**対処法**:
1. generateTestHTML の内容確認
   ```javascript
   const html = generateTestHTML(config);
   console.log('Generated HTML:', html); // デバッグ出力
   ```

2. headless: false でブラウザ確認
   ```javascript
   const browser = await puppeteer.launch({ 
     headless: false,
     devtools: true 
   });
   ```

3. HTMLバリデーション
   ```javascript
   // HTMLGenerator内で
   if (!html.includes('<script') || !html.includes('</html>')) {
     throw new Error('Invalid HTML generated');
   }
   ```

### 🚨 Jest設定エラー

#### Module resolution failed
```
Cannot resolve module 'puppeteer' from 'src/PuppeteerManager.js'
```

**原因**: ESM設定の問題、transform設定の不備

**対処法**:
1. jest.config.js の transform設定確認
   ```javascript
   transform: {
     '^.+\\.jsx?$': ['babel-jest', { 
       presets: [['@babel/preset-env', { targets: { node: 'current' } }]] 
     }]
   }
   ```

2. extensionsToTreatAsEsm 設定
   ```javascript
   extensionsToTreatAsEsm: ['.js']
   ```

3. package.json の type 確認
   ```json
   {
     "type": "module"
   }
   ```

#### Test environment mismatch
```
ReferenceError: window is not defined
ReferenceError: document is not defined
```

**原因**: DOM/Node.js環境の混同、間違ったプロジェクト設定

**対処法**:
1. 適切なプロジェクト設定の確認
   ```javascript
   // puppeteer-tests: Node.js環境
   testEnvironment: "node"
   
   // dom-tests: jsdom環境
   testEnvironment: "jsdom"
   ```

2. testMatch パターンとの対応確認
   ```javascript
   // HTMLGenerator*.test.js → dom-tests
   // PuppeteerManager*.test.js → puppeteer-tests
   ```

3. テストファイルの配置確認
   ```
   __tests__/unit/HTMLGenerator.test.js → dom-tests
   __tests__/unit/PuppeteerManager.test.js → puppeteer-tests
   ```

#### Transform ignore patterns
```
SyntaxError: Cannot use import statement outside a module
```

**原因**: node_modules内のESMパッケージが変換されていない

**対処法**:
1. transformIgnorePatterns の調整
   ```javascript
   transformIgnorePatterns: [
     "node_modules/(?!(puppeteer|other-esm-package)/)"
   ]
   ```

2. 特定パッケージの除外
   ```javascript
   transformIgnorePatterns: [
     "node_modules/(?!puppeteer)"
   ]
   ```

#### ES Modules 環境でのモック失敗
```
// 例: jest.mock が効かず、元のモジュールがインポートされてしまう
// 例: __mocks__ ディレクトリのモックが自動的に使用されない
// 例: TypeError: OriginalModule.mockClear is not a function (モックされていないため)
// 例: TypeError: Cannot read properties of undefined (reading 'mockImplementation') (モック関数になっていない)
```
**原因**: ES Modules (ESM) 環境下（`package.json` で `"type": "module"`、テスト実行時に `node --experimental-vm-modules` フラグ使用など）では、Jest の標準的なモック機能（`jest.mock` の Hoisting や `__mocks__` ディレクトリ）が期待通りに動作しないことがあります。

**対処法**:
1. **`jest.unstable_mockModule` API の使用**:
   - ESM 環境向けに提供されている `jest.unstable_mockModule` を使用してモジュールを明示的にモックします。
   - モックしたいモジュールと、それを使用するテスト対象のモジュールは、`beforeAll` フックなどで `await jest.unstable_mockModule(...)` を呼び出した後に、動的インポート (`await import(...)`) を使用して読み込みます。
   ```javascript
   // test-file.test.js
   import { jest } from '@jest/globals';
   let MyDependency; // モックされる依存関係
   let MyModule;     // テスト対象

   beforeAll(async () => {
     const mocked = await jest.unstable_mockModule('../src/my-dependency', () => ({
       MyDependency: jest.fn().mockImplementation(() => ({
         someMethod: jest.fn(),
       })),
     }));
     MyDependency = mocked.MyDependency;

     const originalModule = await import('../src/my-module');
     MyModule = originalModule.MyModule;
   });
   // ...テストスイート...
   ```

2. **Jest 設定 (`jest.config.js`) の確認と調整**:
   - `globals['ts-jest'].isolatedModules: true` (ts-jest を使用している場合): この設定がモックの安定性に寄与することがあります。
   - `moduleNameMapper`: ESM 環境での拡張子なしインポートなどを正しく解決するために設定が必要な場合があります。
   - 詳細な設定例は、[Jest設定詳細ガイド](./jest-configuration-guide.md#7-es-modules-環境でのモック設定) を参照してください。

3. **`babel-plugin-jest-hoist` の利用検討 (Babel を使用している場合)**:
   - もしプロジェクトで Babel をトランスパイラとして使用している場合、`babel-plugin-jest-hoist` プラグインを導入することで、`jest.mock` の巻き上げが期待通りに機能するようになることがあります。この場合、`.js` ファイルのトランスフォーム設定を `babel-jest` に変更する必要があります。

### 🚨 Three.js関連エラー

#### WebGL context lost
```
Error: WebGL context lost
THREE.WebGLRenderer: Context Lost
```

**原因**: GPUメモリ不足、ドライバー問題、適切なクリーンアップ不足

**対処法**:
1. テスト実行順序の見直し
   ```javascript
   // jest.config.js
   maxWorkers: 1, // 並列実行を無効化
   ```

2. 適切なクリーンアップ処理の実装
   ```javascript
   afterEach(async () => {
     if (scene) {
       // シーンの全オブジェクトを削除
       while(scene.children.length > 0) {
         scene.remove(scene.children[0]);
       }
     }
     if (renderer) {
       renderer.dispose();
       renderer.forceContextLoss();
     }
   });
   ```

3. メモリ使用量の監視
   ```javascript
   console.log('Memory usage:', process.memoryUsage());
   ```

#### Three.js version mismatch
```
TypeError: THREE.SomeNewFeature is not a function
```

**原因**: CDNバージョンとローカルインストールの不整合

**対処法**:
1. package.jsonバージョン確認
   ```bash
   npm list three
   ```

2. generateTestHTML のCDN URL確認
   ```javascript
   const threeJSVersion = "r150"; // package.jsonと一致させる
   const scriptTag = `<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/${threeJSVersion}/three.min.js"></script>`;
   ```

3. バージョン統一
   ```bash
   npm install three@0.150.0
   ```

## ログの読み方・解釈ガイド

### Jest出力の基本構造

```
✓ PASS puppeteer-tests BrowserManager.test.js
✗ FAIL dom-tests HTMLGenerator.test.js
  ● HTMLGenerator › should generate valid HTML
    ReferenceError: window is not defined
      at Object.<anonymous> (src/HTMLGenerator.js:23:15)
      at Promise.then.completed (node_modules/jest-circus/build/utils.js:300:28)
```

### 解読ポイント

1. **プロジェクト名**: `dom-tests` → jsdom環境想定のテスト
2. **ファイル名**: `HTMLGenerator.test.js` → DOM操作テスト
3. **エラー箇所**: `HTMLGenerator.js:23:15` → 23行目15文字目
4. **エラー内容**: `window is not defined` → 環境設定の問題

### エラーメッセージの分析例

#### パターン1: 環境設定エラー
```
ReferenceError: window is not defined
```
→ Node.js環境でDOM操作を試行。dom-testsプロジェクトで実行する必要がある。

#### パターン2: モジュール解決エラー
```
Cannot resolve module 'puppeteer'
```
→ ESM設定またはtransform設定の問題。jest.config.jsを確認。

#### パターン3: タイムアウトエラー
```
TimeoutError: Navigation timeout of 30000 ms exceeded
```
→ ページ読み込みまたはWebGL初期化が遅い。タイムアウト設定の調整が必要。

## デバッグ手順の具体例

### 🔍 Step 1: エラー発生時の初期確認

#### チェックリスト
- [ ] どのプロジェクト設定で実行されているか
- [ ] testMatch パターンは適切か
- [ ] テスト環境は正しいか
- [ ] 依存関係は正しくインストールされているか

#### 確認コマンド
```bash
# 現在の設定確認
npm run test -- --showConfig

# 特定プロジェクトでの実行
npm run test:puppeteer -- --verbose

# 単一ファイルでの実行
npm test -- HTMLGenerator.test.js
```

### 🔍 Step 2: 段階的デバッグ

#### 2.1 単一テストファイルでの実行
```bash
# 特定のテストファイルのみ実行
npm test -- --testPathPattern=HTMLGenerator.test.js

# より詳細な出力
npm test -- --testPathPattern=HTMLGenerator.test.js --verbose
```

#### 2.2 デバッグ出力の追加
```javascript
// テストファイル内で
beforeEach(() => {
  console.log('Test environment:', process.env.NODE_ENV);
  console.log('Available globals:', Object.keys(global));
});

// 実装ファイル内で
console.log('Puppeteer available:', typeof require !== 'undefined');
console.log('Window available:', typeof window !== 'undefined');
```

#### 2.3 ブラウザデバッグ（Puppeteer使用時）
```javascript
const browser = await puppeteer.launch({
  headless: false,  // ブラウザを表示
  devtools: true,   // DevToolsを開く
  slowMo: 100       // 操作を遅くして確認
});
```

### 🔍 Step 3: 環境固有の確認

#### 3.1 Node.js バージョンの確認
```bash
node --version  # v16以上推奨
npm --version
```

#### 3.2 Chrome/Chromium の確認
```bash
# Puppeteerが使用するChromiumの確認
node -e "console.log(require('puppeteer').executablePath())"

# システムのChromeの確認
google-chrome --version
chromium --version
```

#### 3.3 依存パッケージのバージョン確認
```bash
npm list puppeteer
npm list jest
npm list three
```

### 🔍 Step 4: 設定ファイルの検証

#### jest.config.js の確認ポイント
```javascript
// プロジェクト設定の確認
console.log('Jest projects:', module.exports.projects.map(p => p.displayName));

// testMatch パターンの確認
module.exports.projects.forEach(project => {
  console.log(`${project.displayName}:`, project.testMatch);
});
```

#### package.json の確認ポイント
```json
{
  "type": "module",  // ESM使用時
  "scripts": {
    "test:puppeteer": "jest --selectProjects=puppeteer-tests"
  }
}
```

## 環境固有の問題

### Windows環境での注意点

1. **パス区切り文字**
   ```javascript
   // Windows対応
   const path = require('path');
   const testPath = path.join(__dirname, 'test.html');
   ```

2. **Chromium実行権限**
   ```bash
   # 管理者権限での実行が必要な場合
   npm run test:puppeteer
   ```

### macOS環境での注意点

1. **セキュリティ設定**
   ```bash
   # Chromiumの実行許可
   xattr -d com.apple.quarantine /path/to/chromium
   ```

2. **Rosetta 2（Apple Silicon）**
   ```bash
   # x86_64版Node.jsでの実行
   arch -x86_64 npm install
   arch -x86_64 npm test
   ```

### Linux環境での注意点

1. **X11依存関係**
   ```bash
   # 必要パッケージのインストール
   sudo apt-get install -y libx11-xcb1 libxcomposite1 libxcursor1
   ```

2. **フォント不足**
   ```bash
   # フォントパッケージのインストール
   sudo apt-get install -y fonts-liberation
   ```

## 🆘 それでも解決しない場合

1. **Issue報告前のチェックリスト**
   - [ ] 最新版への更新を試した
   - [ ] 他の環境での動作確認をした
   - [ ] 関連するログを収集した
   - [ ] 最小再現例を作成した

2. **収集すべき情報**
   ```bash
   # システム情報
   node --version
   npm --version
   
   # パッケージ情報
   npm list
   
   # Jest設定情報
   npm run test -- --showConfig
   
   # 詳細なエラーログ
   npm run test -- --verbose 2>&1 | tee error.log
   ```

3. **Issue報告テンプレート**
   ```markdown
   ## 環境情報
   - OS: 
   - Node.js: 
   - npm: 
   
   ## 再現手順
   1. 
   2. 
   3. 
   
   ## 期待される動作
   
   ## 実際の動作
   
   ## エラーログ
   ```

---

このガイドを参考に、段階的にデバッグを進めてください。多くの問題は環境設定やJest設定の調整で解決できます。
