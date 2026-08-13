# ADR-001: Migrate Session Management from Cookies to JWTs (F1)

## Status: Proposed

## Context

F1 implements secure doctor login and protected routes. The current architecture relies on sessions that were historically implemented with server-side state (cookie-backed sessions and a shared session store). This approach introduces an infrastructure dependency (shared Redis-like store) and complicates horizontal scaling, operational maintenance, and local dev setup. The codebase already contains JWT utilities and client-side logic that expect token-based auth in several places.

This ADR evaluates migrating session management to JSON Web Tokens (JWTs) for F1.

## Decision Drivers

- Enable stateless horizontal scaling of API servers.
- Reduce infra complexity and operational dependencies (fewer moving parts for session store replication and backups).
- Keep security parity with current sessions: protect against token theft, replay, and ensure logout/force-logout scenarios can be addressed.
- Minimize changes to existing API contracts consumed by the client and tests.
- Maintain predictable developer experience for local and CI environments.

## Options Considered

### Option A: JWTs with short expiry + refresh tokens

Pros:

- Stateless: server instances do not need a shared session store, simplifying horizontal scaling.
- Well-supported ecosystem and patterns (access token + refresh token, rotating refresh tokens).
- Simpler local dev and CI setup (no external Redis required to run auth flows).

Cons:

- Token revocation (logout everywhere, immediate session invalidation) is not free — requires a denylist/blocklist or short-lived tokens with refresh token rotation.
- Adds complexity if we need forced global logout or instant revocation; requires additional implementation (denylist DB table, cache, or a moving-window strategy).

### Option B: Distributed session store (e.g., Redis cluster)

Pros:

- Minimal changes to authentication logic and API responses — current server-side session semantics remain.
- Immediate revocation and server-side session management are straightforward.

Cons:

- Adds or retains infrastructure complexity: running a highly-available Redis cluster, managing failover and backups.
- Still a shared dependency and potential SPOF unless carefully provisioned.
- Operational cost and complexity increase; local dev remains heavier to replicate the runtime environment.

## Decision

We choose Option A: JWTs with short expiry for access tokens and refresh tokens for session continuation. Specific parameters proposed for F1:

- Access tokens: 15 minutes expiry.
- Refresh tokens: 7 days expiry, rotated on use.
- Introduce an optional token revocation table (`auth_token_revocations`) to support explicit revoke-by-jti when required for logout-everywhere scenarios.

Rationale: F1's primary drivers are enabling stateless horizontal scaling and reducing infra dependencies. JWTs deliver those benefits and align with existing code patterns in the repo. The revocation story is solvable via a denylist and short access token lifetimes; choosing JWTs enables simpler scaling and local developer experience improvements.

## Consequences

What becomes easier:

- Horizontal API scaling without a shared session store.
- Local development and CI execution without requiring Redis.
- Simpler autoscaling and container orchestration; fewer infra services required.

What becomes harder:

- Implementing true immediate global logout and token revocation requires additional work (denylist table, cleanup job), and introduces a new DB/read path on token validation.
- Careful attention required to refresh token security: rotation, storage (httpOnly cookie vs secure storage on client), and protection against CSRF/XSS depending on chosen client storage approach.
- Testing must cover token expiry, rotation, and revocation semantics.

## Rollback

To rollback to cookie-backed server sessions:

1. Feature-flag the JWT path and default to the cookie-based session path until the feature flag is fully enabled.
2. Keep the session store (Redis) operational during the transition and ensure it remains seeded and reachable.
3. Revert client configuration to request and use cookie sessions rather than bearer tokens (or keep both paths until clients are migrated).

## Backtracking / Decision Log

- 2026-08-12: Proposed. Rationale anchored on F1's need for stateless scaling and current codebase JWT utilities.
- If later analysis shows token revocation costs outweigh infra savings, revisit with Option B (managed Redis) or hybrid approach (JWTs + short-lived cookies bound to server-side validation).

***

Files referenced by this ADR (for traceability):

- `server/src/auth/jwt.ts` — existing JWT utilities in the codebase.
- `server/db/003_create_auth_token_revocations.sql` — migration placeholder already present in the repo for revocation support.

***
