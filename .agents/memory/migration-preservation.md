---
name: Migration preservation
description: Scope and preservation decisions for the Elwa multi-app migration
---

Keep the existing MongoDB database, tenant isolation, legacy fetch layer, and existing frontend appearance during migration. Do not replace them with scaffold PostgreSQL or rewrite the API into generated hooks.

**Why:** This is the user's real product, and migration is strictly a behavior-preserving port; the existing API is too large for a safe rewrite in this scope.

**How to apply:** Move infrastructure boundaries only. Keep original schema validation versions and dependency major versions where behavior depends on them. iPad work belongs to the separate follow-up, not the port.
