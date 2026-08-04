CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'DOCTOR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  failed_attempt_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_auth_users_failed_attempt_count_non_negative CHECK (failed_attempt_count >= 0),
  CONSTRAINT chk_auth_users_role_doctor CHECK (role IN ('DOCTOR'))
);
