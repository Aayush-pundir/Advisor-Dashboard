import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import type { UserRole } from "@/lib/enums";

const SESSION_COOKIE = "advisor_session";
const PENDING_2FA_COOKIE = "advisor_2fa_pending";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-in-prod",
);

const LOGIN_RATE_LIMIT_WINDOW_MIN = 15;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
const PASSWORD_RESET_TOKEN_TTL_MIN = 60;

export type SessionPayload = {
  userId: string;
  role: UserRole;
  partnerId: string | null;
  name: string;
  sessionVersion: number;
};

export function isStrongPassword(password: string): { ok: boolean; error?: string } {
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, error: "Password must include at least one letter and one number." };
  }
  return { ok: true };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

/**
 * Loads the current session and cross-checks it against the DB: the user
 * must still exist, be active, and the session's sessionVersion must match
 * the DB's current value (so "sign out everywhere" actually revokes older
 * sessions instead of just the current cookie).
 */
export async function getAuthedUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.active) return null;
  if (user.sessionVersion !== session.sessionVersion) return null;
  return user;
}

async function checkLoginRateLimit(email: string) {
  const since = new Date(Date.now() - LOGIN_RATE_LIMIT_WINDOW_MIN * 60 * 1000);
  const recentFailures = await db.loginAttempt.count({
    where: { email, success: false, createdAt: { gte: since } },
  });
  return recentFailures < LOGIN_RATE_LIMIT_MAX_ATTEMPTS;
}

async function recordLoginAttempt(email: string, success: boolean) {
  await db.loginAttempt.create({ data: { email, success } });
}

export type LoginResult =
  | { ok: true; user: Awaited<ReturnType<typeof db.user.findUnique>>; requiresTwoFactor: boolean }
  | { ok: false; error: "RATE_LIMITED" | "INVALID" | "INACTIVE" };

export async function login(email: string, password: string): Promise<LoginResult> {
  const withinLimit = await checkLoginRateLimit(email);
  if (!withinLimit) {
    return { ok: false, error: "RATE_LIMITED" };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    await recordLoginAttempt(email, false);
    return { ok: false, error: "INVALID" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await recordLoginAttempt(email, false);
    return { ok: false, error: "INVALID" };
  }

  if (!user.active) {
    await recordLoginAttempt(email, false);
    return { ok: false, error: "INACTIVE" };
  }

  await recordLoginAttempt(email, true);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  if (user.twoFactorEnabled) {
    await createPendingTwoFactorSession(user.id);
    return { ok: true, user, requiresTwoFactor: true };
  }

  await createSession({
    userId: user.id,
    role: user.role as UserRole,
    partnerId: user.partnerId,
    name: user.name,
    sessionVersion: user.sessionVersion,
  });

  return { ok: true, user, requiresTwoFactor: false };
}

/** Short-lived (5 min) cookie identifying a user who passed the password
 * check but still needs to submit a TOTP code before a real session issues. */
export async function createPendingTwoFactorSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret);

  const store = await cookies();
  store.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });
}

export async function getPendingTwoFactorUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload as { userId: string }).userId;
  } catch {
    return null;
  }
}

export async function clearPendingTwoFactorSession() {
  const store = await cookies();
  store.delete(PENDING_2FA_COOKIE);
}

/** Completes login after a valid TOTP code — issues the real session. */
export async function completeTwoFactorLogin(userId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession({
    userId: user.id,
    role: user.role as UserRole,
    partnerId: user.partnerId,
    name: user.name,
    sessionVersion: user.sessionVersion,
  });
  await clearPendingTwoFactorSession();
  return user;
}

/** Changes a user's password, invalidates all other sessions, and re-issues
 * a fresh session cookie for the current device so the caller stays logged in. */
export async function changePassword(userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  const user = await db.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
      sessionVersion: { increment: 1 },
    },
  });

  await createSession({
    userId: user.id,
    role: user.role as UserRole,
    partnerId: user.partnerId,
    name: user.name,
    sessionVersion: user.sessionVersion,
  });

  return user;
}

/** Bumps sessionVersion so every previously issued session (this device
 * included) stops passing getAuthedUser's check. Caller should redirect to /login. */
export async function signOutEverywhere(userId: string) {
  await db.user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } });
  await destroySession();
}

export async function createPasswordResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MIN * 60 * 1000);
  await db.passwordResetToken.create({ data: { userId, token, expiresAt } });
  return token;
}

export async function consumePasswordResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  await db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record.userId;
}
