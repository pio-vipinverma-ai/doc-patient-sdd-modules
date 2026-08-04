import type { EnvConfig } from "../config/env.js";

export type AuthPolicy = {
  loginRateLimitWindowSec: number;
  loginRateLimitMaxAttempts: number;
  accountLockMinutes: number;
};

export function createAuthPolicy(env: EnvConfig): AuthPolicy {
  return {
    loginRateLimitWindowSec: env.loginRateLimitWindowSec,
    loginRateLimitMaxAttempts: env.loginRateLimitMaxAttempts,
    accountLockMinutes: env.accountLockMinutes
  };
}
