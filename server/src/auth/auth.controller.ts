import type { Request, Response } from "express";
import type { AuthPolicy } from "./policy.js";
import type { AuthService } from "./auth.service.js";
import {
  AccountLockedError,
  InvalidCredentialsError
} from "../errors/authErrors.js";
import {
  registerLoginFailure,
  registerLoginSuccess
} from "../middleware/rateLimitLogin.js";

function requestId(request: Request): string {
  const headerValue = request.headers["x-request-id"];
  return typeof headerValue === "string" ? headerValue : "n/a";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getClientIp(request: Request): string | null {
  return request.ip || null;
}

export function createAuthController(service: AuthService, policy: AuthPolicy) {
  return {
    async login(request: Request, response: Response): Promise<void> {
      const body = request.body as { email?: unknown; password?: unknown };
      const email = typeof body.email === "string" ? body.email.trim() : "";
      const password = typeof body.password === "string" ? body.password : "";

      if (!isEmail(email) || password.length < 8) {
        response.status(400).json({
          error: {
            code: "AUTH_BAD_REQUEST",
            message: "Invalid request payload",
            requestId: requestId(request)
          }
        });
        return;
      }

      const loginRateIdentifier =
        (response.locals.loginRateLimitIdentifier as string | undefined) ??
        `${request.ip}:unknown`;

      try {
        const result = await service.login({
          email,
          password,
          ipAddress: getClientIp(request),
          userAgent: request.header("user-agent") ?? null
        });

        registerLoginSuccess(loginRateIdentifier);
        response.status(200).json(result);
      } catch (error) {
        if (error instanceof AccountLockedError) {
          registerLoginFailure(loginRateIdentifier, policy);
          response.status(429).json({
            error: {
              code: "AUTH_RATE_LIMITED",
              message: "Too many login attempts",
              requestId: requestId(request)
            }
          });
          return;
        }

        if (error instanceof InvalidCredentialsError) {
          registerLoginFailure(loginRateIdentifier, policy);
          response.status(401).json({
            error: {
              code: "AUTH_INVALID_CREDENTIALS",
              message: "Invalid credentials",
              requestId: requestId(request)
            }
          });
          return;
        }

        response.status(500).json({
          error: {
            code: "INTERNAL_ERROR",
            message: "Unexpected server error",
            requestId: requestId(request)
          }
        });
      }
    },

    async me(request: Request, response: Response): Promise<void> {
      const authUser = request.authUser;
      if (!authUser) {
        response.status(401).json({
          error: {
            code: "AUTH_UNAUTHORIZED",
            message: "Unauthorized",
            requestId: requestId(request)
          }
        });
        return;
      }

      const user = await service.getMe(authUser.id);
      if (!user) {
        response.status(401).json({
          error: {
            code: "AUTH_UNAUTHORIZED",
            message: "Unauthorized",
            requestId: requestId(request)
          }
        });
        return;
      }

      response.status(200).json({ user });
    }
  };
}
