// three-test-suite/jest.config.js
const jsEsmTransform = {
  // ts-jest を使って .js/.jsx も ESM としてトランスパイル
  '^.+\\.(js|jsx)$': ['ts-jest', { useESM: true }],
  // three-test-suite に .ts/.tsx ファイルがあれば、以下も追加
  // '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true, tsconfig: { jsx: 'react-jsx' } }],
};

// three-test-suite で puppeteer 等の ESM パッケージを node_modules から利用する場合に設定
const suiteTransformIgnorePatterns = [
  'node_modules/(?!(puppeteer)/)' // puppeteer は ESM なのでトランスパイル対象から除外しない
];

// ES Modules環境でのモジュール解決設定
const esmModuleNameMapping = {
  // 相対パスの.js拡張子を適切に解決
  '^(\\.{1,2}/.*)\\.js$': '$1',
  // 必要に応じて他の拡張子も追加
  '^(\\.{1,2}/.*)\\.jsx$': '$1'
};

// 共通のESM設定
const commonEsmConfig = {
  preset: 'ts-jest/presets/default-esm', // ESMサポートのため
  transform: jsEsmTransform,
  extensionsToTreatAsEsm: ['.jsx'], 
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  moduleNameMapper: esmModuleNameMapping, // ES Modules拡張子解決
  transformIgnorePatterns: suiteTransformIgnorePatterns,
  // jest.unstable_mockModule使用時の設定
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules: true // パフォーマンス向上とモック安定性
    }
  }
};

export default {
  projects: [
    {
      displayName: "puppeteer-tests",
      ...commonEsmConfig,
      testMatch: [
        "**/__tests__/unit/*PuppeteerManager*.test.js",
        "**/__tests__/unit/*BrowserManager*.test.js",
        "**/__tests__/unit/*TestUtils*.test.js",
        "**/__tests__/unit/*EnvironmentInspector*.test.js",
        "**/__tests__/unit/*PerformanceTester*.test.js",
        "**/__tests__/unit/*ThreeTestSuite*.test.js",
        "**/__tests__/unit/*SceneInspector*.test.js",
        "**/__tests__/unit/*TestIsolationHelper*.test.js",
        "**/__tests__/unit/*TestDataGenerator*.test.js"
      ],
      testEnvironment: "node",
    },
    {
      displayName: "dom-tests",
      ...commonEsmConfig,
      testMatch: [
        "**/__tests__/unit/*HTMLGenerator*.test.js",
      ],
      testEnvironment: "jsdom",
      // jsdom環境用の追加設定
      setupFilesAfterEnv: [], // 必要に応じてsetupファイルを追加
    },
    {
      displayName: "integration-tests",
      ...commonEsmConfig,
      testMatch: [
        "**/__tests__/integration/*.test.js",
      ],
      testEnvironment: "node",
      // 統合テストは現在リファクタリング中につき除外
      // testPathIgnorePatterns: [  // ← この行をコメントアウト
      //   "**/__tests__/integration/.*\\.test\\.js$" // ← この行もコメントアウト
      // ],
    }
  ],
  collectCoverageFrom: [
    'src/**/*.(js|jsx)', // カバレッジはJS/JSXファイルから
    '!**/node_modules/**'
  ],
  testTimeout: 60000, // TestUtilsを含む全テストのデフォルトタイムアウト
  detectOpenHandles: true,
  verbose: true, // 詳細なテスト結果を表示
  bail: false, // 一つのテストが失敗しても全テストを継続実行
  
  // ES Modules環境での追加設定
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.jsx'],
  moduleNameMapper: esmModuleNameMapping,
  
  // グローバル設定
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules: true
    }
  }
};
