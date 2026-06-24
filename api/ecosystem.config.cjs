/**
 * PM2 Ecosystem Configuration — Production VPS
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs              # start
 *   pm2 reload ecosystem.config.cjs             # zero-downtime reload
 *   pm2 restart ecosystem.config.cjs            # hard restart
 *   pm2 stop ecosystem.config.cjs               # stop
 *   pm2 save                                    # persist after reboot
 *   pm2 startup                                 # generate systemd unit
 *
 * Environment vars are read from /srv/jootacee/api/.env via dotenv at app boot.
 * PM2 does NOT inject them — the app's env.ts handles validation.
 */

module.exports = {
  apps: [
    {
      name: 'jootacee-api',
      script: './dist/index.js',
      cwd: '/srv/jootacee/api',

      // Cluster mode: one worker per CPU (up to 2 on typical VPS — prevents OOM)
      instances: 'max',
      exec_mode: 'cluster',

      // Auto-restart on crash — with exponential backoff cap
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,        // wait 3s before restart
      min_uptime: '5s',           // must stay up 5s to count as successful start

      // Memory guardrail — restart if heap exceeds 400 MB
      max_memory_restart: '400M',

      // Rolling log management (prevent disk fill on long-running VPS)
      log_file:    '/srv/jootacee/logs/api-combined.log',
      out_file:    '/srv/jootacee/logs/api-out.log',
      error_file:  '/srv/jootacee/logs/api-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Graceful shutdown: wait up to 8s for in-flight requests to drain
      kill_timeout: 8000,
      listen_timeout: 5000,

      // Watch: OFF in production (source changes require explicit restart)
      watch: false,
      ignore_watch: ['node_modules', 'dist', 'logs', '.git'],

      // Node.js flags for production
      node_args: '--max-old-space-size=256',

      // Environment — supplement app's own .env loading
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],

  // Blue-green deploy hook: called by deploy.mjs after build swap
  deploy: {
    production: {
      user: process.env.VPS_USER || 'root',
      host: process.env.VPS_HOST || 'jootacee.com',
      repo: 'git@github.com:JootaCee/JOOTACEEHUB.git',
      path: '/srv/jootacee',
      ref: 'origin/main',
      'pre-deploy': 'git fetch --all',
      'post-deploy': 'cd api && npm ci --only=production && npm run build && pm2 reload ecosystem.config.cjs --env production && pm2 save',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
}
