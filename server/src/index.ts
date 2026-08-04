import express from "express";
import cors from "cors";
import { pathToFileURL } from "node:url";
import { loadEnv, type EnvConfig } from "./config/env.js";
import { createAuthPolicy, type AuthPolicy } from "./auth/policy.js";
import { createDbPool } from "./db/pool.js";
import { checkDatabaseHealth } from "./db/health.js";
import { createUsersRepository } from "./auth/users.repository.js";
import { verifyPassword } from "./auth/password.js";
import { createJwtService } from "./auth/jwt.js";
import { createAuthService, type AuthService } from "./auth/auth.service.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createProtectedRouter } from "./routes/protected.routes.js";

export type AppBuildOptions = {
  env?: EnvConfig;
  policy?: AuthPolicy;
  authService?: AuthService;
};

export function createApp(options: AppBuildOptions = {}) {
  const env = options.env ?? loadEnv();
  const policy = options.policy ?? createAuthPolicy(env);

  const app = express();
  app.use(cors());
  app.use(express.json());

  const pool = createDbPool(env.databaseUrl);
  const usersRepository = createUsersRepository(pool);
  const jwtService = createJwtService(env.jwtSecret, env.jwtExpiresInSec);

  const authService =
    options.authService ??
    createAuthService({
      usersRepository,
      verifyPassword,
      issueToken: jwtService.issueToken,
      jwtExpiresInSec: env.jwtExpiresInSec,
      policy
    });

  app.get("/health", async (_request, response) => {
    try {
      await checkDatabaseHealth(pool);
      response.status(200).json({ ok: true });
    } catch {
      response.status(500).json({ ok: false });
    }
  });

  app.use(
    "/api/v1/auth",
    createAuthRouter({
      authService,
      policy,
      jwtSecret: env.jwtSecret
    })
  );
  app.use("/api/v1/protected", createProtectedRouter(env.jwtSecret));

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
        requestId: "n/a"
      }
    });
  });

  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const env = loadEnv();
  const app = createApp({ env });

  app.listen(env.serverPort, () => {
    console.log(`Server listening on port ${env.serverPort}`);
  });
}
