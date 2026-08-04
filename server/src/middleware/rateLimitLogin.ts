import type { NextFunction, Request, Response } from "express";
import type { AuthPolicy } from "../auth/policy.js";

type LoginRateState = {
  attempts: number;
  windowStartedAtMs: number;
  blockedUntilMs: number;
};

const rateMap = new Map<string, LoginRateState>();

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

export function getLoginRateLimitIdentifier(request: Request): string {
  const ipPart = request.ip || "unknown-ip";
  const emailPart = normalizeEmail((request.body as { email?: unknown })?.email);
  return `${ipPart}:${emailPart || "unknown-email"}`;
}

export function registerLoginFailure(identifier: string, policy: AuthPolicy): void {
  const now = Date.now();
  const windowMs = policy.loginRateLimitWindowSec * 1000;
  const current = rateMap.get(identifier);

  if (!current || now - current.windowStartedAtMs > windowMs) {
    rateMap.set(identifier, {
      attempts: 1,
      windowStartedAtMs: now,
      blockedUntilMs: 0
    });
    return;
  }

  const attempts = current.attempts + 1;
  if (attempts >= policy.loginRateLimitMaxAttempts) {
    rateMap.set(identifier, {
      attempts: 0,
      windowStartedAtMs: now,
      blockedUntilMs: now + policy.accountLockMinutes * 60 * 1000
    });
    return;
  }

  rateMap.set(identifier, {
    ...current,
    attempts
  });
}

export function registerLoginSuccess(identifier: string): void {
  rateMap.delete(identifier);
}

export function createLoginRateLimitMiddleware() {
  return (request: Request, response: Response, next: NextFunction): void => {
    const identifier = getLoginRateLimitIdentifier(request);
    const current = rateMap.get(identifier);

    if (current?.blockedUntilMs && current.blockedUntilMs > Date.now()) {
      response.status(429).json({
        error: {
          code: "AUTH_RATE_LIMITED",
          message: "Too many login attempts",
          requestId: request.headers["x-request-id"] ?? "n/a"
        }
      });
      return;
    }

    response.locals.loginRateLimitIdentifier = identifier;
    next();
  };
}

export function resetRateLimitStateForTests(): void {
  rateMap.clear();
}
