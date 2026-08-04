import { Router } from "express";
import type { AuthPolicy } from "../auth/policy.js";
import type { AuthService } from "../auth/auth.service.js";
import { createAuthController } from "../auth/auth.controller.js";
import { createAuthenticateJwt } from "../middleware/authenticateJwt.js";
import { createLoginRateLimitMiddleware } from "../middleware/rateLimitLogin.js";

export function createAuthRouter(args: {
  authService: AuthService;
  policy: AuthPolicy;
  jwtSecret: string;
}): Router {
  const router = Router();
  const controller = createAuthController(args.authService, args.policy);

  router.post("/login", createLoginRateLimitMiddleware(), (req, res) => {
    void controller.login(req, res);
  });

  router.get("/me", createAuthenticateJwt(args.jwtSecret), (req, res) => {
    void controller.me(req, res);
  });

  return router;
}
