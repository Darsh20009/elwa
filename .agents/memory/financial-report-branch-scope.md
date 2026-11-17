---
name: Financial report branch scope
description: Rules for reporting account balances when some opening balances or journal entries have no branch assignment.
---

For a branch-filtered financial report, include opening balances and journal lines only when they are explicitly assigned to that branch. Do not spread unassigned balances across branches.

**Why:** Assigning company-wide balances to individual branches without source data would fabricate financial values.

**How to apply:** Filter by explicit account/line branch IDs and tell users that unassigned balances are excluded rather than silently allocating them.
