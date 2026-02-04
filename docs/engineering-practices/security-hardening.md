# Security Hardening

## Security headers

What
- Helmet sets common security headers.

Why
- Reduces exposure to common web vulnerabilities.

Where
- App setup: `src/app.ts`

## CORS policy

What
- Explicit allowed origin with credentials enabled.

Why
- Prevents unwanted cross-origin access while supporting cookie auth.

Where
- App setup: `src/app.ts`
- Config: `src/config/env.ts`

## Rate limiting

What
- In-memory rate limit with `X-RateLimit-*` headers.

Why
- Protects against accidental or abusive request bursts.

Where
- Middleware: `src/middlewares/rateLimit.ts`
- App setup: `src/app.ts`

## Cookie security

What
- Refresh token cookie uses HttpOnly, `secure`, and `sameSite` options.

Why
- Reduces XSS/CSRF exposure.

Where
- Auth controller: `src/controllers/auth.controller.ts`
- Env config: `src/config/env.ts`

## JWT hardening

What
- JWT verification enforces issuer, audience, algorithm, and token type.

Why
- Prevents token confusion and weak verification.

Where
- Token service: `src/services/token.service.ts`

## Request body size limits

What
- JSON body size limit is set to 1mb.

Why
- Mitigates accidental large payloads and basic abuse.

Where
- App setup: `src/app.ts`
