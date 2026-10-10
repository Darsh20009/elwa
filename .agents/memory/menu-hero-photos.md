---
name: Menu hero photos
description: Non-obvious constraints on which image files are safe to use in the Elwa menu hero.
---

The bundled legacy hero banner images are 1×1 black placeholders, not real promotional photos. Treat a non-empty image URL as a candidate only; the hero should show a slide only after its image loads and has usable dimensions.

**Why:** A local placeholder can resolve successfully and still render as a blank black hero.

**How to apply:** Replace those bundled files before reusing them as hero art, and keep successful-load and dimensions checks for custom and product slide images.
