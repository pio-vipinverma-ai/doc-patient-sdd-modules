ADR-003: Token Revocation Strategy (F1)

## Status: Proposed

## Context

Using JWTs requires a strategy for token revocation when we need immediate invalidation (logout-everywhere, compromised token). A revocation approach must balance performance and operational complexity.

## Decision Drivers

- Support forced global logout or administrative revocation.
- Limit runtime cost on token validation (avoid expensive DB round-trips where possible).
- Keep implementation and maintenance simple for F1 scope.

## Options Considered

### Option A: JTI denylist (DB-backed) with TTL and caching

Pros:

- Precise revocation semantics (revoke by token `jti`).
- Can be implemented incrementally; cache denies for perf.

Cons:

- Requires DB writes/reads on revocation; validation path may query denylist (cache helps but adds complexity).

### Option B: Short-lived access tokens + no denylist

Pros:

- Simpler: no denylist to maintain; validation purely cryptographic.

Cons:

- Immediate revocation impossible; relies on short expiry to limit window.

## Decision

Adopt Option A with pragmatic constraints: create an `auth_token_revocations` table (migration present) and use a short expiry access token. Use an in-memory/redis cache layer (optional) to reduce DB hits on validation. For F1 MVP, prefer DB denylist with optional in-memory LRU cache local to app instances.

## Consequences

- Easier: supports explicit revoke-by-jti for logout-everywhere.
- Harder: introduces DB dependency for validation path and cache invalidation complexity.

## Rollback

- Remove denylist checks and rely solely on short-lived access tokens (Option B).
