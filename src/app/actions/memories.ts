"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { isValidDayKey, todayKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_BYTES = 50 * 1024 * 1024;

async function requirePair() {
  const user = await getSessionUser();
  if (!user?.spaceId || !user.space) return null;
  return user;
}

export async function createMediaAction(formData: FormData) {
  const user = await requirePair();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Chọn ảnh hoặc video đã." };
  }
  if (file.size > MAX_BYTES) return { error: "File tối đa 50MB." };

  const day = String(formData.get("day") ?? todayKey());
  if (!isValidDayKey(day)) return { error: "Ngày không hợp lệ." };

  const type = file.type.startsWith("video/") ? "video" : "image";
  const ext = path.extname(file.name) || (type === "video" ? ".mp4" : ".jpg");
  const id = crypto.randomUUID();
  const fileName = `${id}${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));

  const stickers = formData
    .getAll("stickers")
    .map((item) => String(item).trim())
    .filter(Boolean);

  const momentName = String(formData.get("momentName") ?? "").trim();
  const markMoment = formData.get("markMoment") === "on";
  let momentId: string | undefined;

  if (markMoment) {
    const existingId = String(formData.get("momentId") ?? "");
    if (existingId) {
      momentId = existingId;
    } else if (momentName) {
      const moment = await prisma.moment.create({
        data: {
          spaceId: user.spaceId,
          name: momentName,
          startDay: day,
          endDay: String(formData.get("momentEnd") ?? day) || day,
        },
      });
      momentId = moment.id;
    }
  }

  await prisma.media.create({
    data: {
      id,
      spaceId: user.spaceId,
      authorId: user.id,
      day,
      caption: String(formData.get("caption") ?? "").trim(),
      frame: String(formData.get("frame") ?? "polaroid"),
      stickers: JSON.stringify(stickers),
      type,
      fileName,
      mimeType: file.type || "application/octet-stream",
      momentId,
    },
  });

  revalidatePath("/days");
  revalidatePath(`/day/${day}`);
  revalidatePath("/moments");
  redirect(`/day/${day}`);
}

export async function saveJournalAction(formData: FormData) {
  const user = await requirePair();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };

  const day = String(formData.get("day") ?? todayKey());
  const body = String(formData.get("body") ?? "").trim();
  if (!isValidDayKey(day)) return { error: "Ngày không hợp lệ." };
  if (!body) return { error: "Viết một chút đã." };

  await prisma.journalEntry.upsert({
    where: {
      spaceId_authorId_day: {
        spaceId: user.spaceId,
        authorId: user.id,
        day,
      },
    },
    update: { body },
    create: { spaceId: user.spaceId, authorId: user.id, day, body },
  });

  revalidatePath("/days");
  revalidatePath(`/day/${day}`);
  redirect(`/day/${day}`);
}

export async function saveMoodAction(formData: FormData) {
  const user = await requirePair();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };
  const day = String(formData.get("day") ?? todayKey());
  const emoji = String(formData.get("emoji") ?? "");
  if (!emoji) return { error: "Chọn mood." };

  await prisma.mood.upsert({
    where: {
      spaceId_authorId_day: {
        spaceId: user.spaceId,
        authorId: user.id,
        day,
      },
    },
    update: { emoji },
    create: { spaceId: user.spaceId, authorId: user.id, day, emoji },
  });

  revalidatePath("/days");
  revalidatePath(`/day/${day}`);
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function createMomentAction(formData: FormData) {
  const user = await requirePair();
  if (!user?.spaceId) return { error: "Cần đăng nhập." };
  const name = String(formData.get("name") ?? "").trim();
  const startDay = String(formData.get("startDay") ?? todayKey());
  const endDay = String(formData.get("endDay") ?? startDay);
  if (!name) return { error: "Đặt tên moment." };

  const moment = await prisma.moment.create({
    data: { spaceId: user.spaceId, name, startDay, endDay },
  });

  revalidatePath("/moments");
  redirect(`/moments/${moment.id}`);
}
