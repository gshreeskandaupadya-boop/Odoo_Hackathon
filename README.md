# DealFlow360

PostgreSQL-backed sales operations platform for quotes, discount risk, approvals, negotiation, warehouse allocation, and orders.

## Structure

```text
DealFlow360/
├── Frontend/
│   ├── public/
│   ├── src/app/                 Next.js pages and API route handlers
│   ├── src/components/          UI and feature implementations
│   ├── package.json
│   └── tsconfig.json
├── Backend/
│   ├── src/                    Database, auth, and business services
│   ├── prisma/                 Contract, generated metadata, and seed
│   ├── package.json
│   └── tsconfig.json
├── docs/                       Architecture, setup, API, database, deployment
├── .github/workflows/          Frontend and backend CI
├── package.json                Root workspace commands
└── RUNBOOK.md                  Local and Vercel operations
```

`Frontend/src/app/api` contains thin Next.js HTTP adapters. Business rules and database access stay in `Backend/src`. There is no separate Express service.

## Commands

```powershell
npm install
npm run db:init
npm run db:seed
npm run dev
```

Run `docker compose up -d` first when using the included local PostgreSQL container.

Open `http://localhost:3000`.

Validate before committing:

```powershell
npm run lint
npm run build
```

See [RUNBOOK.md](RUNBOOK.md) for demo accounts, the end-to-end workflow, and Vercel deployment. See [docs/architecture.md](docs/architecture.md) for design decisions.

## Environment

Set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in `.env`. Vercel must use a hosted PostgreSQL database; it cannot connect to local `localhost` addresses.
