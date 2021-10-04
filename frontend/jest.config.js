module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/internals/testing/setupTests.ts'],
  moduleNameMapper: {
    '@assets/(.*)': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.svg$': '<rootDir>/internals/testing/svgTransform.ts'
  }
}
