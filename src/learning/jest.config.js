export default {
    displayName: 'learning-tests',
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    testMatch: [
      '<rootDir>/step*/**/*.(test|spec).(ts|tsx)'
    ],
    transform: {
      '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', { 
        useESM: true, 
        tsconfig: {
          jsx: 'react-jsx',
          allowJs: true 
        } 
      }]
    },
    transformIgnorePatterns: [
      '/node_modules/(?!three/examples/jsm/)',
    ],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testTimeout: 30000
  };