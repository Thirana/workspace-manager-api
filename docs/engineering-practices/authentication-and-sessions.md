# Authentication and Sessions

## Access tokens with hardened JWT verification

What

- Access tokens include `typ`, `sub`, and `systemRole`.
- Verification enforces algorithm, issuer, and audience.

Why

- Reduces JWT misuse and avoids DB lookups for global role checks.

Where

- Token service: `src/services/token.service.ts`
- Auth middleware: `src/middlewares/requireAuth.ts`

## Refresh token rotation and reuse detection

What

- Refresh tokens are rotated on refresh, and reuse revokes all active tokens.
- Tokens are stored hashed (never stored in plaintext).

Why

- Limits damage from stolen tokens and detects token replay.

Where

- Auth service: `src/services/auth.service.ts`
- Token hashing: `src/services/token.service.ts`
- Refresh token model: `src/models/refreshToken.model.ts`

## HttpOnly cookie session boundary

What

- Refresh tokens are stored in HttpOnly cookies with `secure` and `sameSite` options.

Why

- Reduces exposure to XSS and CSRF risks.

Where

- Auth controller: `src/controllers/auth.controller.ts`
- Env config: `src/config/env.ts`

## Auth context on the request

What

- `requireAuth` attaches `{ userId, systemRole }` to `req.auth`.

Why

- Enables downstream authorization without re-parsing JWTs and DB queries

Where

- Middleware: `src/middlewares/requireAuth.ts`
- Request typing: `src/types/express.d.ts`
