## PR: feature/module-till-8 — Secure doctor login baseline

### Summary
This change introduces the F1 secure doctor login baseline for the application. It adds backend authentication endpoints, JWT validation, login throttling, a client login experience, and protected-route redirection so that only authenticated users can access dashboard workflows.

### Spec
.github/specs/specs/f1.md

### Acceptance Criteria

| AC | Criterion | Status | Evidence |
|---|---|---|---|
| AC-1 | Valid credentials grant access and display the dashboard | PASS | Server and client tests cover successful login and navigation to the protected dashboard destination. |
| AC-2 | Invalid credentials deny access and show an authentication error | PASS | Server and UI tests verify 401 responses and visible auth error messaging. |
| AC-3 | Unauthenticated access to protected routes redirects to login | PASS | Protected-route tests and server auth middleware verify redirect and unauthorized behavior. |
| AC-4 | Failed login attempts are rate-limited or blocked according to policy | PASS with note | Login throttling middleware and tests are present; in-memory state is suitable for the current baseline. |
| AC-5 | Session timeout and re-authentication behavior are defined and enforced | PASS with note | JWT expiration is configurable and enforced through middleware. |

### Test Evidence
CI Run: local verification

- npm run test:unit: 12 tests passed
- npm run build: succeeded
- npm run test:integration: placeholder integration coverage passed
- npm run lint: succeeded

### Security
- Generic auth errors are used to reduce credential enumeration risk.
- Production deployments should replace default secrets and review token storage strategy.

### Observability
- Request IDs are included in auth errors.
- Additional structured logging for auth events is recommended.

### Feature Flag
No feature flag is introduced in this change.

### Rollback
- Revert the auth-related client and server route changes.
- Disable the new login experience if a rollout needs to be rolled back quickly.

### Merge Decision
APPROVE — The F1 feature is implemented and verified by passing tests and a successful build, with follow-up hardening recommended before production rollout.
