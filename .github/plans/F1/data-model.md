# F1 Data Model and Database Plan

## Overview
This document defines PostgreSQL tables, constraints, indexes, migrations, and verification checks for F1 secure doctor login.

## Database Assumptions
- Engine: PostgreSQL 14+
- Timezone: UTC
- Connection: DATABASE_URL
- UUID strategy: application-generated UUIDs or pgcrypto extension

## Tables

### 1) auth_users
Stores login credentials and account state for doctor authentication.

Columns:
- id UUID PRIMARY KEY
- email VARCHAR(255) NOT NULL
- password_hash VARCHAR(255) NOT NULL
- display_name VARCHAR(120) NOT NULL
- role VARCHAR(30) NOT NULL DEFAULT 'DOCTOR'
- is_active BOOLEAN NOT NULL DEFAULT TRUE
- failed_attempt_count INTEGER NOT NULL DEFAULT 0
- locked_until TIMESTAMPTZ NULL
- last_login_at TIMESTAMPTZ NULL
- created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
- updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

Constraints:
- CHECK (failed_attempt_count >= 0)
- CHECK (role IN ('DOCTOR'))

### 2) auth_login_attempts
Stores login attempt audit rows for throttling and diagnostics.

Columns:
- id BIGSERIAL PRIMARY KEY
- user_email VARCHAR(255) NOT NULL
- ip_address INET NULL
- user_agent TEXT NULL
- attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
- success BOOLEAN NOT NULL
- failure_reason VARCHAR(80) NULL

### 3) auth_token_revocations (Optional in F1, prepared for hardening)
Supports token denylist strategy if needed beyond stateless token discard.

Columns:
- id BIGSERIAL PRIMARY KEY
- jti VARCHAR(128) NOT NULL
- user_id UUID NOT NULL REFERENCES auth_users(id)
- revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
- expires_at TIMESTAMPTZ NOT NULL

## Index Plan

### Required Indexes
1. Unique case-insensitive email lookup

```sql
CREATE UNIQUE INDEX ux_auth_users_email_lower
ON auth_users (LOWER(email));
```

2. Lock state lookup

```sql
CREATE INDEX ix_auth_users_locked_until
ON auth_users (locked_until);
```

3. Recent attempts by email for policy evaluation

```sql
CREATE INDEX ix_auth_login_attempts_email_attempted_at
ON auth_login_attempts (user_email, attempted_at DESC);
```

4. Recent attempts by IP for policy evaluation

```sql
CREATE INDEX ix_auth_login_attempts_ip_attempted_at
ON auth_login_attempts (ip_address, attempted_at DESC);
```

5. Token revocation lookup by JTI

```sql
CREATE UNIQUE INDEX ux_auth_token_revocations_jti
ON auth_token_revocations (jti);
```

6. Token revocation lookup by user

```sql
CREATE INDEX ix_auth_token_revocations_user_id
ON auth_token_revocations (user_id);
```

## Migration Plan
1. 001_create_auth_users.sql
2. 002_create_auth_login_attempts.sql
3. 003_create_auth_token_revocations.sql
4. 004_create_auth_indexes_and_constraints.sql
5. 100_seed_single_doctor.sql

## Seed Plan
- Seed one active DOCTOR user for local/dev verification.
- Password must be stored as bcrypt hash only.
- Seed script must never commit plaintext credentials.

## Retention and Cleanup
- auth_login_attempts: retain default 90 days (configurable)
- auth_token_revocations: cleanup rows where expires_at < NOW()

## Risks and Assumptions
- Policy thresholds for lockout/rate limit/timeout are configuration-driven and TBD.
- role set is intentionally minimal for single-doctor phase.
- token revocation table may be unused in first delivery but kept for forward compatibility.

## Verification Checklist
1. Apply migrations on an empty DB successfully.
2. Re-run migrations safely or ensure migration runner blocks duplicate apply.
3. Confirm seed inserts one doctor account.
4. Validate email uniqueness case-insensitively.
5. Run EXPLAIN ANALYZE for key login queries and confirm index usage.
