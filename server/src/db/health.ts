import type { Pool } from "pg";

export async function checkDatabaseHealth(pool: Pool): Promise<{ ok: true }> {
  await pool.query("SELECT 1");
  return { ok: true };
}
