---
name: Render build compatibility
description: Render cannot resolve Replit's internal npm package firewall host.
---

The committed npm lockfile may contain `package-firewall.replit.internal` URLs, which are reachable inside Replit but not from Render. Normalize those URLs only in Render's build checkout; leave the shared lockfile intact so Replit installs continue through its package firewall. Keep Replit Vite plugins conditional on development, since Render installs production dependencies without dev-only packages.

**Why:** Render builds failed first on DNS lookups to the internal host and then on missing development-only Vite plugins. Scoping the adjustments to Render avoids bypassing Replit's dependency protections or requiring development tooling in production.

**How to apply:** When changing Render build behavior, preserve checkout-only URL normalization, verify dependencies are actually installed before building, and avoid static imports of development-only plugins in production config.
