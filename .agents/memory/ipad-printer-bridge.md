---
name: iPad printer bridge
description: Platform limits and safe local-bridge requirements for Elwa POS printing.
---

The photographed Elwa printer is a Foodics-branded SUNMI 80mm Kitchen Cloud Printer, model NT310 (NT31x family). The user's current chosen setup is one Android POS tablet, kept open as the branch's printer host, directly attached to the printer by USB or Bluetooth. Other phones/POS devices send orders to that terminal through the app's realtime connection; printer communication itself is local and does not use LAN/TCP. The browser POS can attempt direct ESC/POS through WebUSB/Bluetooth, but model/browser/permission compatibility still needs a real paper test. The older Termux agent supports only LAN/TCP ESC/POS and is not the selected USB/Bluetooth path. If browser access fails, use a native Android bridge or SUNMI's official SDK; NT31x support requires firmware 2.7.0+ and SUNMI App 2.19.0+.

**Why:** The user clarified that the cashier's Android tablet is the printer-connected device; orders from other devices should reach it and print locally. This avoids treating every POS device as a printer and avoids requiring LAN access to the printer.

**How to apply:** Keep the cashier POS open and connected to realtime events, pair/authorize the printer on that terminal, and enable local auto-print there. Other POS devices should not need printer configuration. Orders are relayed to the cashier terminal over the app connection; WebUSB/Bluetooth printing must be physically verified and can fail if the browser is suspended or its device permission is lost. Do not claim successful paper output based only on a WebSocket event or build.
