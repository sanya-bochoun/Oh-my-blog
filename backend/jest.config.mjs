export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/__tests__/**/*.mjs',
    '**/__tests__/**/*.test.mjs',
    '**/tests/**/*.test.mjs',
    '**/?(*.)+(spec|test).mjs'
  ],
  collectCoverageFrom: [
    'controllers/**/*.mjs',
    'middleware/**/*.mjs',
    'utils/**/*.mjs',
    'routes/**/*.mjs',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.mjs']
};

