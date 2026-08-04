CREATE UNIQUE INDEX IF NOT EXISTS ux_auth_users_email_lower
ON auth_users (LOWER(email));

CREATE INDEX IF NOT EXISTS ix_auth_users_locked_until
ON auth_users (locked_until);

CREATE INDEX IF NOT EXISTS ix_auth_login_attempts_email_attempted_at
ON auth_login_attempts (user_email, attempted_at DESC);

CREATE INDEX IF NOT EXISTS ix_auth_login_attempts_ip_attempted_at
ON auth_login_attempts (ip_address, attempted_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_auth_token_revocations_jti
ON auth_token_revocations (jti);

CREATE INDEX IF NOT EXISTS ix_auth_token_revocations_user_id
ON auth_token_revocations (user_id);
