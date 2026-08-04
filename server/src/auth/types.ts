export type AuthUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: "DOCTOR";
  isActive: boolean;
  failedAttemptCount: number;
  lockedUntil: Date | null;
};

export type AuthPublicUser = {
  id: string;
  email: string;
  displayName: string;
  role: "DOCTOR";
};

export type AuthJwtClaims = AuthPublicUser & {
  exp: number;
  iat: number;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthPublicUser;
};
