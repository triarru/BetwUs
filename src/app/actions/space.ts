"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { generateInviteCode, inviteExpiry } from "@/lib/invite";
import { prisma } from "@/lib/prisma";

export async function saveOnboardingAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.space) return { error: "Bạn chưa có space." };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const startedOn = String(formData.get("startedOn") ?? "").trim();

  if (!displayName) return { error: "Đặt một tên gọi đã." };

  await prisma.user.update({
    where: { id: user.id },
    data: { displayName },
  });

  if (startedOn) {
    await prisma.space.update({
      where: { id: user.space.id },
      data: { startedOn },
    });
  }

  revalidatePath("/");
  redirect("/days");
}

export async function rotateInviteAction() {
  const user = await getSessionUser();
  if (!user?.space) return { error: "Không có space." };
  if (user.space.users.length >= 2) {
    return { error: "Đã đủ hai người, không tạo mã mới." };
  }

  await prisma.space.update({
    where: { id: user.space.id },
    data: {
      inviteCode: generateInviteCode(),
      inviteExpiresAt: inviteExpiry(),
    },
  });

  revalidatePath("/us/just-us");
  revalidatePath("/onboarding");
  return { ok: true as const };
}

export async function updateSinceAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.space) return { error: "Không có space." };
  const startedOn = String(formData.get("startedOn") ?? "").trim();
  await prisma.space.update({
    where: { id: user.space.id },
    data: { startedOn: startedOn || null },
  });
  revalidatePath("/us/since");
  revalidatePath("/days");
  return { ok: true as const };
}
