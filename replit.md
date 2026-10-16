# Running this project on Replit

## Development preview

The **Start application** workflow runs `npm run dev` on port 5000. It serves the Vite frontend and Express API together and connects to the configured MongoDB database. Check `/health` to confirm the API and database are ready.

## Environment

Use Node.js 20.19 through 22. Keep credentials in Replit Secrets and customer configuration in Replit environment variables:

- Secrets: `MONGODB_URI` for this customer's database, `BOOTSTRAP_ADMIN_PASSWORD` for the initial owner account, and `SESSION_SECRET` (at least 32 characters).
- Environment variables: `MONGODB_DATABASE`, `TENANT_ID`, `PROJECT_PLAN_TIER` (`lite`, `pro`, or `infinity`), and `BUSINESS_CONFIG_JSON`.
- `BUSINESS_CONFIG_JSON` must be valid JSON with a business name and a six-digit hexadecimal `primaryColor`. `MONGODB_DATABASE` must match the database in `MONGODB_URI` when one is specified there. The server rejects database names containing `qirox`.

Run `npm run dev` to start the development server. Do not use placeholder tenant, business, legal, or tax details for a real customer.

## Tenant build

`npm run build:tenant` customizes tenant branding and plan features before building, and requires an official `commercialRegNumber` in `BUSINESS_CONFIG_JSON`. Verify the legal details before running it; do not use placeholders.