import { describe, it, expect, vi, beforeEach } from "vitest";

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
};

type LoginDeps = {
  findByEmail: (email: string) => Promise<UserRecord | null>;
  verifyPassword: (plain: string, hash: string) => Promise<boolean>;
  signToken: (userId: string) => string;
};

function createLoginService(deps: LoginDeps) {
  return async function login(input: { email: string; password: string }) {
    const user = await deps.findByEmail(input.email);

    if (!user) {
      throw Object.assign(new Error("Invalid credentials"), {
        code: "AUTH_INVALID_CREDENTIALS"
      });
    }

    const valid = await deps.verifyPassword(input.password, user.passwordHash);

    if (!valid) {
      throw Object.assign(new Error("Invalid credentials"), {
        code: "AUTH_INVALID_CREDENTIALS"
      });
    }

    return {
      accessToken: deps.signToken(user.id),
      user: {
        id: user.id,
        email: user.email
      }
    };
  };
}

describe("auth login service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns access token for valid credentials", async () => {
    const deps: LoginDeps = {
      findByEmail: vi.fn().mockResolvedValue({
        id: "u1",
        email: "doctor@clinic.com",
        passwordHash: "hashed"
      }),
      verifyPassword: vi.fn().mockResolvedValue(true),
      signToken: vi.fn().mockReturnValue("jwt-token")
    };

    const login = createLoginService(deps);

    const result = await login({
      email: "doctor@clinic.com",
      password: "CorrectPassword123"
    });

    expect(result.accessToken).toBe("jwt-token");
    expect(result.user.email).toBe("doctor@clinic.com");
    expect(deps.findByEmail).toHaveBeenCalledWith("doctor@clinic.com");
  });

  it("throws generic unauthorized code for unknown user", async () => {
    const deps: LoginDeps = {
      findByEmail: vi.fn().mockResolvedValue(null),
      verifyPassword: vi.fn(),
      signToken: vi.fn()
    };

    const login = createLoginService(deps);

    await expect(
      login({ email: "doctor@clinic.com", password: "wrong-password" })
    ).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS" });
  });

  // it("intentional failing test for testing purpose", () => {
  //   expect(true).toBe(false);
  // });
});
