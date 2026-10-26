"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { weekStartKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function addDateIdeaAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Thêm một ý đi." };

  await prisma.dateIdea.create({
    data: { spaceId: user.spaceId, authorId: user.id, title },
  });
  revalidatePath("/us/this-week");
  return { ok: true as const };
}

export async function voteDateIdeaAction(ideaId: string) {
  const user = await getSessionUser();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };
  const weekStart = weekStartKey();

  await prisma.dateVote.upsert({
    where: { userId_weekStart: { userId: user.id, weekStart } },
    update: { ideaId },
    create: { userId: user.id, ideaId, weekStart },
  });
  revalidatePath("/us/this-week");
  return { ok: true as const };
}

export async function markDateDoneAction(ideaId: string) {
  const user = await getSessionUser();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };
  await prisma.dateIdea.update({
    where: { id: ideaId },
    data: { doneAt: new Date() },
  });
  revalidatePath("/us/this-week");
  return { ok: true as const };
}

export async function addWishlistAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Tên món quà?" };

  await prisma.wishlistItem.create({
    data: {
      spaceId: user.spaceId,
      ownerId: user.id,
      title,
      note: String(formData.get("note") ?? "").trim(),
      url: String(formData.get("url") ?? "").trim(),
    },
  });
  revalidatePath("/us/for-you");
  return { ok: true as const };
}

export async function markGiftedAction(itemId: string) {
  const user = await getSessionUser();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };
  const item = await prisma.wishlistItem.findUnique({ where: { id: itemId } });
  if (!item || item.spaceId !== user.spaceId || item.ownerId === user.id) {
    return { error: "Không tặng giúp item của mình." };
  }
  await prisma.wishlistItem.update({
    where: { id: itemId },
    data: { giftedAt: new Date(), giftedById: user.id },
  });
  revalidatePath("/us/for-you");
  return { ok: true as const };
}
