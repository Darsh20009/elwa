---
name: WhatsApp customer flow
description: Elwa's required customer sign-in and automated WhatsApp delivery behavior.
---

- Customer registration and sign-in use a phone field with a country calling code and WhatsApp OTP. Existing numbers sign in; new customers provide a name after verification, with email optional.
- Keep at least three seconds between automated WhatsApp sends, including OTPs, POS receipts, and daily summaries.
- POS WhatsApp receipts include order details. Send the daily sales summary to an active owner first, falling back to active admins, using their saved phone numbers and the Saudi business-day schedule.
- POS orders require the customer's name and a valid phone number. Send order details through QIROX to the customer and the configured order-receiver number.
- QIROX WhatsApp supports at most five attachments; PDFs must be no larger than 20 MB and must use public HTTPS URLs. Use short-lived signed invoice links and only report attachment success when QIROX accepts the message.

**Why:** the user asked for these account and notification behaviors, including POS messages to both recipients and a PDF invoice; QIROX's current integration guide specifies HTTPS-only attachments and a 20 MB PDF limit.

**How to apply:** Preserve these rules when changing customer authentication, POS messaging, the WhatsApp integration, or the daily scheduler. An accepted API request is not proof that a recipient downloaded or viewed the PDF.
