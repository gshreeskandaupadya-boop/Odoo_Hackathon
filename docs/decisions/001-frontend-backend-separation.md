# Decision 001: Frontend and Backend Separation

DealFlow360 uses two workspace packages: `Frontend/` owns the Next.js application and `Backend/` owns database, authentication, and business services.

Next.js API route handlers remain in `Frontend/src/app/api` because they are deployed with the web application. They are transport adapters and delegate domain logic to `Backend/src`.
