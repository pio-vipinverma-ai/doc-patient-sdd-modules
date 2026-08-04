import type { NextFunction, Request, Response } from "express";
import type { AuthJwtClaims } from "../auth/types.js";
import { createJwtService } from "../auth/jwt.js";

function readBearerToken(request: Request): string | null {
  const authHeader = request.header("authorization");
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function createAuthenticateJwt(secret: string) {
  const jwtService = createJwtService(secret, 3600);

  return (request: Request, response: Response, next: NextFunction): void => {
    const token = readBearerToken(request);

    if (!token) {
      response.status(401).json({
        error: {
          code: "AUTH_UNAUTHORIZED",
          message: "Unauthorized",
          requestId: request.headers["x-request-id"] ?? "n/a"
        }
      });
      return;
    }

    const claims = jwtService.verifyToken(token);
    if (!claims) {
      response.status(401).json({
        error: {
          code: "AUTH_UNAUTHORIZED",
          message: "Unauthorized",
          requestId: request.headers["x-request-id"] ?? "n/a"
        }
      });
      return;
    }

    request.authUser = claims as AuthJwtClaims;
    next();
  };
}
