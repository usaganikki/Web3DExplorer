export default {
    displayName: 'learning-tests',
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    testMatch: [
      '<rootDir>/step*/**/*.(test|spec).(ts|tsx)'
    ],
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', { 
        useESM: true, 
        tsconfig: { jsx: 'react-jsx' } 
      }]
    },
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testTimeout: 30000
  };