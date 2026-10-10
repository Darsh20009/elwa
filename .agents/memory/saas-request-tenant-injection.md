---
name: SaaS request tenant injection
description: Route validation behavior imposed by the global SaaS gate on API mutations.
---

The global SaaS feature-gate middleware replaces/injects `tenantId` into JSON bodies for `/api` requests before route handlers. Strict Zod request schemas will reject otherwise-valid bodies unless they remove that server-injected field before parsing. Do not trust a client-supplied tenant ID for authorization; derive tenant scope from the authenticated employee or server middleware.

**Why:** Route requests that were correct at the client failed strict body validation because the shared middleware added a field not included in feature-local schemas.

**How to apply:** For new `/api` mutation endpoints, inspect `server/saas-policy.ts`; remove only the authoritative middleware-added tenant field before strict parsing, or use a schema strategy that safely strips unknown fields. Continue deriving tenant ownership and branch authorization server-side.
