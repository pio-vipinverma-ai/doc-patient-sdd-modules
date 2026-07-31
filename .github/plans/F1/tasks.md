# F1 Task Breakdown

## Epic
F1 Secure Doctor Login

## Dependency Graph
1. Group A -> Group B and Group C
2. Group C -> Group D
3. Group B + Group C + Group D -> Group E

## Global Run Commands (Local Gate)
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run test:coverage`
- `npm run test:all`

## Global Gate Policy
- Red: required behavior is failing, missing, or only backed by placeholder tests.
- Green: all required tests for the task pass locally with deterministic results.
- Production-ready: Green + task DoD complete + trace links updated + no placeholder-only evidence.
- Phase close rule: phase can close only when all tasks in that phase are Pass.

## Group A: Project Bootstrap

### Phase Gate (Group A)
- Objective: establish executable frontend and backend foundations with stable scripts.
- Phase DoD:
  - A1, A2, A3 are Pass.
  - bootstrap instructions are reproducible from clean setup.
- Phase Pass/Fail:
  - Pass: all Group A tasks are Pass.
  - Fail: any Group A task is Fail.

### A1 Root workspace setup
- Inputs/dependencies: none
- Deliverables:
  - root package scripts
  - root README baseline
- Risks:
  - script naming conflicts
- Estimate: S
- Red:
  - missing/conflicting root scripts or non-zero script exit.
- Green:
  - root scripts execute successfully from repo root.
- Files:
  - `package.json`
  - `README.md`
- Traces:
  - F1 bootstrap prerequisite for all downstream groups.
- DoD:
  - script list documented and verified in a clean environment.
- Pass/Fail:
  - Pass: script checklist complete and all scripts exit 0.
  - Fail: any required script missing or failing.

### A2 Frontend scaffold
- Inputs/dependencies: A1
- Deliverables:
  - client app baseline with routing shell
- Risks:
  - local Node tooling mismatch
- Estimate: M
- Red:
  - client app fails to boot or routing shell fails to render.
- Green:
  - frontend scaffold runs locally and route shell is reachable.
- Files:
  - `client/*` (scaffold)
  - frontend route entry files
- Traces:
  - prerequisite for D1-D6.
- DoD:
  - start command and route smoke check documented and repeatable.
- Pass/Fail:
  - Pass: startup + smoke route checks succeed.
  - Fail: startup/build/runtime route check fails.

### A3 Backend scaffold
- Inputs/dependencies: A1
- Deliverables:
  - Express API baseline and env loading
- Risks:
  - environment variable loading errors
- Estimate: M
- Red:
  - server cannot boot or env loading/health check fails.
- Green:
  - backend boots and health endpoint returns success.
- Files:
  - backend entrypoint files
  - env loader/config files
  - health route files
- Traces:
  - prerequisite for B1-B4 and C1-C8.
- DoD:
  - boot + health check verified and documented.
- Pass/Fail:
  - Pass: server boot and health checks are green.
  - Fail: any boot/env/health check fails.

## Group B: Database

### Phase Gate (Group B)
- Objective: implement reliable auth schema, constraints, indexes, and seed data.
- Phase DoD:
  - B1-B4 are Pass.
  - migration apply/rollback path verified.
- Phase Pass/Fail:
  - Pass: all Group B tasks are Pass.
  - Fail: any Group B task is Fail.

### B1 Create auth_users migration
- Inputs/dependencies: A3
- Deliverables:
  - auth_users table with constraints
- Risks:
  - incorrect uniqueness/case-sensitivity behavior
- Estimate: M
- Red:
  - table/constraints missing or duplicate-email behavior incorrect.
- Green:
  - migration apply/rollback and lookup tests pass for auth_users.
- Files:
  - auth_users migration scripts
  - DB schema docs
- Traces:
  - `.github/plans/F1/data-model.md`
  - AC-1
- DoD:
  - uniqueness and case-sensitivity scenarios validated.
- Pass/Fail:
  - Pass: migration + constraints + lookup checks pass.
  - Fail: any schema or constraint validation fails.

### B2 Create auth_login_attempts migration
- Inputs/dependencies: A3
- Deliverables:
  - attempt logging table
- Risks:
  - missing fields for diagnostics
- Estimate: S
- Red:
  - logging table incomplete or insert/query fails.
- Green:
  - attempt logging schema supports required diagnostics fields.
- Files:
  - auth_login_attempts migration scripts
- Traces:
  - `.github/plans/F1/data-model.md`
  - AC-3
- DoD:
  - insert/query tests cover required field integrity.
- Pass/Fail:
  - Pass: schema and diagnostics query checks pass.
  - Fail: missing fields or query failures remain.

### B3 Add indexes and constraints
- Inputs/dependencies: B1, B2
- Deliverables:
  - index scripts for email and attempt lookups
- Risks:
  - poor index selection affects performance
- Estimate: S
- Red:
  - required indexes absent or query path remains unoptimized.
- Green:
  - index existence and lookup path checks pass.
- Files:
  - index migration scripts
  - query plan evidence notes
- Traces:
  - `.github/plans/F1/data-model.md`
  - login query path for C2/C5/C8
- DoD:
  - index checks and explain analysis evidence recorded.
- Pass/Fail:
  - Pass: indexes present and query checks meet expectations.
  - Fail: indexes missing or query plan checks fail.

### B4 Seed doctor account
- Inputs/dependencies: B1
- Deliverables:
  - seed script with hashed password
- Risks:
  - accidental plaintext credential exposure
- Estimate: S
- Red:
  - seed data missing/invalid or password stored in plaintext.
- Green:
  - seeded doctor can authenticate with hashed password storage.
- Files:
  - seed scripts
  - seed config docs
- Traces:
  - AC-1
  - login happy path dependency for C5
- DoD:
  - seeded login verification and hash safety check complete.
- Pass/Fail:
  - Pass: seed execution and seeded login tests pass.
  - Fail: seeded account invalid or security checks fail.

## Group C: Backend Auth

### Phase Gate (Group C)
- Objective: deliver secure auth APIs, middleware, and lockout behavior.
- Phase DoD:
  - C1-C8 are Pass.
  - auth contracts are satisfied with negative-path coverage.
- Phase Pass/Fail:
  - Pass: all Group C tasks are Pass.
  - Fail: any Group C task is Fail.

### C1 Env and policy loader
- Inputs/dependencies: A3
- Deliverables:
  - env parser and policy config module
- Risks:
  - invalid default policy values
- Estimate: S
- Red:
  - env parsing accepts invalid values or unsafe defaults.
- Green:
  - policy/env parsing tests pass for valid/invalid/default cases.
- Files:
  - env parser module
  - policy config module
  - related unit tests
- Traces:
  - AC-3
  - policy dependency for C4/C5/C8
- DoD:
  - parser test matrix for defaults, bounds, invalid inputs is complete.
- Pass/Fail:
  - Pass: parser tests all green.
  - Fail: any policy parsing scenario fails.

### C2 User repository queries
- Inputs/dependencies: B1, C1
- Deliverables:
  - get user by email, update login state
- Risks:
  - SQL injection if unsafe query composition
- Estimate: M
- Red:
  - unsafe query composition or incorrect state update behavior.
- Green:
  - repository tests confirm parameterized queries and correct state updates.
- Files:
  - user repository module
  - DB query tests
- Traces:
  - `.github/plans/F1/data-model.md`
  - dependencies for C5/C6
- DoD:
  - positive + negative query path tests are complete.
- Pass/Fail:
  - Pass: repository query suite passes.
  - Fail: parameterization or state update checks fail.

### C3 Password verify utility
- Inputs/dependencies: C2
- Deliverables:
  - bcrypt compare utility
- Risks:
  - inconsistent hash settings
- Estimate: S
- Red:
  - compare utility returns incorrect match results or unhandled errors.
- Green:
  - bcrypt compare tests pass for match, mismatch, and error paths.
- Files:
  - password utility module
  - utility unit tests
- Traces:
  - AC-1
  - C5 credential verification dependency
- DoD:
  - compare behavior validated for expected and error conditions.
- Pass/Fail:
  - Pass: utility test matrix fully green.
  - Fail: any compare scenario fails.

### C4 JWT issue/verify utility
- Inputs/dependencies: C1
- Deliverables:
  - sign/verify token helpers
- Risks:
  - expiration handling bugs
- Estimate: S
- Red:
  - token generation/verification or expiration handling incorrect.
- Green:
  - valid, expired, malformed token tests pass.
- Files:
  - JWT helper module
  - JWT utility tests
- Traces:
  - `.github/plans/F1/contracts.md`
  - AC-2
- DoD:
  - sign/verify test matrix covers all required token states.
- Pass/Fail:
  - Pass: JWT tests all green.
  - Fail: any token-path assertion fails.

### C5 Login endpoint
- Inputs/dependencies: C2, C3, C4
- Deliverables:
  - POST /auth/login route
- Risks:
  - credential enumeration in responses
- Estimate: M
- Red:
  - login route returns incorrect status/body or leaks credential details.
- Green:
  - contract tests pass for 200, 400, 401, 429 and safe error responses.
- Files:
  - auth route/controller/service files
  - API contract tests
- Traces:
  - `.github/plans/F1/contracts.md`
  - AC-1, AC-3
- DoD:
  - positive and negative contract behavior validated with generic-safe messaging.
- Pass/Fail:
  - Pass: endpoint contract suite passes.
  - Fail: any status/payload/security assertion fails.

### C6 Auth me endpoint
- Inputs/dependencies: C4, C2
- Deliverables:
  - GET /auth/me route
- Risks:
  - stale claims vs DB state
- Estimate: S
- Red:
  - invalid token accepted or stale/deactivated user state mishandled.
- Green:
  - valid token returns user, invalid token is rejected.
- Files:
  - auth me route/controller/service files
  - token integration tests
- Traces:
  - `.github/plans/F1/contracts.md`
  - AC-2
- DoD:
  - token-path tests cover valid, invalid, and stale-state cases.
- Pass/Fail:
  - Pass: auth me suite passes for required scenarios.
  - Fail: any auth me scenario fails.

### C7 Protected endpoint and middleware
- Inputs/dependencies: C4
- Deliverables:
  - JWT middleware and protected route
- Risks:
  - malformed header handling gaps
- Estimate: S
- Red:
  - malformed/missing header bypasses auth or incorrect 401 handling.
- Green:
  - middleware and protected route pass 401/200 matrix tests.
- Files:
  - auth middleware files
  - protected route files
  - middleware tests
- Traces:
  - `.github/plans/F1/contracts.md`
  - AC-2
- DoD:
  - header parsing and token enforcement test matrix complete.
- Pass/Fail:
  - Pass: middleware path tests are green.
  - Fail: any unauthorized-path enforcement gap remains.

### C8 Rate-limit and lockout middleware
- Inputs/dependencies: B2, C1, C5
- Deliverables:
  - throttle/lock checks for login route
- Risks:
  - false-positive locks during testing
- Estimate: M
- Red:
  - repeated failed attempts do not trigger expected throttle/lock behavior.
- Green:
  - 429 lockout path and reset-window behavior tests pass.
- Files:
  - rate-limit/lockout middleware files
  - login-attempt integration tests
- Traces:
  - `.github/plans/F1/data-model.md`
  - AC-3
- DoD:
  - threshold, lockout, and reset scenarios verified.
- Pass/Fail:
  - Pass: lockout middleware test matrix is green.
  - Fail: throttle/lock or reset behavior fails.

## Group D: Frontend Auth

### Phase Gate (Group D)
- Objective: deliver secure and predictable client authentication UX and route protection.
- Phase DoD:
  - D1-D6 are Pass.
  - login, token lifecycle, route guard, and redirect safety are validated.
- Phase Pass/Fail:
  - Pass: all Group D tasks are Pass.
  - Fail: any Group D task is Fail.

### D1 Login UI
- Inputs/dependencies: A2, C5
- Deliverables:
  - email/password form and submit flow
- Risks:
  - weak UX for error feedback
- Estimate: M
- Red:
  - validation, submit state, or safe error feedback does not meet requirements.
- Green:
  - form validation and submit-flow tests pass with expected UI feedback.
- Files:
  - login page/component files
  - form validation files
  - UI tests
- Traces:
  - AC-1
  - login endpoint contract integration
- DoD:
  - required and invalid input cases + error rendering verified.
- Pass/Fail:
  - Pass: login UI matrix passes.
  - Fail: any validation/submit/error assertion fails.

### D2 Auth API client
- Inputs/dependencies: C5, C6
- Deliverables:
  - typed login/me API calls
- Risks:
  - contract mismatch with backend
- Estimate: S
- Red:
  - request/response typing or status mapping mismatches backend contract.
- Green:
  - API client tests pass for login/me payload and error mapping.
- Files:
  - auth API client module
  - client integration tests
- Traces:
  - `.github/plans/F1/contracts.md`
  - AC-1, AC-2
- DoD:
  - typed request/response and non-200 mapping tests complete.
- Pass/Fail:
  - Pass: API client suite passes.
  - Fail: contract mapping mismatch remains.

### D3 Auth store and token persistence
- Inputs/dependencies: D2
- Deliverables:
  - auth state and token storage module
- Risks:
  - token persistence edge cases
- Estimate: S
- Red:
  - token hydration, persistence, or clearing behavior is inconsistent.
- Green:
  - hydration/clear and invalid-token storage cases pass.
- Files:
  - auth store module
  - storage adapter files
  - unit tests
- Traces:
  - AC-2
  - frontend auth lifecycle
- DoD:
  - login persistence and logout cleanup paths verified.
- Pass/Fail:
  - Pass: auth store tests pass.
  - Fail: any persistence edge case fails.

### D4 Protected route component
- Inputs/dependencies: D3
- Deliverables:
  - route guard component
- Risks:
  - route flicker on initial load
- Estimate: S
- Red:
  - unauthorized content exposure or route flicker risk remains.
- Green:
  - guard behavior tests pass for unauthenticated redirect and authenticated access.
- Files:
  - protected route component
  - route guard tests
- Traces:
  - AC-2
  - protected flow tied to C7
- DoD:
  - no-flicker and authorization guard scenarios validated.
- Pass/Fail:
  - Pass: route guard tests are green.
  - Fail: unauthorized/flicker scenario fails.

### D5 Return URL handling
- Inputs/dependencies: D4, D1
- Deliverables:
  - preserve and restore destination after login
- Risks:
  - open redirect vulnerability
- Estimate: M
- Red:
  - destination restore fails or unsafe external redirect is possible.
- Green:
  - return URL restoration and allowlist/relative path checks pass.
- Files:
  - auth redirect helper files
  - login success navigation files
  - redirect tests
- Traces:
  - AC-2
  - security requirement for redirect safety
- DoD:
  - safe redirect matrix includes malicious and allowed paths.
- Pass/Fail:
  - Pass: redirect handling tests pass with open-redirect prevention.
  - Fail: any unsafe redirect behavior remains.

### D6 Dashboard placeholder
- Inputs/dependencies: D4
- Deliverables:
  - protected dashboard page
- Risks:
  - accidental unprotected rendering
- Estimate: S
- Red:
  - dashboard reachable without authentication.
- Green:
  - protected dashboard is accessible only when authenticated.
- Files:
  - dashboard page files
  - route configuration
  - e2e access tests
- Traces:
  - AC-2
  - protected route flow
- DoD:
  - direct URL unauthorized/authorized checks complete.
- Pass/Fail:
  - Pass: dashboard protection checks pass.
  - Fail: unauthorized dashboard access is possible.

## Group E: Testing and Documentation

### Phase Gate (Group E)
- Objective: deliver deterministic verification and final traceability evidence.
- Phase DoD:
  - E1-E4 are Pass.
  - acceptance criteria evidence is complete and current.
- Phase Pass/Fail:
  - Pass: all Group E tasks are Pass.
  - Fail: any Group E task is Fail.

### E1 Backend contract tests
- Inputs/dependencies: C5, C6, C7, C8
- Deliverables:
  - API tests for login/protected/auth me
- Risks:
  - flaky DB-dependent tests
- Estimate: M
- Red:
  - contracts are placeholders, incomplete, or flaky.
- Green:
  - real backend contract tests pass repeatedly (local runs).
- Files:
  - `tests/integration/api/*`
  - backend test fixtures/helpers
- Traces:
  - AC-1, AC-2, AC-3
  - `.github/plans/F1/contracts.md`
- DoD:
  - login/protected/me/lockout paths verified by non-placeholder tests.
- Pass/Fail:
  - Pass: contract suite is deterministic across repeated local runs.
  - Fail: flaky behavior or placeholder-only evidence remains.

### E2 Frontend auth and guard tests
- Inputs/dependencies: D1-D6
- Deliverables:
  - UI tests for login and redirection
- Risks:
  - brittle route test setup
- Estimate: M
- Red:
  - frontend auth tests are brittle, incomplete, or non-deterministic.
- Green:
  - login, guard, and redirect suites pass deterministically.
- Files:
  - `tests/unit/client/*`
  - `tests/integration/client/*`
  - `tests/e2e/*`
- Traces:
  - AC-1, AC-2
  - D1-D6 evidence map
- DoD:
  - multi-run stability verified for unit/integration/e2e auth paths.
- Pass/Fail:
  - Pass: frontend auth suites pass repeatedly.
  - Fail: unstable or incomplete auth flow evidence.

### E3 Quickstart validation
- Inputs/dependencies: A-E tasks
- Deliverables:
  - verified local run instructions
- Risks:
  - undocumented environment drift
- Estimate: S
- Red:
  - fresh setup cannot reproduce expected run/test flow.
- Green:
  - quickstart works from clean environment without undocumented steps.
- Files:
  - `.github/plans/F1/quickstart.md`
  - env sample/setup docs
- Traces:
  - operational readiness evidence for A-E.
- DoD:
  - clean-run checklist completed and documented.
- Pass/Fail:
  - Pass: independent fresh setup validation succeeds.
  - Fail: missing step or environment drift detected.

### E4 F1 spec traceability update
- Inputs/dependencies: E1, E2
- Deliverables:
  - updated F1 spec evidence mapping
- Risks:
  - mismatch between docs and behavior
- Estimate: S
- Red:
  - AC mapping is incomplete or stale.
- Green:
  - AC-to-test and AC-to-implementation evidence map is complete.
- Files:
  - `.github/plans/F1/plan.md`
  - `.github/plans/F1/tasks.md`
  - supporting F1 docs
- Traces:
  - AC-1, AC-2, AC-3 full coverage evidence.
- DoD:
  - checklist review confirms doc-behavior alignment.
- Pass/Fail:
  - Pass: traceability review complete and approved.
  - Fail: any acceptance criterion lacks evidence.

## Definition of Done
- All phases (A-E) are Pass.
- All tasks A1-E4 are Pass with explicit Red/Green closure.
- AC-1, AC-2, AC-3 validated by non-placeholder tests.
- Database migrations, constraints, and indexes verified.
- Contracts, quickstart, and traceability documents aligned with implementation.
- `npm run test:all` and `npm run test:coverage` succeed locally.
