---
name: GitHub authentication recovery
description: Replit-managed GitHub OAuth and workspace PAT secrets can be independent credentials during git operations.
---

When Git operations through Replit's GitHub source-control integration fail with 401, a newly supplied `GITHUB_PERSONAL_ACCESS_TOKEN` may not repair the Git CLI path. The connection can also report that it is already bound while its integration status remains `not_added`, preventing the normal reauthorization flow.

**Why:** The Git CLI may authenticate through Replit's managed OAuth integration rather than the workspace secret. Updating the latter does not refresh the former.

**How to apply:** Do not keep requesting or exposing PATs. Reconnect the GitHub OAuth/source-control integration through Replit's supported connection flow, confirm it is active, then retry the Git operation once.
