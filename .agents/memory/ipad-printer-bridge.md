---
name: iPad printer bridge
description: Platform limits and safe local-bridge requirements for Elwa POS printing.
---

The photographed Elwa printer is a Foodics-branded SUNMI 80mm Kitchen Cloud Printer, model NT310 (NT31x family). SUNMI's official iOS Cloud Printer SDK documents LAN discovery/connection and Bluetooth support; NT31x support requires printer firmware 2.7.0+ and SUNMI App 2.19.0+. Elwa's web app cannot call this native SDK directly: use a native iPad app/wrapper for direct LAN printing, or a local bridge if keeping printing browser-only.

**Why:** The user supplied the printer's model label, and SUNMI's current SDK documentation lists the supported NT31x firmware/app minimums. iPad browsers cannot directly use vendor iOS SDKs or generic USB/Bluetooth/LAN printer sockets.

**How to apply:** Start with LAN and verify installed firmware/SUNMI App versions before implementation. LAN discovery on iOS requires Apple's Multicast Networking entitlement and local-network permission; if manual IP entry avoids discovery, confirm the SDK requirements in a device test. Do not assume AirPrint or Bluetooth capability from the photo. Require a real iPad/printer test before claiming hardware support; a browser-only route still needs a local bridge and cannot use the native SDK directly.
