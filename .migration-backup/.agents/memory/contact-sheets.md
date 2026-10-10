---
name: Contact sheets
description: Work around ImageMagick contact-sheet font failures in this runtime.
---

Avoid ImageMagick `montage` for unlabeled image grids in this runtime; it still attempts to load an unavailable default font. Create thumbnails, arrange each row with `+append`, then stack rows with `-append`.

**Why:** `montage` failed repeatedly with an empty-font error, while append-based grids worked without requiring fonts.

**How to apply:** When reviewing batches of uploaded images, use fixed-size thumbnails and append operations so positions stay deterministic without text labels.
