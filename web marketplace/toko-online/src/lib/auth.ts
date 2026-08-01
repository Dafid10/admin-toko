import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";

function sign(value: string) {
  const secret = process.env.SESSION_SECRET || "dev-secret-change-me";
  const hmac = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${hmac}`;
}

function verify(signed: string): string | null {
  const secret = process.env.SESSION_SECRET || "dev-secret-change-me";
  const [value, sig] = signed.split(".");
  if (!value || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return sig === expected ? value : null;
}

export function createAdminSession(email: string) {
  const token = sign(email);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 jam
  });
}

export function getAdminSession(): string | null {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  return verify(cookie);
}

export function destroyAdminSession() {
  cookies().delete(COOKIE_NAME);
}
