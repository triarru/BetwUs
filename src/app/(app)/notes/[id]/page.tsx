import Link from "next/link";
import { PageTitle } from "@/components/ui";
import { formatDay } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSpace();
  const { id } = await params;
  const note = await prisma.note.findFirst({
    where: { id, spaceId: user.spaceId! },
    include: { sender: true, recipient: true },
  });
  if (!note) notFound();
  if (note.recipientId !== user.id && note.senderId !== user.id) notFound();

  if (note.recipientId === user.id && !note.readAt) {
    await prisma.note.update({
      where: { id: note.id },
      data: { readAt: new Date() },
    });
  }

  return (
    <div>
      <PageTitle
        kicker={note.kind === "letter" ? "Thư" : "Sticky"}
        title={`Từ ${note.sender.displayName}`}
        body={note.day ? formatDay(note.day) : undefined}
      />
      <article className="rounded-3xl border border-line bg-white p-6 whitespace-pre-wrap leading-7">
        {note.body}
      </article>
      {note.day ? (
        <Link href={`/day/${note.day}`} className="mt-4 inline-block text-sm text-blush">
          Xem ngày này
        </Link>
      ) : null}
    </div>
  );
}
