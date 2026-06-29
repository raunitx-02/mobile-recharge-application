#!/bin/bash
# ============================================================
# OptionsPay — SSL Setup Script
# Run AFTER deploy.sh and after DNS is pointing to this server
# ============================================================

set -e

# Get SSL for main domain
echo "🔒 Getting SSL for optionspay.in..."
certbot --nginx -d optionspay.in -d www.optionspay.in \
  --non-interactive \
  --agree-tos \
  --email admin@optionspay.in \
  --redirect

# Get SSL for API subdomain  
echo "🔒 Getting SSL for api.optionspay.in..."
certbot --nginx -d api.optionspay.in \
  --non-interactive \
  --agree-tos \
  --email admin@optionspay.in \
  --redirect

# Auto-renew cron
echo "0 12 * * * root certbot renew --quiet" >> /etc/cron.d/certbot-renew

echo "✅ SSL certificates installed!"
echo "   optionspay.in → HTTPS ✓"
echo "   api.optionspay.in → HTTPS ✓"
echo "   Auto-renew → enabled ✓"
