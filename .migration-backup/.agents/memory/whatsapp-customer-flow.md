---
name: WhatsApp customer flow
description: Elwa's required customer sign-in and automated WhatsApp delivery behavior.
---

- Customer registration and sign-in use a phone field with a country calling code and WhatsApp OTP. Existing numbers sign in; new customers provide a name after verification, with email optional.
- Keep at least three seconds between automated WhatsApp sends, including OTPs, POS receipts, and daily summaries.
- POS WhatsApp receipts include order details. Send the daily sales summary to an active owner first, falling back to active admins, using their saved phone numbers and the Saudi business-day schedule.

**Why:** the user asked for these account and notification behaviors.

**How to apply:** Preserve these rules when changing customer authentication, POS messaging, the WhatsApp integration, or the daily scheduler.
