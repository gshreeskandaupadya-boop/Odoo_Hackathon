# Decision 002: Authentication Strategy

Authentication uses NextAuth credentials with bcrypt password verification. The provider is implemented in `Backend/src/auth.ts` and exposed through the Frontend Next.js auth route. Session helpers are kept in `Backend/src/session.ts` and approval/order identity is derived from the authenticated session.
