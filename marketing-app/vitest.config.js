import { defineConfig } from 'vitest/config';
import os from 'node:os';
import path from 'node:path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node',
    testTimeout: 30000,
    // Demo writer + throwaway data folder: tests never touch real keys or your history.
    env: {
      MQS_SKIP_DOTENV: '1',
      MOCK_AI: 'true',
      DATA_DIR: path.join(os.tmpdir(), `qms-test-${process.pid}`),
    },
  },
});
