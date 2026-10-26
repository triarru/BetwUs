"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser, partnerOf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function sendNoteAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.spaceId || !user.space) return { error: "Cần đăng nhập." };
  const partner = partnerOf(user);
  if (!partner) return { error: "Cần đủ hai người mới gửi thư được." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Viết nội dung đã." };

  const day = String(formData.get("day") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "sticky") === "letter" ? "letter" : "sticky";

  const note = await prisma.note.create({
    data: {
      spaceId: user.spaceId,
      senderId: user.id,
      recipientId: partner.id,
      body,
      kind,
      day,
    },
  });

  revalidatePath("/notes");
  revalidatePath("/days");
  if (day) revalidatePath(`/day/${day}`);
  redirect(`/notes/${note.id}`);
}

export async function markNoteReadAction(noteId: string) {
  const user = await getSessionUser();
  if (!user) return;

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.recipientId !== user.id || note.readAt) return;

  await prisma.note.update({
    where: { id: noteId },
    data: { readAt: new Date() },
  });
  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
}
