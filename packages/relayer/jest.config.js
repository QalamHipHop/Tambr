module.exports = {
  displayName: 'relayer',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@tambr/contracts(|/.*)$': '<rootDir>/../../packages/contracts/src/$1',
    '^@tambr/backend(|/.*)$': '<rootDir>/../../packages/backend/src/$1',
    '^@tambr/shared(|/.*)$': '<rootDir>/../../packages/shared/src/$1',
  },
};
