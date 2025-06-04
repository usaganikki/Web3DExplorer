// jest.config.js (ルート)
const commonEsmTransform = {
  '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true, tsconfig: { jsx: 'react-jsx' } }],
  // .js/.jsx のトランスフォームは three-test-suite 側で主に扱うため、ルートではTS/TSXに集中
};

// ルートプロジェクトで ESM パッケージを node_modules から利用する場合に設定
const rootTransformIgnorePatterns = [
  'node_modules/(?!(some-esm-pkg-for-root)/)' // 必要に応じて設定
];

export default {
  displayName: 'root-tests',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/__tests__/**/*.(ts|tsx)', // TypeScriptのテストファイルに限定
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)' // TypeScriptのテストファイルに限定
  ],
  transform: commonEsmTransform,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/three/(.*)$': '<rootDir>/src/three/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'], // ESMとして扱うのはTS/TSXファイル
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // js, jsxも解決のため残す
  transformIgnorePatterns: rootTransformIgnorePatterns,
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)', // カバレッジもTS/TSXファイルから
    '!src/index.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  testTimeout: 30000,
};
