ADR-005: CSRF and Client Storage Considerations (F1)

## Status: Proposed

## Context

If refresh tokens are stored in cookies (ADR-002), cross-site request forgery (CSRF) becomes a concern for endpoints that rely on cookies being sent by the browser. We must choose mitigations appropriate for the SPA client used by F1.

## Decision Drivers

- Prevent CSRF attacks without degrading UX.
- Keep implementation simple and maintainable.

## Options Considered

### Option A: Rely on `SameSite=Lax` for refresh cookie + double-submit anti-forgery token

Pros:

- Good security coverage for typical SPA flows; double-submit protects against lax same-site exceptions.

Cons:

- Requires client to handle XSRF token lifecycle (read and include header) for refresh calls.

### Option B: Require CSRF token in body and use CORS with strict origins

Pros:

- Stronger protection; explicit control of allowed origins.

Cons:

- Slightly more complex client and server wiring.

## Decision

Adopt Option A for F1: set refresh cookies with `SameSite=Lax`, `Secure`, and `httpOnly`, and issue an `XSRF-TOKEN` cookie (non-httpOnly) that the client reads and sends as `X-XSRF-TOKEN` header for refresh calls. Combine with strict CORS policy for allowed frontend origins.

## Consequences

- Easier: balances security with developer ergonomics for SPA clients.
- Harder: requires test coverage for CSRF flows and careful origin configuration in CORS.

## Rollback

- Move to stricter option B if threat modelling requires stronger enforcement.
