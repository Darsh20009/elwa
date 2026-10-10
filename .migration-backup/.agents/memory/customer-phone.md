---
name: Customer phone format
description: Canonical storage rules for customer phone numbers and backward compatibility.
---

Store Saudi customer mobile numbers as the existing nine-digit national number without a leading zero. Store numbers from other countries in E.164 form. Use the same canonicalization for registration, login, guest orders, and customer matching.

**Why:** Existing Saudi accounts and orders are matched against national-form numbers; converting them to E.164 would break those lookups.

**How to apply:** Reuse the shared customer-phone normalization and do not migrate historic Saudi numbers unless the lookup path is updated consistently.