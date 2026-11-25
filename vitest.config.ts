import { defineConfig } from 'vitest/config';

// `npm test` : tests rapides. `npm run solve` : le solveur rejoue chaque niveau (plus long).
export default defineConfig({
  test: {
    include: process.env.SOLVE ? ['tests/solve/*.test.ts'] : ['tests/*.test.ts'],
    testTimeout: 600_000,
  },
});
