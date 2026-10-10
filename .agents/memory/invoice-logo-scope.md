---
name: Invoice logo scope
description: Where the supplied Elwa logo should and should not be applied.
---

Use the latest image supplied by the user as the sole logo in every invoice and receipt output. Trim transparent padding only when needed to fit the invoice layout. Do not replace unrelated customer-site, staff, or app logos.

**Why:** the user specified that every logo visible on invoices should use the latest attached image, not a general rebrand of every logo in the app.

**How to apply:** Update invoice/receipt print templates and ensure their print path waits for the image; leave non-invoice logo usage unchanged.