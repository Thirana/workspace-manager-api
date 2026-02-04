# Security Hardening

## Security headers

What
- Helmet sets common security headers.

Why
- Adds a baseline set of protections for common web vulnerabilities.
- Reduces attack surface without custom code per route.
- Keeps security defaults consistent across endpoints.

Where
- App setup: `src/app.ts`

## CORS policy

What
- Explicit allowed origin with credentials enabled.

Why
- Prevents unwanted cross-origin access while supporting cookie auth.
- Ensures only the intended frontend origin can call the API.
- Limits risk of browser-based data exfiltration.

Where
- App setup: `src/app.ts`
- Config: `src/config/env.ts`

## Rate limiting

What
- In-memory rate limit with `X-RateLimit-*` headers.

Why
- Protects against accidental or abusive request bursts.
- Provides a simple, predictable throttle for noisy clients.
- Adds backpressure before the database becomes overloaded.

Where
- Middleware: `src/middlewares/rateLimit.ts`
- App setup: `src/app.ts`

## Cookie security

What
- Refresh token cookie uses HttpOnly, `secure`, and `sameSite` options.

Why
- HttpOnly reduces XSS impact by blocking JS access to the cookie.
- `sameSite` reduces CSRF by limiting cross-site cookie sending.
- `secure` ensures cookies are only sent over HTTPS in production.

Where
- Auth controller: `src/controllers/auth.controller.ts`
- Env config: `src/config/env.ts`

## JWT hardening

What
- JWT verification enforces issuer, audience, algorithm, and token type.

Why
- Prevents token confusion by requiring the right token type.
- Enforces issuer/audience to avoid accepting tokens from other apps.
- Restricts algorithms to reduce risk of downgrade attacks.

Where
- Token service: `src/services/token.service.ts`

## Request body size limits

What
- JSON body size limit is set to 1mb.

Why
- Mitigates accidental large payloads and basic abuse.
- Reduces memory pressure from oversized JSON bodies.
- Provides an early guardrail for clients.

Where
- App setup: `src/app.ts`
