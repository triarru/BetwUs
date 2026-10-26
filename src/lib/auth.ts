import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const encoder = new TextEncoder();

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is missing");
  }
  return encoder.encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        space: { include: { users: { orderBy: { createdAt: "asc" } } } },
      },
    });
  } catch {
    return null;
  }
}

export function partnerOf(
  user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>,
) {
  return user.space?.users.find((item) => item.id !== user.id) ?? null;
}

export function safeEqual(a: string, b: string) {
  const left = createHmac("sha256", "betweenus").update(a).digest();
  const right = createHmac("sha256", "betweenus").update(b).digest();
  return timingSafeEqual(left, right);
}
