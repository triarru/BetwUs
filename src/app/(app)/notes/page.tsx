import Link from "next/link";
import { EmptyState, PageTitle } from "@/components/ui";
import { requireSpace } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ box?: string }>;
}) {
  const user = await requireSpace();
  const { box } = await searchParams;
  const sent = box === "sent";
  const notes = await prisma.note.findMany({
    where: sent
      ? { spaceId: user.spaceId!, senderId: user.id }
      : { spaceId: user.spaceId!, recipientId: user.id },
    include: { sender: true, recipient: true },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageTitle kicker="Notes" title="Thư giữa chúng mình" />
      <div className="mb-5 flex gap-2 text-sm">
        <Link href="/notes" className={`rounded-full px-4 py-2 ${!sent ? "bg-blush text-white" : "bg-white border border-line"}`}>
          Cho mình
        </Link>
        <Link href="/notes?box=sent" className={`rounded-full px-4 py-2 ${sent ? "bg-blush text-white" : "bg-white border border-line"}`}>
          Mình đã gửi
        </Link>
        <Link href="/new?type=note" className="ml-auto rounded-full bg-white px-4 py-2 border border-line">
          Viết thư
        </Link>
      </div>
      {notes.length === 0 ? (
        <EmptyState title="Chưa có thư" body="Sticky note hoặc thư ngắn, có người gửi và người nhận." />
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className={`block rounded-3xl border p-4 ${!note.readAt && !sent ? "border-blush bg-white" : "border-line bg-white/80"}`}
              >
                <div className="flex items-center justify-between text-xs text-gold">
                  <span>
                    {sent ? `Đến ${note.recipient.displayName}` : `Từ ${note.sender.displayName}`}
                    {note.kind === "letter" ? " · thư" : " · sticky"}
                  </span>
                  <span>{note.readAt ? "Đã đọc" : "Chưa đọc"}</span>
                </div>
                <p className="mt-2 line-clamp-2">{note.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
