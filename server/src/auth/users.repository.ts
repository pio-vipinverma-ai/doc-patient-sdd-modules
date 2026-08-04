import type { Pool } from "pg";
import type { AuthUserRecord } from "./types.js";

export type LoginAttemptAudit = {
  userEmail: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failureReason: string | null;
};

export type UsersRepository = {
  findByEmail: (email: string) => Promise<AuthUserRecord | null>;
  markSuccessfulLogin: (userId: string) => Promise<void>;
  markFailedLogin: (
    userId: string,
    failedAttemptCount: number,
    lockedUntil: Date | null
  ) => Promise<void>;
  insertLoginAttempt: (attempt: LoginAttemptAudit) => Promise<void>;
  findPublicUserById: (userId: string) => Promise<{
    id: string;
    email: string;
    displayName: string;
    role: "DOCTOR";
  } | null>;
};

function mapUser(row: Record<string, unknown>): AuthUserRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    displayName: String(row.display_name),
    role: "DOCTOR",
    isActive: Boolean(row.is_active),
    failedAttemptCount: Number(row.failed_attempt_count ?? 0),
    lockedUntil: row.locked_until ? new Date(String(row.locked_until)) : null
  };
}

export function createUsersRepository(pool: Pool): UsersRepository {
  return {
    async findByEmail(email) {
      const result = await pool.query(
        `
          SELECT
            id,
            email,
            password_hash,
            display_name,
            role,
            is_active,
            failed_attempt_count,
            locked_until
          FROM auth_users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
        `,
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return mapUser(result.rows[0]);
    },

    async markSuccessfulLogin(userId) {
      await pool.query(
        `
          UPDATE auth_users
          SET
            failed_attempt_count = 0,
            locked_until = NULL,
            last_login_at = NOW(),
            updated_at = NOW()
          WHERE id = $1
        `,
        [userId]
      );
    },

    async markFailedLogin(userId, failedAttemptCount, lockedUntil) {
      await pool.query(
        `
          UPDATE auth_users
          SET
            failed_attempt_count = $2,
            locked_until = $3,
            updated_at = NOW()
          WHERE id = $1
        `,
        [userId, failedAttemptCount, lockedUntil]
      );
    },

    async insertLoginAttempt(attempt) {
      await pool.query(
        `
          INSERT INTO auth_login_attempts (
            user_email,
            ip_address,
            user_agent,
            success,
            failure_reason
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          attempt.userEmail,
          attempt.ipAddress,
          attempt.userAgent,
          attempt.success,
          attempt.failureReason
        ]
      );
    },

    async findPublicUserById(userId) {
      const result = await pool.query(
        `
          SELECT id, email, display_name, role
          FROM auth_users
          WHERE id = $1 AND is_active = TRUE
          LIMIT 1
        `,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        id: String(result.rows[0].id),
        email: String(result.rows[0].email),
        displayName: String(result.rows[0].display_name),
        role: "DOCTOR"
      };
    }
  };
}
