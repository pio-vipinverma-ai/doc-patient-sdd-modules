ADR-006: Auth Rate-Limit and Account Lockout Policy (F1)

## Status: Proposed

## Context

F1 includes login rate-limiting and temporary lock behavior, but concrete thresholds were not previously defined. This ADR proposes explicit policy parameters for consistent behavior across environments.

## Decision Drivers

- Prevent brute-force credential attacks while minimizing false positives for legitimate users.
- Provide deterministic behaviour for tests and monitoring.

## Options Considered

### Option A: Conservative thresholds (lenient)

Pros:

- Lower user friction; fewer accidental lockouts.

Cons:

- Less protection against targeted brute force.

### Option B: Strict thresholds (aggressive)

Pros:

- Stronger protection; fewer attack successes.

Cons:

- Higher chance of legitimate user lockouts; more support overhead.

## Decision

Adopt a balanced policy for F1 (configurable via env):

- `loginRateLimitWindowSec`: 60 (1 minute)
- `loginRateLimitMaxAttempts`: 5
- `accountLockMinutes`: 15 (lock duration after threshold reached)

Make these values configurable per-environment and covered by unit and characterization tests. Implement exponential backoff or progressive cooldown in future iterations if telemetry shows abuse.

## Consequences

- Easier: predictable behavior and reproducible tests.
- Harder: may need tuning after real-world telemetry; lockouts could impact some users in edge cases.

## Rollback

- Adjust env-config values to relax or tighten thresholds as needed; no code change required for tuning.
