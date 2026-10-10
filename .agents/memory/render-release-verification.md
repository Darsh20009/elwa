---
name: Render release verification
description: Confirm that Render is serving the latest commit rather than only a healthy prior release.
---

For Render deployments, an HTTP 200 health response proves that a release is serving, not that the newest commit has been promoted. Check the deployment status and commit, then confirm the live HTML references the new asset hash. If a deployment remains stuck in `update_in_progress` while old assets are still served, do not report the change as live. After user approval, cancel the stale deployment, wait for `canceled`, and trigger a deployment of the current branch commit.

**Why:** A Render instance continued returning 200 while an auto-deploy was stuck and the domain still served the previous frontend bundle.

**How to apply:** After Render deploys, verify the target commit, final `live` status, health endpoint, and live asset reference; if they disagree, keep the prior release status explicit and ask before restarting production.
