# DealFlow360 Backend

Database, authentication, and business services for DealFlow360.

```powershell
npm run db:init
npm run db:seed
```

Run these commands from `Backend/` or use the root equivalents `npm run db:init` and `npm run db:seed`. The package reads the repository `.env` when `DATABASE_URL` is not already set.

The Prisma contract and seed are in `prisma/`. Runtime database, authentication, and business engines are in `src/`.
