#!/bin/sh
set -e

# Default backend URL for local development
BACKEND_URL="${BACKEND_URL:-http://backend:3000}"

# Replace backend URL in nginx config
sed -i "s|http://backend:3000|${BACKEND_URL}|g" /etc/nginx/nginx.conf

# Start nginx
exec nginx -g "daemon off;"

