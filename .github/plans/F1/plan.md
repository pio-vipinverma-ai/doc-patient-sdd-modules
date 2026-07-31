# F1 Implementation Plan

## Goal
Deliver secure doctor login with JWT auth, protected route enforcement, and PostgreSQL-backed credential checks.

## Phase 1: Project Bootstrap

### Step 1: Workspace and scripts
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/package.json
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/.gitignore
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/README.md

What this does:
- Establishes root scripts and repository-level conventions.

Risks/assumptions:
- Node and npm available.

Verification:
- Root scripts run and delegate to client/server.

### Step 2: Frontend/backend scaffolds
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/package.json
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/index.html
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/tsconfig.json
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/vite.config.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/main.tsx
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/App.tsx
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/package.json
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/tsconfig.json
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/index.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/.env.example

What this does:
- Creates runnable React + Express TypeScript baseline.

Risks/assumptions:
- Port conflicts may occur locally.

Verification:
- Frontend and backend both boot in dev mode.

## Phase 2: Database Layer

### Step 3: Schema and seed scripts
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/db/001_create_auth_users.sql
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/db/002_create_auth_login_attempts.sql
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/db/003_create_auth_token_revocations.sql
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/db/004_create_auth_indexes_and_constraints.sql
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/db/100_seed_single_doctor.sql

What this does:
- Creates auth tables/indexes and local verification data.

Risks/assumptions:
- Seed secrets must be handled safely.

Verification:
- Schema applies cleanly; seed row present.

### Step 4: DB connectivity
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/db/pool.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/db/health.ts

What this does:
- Adds PostgreSQL connection pooling and health probing.

Risks/assumptions:
- DATABASE_URL must be correct.

Verification:
- Health endpoint/query returns success.

## Phase 3: Backend Auth

### Step 5: Auth config and repository
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/config/env.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/auth/types.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/auth/policy.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/auth/users.repository.ts

What this does:
- Centralizes env/policy and user credential query logic.

Risks/assumptions:
- Policy thresholds remain TBD config.

Verification:
- Repository queries return expected model.

### Step 6: Login and token issuance
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/auth/password.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/auth/jwt.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/auth/auth.service.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/auth/auth.controller.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/routes/auth.routes.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/index.ts

What this does:
- Implements POST /auth/login and returns JWT for valid credentials.

Risks/assumptions:
- Must avoid credential enumeration in errors.

Verification:
- 200 for valid login; 401 generic for invalid.

### Step 7: Protected endpoint enforcement
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/middleware/authenticateJwt.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/routes/protected.routes.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/routes/auth.routes.ts

What this does:
- Enforces JWT on protected routes and adds /auth/me.

Risks/assumptions:
- Expired token behavior should be deterministic.

Verification:
- 401 for missing/invalid token; 200 for valid token.

### Step 8: Throttle/lock policy middleware
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/middleware/rateLimitLogin.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/src/auth/policy.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/.env.example

What this does:
- Applies login throttling/temporary lock hooks with config placeholders.

Risks/assumptions:
- Final threshold values pending policy sign-off.

Verification:
- 429 path reached when limits exceeded.

## Phase 4: Frontend Auth UX

### Step 9: Login UI and submit flow
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/pages/LoginPage.tsx
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/auth/authApi.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/auth/authStore.ts

What this does:
- Captures credentials, calls login API, stores auth state.

Risks/assumptions:
- Token storage strategy acceptable for F1.

Verification:
- Valid login transitions to authenticated state.

### Step 10: Protected routes and return URL
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/router.tsx
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/components/ProtectedRoute.tsx
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/App.tsx
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/pages/DashboardPage.tsx

What this does:
- Redirects unauthenticated users to login and preserves return URL.

Risks/assumptions:
- Must prevent open redirect issues.

Verification:
- Deep-link protected path while logged out redirects then returns after login.

## Phase 5: Testing and Traceability

### Step 11: Tests mapped to ACs
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/tests/auth.login.test.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/server/tests/auth.protected.test.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/auth/authStore.test.ts
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/client/src/router/protectedRoute.test.tsx

What this does:
- Adds test coverage for AC-1, AC-2, AC-3.

Risks/assumptions:
- Test environment setup may require extra config.

Verification:
- All tests pass in CI/local.

### Step 12: Spec evidence update
Files to change:
- d:/vipin/projects/doc-patient-sdd-AI-Module-4/.github/specs/specs/f1.md

What this does:
- Aligns implemented behavior evidence with F1 spec.

Risks/assumptions:
- Spec drift if not updated promptly.

Verification:
- Manual cross-check between tests and acceptance criteria.
