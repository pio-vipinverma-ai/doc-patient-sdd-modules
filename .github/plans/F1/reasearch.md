# F1 Technical Research Notes

## Decision 1: Authentication Mechanism
- Chosen: JWT bearer token authentication.
- Reason:
  - Works with decoupled React frontend and Express backend.
  - Aligns with approved spec answer for token-based auth.
- Alternative considered:
  - Server-side sessions with secure cookies.

## Decision 2: Persistence Approach
- Chosen: PostgreSQL direct SQL access without Prisma ORM.
- Reason:
  - Explicit control over schema, indexes, and query behavior.
  - Matches user-approved architecture direction.
- Tradeoff:
  - More manual query and migration management.

## Decision 3: Error Messaging
- Chosen:
  - Generic auth error message for failed login.
- Reason:
  - Prevents user/credential enumeration vectors.

## Decision 4: Policy Configuration
- Chosen:
  - Rate limiting, lockout thresholds, and timeout values remain config-driven placeholders.
- Reason:
  - Security policy values are not finalized yet.

## Open Research Items
1. Token storage hardening path:
- Current likely approach: localStorage.
- Future hardening option: httpOnly secure cookies.

2. Token revocation strategy:
- F1 can be stateless token discard on logout.
- Future: jti denylist with auth_token_revocations table.

3. Secret rotation:
- Define key rotation/rollover strategy before production.

4. Audit and compliance:
- Confirm minimum audit fields and retention period for login attempt logs.

## Confirmed Inputs from F1 Spec
- Token-based auth approved.
- Expired session flow should redirect to login and preserve return URL.

## Risks
- Delaying policy threshold finalization can defer security hardening acceptance.
- localStorage token strategy has higher XSS sensitivity than httpOnly cookie strategy.

## Verification of Research Outcomes
- Review security decisions with product/security owner before implementation freeze.
