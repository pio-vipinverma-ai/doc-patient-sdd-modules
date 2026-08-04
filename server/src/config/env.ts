import dotenv from "dotenv";

dotenv.config();

export type EnvConfig = {
  serverPort: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresInSec: number;
  loginRateLimitWindowSec: number;
  loginRateLimitMaxAttempts: number;
  accountLockMinutes: number;
};

function parsePositiveInt(value: string | undefined, fallback: number, key: string): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${key}: expected positive integer`);
  }

  return parsed;
}

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): EnvConfig {
  return {
    serverPort: parsePositiveInt(raw.SERVER_PORT, 4000, "SERVER_PORT"),
    databaseUrl:
      raw.DATABASE_URL ?? "postgres://postgres:123.com@localhost:5432/doc_patient_db",
    jwtSecret: raw.JWT_SECRET ?? "dev-only-secret-change-me",
    jwtExpiresInSec: parsePositiveInt(raw.JWT_EXPIRES_IN, 3600, "JWT_EXPIRES_IN"),
    loginRateLimitWindowSec: parsePositiveInt(
      raw.LOGIN_RATE_LIMIT_WINDOW_SEC,
      60,
      "LOGIN_RATE_LIMIT_WINDOW_SEC"
    ),
    loginRateLimitMaxAttempts: parsePositiveInt(
      raw.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
      5,
      "LOGIN_RATE_LIMIT_MAX_ATTEMPTS"
    ),
    accountLockMinutes: parsePositiveInt(raw.ACCOUNT_LOCK_MINUTES, 15, "ACCOUNT_LOCK_MINUTES")
  };
}
