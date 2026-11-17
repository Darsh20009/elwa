# Data usage: baseline, changes, and monitoring

## Baseline

The Replit Usage snapshot shared for this work showed 5.62 GB of data transfer: 4.47 GB service-initiated, 1.15 GB HTTP responses, and about 1 MB of WebSocket responses. This is the supplied snapshot, not a route-by-route measurement from the app.

Local asset inventory found 108 PNG/JPEG images in `attached_assets` and `public` totaling 51,883,855 bytes (49.48 MiB). The 74 legacy product images in `attached_assets/drinks` total 36.36 MiB. No `.optimized.webp` sidecar variants were present.

An in-memory conversion benchmark using the same dimensions and WebP quality 92 now used by the server produced:

- All 108 images: 49.48 MiB original → 3.94 MiB WebP, about 92.0% smaller.
- The 74 legacy product images: 36.36 MiB original → 2.34 MiB WebP, about 93.6% smaller.
- A real response test for `foodics-product-007.png`: 2,961,223 bytes original → 194,688 bytes WebP, about 93.4% smaller; the response kept the original dimensions and returned a 30-day cache policy.

These are potential savings when the images are requested, not a forecast of monthly billed transfer. Actual results depend on which images customers open, browser cache hits, and traffic volume. The optimization targets image/HTTP responses; it cannot by itself guarantee less than 4 GB because the supplied service-initiated category alone is 4.47 GB. The app does not have Replit's deployment-level billed byte counts by route, so the Replit Usage dashboard remains the source of truth.

## Changes

- Existing PNG/JPEG URLs now negotiate a WebP response for browsers that support it. The source files remain unchanged; optimized copies are generated on first request in the temporary cache and cached by the browser for 30 days.
- The accounting dashboard loads its summary only on the overview/reports tabs and fetches expense or revenue rows only when those tabs are opened.
- The image library uses the shared five-minute React Query cache and lazy-loads images as the user scrolls.
- The accounting summary reads only the MongoDB fields it uses, rather than downloading complete order, expense, invoice, and refund records.

## Monitoring and limits

Use Replit's Usage dashboard to compare data transfer over a full billing period after publishing, especially the HTTP response and service-initiated categories. Configure a spending alert and, if appropriate, a Service Shutdown Limit under Replit billing settings. Budget alerts are spending thresholds, not a per-app alarm at exactly 4 GB, so continue checking the transfer totals separately.

Replit documents the shutdown limit as a billing/workspace/member spending control, not a per-app bandwidth cap. Reaching it may suspend billable services—including published apps and database compute—until the limit is raised or the next billing cycle begins. It can therefore stop more than this app. There is no code setting that guarantees an app will stop at 4 GB of transfer.

References:

- [Replit Usage-Based Billing](https://docs.replit.com/billing/about-usage-based-billing)
- [Managing Spend](https://docs.replit.com/billing/managing-spend)
