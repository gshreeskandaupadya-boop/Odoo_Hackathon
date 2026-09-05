# Architecture

DealFlow360 is organized as a small monorepo:

- `Frontend/`: Next.js pages, UI components, API route handlers, and browser assets.
- `Backend/`: Prisma contract, database client, authentication, and business engines.
- `docs/`: architecture, setup, API, database, deployment, and decision records.

The Frontend owns the HTTP route boundary because Next.js route handlers are deployed with the web application. Those handlers call the Backend source through TypeScript path aliases. There is no separate Express service.
