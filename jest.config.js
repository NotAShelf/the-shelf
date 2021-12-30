/**
 * Jest configuration the-shelf
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/*.spec.ts'],
  verbose: true,
  preset: 'ts-jest',
  name: 'utils',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
};
