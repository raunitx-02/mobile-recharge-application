#!/bin/bash
# ============================================================
# OptionsPay — App Deploy Script
# Run this on the VPS after vps-init.sh
# ============================================================

set -e
APP_DIR="/var/www/optionspay"
REPO="https://github.com/raunitx-02/mobile-recharge-application.git"

echo "🚀 Deploying OptionsPay..."

# ── Pull Latest Code ─────────────────────────────────────────
cd $APP_DIR

if [ -d ".git" ]; then
  echo "📥 Pulling latest code..."
  git pull origin main
else
  echo "📥 Cloning repository..."
  git clone $REPO .
fi

# ── Deploy Backend ───────────────────────────────────────────
echo "🔧 Setting up backend..."
cd $APP_DIR/backend
npm install --production

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file found! Copying .env.example..."
  cp .env.example .env
  echo "🔴 IMPORTANT: Edit /var/www/optionspay/backend/.env with your real keys!"
fi

# Set production env
sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
sed -i 's/USE_SQLITE=true/USE_SQLITE=false/' .env

# Start/restart backend with PM2
pm2 delete optionspay-api 2>/dev/null || true
pm2 start server.js --name "optionspay-api" \
  --cwd $APP_DIR/backend \
  --env production \
  --log /var/log/optionspay-api.log \
  --max-memory-restart 512M \
  --restart-delay 3000

pm2 save
pm2 startup | tail -1 | bash || true

echo "✅ Backend running on port 3000"

# ── Build Admin Panel ─────────────────────────────────────────
echo "🎨 Building admin panel..."
cd $APP_DIR/admin
npm install

# Set API URL for production build
echo "VITE_API_URL=https://api.optionspay.in/api" > .env.local

npm run build

# Copy admin build to nginx serve dir
mkdir -p /var/www/html/admin
cp -r dist/* /var/www/html/admin/

echo "✅ Admin panel built and deployed"

echo ""
echo "🎉 Deployment complete!"
echo "   Backend:    http://localhost:3000"
echo "   Admin:      https://optionspay.in/admin (after nginx setup)"
echo ""
echo "Run: bash setup-nginx.sh"
