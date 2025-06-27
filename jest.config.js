// jest.config.js (ルート)
const commonEsmTransform = {
  '^.+\\.(ts|tsx)$': ['ts-jest', { 
    useESM: true, 
    tsconfig: {
      jsx: 'react-jsx',
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
        '@/types/*': ['./src/types/*'],
        '@/components/*': ['./src/components/*'],
        '@/utils/*': ['./src/utils/*'],
        '@/three/*': ['./src/three/*']
      }
    }
  }],
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
    // パスエイリアス設定 - より具体的なものを先に配置
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/three/(.*)$': '<rootDir>/src/three/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    // CSS/SCSS ファイルのモック
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // 画像ファイルのモック
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },
  setupFilesAfterEnv: [
    'jest-canvas-mock',
    '<rootDir>/jest.setup.ts',
    '<rootDir>/tests/setup.ts'
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
  // モジュール解決の設定
  resolver: undefined,
  moduleDirectories: ['node_modules', '<rootDir>/'],
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
};
