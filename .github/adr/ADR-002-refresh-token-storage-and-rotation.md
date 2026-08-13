ADR-002: Refresh Token Storage and Rotation (F1)

## Status: Proposed

## Context

The decision to use JWTs (ADR-001) introduces a refresh token concept to allow short-lived access tokens with longer lived session continuity. How refresh tokens are stored on the client and whether they are rotated on use materially affects security (XSS, CSRF), UX, and server-side complexity.

## Decision Drivers

- Minimize risk of token theft via XSS.
- Avoid CSRF when possible.
- Make refresh rotation robust against replay attacks.
- Keep client integration simple for the SPA.

## Options Considered

### Option A: Store refresh token in an `httpOnly`, `Secure`, sameSite cookie; rotate on use

Pros:

- Mitigates XSS theft (httpOnly).
- If SameSite=strict/lax, reduces CSRF risk for cross-site requests.
- Rotation on refresh reduces replay-window for leaked refresh tokens.

Cons:

- Requires CSRF protections or SameSite tuning for some flows; cookie-based storage means the browser sends tokens automatically.
- Requires server-side rotation/rotate-and-revoke semantics.

### Option B: Store refresh token in secure browser storage (IndexedDB/localStorage) and send it explicitly via XHR

Pros:

- Simpler request semantics (explicit authorization header usage); no cookies to manage.

Cons:

- Vulnerable to XSS (higher risk of token theft).
- Requires strict client-side hardening and CSP; not recommended for high-value tokens.

## Decision

Choose Option A: store refresh tokens in `httpOnly`, `Secure`, `SameSite=Lax` cookies and rotate refresh tokens on every use. Use short access tokens in Authorization headers and keep refresh endpoints protected against CSRF via SameSite cookie and the double-submit `XSRF-TOKEN` pattern if needed.

## Consequences

- Easier: reduces exposure to XSS for refresh tokens.
- Harder: requires server-side rotation logic and careful handling of CSRF in cross-origin scenarios.

## Rollback

- Revert to client-side storage (Option B) if cookies present unacceptable UX/hosting constraints, but mitigate XSS via strict CSP and additional runtime checks.
