"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  clearSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { generateInviteCode, inviteExpiry } from "@/lib/invite";
import { prisma } from "@/lib/prisma";

function formString(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

export async function registerAction(formData: FormData) {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const displayName = formString(formData, "displayName") || "Mình";

  if (!email || password.length < 8) {
    return { error: "Email và mật khẩu (tối thiểu 8 ký tự) là bắt buộc." };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Email này đã có tài khoản." };

  const space = await prisma.space.create({
    data: {
      inviteCode: generateInviteCode(),
      inviteExpiresAt: inviteExpiry(),
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      displayName,
      spaceId: space.id,
    },
  });

  await createSession(user.id);
  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email hoặc mật khẩu chưa đúng." };
  }
  await createSession(user.id);
  redirect("/days");
}

export async function joinAction(code: string, formData: FormData) {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const displayName = formString(formData, "displayName") || "Mình";
  const inviteCode = code.trim().toUpperCase();

  if (!email || password.length < 8) {
    return { error: "Email và mật khẩu (tối thiểu 8 ký tự) là bắt buộc." };
  }

  const space = await prisma.space.findUnique({
    where: { inviteCode },
    include: { users: true },
  });

  if (!space) return { error: "Mã không đúng." };
  if (space.inviteExpiresAt && space.inviteExpiresAt < new Date()) {
    return { error: "Mã đã hết hạn. Nhờ người kia tạo mã mới." };
  }
  if (space.users.length >= 2) {
    return { error: "Chỗ này đã đủ hai người." };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Email này đã có tài khoản." };

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      displayName,
      spaceId: space.id,
    },
  });

  await prisma.space.update({
    where: { id: space.id },
    data: { inviteCode: null, inviteExpiresAt: null },
  });

  await createSession(user.id);
  redirect("/days");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
