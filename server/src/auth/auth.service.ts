import type { AuthPolicy } from "./policy.js";
import type { LoginResponse } from "./types.js";
import type { UsersRepository } from "./users.repository.js";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

export class AccountLockedError extends Error {
  constructor() {
    super("Too many login attempts");
    this.name = "AccountLockedError";
  }
}

type AuthServiceDeps = {
  usersRepository: UsersRepository;
  verifyPassword: (plainText: string, hash: string) => Promise<boolean>;
  issueToken: (user: { id: string; email: string; displayName: string; role: "DOCTOR" }) => string;
  jwtExpiresInSec: number;
  policy: AuthPolicy;
};

export type AuthService = {
  login: (input: {
    email: string;
    password: string;
    ipAddress: string | null;
    userAgent: string | null;
  }) => Promise<LoginResponse>;
  getMe: (userId: string) => Promise<{
    id: string;
    email: string;
    displayName: string;
    role: "DOCTOR";
  } | null>;
};

export function createAuthService(deps: AuthServiceDeps): AuthService {
  return {
    async login(input) {
      const user = await deps.usersRepository.findByEmail(input.email);

      if (!user || !user.isActive) {
        await deps.usersRepository.insertLoginAttempt({
          userEmail: input.email,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          success: false,
          failureReason: "INVALID_CREDENTIALS"
        });
        throw new InvalidCredentialsError();
      }

      if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
        await deps.usersRepository.insertLoginAttempt({
          userEmail: input.email,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          success: false,
          failureReason: "ACCOUNT_LOCKED"
        });
        throw new AccountLockedError();
      }

      const passwordValid = await deps.verifyPassword(input.password, user.passwordHash);

      if (!passwordValid) {
        const failedAttemptCount = user.failedAttemptCount + 1;
        const shouldLock = failedAttemptCount >= deps.policy.loginRateLimitMaxAttempts;
        const lockedUntil = shouldLock
          ? new Date(Date.now() + deps.policy.accountLockMinutes * 60 * 1000)
          : null;

        await deps.usersRepository.markFailedLogin(
          user.id,
          shouldLock ? 0 : failedAttemptCount,
          lockedUntil
        );
        await deps.usersRepository.insertLoginAttempt({
          userEmail: input.email,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          success: false,
          failureReason: "INVALID_CREDENTIALS"
        });
        throw new InvalidCredentialsError();
      }

      await deps.usersRepository.markSuccessfulLogin(user.id);
      await deps.usersRepository.insertLoginAttempt({
        userEmail: input.email,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        success: true,
        failureReason: null
      });

      const publicUser = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: "DOCTOR" as const
      };

      return {
        accessToken: deps.issueToken(publicUser),
        tokenType: "Bearer",
        expiresIn: deps.jwtExpiresInSec,
        user: publicUser
      };
    },

    async getMe(userId) {
      return deps.usersRepository.findPublicUserById(userId);
    }
  };
}
