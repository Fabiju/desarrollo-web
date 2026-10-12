module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // import.meta.env (Vite) no existe en Jest, así que usamos un apiConfig falso para los tests
  moduleNameMapper: {
    '^(.*)/apiConfig$': '<rootDir>/src/test/apiConfigMock.ts',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx', '!src/test/**', '!src/**/*.d.ts'],
};
