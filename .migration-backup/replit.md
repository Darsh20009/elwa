# Running this project on Replit

## Current preview

The **Start application** workflow runs the Vite frontend on port 5000. This makes the interface available for preview, but it does not run the Express API or connect to a database. Sign-in, orders, and other database-backed features are unavailable in this mode.

## Full application

The full development server is started with `npm run dev`. Before switching the workflow to that command, configure these values for the actual customer:

- `MONGODB_URI`: connection string for that customer's own MongoDB database. The server rejects database names containing `qirox`.
- `MONGODB_DATABASE`: set this to the dedicated database name if `MONGODB_URI` has no database path; use `elwa` for the current connection. Do not use a name containing `qirox`.
- `TENANT_ID`: the assigned tenant identifier.
- `PROJECT_PLAN_TIER`: `lite`, `pro`, or `infinity`.
- `BUSINESS_CONFIG_JSON`: valid JSON with `businessName` and a six-digit hexadecimal `primaryColor` for local `npm run dev`. Use verified legal details; the production build requires an official `commercialRegNumber`. Never use placeholders for legal or tax identifiers.
- `BOOTSTRAP_ADMIN_PASSWORD`: at least 6 characters for the initial owner account. This shorter minimum is weaker; prefer a longer password when possible.
- `SESSION_SECRET`: at least 32 characters; this Repl already has this secret configured.

Keep database credentials and passwords in Replit Secrets, not in source files or chat. Do not use placeholder tenant or business values for a real deployment.