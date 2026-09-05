# Setup

From the repository root:

```powershell
npm install
npm run db:init
npm run db:seed
npm run dev
```

If PostgreSQL is not installed locally, run `docker compose up -d` before `npm run db:init`.

Open `http://localhost:3000`. Use the demo credentials printed by the seed command. See `RUNBOOK.md` for the complete workflow and Vercel deployment steps.
