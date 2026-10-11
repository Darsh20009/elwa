---
name: iPad printer bridge
description: Platform limits and safe local-bridge requirements for Elwa POS printing.
---

The photographed Elwa printer is a Foodics-branded SUNMI 80mm Kitchen Cloud Printer, model NT310 (NT31x family). The user wants any POS device to send a job to one Android phone attached to the printer by wired or Bluetooth connection. The existing Termux Node agent supports only LAN/TCP ESC/POS; raw TCP/9100 compatibility with this NT310 must be physically tested. Direct Android USB/Bluetooth requires a native Android bridge or vendor SDK. If raw ESC/POS is rejected, use SUNMI's official native cloud-printer SDK; its NT31x support requires firmware 2.7.0+ and SUNMI App 2.19.0+.

**Why:** The user explicitly wants the iPad/browser order flow to remain and the connected Android phone to be the single print endpoint, including wired or Bluetooth attachment. iPad browsers cannot directly use printer USB/Bluetooth sockets.

**How to apply:** Configure the same private printer IP and port in queue mode on each POS device and the Android agent, keep them on the same LAN, and prevent Android battery management from stopping the polling process. Treat queue acceptance as distinct from paper output. Do not claim USB/Bluetooth support from the Termux agent; verify a real receipt. Direct USB/Bluetooth needs a native Android bridge or the official SDK.
