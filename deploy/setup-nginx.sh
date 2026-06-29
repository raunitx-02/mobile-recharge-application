#!/bin/bash
# ============================================================
# OptionsPay — Nginx Setup Script
# ============================================================

set -e

# Copy nginx config
echo "📋 Setting up Nginx..."
cp /var/www/optionspay/deploy/nginx.conf /etc/nginx/sites-available/optionspay

# Create proxy_params if missing
cat > /etc/nginx/proxy_params << 'EOF'
proxy_set_header Host $http_host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_cache_bypass $http_upgrade;
proxy_read_timeout 120s;
proxy_connect_timeout 120s;
EOF

# Enable site
ln -sf /etc/nginx/sites-available/optionspay /etc/nginx/sites-enabled/optionspay

# Disable default nginx site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx
systemctl enable nginx

echo "✅ Nginx configured!"
echo "   Site: optionspay"
echo "   Admin: /admin -> /var/www/html/admin"
echo "   API:   api.optionspay.in -> localhost:3000"
