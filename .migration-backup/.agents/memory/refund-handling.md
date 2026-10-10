---
name: Refund handling
description: Elwa's rules for refunded inventory, legacy cost data, and visual product-photo matching.
---

- Restocking is chosen per refunded order line. Restore inventory and reverse cost only when that line has exact saved ingredient and cost details.
- Older orders without exact line-level inventory snapshots remain eligible for monetary refunds, but do not auto-restock ingredients or estimate item-level COGS.
- Reversing a refund must reverse its stock return and accounting effects together; do not cancel the refund if the stock adjustment cannot be applied safely.
- Link supplied product photos only when visual matching is confident; leave uncertain products without a mapped image.

**Why:** The user chose per-item restocking and visual matching, and asked to avoid accounting errors.

**How to apply:** Use the saved line snapshot for refunds; for legacy orders without it, disable restocking and preserve the unknown cost rather than estimating.
