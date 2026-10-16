#!/bin/sh
set -e

# Generate runtime configuration file /config.js from container environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.__CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL:-}",
  DEFAULT_TIMEZONE: "${DEFAULT_TIMEZONE:-Asia/Bangkok}"
};
EOF

echo "[SHD M Supply Admin] Generated /config.js with API_BASE_URL='${API_BASE_URL:-}' and DEFAULT_TIMEZONE='${DEFAULT_TIMEZONE:-Asia/Bangkok}'"

# Execute CMD passed to container (nginx)
exec "$@"
