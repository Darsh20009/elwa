---
name: Artifact registration failure
description: Workspace paths can exist despite artifact-registration scans reporting missing dependencies
---

Artifact creation can finish scaffolding but fail registration with a ripgrep error about mockup dependency directories. The reported paths may actually exist in the working container.

**Why:** Repeated creation attempts, reinstalling dependencies, and relocating backup dependency folders did not resolve this failure. Do not assume a successful scaffold means a registered preview.

**How to apply:** Confirm registration with the artifact list and use the managed workflow only after registration succeeds. If the same failure persists, stop repeating creation and report the blocker rather than claiming the port is finished.
