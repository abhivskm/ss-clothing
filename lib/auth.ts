/**
 * Admin login: one password (ADMIN_PASSWORD) and a signed session cookie.
 *
 * The cookie holds only an expiry time plus an HMAC signature made with
 * SESSION_SECRET, so it cannot be forged or extended. Every admin page,
 * Server Action and the upload route calls requireAdmin() / isAdmin().
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

const COOKIE = "ss_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(password, expected!);
}

export async function startSession() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  await connection(); // always checked per request, never prerendered
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [expires, signature] = token.split(".");
  return Boolean(expires && signature) && safeEqual(signature, sign(expires)) && Number(expires) > Date.now();
}

/** Call at the top of every admin page and Server Action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
