#!/usr/bin/env node
/**
 * Phase 5 — VPS One-Command Bootstrap
 *
 * Automates first-time VPS setup via SSH:
 *   1. System packages (Nginx, certbot, fail2ban, ufw)
 *   2. Node.js 22 via nvm
 *   3. PM2 global install + startup
 *   4. Directory layout (/srv/jootacee, /srv/jootacee/logs, /var/www/jootacee)
 *   5. Git clone + API build
 *   6. Nginx config + Let's Encrypt TLS
 *   7. Fail2ban config
 *   8. UFW firewall rules (ssh 22, http 80, https 443)
 *   9. PM2 start + pm2 save
 *  10. Health check
 *
 * Usage:
 *   node scripts/vps-setup.mjs --host <ip> --user root [--domain jootacee.com]
 *   node scripts/vps-setup.mjs --dry-run   # print commands only
 *
 * Requirements on local machine:
 *   SSH access to VPS (key-based, agent or key file)
 */

import { execSync, spawnSync } from 'node:child_process'

const args     = process.argv.slice(2)
const DRY_RUN  = args.includes('--dry-run')
const HOST     = args[args.indexOf('--host') + 1]  ?? process.env.VPS_HOST
const USER     = args[args.indexOf('--user') + 1]  ?? process.env.VPS_USER ?? 'root'
const KEY_FILE = args[args.indexOf('--key')  + 1]  ?? process.env.VPS_SSH_KEY
const DOMAIN   = args[args.indexOf('--domain') + 1] ?? 'jootacee.com'
const EMAIL    = args[args.indexOf('--email') + 1]  ?? 'jootac@gmail.com'

const C = { r: '\x1b[31m', g: '\x1b[32m', y: '\x1b[33m', b: '\x1b[34m', nc: '\x1b[0m' }
const ok   = (s) => console.log(`${C.g}✓${C.nc} ${s}`)
const info = (s) => console.log(`${C.b}→${C.nc} ${s}`)
const warn = (s) => console.log(`${C.y}⚠${C.nc} ${s}`)
const fail = (s) => { console.error(`${C.r}✗${C.nc} ${s}`); process.exit(1) }

if (!HOST && !DRY_RUN) fail('--host <ip> or VPS_HOST env var required')

// ---------------------------------------------------------------------------
// SSH helper
// ---------------------------------------------------------------------------

function ssh(command, opts = {}) {
  const keyFlag = KEY_FILE ? `-i ${KEY_FILE}` : ''
  const sshCmd  = `ssh ${keyFlag} -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 ${USER}@${HOST} '${command.replace(/'/g, "'\\''")}'`

  if (DRY_RUN) {
    console.log(`  ${C.y}[dry]${C.nc} ${command.slice(0, 120)}`)
    return ''
  }

  try {
    return execSync(sshCmd, { encoding: 'utf8', stdio: opts.silent ? 'pipe' : 'inherit' }).trim()
  } catch (err) {
    if (opts.ignoreError) { warn(`Step failed (continuing): ${command.slice(0, 80)}`); return '' }
    fail(`SSH command failed: ${command.slice(0, 80)}\n${err.message}`)
  }
}

function scp(local, remote) {
  const keyFlag = KEY_FILE ? `-i ${KEY_FILE}` : ''
  const cmd = `scp ${keyFlag} ${local} ${USER}@${HOST}:${remote}`
  if (DRY_RUN) { console.log(`  ${C.y}[dry]${C.nc} scp ${local} → ${remote}`); return }
  execSync(cmd, { stdio: 'inherit' })
}

// ---------------------------------------------------------------------------
// Setup steps
// ---------------------------------------------------------------------------

const STEPS = [
  {
    name: 'System packages',
    run() {
      ssh('apt-get update -qq && apt-get install -y -q nginx certbot python3-certbot-nginx fail2ban ufw git curl')
    },
  },
  {
    name: 'Node.js 22 via nvm',
    run() {
      ssh('curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && source ~/.nvm/nvm.sh && nvm install 22 && nvm alias default 22 && nvm use default')
      ssh('source ~/.nvm/nvm.sh && npm install -g pm2')
    },
  },
  {
    name: 'Directory layout',
    run() {
      ssh('mkdir -p /srv/jootacee/logs /var/www/jootacee /srv/jootacee/dist-blue /srv/jootacee/dist-green')
      ssh('chown -R www-data:www-data /var/www/jootacee || true')
    },
  },
  {
    name: 'Git clone + API build',
    run() {
      ssh('if [ -d /srv/jootacee/.git ]; then cd /srv/jootacee && git pull --ff-only; else git clone https://github.com/JootaCee/JOOTACEEHUB.git /srv/jootacee; fi')
      ssh('source ~/.nvm/nvm.sh && cd /srv/jootacee/api && npm ci --only=production && npm run build')
    },
  },
  {
    name: 'Nginx config',
    run() {
      ssh('cp /srv/jootacee/api/nginx/jootacee.conf /etc/nginx/sites-available/jootacee')
      ssh('ln -sf /etc/nginx/sites-available/jootacee /etc/nginx/sites-enabled/jootacee')
      ssh('rm -f /etc/nginx/sites-enabled/default')
      ssh('nginx -t && systemctl reload nginx')
    },
  },
  {
    name: `Let's Encrypt TLS (${DOMAIN})`,
    run() {
      ssh(`certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${EMAIL} --redirect`, { ignoreError: true })
      ssh('(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && nginx -s reload") | sort -u | crontab -')
    },
  },
  {
    name: 'Fail2ban',
    run() {
      scp('api/nginx/fail2ban-jootacee.conf', '/etc/fail2ban/jail.d/jootacee.conf')
      // Write filter files
      const filterContent = `[Definition]\nfailregex = ^<HOST> .* "POST /api/auth/login HTTP/.*" 401\nignoreregex =`
      ssh(`printf '%s' '${filterContent}' > /etc/fail2ban/filter.d/jootacee-nginx-auth.conf`)
      const rlFilter = `[Definition]\nfailregex = limiting requests, excess: .* by zone ".*", client: <HOST>\nignoreregex =`
      ssh(`printf '%s' '${rlFilter}' > /etc/fail2ban/filter.d/jootacee-nginx-ratelimit.conf`)
      const bbFilter = `[Definition]\nfailregex = ^<HOST> .* "(GET|POST) /(wp-admin|xmlrpc\\.php|\\.env|\\.git) HTTP/.*"\nignoreregex =`
      ssh(`printf '%s' '${bbFilter}' > /etc/fail2ban/filter.d/jootacee-nginx-badbot.conf`)
      ssh('systemctl enable fail2ban && systemctl restart fail2ban')
    },
  },
  {
    name: 'UFW firewall',
    run() {
      ssh('ufw --force reset')
      ssh('ufw default deny incoming && ufw default allow outgoing')
      ssh('ufw allow 22/tcp comment "SSH"')
      ssh('ufw allow 80/tcp comment "HTTP"')
      ssh('ufw allow 443/tcp comment "HTTPS"')
      ssh('ufw --force enable')
      ssh('ufw status verbose')
    },
  },
  {
    name: 'PM2 start + persist',
    run() {
      ssh('source ~/.nvm/nvm.sh && cd /srv/jootacee/api && pm2 start ecosystem.config.cjs --env production')
      ssh('source ~/.nvm/nvm.sh && pm2 save')
      ssh('source ~/.nvm/nvm.sh && pm2 startup systemd -u root --hp /root | tail -1 | bash', { ignoreError: true })
    },
  },
  {
    name: 'Health check',
    run() {
      const status = ssh(`curl -sf https://${DOMAIN}/api/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','?'))"`, { ignoreError: true, silent: true })
      if (DRY_RUN || status === 'ok') ok(`API health: ${status || 'ok (dry-run)'}`)
      else warn(`API health returned: "${status}" — check PM2 logs: pm2 logs jootacee-api`)
    },
  },
]

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

if (DRY_RUN) warn('DRY RUN — no SSH commands will be executed\n')
else info(`Bootstrapping VPS at ${USER}@${HOST} for ${DOMAIN}\n`)

for (const step of STEPS) {
  info(`[${STEPS.indexOf(step) + 1}/${STEPS.length}] ${step.name}`)
  step.run()
  ok(`${step.name} done`)
}

console.log()
ok(`VPS setup complete for ${DOMAIN}`)
if (!DRY_RUN) {
  info('Next steps:')
  info('  1. Edit /srv/jootacee/api/.env with your secrets (JWT_SECRET, etc.)')
  info('  2. pm2 restart jootacee-api')
  info('  3. Run: npm run dns:check to verify DNS + HTTPS')
  info('  4. Run: npm run launch:check to verify all Phase 5 gates')
}
