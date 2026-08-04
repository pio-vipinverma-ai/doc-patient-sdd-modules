-- Password hash corresponds to local-only credential configured for F1 smoke tests.
-- Plaintext is intentionally not stored in repository artifacts.
INSERT INTO auth_users (
  id,
  email,
  password_hash,
  display_name,
  role,
  is_active
)
VALUES (
  '7c6b9c9b-2f4d-4f63-a8a1-9e66d55d364f',
  'doctor@clinic.com',
  '$2a$10$NYirvm0slkRJ/Eczzu45V.ibOsukDaCSa4OadjLn8ajQebGFhImCm',
  'Dr. Smith',
  'DOCTOR',
  TRUE
)
ON CONFLICT (id)
DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
