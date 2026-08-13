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
