module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'config/**/*.js',
    'src/**/*.js',
    '!src/admin/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
