import { Router } from "express";
import { createAuthenticateJwt } from "../middleware/authenticateJwt.js";

export function createProtectedRouter(jwtSecret: string): Router {
  const router = Router();

  router.get("/dashboard", createAuthenticateJwt(jwtSecret), (request, response) => {
    response.status(200).json({
      message: "Authorized",
      data: {
        summary: "placeholder"
      },
      user: request.authUser
    });
  });

  return router;
}
