/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    // exclude complex runtime wrappers from initial coverage to focus on core utils
    '!src/runner.ts',
    '!src/watcher.ts',
    '!src/processUtils.ts',
    '!src/exec.ts',
    '!src/index.ts',
    '!src/cli.ts'
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
  coverageThreshold: {
    global: {
      statements: 90,
      functions: 90,
      lines: 90
    }
  }
};
