# Elwa: iPad browser → HTTPS queue → local USB printer

## What this supports

Staff use the existing website in iPad Safari or Chrome. No iPad application,
Flutter, TestFlight, WebUSB, direct Bluetooth, or raw browser TCP is required.

This adapter requires **an always-on macOS or Linux computer with CUPS and a
working USB printer driver**, Node.js 20.19–22, and Google Chrome/Chromium.
The printer must already print a PDF from that computer. No ESC/POS or AirPrint
compatibility is assumed. Windows is **not implemented by this adapter**.
Do not buy equipment or claim support based only on the Epson brand name.
The hardware information still required is the **exact printer model number**
(a photo of its model label is sufficient). Check the driver's supported OS and
paper sizes against that model before deployment.

## One-time installation (administrator)

1. Install the manufacturer's compatible USB driver on the local computer.
   Print an OS test page and a PDF. Set the CUPS queue's paper size to the
   actual 58 mm or 80 mm roll, margins and cutting settings. Record the exact
   queue name from `lpstat -p`. Printing to a PDF/virtual queue is not a hardware test.
2. Install Node.js and Chrome/Chromium. Install an Arabic font such as Noto Sans
   Arabic on Linux; verify Arabic shaping on paper. The receipt uses the same
   authoritative server-generated HTML for browser preview and the bridge PDF.
3. Download `/usb-print-bridge.cjs` from the same HTTPS Elwa website you use.
   Keep the script in a private permanent local folder, not the Git repository.
4. In the website's printer settings, an authorized manager selects the correct
   branch, enters the printer name/manufacturer/model, sets the verified paper
   width, and selects USB bridge. Save. Generate a pairing code (expires in 5 minutes).
5. On the computer, run (replace the example values with your real ones):

   ```
   node usb-print-bridge.cjs pair https://YOUR-ELWA-HOST YOUR_CUPS_QUEUE /usr/bin/chromium
   ```

   On macOS the executable may be:
   `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
   (quote that argument). Enter the pairing code at the prompt.
   Never paste tokens into chat, source control, frontend code or a startup command.
6. Start:

   ```
   node usb-print-bridge.cjs run
   ```

7. Confirm the website shows the bridge online. Run a manager test print.
   Verify Arabic, English, logo, width, margins and actual paper output before
   printing a real invoice. Do not regard “accepted by print queue” as paper confirmation.

Credentials and a minimal crash-recovery journal are stored under
`~/.config/elwa-print-bridge/` with owner-only permissions. Protect that account,
enable disk encryption where appropriate, and never copy that folder into Git.
Temporary receipt/PDF files are in a private system-temp directory and removed
after each job; after a machine crash, remove leftover `elwa-receipt-*`
directories only when the bridge is stopped. CUPS spool files may retain sensitive
receipt data: configure local OS retention/access and use a trusted host.

## Staff operation

Open a saved online invoice or the POS receipt dialog, review it, and press
**Print Receipt**. The server checks the employee's tenant and branch and renders
saved invoice values; the browser cannot supply arbitrary receipt bytes.

- Preparing: receipt is being loaded/rendered.
- Pending: accepted by the website, waiting for the bridge.
- Processing: claimed by the bridge.
- Spooled: the OS driver accepted the job, **not proof of physical printing**.
- Completed: reserved for an adapter that can verify OS-job completion; the CUPS
  adapter currently reports spooled only.
- Failed: failure before driver submission; a manual retry uses the same job.
- Unknown: interruption during/after submission. Check the printer and the OS
  queue first. No automatic resend. A manager can explicitly reprint; reprints
  are labeled and recorded separately without creating or changing an invoice.

If a USB cable is unplugged after CUPS accepts a job, CUPS may keep it queued and
print it when reconnected. **Do not reprint blindly**; inspect or cancel the OS
job first. The website cannot infer paper output from an HTTP response.

Browser fallback is always explicit: choose **Print using browser**, then choose
a printer supported by iPadOS. This opens the OS dialog; it does not enable USB
from Safari and does not guarantee silent or successful thermal printing.
Canceling that dialog never changes payment status.

## Startup and recovery

Linux: install a user service at `~/.config/systemd/user/elwa-print.service`
using absolute paths appropriate to the local machine:

```
[Unit]
Description=Elwa outbound USB print bridge
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/node /home/LOCALUSER/elwa/usb-print-bridge.cjs run
Restart=on-failure
RestartSec=10
UMask=0077

[Install]
WantedBy=default.target
```

Run `systemctl --user daemon-reload` then
`systemctl --user enable --now elwa-print.service`. For startup before login,
ask the local administrator to enable lingering for that account. Do not run
Chrome as root or add `--no-sandbox`.

macOS: create `~/Library/LaunchAgents/site.elwa.usbprint.plist` with this structure,
replacing both absolute paths:

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>site.elwa.usbprint</string>
  <key>ProgramArguments</key><array>
    <string>/absolute/path/to/node</string>
    <string>/Users/LOCALUSER/elwa/usb-print-bridge.cjs</string><string>run</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
```

Load with `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/site.elwa.usbprint.plist`.
This starts after user login. Reboot and verify reconnection and pending-job status.

On interrupted submission the bridge keeps a recovery journal and reports
uncertainty, never resends the paper job automatically. A failed status report
is retried separately from printing. Do not delete the recovery journal to force
a print; inspect the OS queue and explicitly reprint from the website if needed.

## Security and revocation

Both iPad and bridge initiate outbound HTTPS to the existing website.
No browser request goes to a local HTTP server, no mixed content, no self-signed
certificate, no local-network permission dependency, and no inbound port,
port forwarding or browser-security disablement.

Manager-only one-time pairing codes expire in 5 minutes and are atomically
consumed. Only a hash of the bridge token is stored server-side. The token is
issued to the bridge, not the frontend. A new pairing rotates the old token;
**Revoke bridge** immediately invalidates it and cancels unclaimed jobs.
Pair again after revocation. Revoke a lost/compromised host before re-pairing.
Request validation, tenant/branch scoping, rate limits, and atomic claims apply.
The bridge accepts only server-rendered jobs, fixed OS commands and local
administrator-configured executables/queue names; it never invokes a shell
or accepts executable paths from the browser.

## Acceptance still requiring real equipment

NOT VERIFIED until a real iPad and actual printer are available:
Safari and Chrome print dialogs, production HTTPS end-to-end printing,
USB disconnection/reconnection, driver spooling and physical paper, Arabic
glyph shaping, both actual roll sizes, paper/cutter settings, host reboot.
Keep a record of iPadOS/browser/driver versions and printer model when testing.
Software tests are not hardware verification.
