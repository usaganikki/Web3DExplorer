// jest.config.js (ルート)
const commonEsmTransform = {
  '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true, tsconfig: { jsx: 'react-jsx' } }],
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
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx'
  ],
  transform: commonEsmTransform,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/three/(.*)$': '<rootDir>/src/three/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: [
    'jest-canvas-mock',
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup.js'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: rootTransformIgnorePatterns,
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    '!src/**/*.d.ts',
    '!**/node_modules/**'
  ],
  testTimeout: 30000,
};
