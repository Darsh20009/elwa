---
name: iPad printer bridge
description: Platform limits and safe local-bridge requirements for Elwa POS printing.
---

The current Elwa iPad printing scope is the existing website in iPad Safari or Chrome; do not add a native app, Flutter/TestFlight workflow, or app migration for this printing work. The first wired option is an outbound HTTPS queue to an administrator-managed macOS/Linux host using CUPS and the printer's installed USB driver. The known manufacturer is Epson, but the exact model and driver compatibility are unverified; this adapter does not support Windows, direct browser USB/Bluetooth, or assume every printer works.

**Why:** The user superseded the earlier native-app plan with a browser-only receipt-printing specification on 2026-10-10. iPad browsers cannot safely access arbitrary USB devices, and a cloud server cannot reach a private USB connection; physical output depends on the host OS, exact model, driver, paper setup and real hardware.

**How to apply:** Keep manager-only pairing/configuration, branch and tenant authorization, per-job idempotency, no automatic resubmission after uncertain driver submission, saved invoice totals, and explicit browser print fallback. The bridge initiates HTTPS requests and exposes no inbound port. Describe CUPS acceptance as “spooled”, never as physical success. Require the exact printer model, supported local host OS and a real iPad/printer test before claiming hardware verification; this first bridge is macOS/Linux only.
