---
name: iPad printer bridge
description: Platform limits and safe local-bridge requirements for Elwa POS printing.
---

The photographed Elwa printer is a Foodics-branded SUNMI 80mm Kitchen Cloud Printer, model NT310 (NT31x family). The user chose to keep orders in iPad Safari/Chrome and let an Android phone on the printer's LAN poll Elwa's cloud print queue, then send ESC/POS over TCP. A Termux Node agent can use the existing queue, but raw TCP/9100 compatibility with this specific NT310 must be physically tested. If it rejects raw ESC/POS, use SUNMI's official native cloud-printer SDK; its NT31x support requires firmware 2.7.0+ and SUNMI App 2.19.0+.

**Why:** The user explicitly selected an Android phone as a local bridge so the existing iPad browser flow can remain unchanged. iPad browsers cannot directly use vendor iOS SDKs or generic USB/Bluetooth/LAN printer sockets.

**How to apply:** Configure the same private printer IP and port in iPad queue mode and the Android agent, keep both devices on the same LAN, and prevent Android battery management from stopping the polling process. Treat queue acceptance as distinct from paper output. Do not assume AirPrint, Bluetooth, or raw port 9100 support from the photo; verify a real receipt before claiming success. If the Termux bridge fails due to SUNMI's protocol, fall back to the official SDK in a native Android app or approved local bridge.
