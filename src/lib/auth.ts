import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const hashBuffer = Buffer.from(hash, "hex");
    const testBuffer = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuffer, testBuffer);
  } catch {
    return false;
  }
}

export function generateToken(): string {
  return randomBytes(48).toString("hex");
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.insert(sessions).values({ userId, token, expiresAt });
  return token;
}

export async function getUserByToken(token: string) {
  if (!token) return null;
  const rows = await db
    .select({
      userId: sessions.userId,
      name: users.name,
      email: users.email,
      role: users.role,
      plan: users.plan,
      planExpiresAt: users.planExpiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] || null;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export const SESSION_COOKIE = "pm_session";
