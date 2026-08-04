import type { AuthJwtClaims } from "../auth/types.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthJwtClaims;
    }
  }
}

export {};
