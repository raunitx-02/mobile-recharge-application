#!/bin/bash
# ============================================================
# OptionsPay — Hostinger VPS Deployment Script
# Server: KVM1 (Ubuntu 22.04)
# Domain: optionspay.in
# Backend: api.optionspay.in
# Admin:   optionspay.in/admin
# ============================================================

set -e
echo "🚀 OptionsPay VPS Setup Starting..."

# ── 1. System Update ─────────────────────────────────────────
echo "📦 Updating system packages..."
apt-get update -y && apt-get upgrade -y

# ── 2. Install Node.js 20 LTS ────────────────────────────────
echo "⬇️  Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version && npm --version

# ── 3. Install PM2 (process manager) ────────────────────────
echo "⬇️  Installing PM2..."
npm install -g pm2

# ── 4. Install Nginx ─────────────────────────────────────────
echo "⬇️  Installing Nginx..."
apt-get install -y nginx

# ── 5. Install Certbot (SSL) ─────────────────────────────────
echo "⬇️  Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ── 6. Install Git ───────────────────────────────────────────
apt-get install -y git

# ── 7. Create app directory ──────────────────────────────────
mkdir -p /var/www/optionspay
cd /var/www/optionspay

echo "✅ System setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run: bash deploy.sh"
echo "  2. Run: bash setup-ssl.sh"
