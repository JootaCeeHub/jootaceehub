import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    root: __dirname,
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
    },
    // Inject required env vars before any module is loaded — avoids importing
    // a setupFiles that might inherit globals (vi.fn) from the parent project.
    env: {
      JWT_SECRET: 'a'.repeat(64),
      ADMIN_PASSWORD_HASH: 'deadbeef:cafebabe',
      REPO_ROOT: '/tmp/test-repo',
      GIT_USER_NAME: 'Test Bot',
      GIT_USER_EMAIL: 'test@example.com',
      DIST_BLUE: '/tmp/dist-blue',
      DIST_GREEN: '/tmp/dist-green',
      NGINX_ROOT: '/tmp/nginx',
      CORS_ORIGIN: 'http://localhost:3000',
    },
  },
})
