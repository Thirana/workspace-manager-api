# Authentication and Sessions

## Access tokens with hardened JWT verification

What

- Access tokens include `typ`, `sub`, and `systemRole`.
- Verification enforces algorithm, issuer, and audience.

Why

- Enforcing issuer, audience, algorithm, and typ reduces token confusion attacks.
- Embedding `systemRole` avoids a DB lookup on every authorized request.
- Short-lived access tokens reduce exposure if a token is leaked.

Where

- Token service: `src/services/token.service.ts`
- Auth middleware: `src/middlewares/requireAuth.ts`

## Refresh token rotation and reuse detection

What

- Refresh tokens are rotated on refresh, and reuse revokes all active tokens.
- Tokens are stored hashed (never stored in plaintext).

Why

- Rotation limits the lifetime of a stolen refresh token.
- Reuse detection signals compromise and revokes outstanding tokens.
- Hashing tokens protects the database if it is ever exposed.

Where

- Auth service: `src/services/auth.service.ts`
- Token hashing: `src/services/token.service.ts`
- Refresh token model: `src/models/refreshToken.model.ts`

## HttpOnly cookie session boundary

What

- Refresh tokens are stored in HttpOnly cookies with `secure` and `sameSite` options.

Why

- HttpOnly blocks JavaScript access, reducing XSS impact.
- `sameSite` reduces CSRF by limiting cross-site cookie sending.
- `secure` ensures cookies only travel over HTTPS in production.

Where

- Auth controller: `src/controllers/auth.controller.ts`
- Env config: `src/config/env.ts`

## Auth context on the request

What

- `requireAuth` attaches `{ userId, systemRole }` to `req.auth`.

Why

- Enables downstream authorization without re-parsing JWTs.
- Keeps authorization decisions consistent within a single request.
- Reduces repeated work and makes middleware chains simpler.

Where

- Middleware: `src/middlewares/requireAuth.ts`
- Request typing: `src/types/express.d.ts`
