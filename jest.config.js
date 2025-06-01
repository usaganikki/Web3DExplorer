export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testMatch: [
    '**/__tests__/**/*.(js|jsx)',
    '**/*.(test|spec).(js|jsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.(js|jsx)',
    'three-test-suite/src/**/*.(js|jsx)',
    '!src/index.js',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000
};