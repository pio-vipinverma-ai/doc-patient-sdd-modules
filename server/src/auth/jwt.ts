import jwt from "jsonwebtoken";
import type { AuthJwtClaims, AuthPublicUser } from "./types.js";

type JwtService = {
  issueToken: (user: AuthPublicUser) => string;
  verifyToken: (token: string) => AuthJwtClaims | null;
};

export function createJwtService(secret: string, expiresInSec: number): JwtService {
  return {
    issueToken(user) {
      return jwt.sign(
        {
          email: user.email,
          displayName: user.displayName,
          role: user.role
        },
        secret,
        {
          subject: user.id,
          expiresIn: expiresInSec
        }
      );
    },

    verifyToken(token) {
      try {
        const payload = jwt.verify(token, secret) as jwt.JwtPayload;
        if (!payload.sub || !payload.email || !payload.displayName || !payload.role) {
          return null;
        }

        return {
          id: String(payload.sub),
          email: String(payload.email),
          displayName: String(payload.displayName),
          role: "DOCTOR",
          exp: Number(payload.exp),
          iat: Number(payload.iat)
        };
      } catch {
        return null;
      }
    }
  };
}
