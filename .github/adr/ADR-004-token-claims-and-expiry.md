ADR-004: Token Claims and Expiry (F1)

## Status: Proposed

## Context

JWTs must include a consistent set of claims and expiry semantics. These affect interoperability, token size, and validation logic across services.

## Decision Drivers

- Keep tokens compact while containing required information for protected endpoints.
- Ensure expiry and renewal behavior support F1 acceptance criteria and security needs.

## Options Considered

### Option A: Minimal claims (`sub`, `email`, `role`, `jti`, `iat`, `exp`)

Pros:

- Compact tokens, sufficient for auth checks in protected routes.

Cons:

- Any additional profile data requires `/auth/me` calls.

### Option B: Include expanded profile data in token

Pros:

- Fewer DB lookups for some endpoints.

Cons:

- Larger tokens; revocation/claim updates harder to propagate.

## Decision

Choose Option A: issue tokens with `sub` (user id), `email`, `role`, `jti`, `iat`, and `exp`. Access token expiry: 15 minutes. Refresh token expiry: 7 days. Maintain server-side `jwtExpiresInSec` config, and support token versioning by embedding `kid` or `ver` claim if needed later.

## Consequences

- Easier: compact tokens and predictable claims. Keeps user profile authoritative on server (`/auth/me`).
- Harder: endpoints needing additional user info will call `/auth/me`.

## Rollback

- Add optional claims gradually if profiling shows performance benefits.
