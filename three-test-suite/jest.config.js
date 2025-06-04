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

export default {
  projects: [
    {
      displayName: "test-utils",
      preset: 'ts-jest/presets/default-esm', // ESMサポートのため
      transform: jsEsmTransform,
      extensionsToTreatAsEsm: ['.jsx'], // .jsx を ESM として扱う ( .js は package.json の type: module で自動判別)
      moduleFileExtensions: ['js', 'jsx', 'json', 'node'], // 主にJSファイルを扱う
      testMatch: [
        "**/__tests__/unit/*TestUtils*.test.js",
      ],
      testEnvironment: "node",
      transformIgnorePatterns: suiteTransformIgnorePatterns,
      testTimeout: 60000, // TestUtilsは複数ブラウザインスタンスを使うため長めに設定
      setupFilesAfterEnv: [], // 必要に応じて追加
      // TestUtils専用の設定
      maxConcurrency: 1, // TestUtilsテストは並列実行を制限
      detectOpenHandles: true,
      forceExit: false, // TestUtilsのクリーンアップを確実に実行
    },
    {
      displayName: "puppeteer-tests",
      preset: 'ts-jest/presets/default-esm', // ESMサポートのため
      transform: jsEsmTransform,
      extensionsToTreatAsEsm: ['.jsx'], // .jsx を ESM として扱う ( .js は package.json の type: module で自動判別)
      moduleFileExtensions: ['js', 'jsx', 'json', 'node'], // 主にJSファイルを扱う
      testMatch: [
        "**/__tests__/unit/*PuppeteerManager*.test.js",
        "**/__tests__/unit/*BrowserManager*.test.js",
        "**/__tests__/unit/*EnvironmentInspector*.test.js",
        "**/__tests__/performance/*PerformanceTester*.test.js",
        "**/__tests__/unit/*ThreeTestSuite*.test.js",
        "**/__tests__/unit/*SceneInspector*.test.js"
      ],
      testEnvironment: "node",
      transformIgnorePatterns: suiteTransformIgnorePatterns,
    },
    {
      displayName: "dom-tests",
      preset: 'ts-jest/presets/default-esm', // ESMサポートのため
      transform: jsEsmTransform,
      extensionsToTreatAsEsm: ['.jsx'], // .jsx を ESM として扱う ( .js は package.json の type: module で自動判別)
      moduleFileExtensions: ['js', 'jsx', 'json', 'node'], // 主にJSファイルを扱う
      testMatch: [
        "**/__tests__/unit/*HTMLGenerator*.test.js",
      ],
      testEnvironment: "jsdom",
      transformIgnorePatterns: suiteTransformIgnorePatterns, // DOMテストでpuppeteerは通常不要だが、共通設定としておく
    }
  ],
  collectCoverageFrom: [
    'src/**/*.(js|jsx)', // カバレッジはJS/JSXファイルから
    '!**/node_modules/**'
  ],
  testTimeout: 30000,
  detectOpenHandles: true,
  // TestUtils関連の追加設定
  verbose: true, // TestUtilsの詳細なテスト結果を表示
  bail: false, // 一つのテストが失敗しても全テストを継続実行
};