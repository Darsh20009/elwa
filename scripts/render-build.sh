#!/usr/bin/env bash

print_npm_diagnostics() {
  log_file=$(find /opt/render/.cache/_logs -maxdepth 1 -type f -name '*debug-0.log' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -n 1 | cut -d' ' -f2-)
  if [ -n "$log_file" ]; then
    echo "Recent npm diagnostics:"
    tail -n 100 "$log_file" | sed -E 's/(Bearer[[:space:]]+)[^[:space:]]+/\1[REDACTED]/g; s/qrx_project_[[:alnum:]_-]+/[REDACTED]/g'
  fi
}

# Replit lockfiles use its internal firewall URL; Render builds need public npm.
sed -i \
  -e 's#http://package-firewall\.replit\.internal/npm/#https://registry.npmjs.org/#g' \
  -e 's#https://package-firewall\.replit\.internal/npm/#https://registry.npmjs.org/#g' \
  package-lock.json
if grep -q 'package-firewall.replit.internal' package-lock.json; then
  echo "The Render package lock still contains an unreachable Replit registry URL"
  exit 1
fi

npm ci --registry=https://registry.npmjs.org --no-audit --no-fund --maxsockets=4
install_status=$?
vite_available=false
if [ -x node_modules/.bin/vite ]; then
  vite_available=true
fi

if [ "$install_status" -ne 0 ] || [ "$vite_available" != true ]; then
  echo "Dependency install incomplete (exit=$install_status, vite_available=$vite_available)"
  print_npm_diagnostics
  exit 1
fi

npm run build
