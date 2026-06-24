# VPS Deployment Runbook

> **Audience:** whoever operates the Hostinger VPS where the Content API runs.
> **Stack:** Ubuntu 24.04 · Node 22 · Nginx · PM2 · blue-green dist slots
> **API source:** `api/` — Hono server on port 3001

---

## 1 — Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 22 LTS | `nvm install 22` |
| PM2 | latest | `npm i -g pm2` |
| Nginx | 1.24+ | `apt install nginx` |
| Git | 2.x | `apt install git` |

```bash
# One-time: clone repo to VPS
git clone https://github.com/JootaCee/JOOTACEEHUB.git /srv/jootacee
cd /srv/jootacee/api && npm ci --only=production
```

---

## 2 — First-time setup

### 2.1 Environment file

```bash
cp /srv/jootacee/api/.env.example /srv/jootacee/api/.env
# Edit .env — minimum required vars:
nano /srv/jootacee/api/.env
```

Required values:
```
JWT_SECRET=<openssl rand -hex 64>
ADMIN_PASSWORD_HASH=<see api/.env.example for generator command>
REPO_ROOT=/srv/jootacee
GIT_USER_NAME=JootaCee Bot
GIT_USER_EMAIL=jootac@gmail.com
DIST_BLUE=/srv/jootacee/dist-blue
DIST_GREEN=/srv/jootacee/dist-green
NGINX_ROOT=/var/www/jootacee
CORS_ORIGIN=https://jootacee.com
PORT=3001
```

### 2.2 Directory layout

```bash
mkdir -p /srv/jootacee/dist-blue /srv/jootacee/dist-green /srv/jootacee/logs
ln -sfn /srv/jootacee/dist-blue /var/www/jootacee   # initial active slot
```

### 2.3 Nginx

```bash
cp /srv/jootacee/api/nginx.conf /etc/nginx/sites-available/jootacee
ln -s /etc/nginx/sites-available/jootacee /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 2.4 PM2 (process manager)

Use the ecosystem file for consistent, production-grade startup:

```bash
cd /srv/jootacee/api
npm run build

# Start via ecosystem config (cluster mode, auto-restart, log rotation)
pm2 start ecosystem.config.cjs --env production

# Persist across reboots
pm2 save
pm2 startup systemd -u root --hp /root   # follow printed command

# Verify
pm2 status
pm2 logs jootacee-api --lines 20
```

**ecosystem.config.cjs** key settings:
| Setting | Value | Why |
|---------|-------|-----|
| `instances: 'max'` | All CPUs | Full core utilisation |
| `exec_mode: 'cluster'` | PM2 cluster | Zero-downtime reload |
| `max_memory_restart: '400M'` | 400 MB | Guard against memory leaks |
| `kill_timeout: 8000` | 8s | Drains in-flight requests gracefully |
| Rolling logs | `/srv/jootacee/logs/` | Prevents disk fill |

### 2.5 One-command bootstrap (automated)

```bash
# From local machine — sets up everything end-to-end
node scripts/vps-setup.mjs --host <vps-ip> --user root --domain jootacee.com

# Then set secrets on VPS:
nano /srv/jootacee/api/.env
pm2 restart jootacee-api

# Verify from local:
npm run dns:check
npm run launch:check
```

---

## 3 — Routine deployment

Triggered automatically by CI on every push to `main` via Cloudflare Pages (frontend). The VPS API is deployed manually or via webhook.

### Manual deploy

```bash
# 1. Pull latest code
cd /srv/jootacee
git pull origin main

# 2. Install new API deps (production only)
cd api && npm ci --only=production

# 3. Rebuild API
npm run build

# 4. Reload API without downtime
pm2 reload content-api

# 5. Verify health
curl http://localhost:3001/health
```

### Blue-green frontend deploy

The API's `/build/trigger` endpoint handles this automatically when called from the admin panel:
1. Runs `next build` in the background
2. Outputs to the inactive dist slot (blue/green)
3. Atomically swaps the Nginx symlink
4. Previous slot is kept for instant rollback

---

## 4 — Rollback

### API rollback (PM2)

```bash
# List recent restarts
pm2 logs content-api --lines 50

# If API is broken: revert to last known good commit and rebuild
cd /srv/jootacee
git log --oneline -10
git checkout <commit-hash> -- api/
cd api && npm run build && pm2 reload content-api
```

### Frontend rollback (blue-green)

```bash
# Check which slot is active
ls -la /var/www/jootacee   # should show → dist-blue or → dist-green

# Swap to the other slot manually
ln -sfn /srv/jootacee/dist-green /var/www/jootacee   # or dist-blue
nginx -s reload

# Verify
curl -I https://jootacee.com
```

---

## 5 — Health checks

```bash
# API process status
pm2 status content-api

# API health endpoint
curl http://localhost:3001/health

# Nginx status
systemctl status nginx

# Recent API logs
pm2 logs content-api --lines 100

# Audit log (CMS operations)
tail -f /srv/jootacee/logs/audit.ndjson
```

---

## 6 — SSL / HTTPS

Nginx handles TLS termination. Let's Encrypt via certbot:

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d jootacee.com -d www.jootacee.com
# Certbot auto-renews via systemd timer
```

---

## 7 — Secrets rotation

| Secret | How to rotate |
|--------|--------------|
| `JWT_SECRET` | Generate new value → update `.env` → `pm2 reload content-api` → all existing tokens invalidated immediately |
| `ADMIN_PASSWORD_HASH` | Generate new hash (see `.env.example`) → update `.env` → `pm2 reload content-api` |

---

## 8 — Monitoring checklist (post-deploy)

- [ ] `curl http://localhost:3001/health` returns `{"status":"ok","memory":{"heapUsedMB":...}}`
- [ ] `pm2 status` shows `content-api` as `online`
- [ ] `curl -I https://jootacee.com` returns 200
- [ ] Admin panel at `/admin` loads and can authenticate
- [ ] Audit log at `/srv/jootacee/logs/audit.ndjson` is updating
- [ ] Admin → Analytics → Launch P5 tab shows live health (green)

---

## 9 — Phase 5 VPS Hardening (applied 2026-06-21)

### 9.1 — Middleware stack (api/src/app.ts)

```
Request → hardeningMiddleware → logger → slowDownMiddleware (auth/git) → routes
```

**hardeningMiddleware** (`api/src/middleware/security.ts`):
- Global rate limit: **200 req/min/IP** (sliding 60s window)
- Payload cap: **10 MB** max Content-Length
- IP blocklist via `BLOCKED_IPS` env var (comma-separated)
- Attaches `X-Request-Id` to every request + response
- Security response headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: off`, `X-Permitted-Cross-Domain-Policies: none`

**slowDownMiddleware** — applied to `/auth/*` and `/git/*`:
- After **10 req/min** from same IP: adds **200ms** artificial delay per request
- Prevents credential stuffing and rapid Git push abuse without hard blocking

### 9.2 — Health endpoint

`GET /health` now returns:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "buildId": "<BUILD_ID env>",
  "uptime": 3600,
  "ts": "2026-06-21T...",
  "memory": { "heapUsedMB": 45, "heapTotalMB": 80, "rssMB": 90 }
}
```

### 9.3 — Nginx hardening

Add to `/etc/nginx/sites-available/jootacee`:

```nginx
# Rate limiting zone (define in http block)
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

server {
    # ...existing config...
    
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://localhost:3001/;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Real-IP $remote_addr;
        add_header X-Content-Type-Options nosniff always;
        add_header X-Frame-Options DENY always;
    }
}
```

### 9.4 — Fail2ban (comprehensive brute-force protection)

Config files are committed at `api/nginx/fail2ban-jootacee.conf` and `api/nginx/fail2ban-filters.conf`.

```bash
# Install
apt install fail2ban

# Deploy config
cp /srv/jootacee/api/nginx/fail2ban-jootacee.conf /etc/fail2ban/jail.d/jootacee.conf

# Deploy filters (one per jail)
cp /srv/jootacee/api/nginx/fail2ban-filters.conf /tmp/
# (the filters.conf file contains three [Definition] blocks — split manually or use vps-setup.mjs)

systemctl enable fail2ban && systemctl restart fail2ban

# Verify
fail2ban-client status
fail2ban-client status sshd
fail2ban-client status jootacee-nginx-auth
```

**Jail summary:**

| Jail | Triggers | Ban time |
|------|----------|----------|
| sshd | 3 failed SSH logins / 10 min | 24h |
| jootacee-nginx-auth | 5 failed /api/auth/login 401 / 5 min | 2h |
| jootacee-nginx-ratelimit | 10 Nginx 429 errors / 1 min | 1h |
| jootacee-nginx-badbot | 2 scanner paths (wp-admin, .env…) | 24h |

### 9.5 — UFW Firewall

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment "SSH"
ufw allow 80/tcp comment "HTTP"
ufw allow 443/tcp comment "HTTPS"
ufw --force enable
ufw status verbose
```

### 9.6 — Blocked IPs (application layer)

Add BLOCKED_IPS to `/srv/jootacee/api/.env` and `pm2 reload jootacee-api`:
```
BLOCKED_IPS=1.2.3.4,5.6.7.8
```
IPs are blocked at application layer (before authentication). For persistent attackers, also use `ufw deny from <ip>`.

### 9.7 — PM2 with ecosystem.config.cjs

```bash
# Zero-downtime reload (use this for API updates)
pm2 reload ecosystem.config.cjs --env production

# Hard restart (use only if reload hangs)
pm2 restart ecosystem.config.cjs

# Monitor in real-time
pm2 monit

# Log rotation (if pm2-logrotate not installed)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
```
