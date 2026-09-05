# DealFlow360 Runbook

This file contains the commands for running DealFlow360 locally, verifying the application, and deploying it to Vercel.

The source is organized into `Frontend/` for the Next.js application, `Backend/` for database/auth/business services, and `docs/` for project documentation.

## 1. Prerequisites

Install Node.js 26+, PostgreSQL 15+, and Git. The application uses the PostgreSQL connection in `.env` through `DATABASE_URL`.

## 2. Install Dependencies

```powershell
npm install
```

## 3. Configure Environment Variables

```powershell
Copy-Item .env.example .env
```

Set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in `.env`.

## 4. Initialize PostgreSQL

For the included local database, start Docker first:

```powershell
docker compose up -d
```

Then make sure the database in `DATABASE_URL` exists:

```powershell
npm run db:init
npm --prefix Backend exec prisma migration status
```

## 5. Seed Local Data

```powershell
npm run db:seed
```

The local seed resets DealFlow360 application tables before inserting users, customers, products, warehouses, and inventory. Never run it against a production database containing business data.

Demo accounts:

| Role | Email | Password |
|---|---|---|
| Sales Rep | `sales@dealflow360.com` | `demo-sales-password` |
| Sales Manager | `manager@dealflow360.com` | `demo-manager-password` |
| Finance | `finance@dealflow360.com` | `demo-finance-password` |
| Admin | `admin@dealflow360.com` | `demo-admin-password` |

## 6. Run and Verify

```powershell
npm run dev
```

Open `http://localhost:3000`. Test: create quote, trigger discount risk, approve it, submit a counter-offer, re-approve, confirm an order, and inspect fulfillment allocation.

Before committing:

```powershell
npm run lint
npm run build
```

## 7. Deploy to Vercel

Use a hosted PostgreSQL 15+ database. Vercel cannot access local `localhost:5433`.

```powershell
$env:DATABASE_URL = "postgresql://user:password@host:5432/dealflow360"
npm exec prisma db init
npm run db:seed
```

Set these Vercel Production environment variables:

```text
DATABASE_URL=your-hosted-postgresql-url
NEXTAUTH_SECRET=your-long-random-secret
NEXTAUTH_URL=https://your-project.vercel.app
```

Use `npm install` as the install command and `npm run build` as the build command.

## Production Safety

Do not run `npm run db:seed` against a production database with real business data. Keep `.env`, `DATABASE_URL`, and `NEXTAUTH_SECRET` private.
