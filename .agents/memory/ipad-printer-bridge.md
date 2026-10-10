---
name: iPad printer bridge
description: Platform limits and safe local-bridge requirements for Elwa POS printing.
---

The POS website cannot open raw TCP printer sockets or use generic USB/Bluetooth printing directly from Chrome or Safari on iPad. Use AirPrint with a user-initiated print action for AirPrint-capable printers, or send LAN ESC/POS jobs through a local computer on the cafe network. A cloud-hosted server cannot reach the printer's private LAN address.

The user confirmed on 2026-10-09 that `192.168.8.208` is the active DHCP address; `192.168.8.5` is the fixed-address option on the printer slip. They use the iPad on the same LAN, but the printer does not appear in the iPad's AirPrint list; do not assume a Windows print-agent computer is available. DHCP leases can change, so recheck the active address if connectivity stops. The exact printer model/protocol is still unverified.

The user wants the Elwa iPad app to support LAN, direct USB, and Bluetooth printing. Support each transport only if the exact printer model exposes an iOS-compatible protocol: USB may require vendor SDK/MFi, and Bluetooth may be BLE or require vendor support for classic SPP. Never claim connection or physical printing success without confirming it on the iPad and printer.

The user chose a staged release: LAN printing first in a private TestFlight beta, then USB and Bluetooth after the LAN path works and the printer's support for each is verified.

The user wants CodeMagic to build the native iPad app and deliver it privately through TestFlight. The attached workflow is a Flutter example from another app; never reuse its bundle ID, integration name, Apple Team ID, or signing material for Elwa.

The user supplied Elwa's Apple app metadata: Team ID `V4K6RM59LS`, explicit Bundle ID `site.elwa.elwa`, and App Store Connect SKU `elwa`.

The user wants Blackrose's iOS build setup used as a technical reference for Elwa. Its archive contains private Apple signing material; reuse only safe build structure, never Blackrose keys, certificates, identifiers, app data, or branding. Treat the included private signing files as exposed and advise revocation/rotation.

The user chose Flutter, matching Blackrose's native iOS build stack, rather than the previously planned Expo approach.

**Why:** iPad browser APIs do not provide these hardware transports, and cloud deployment cannot route to private cafe-network devices. DHCP addresses can change and incorrect protocol assumptions can send jobs nowhere or to the wrong device. The printer's exact model and capabilities are unknown, so the user prioritizes the existing LAN path for a faster first release. Apple signing and TestFlight access must belong to Elwa, not the attached Flutter sample.

**How to apply:** Keep advanced printer configuration manager-only. Use the confirmed DHCP address `192.168.8.208` only while it remains active; reserve a stable address if possible. Ship the LAN path first after confirming its protocol; add USB and Bluetooth in later updates only after validating exact model compatibility. Keep App Store Connect keys and signing files in CodeMagic's secure integration, never in source control or chat. Use only the Elwa Team ID, Bundle ID, and SKU above for Apple build configuration. The mobile app uses Flutter, and Blackrose is only a technical build reference: reuse its workflow structure adapted to Elwa, never its credentials, identifiers, app data, or visual assets. On the current iPad workflow, browser printing requires AirPrint; if it is absent, use a compatible vendor/native iPad app or a local agent on another device. Describe queued, transmitted, and physically confirmed states honestly.
