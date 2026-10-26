import { prisma } from "@/lib/prisma";

export async function loadDay(spaceId: string, day: string) {
  const [media, journals, notes, moods, moments] = await Promise.all([
    prisma.media.findMany({
      where: { spaceId, day },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.journalEntry.findMany({
      where: { spaceId, day },
      include: { author: true },
    }),
    prisma.note.findMany({
      where: { spaceId, day },
      include: { sender: true, recipient: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mood.findMany({
      where: { spaceId, day },
      include: { author: true },
    }),
    prisma.moment.findMany({
      where: {
        spaceId,
        startDay: { lte: day },
        endDay: { gte: day },
      },
    }),
  ]);

  return { media, journals, notes, moods, moments };
}

export async function loadTimeline(spaceId: string) {
  const [media, journals, notes, moods, moments] = await Promise.all([
    prisma.media.findMany({
      where: { spaceId },
      include: { author: true },
      orderBy: [{ day: "desc" }, { createdAt: "asc" }],
    }),
    prisma.journalEntry.findMany({
      where: { spaceId },
      include: { author: true },
    }),
    prisma.note.findMany({
      where: { spaceId },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mood.findMany({
      where: { spaceId },
      include: { author: true },
    }),
    prisma.moment.findMany({ where: { spaceId } }),
  ]);

  const days = new Set<string>();
  for (const item of media) days.add(item.day);
  for (const item of journals) days.add(item.day);
  for (const item of notes) if (item.day) days.add(item.day);
  for (const item of moods) days.add(item.day);

  return [...days].sort((a, b) => b.localeCompare(a)).map((day) => ({
    day,
    media: media.filter((item) => item.day === day),
    journals: journals.filter((item) => item.day === day),
    notes: notes.filter((item) => item.day === day),
    moods: moods.filter((item) => item.day === day),
    moments: moments.filter(
      (item) => item.startDay <= day && item.endDay >= day,
    ),
  }));
}

export async function unreadNoteCount(userId: string) {
  return prisma.note.count({
    where: { recipientId: userId, readAt: null },
  });
}
