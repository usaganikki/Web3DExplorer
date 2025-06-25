module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../../../../jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '../../../../src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // このJest設定ファイルが対象とするテストファイルを指定
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/components/**/*.(test|spec).(ts|tsx)'
  ],
  
  // ルートのjest.config.jsと競合しないようにdisplayNameを設定
  displayName: 'threejs-testing-research-phase1',
  
  // TypeScriptの型解決のための設定
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // ESMとして扱う拡張子
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // transformIgnorePatternsは必要に応じて追加
  transformIgnorePatterns: [
    'node_modules/(?!(three)/)' // three.jsはトランスフォーム対象に含める
  ],
  
  // プロジェクトルートの設定
  rootDir: '.',
  
  // モジュール解決の設定
  moduleDirectories: ['node_modules', '../../../../node_modules'],
  
  // タイムアウト設定
  testTimeout: 10000,
};
