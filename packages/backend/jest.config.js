module.exports = {
  displayName: 'backend',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@tambr/contracts(|/.*)$': '<rootDir>/../contracts/src/$1',
    '^@tambr/relayer(|/.*)$': '<rootDir>/../relayer/src/$1',
    '^@tambr/shared(|/.*)$': '<rootDir>/../shared/src/$1',
  },
};
