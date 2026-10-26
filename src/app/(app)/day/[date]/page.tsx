import Link from "next/link";
import { MoodForm } from "@/components/MoodForm";
import { Polaroid } from "@/components/Polaroid";
import { PageTitle } from "@/components/ui";
import { formatDay, isValidDayKey } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";
import { loadDay } from "@/lib/queries";
import { notFound } from "next/navigation";

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const user = await requireSpace();
  const { date } = await params;
  if (!isValidDayKey(date)) notFound();
  const data = await loadDay(user.spaceId!, date);
  const myMood = data.moods.find((item) => item.authorId === user.id);

  return (
    <div className="space-y-6">
      <PageTitle
        kicker="Một ngày"
        title={formatDay(date)}
        body={data.moments.map((item) => item.name).join(" · ") || "Ghi lại hôm này."}
      />

      {data.moments.map((moment) => (
        <Link
          key={moment.id}
          href={`/moments/${moment.id}`}
          className="mr-2 rounded-full bg-paper-deep px-3 py-1 text-sm"
        >
          {moment.name}
        </Link>
      ))}

      <section>
        <h2 className="mb-2 text-sm text-ink-soft">Today — mood một tap</h2>
        <MoodForm day={date} current={myMood?.emoji} />
        <p className="mt-2 text-sm text-ink-soft">
          {data.moods.map((mood) => `${mood.author.displayName} ${mood.emoji}`).join(" · ") ||
            "Chưa ai chọn mood."}
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm text-ink-soft">Both sides</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {user.space!.users.map((member) => {
            const journal = data.journals.find((item) => item.authorId === member.id);
            const mine = member.id === user.id;
            return (
              <div key={member.id} className="rounded-3xl border border-line bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gold">{member.displayName}</p>
                <p className="mt-2 whitespace-pre-wrap">{journal?.body ?? "Chưa viết hôm nay"}</p>
                {mine ? (
                  <Link href={`/new?type=journal&day=${date}`} className="mt-3 inline-block text-sm text-blush">
                    {journal ? "Sửa" : "Viết"}
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm text-ink-soft">Ảnh & video</h2>
          <Link href={`/new?type=media&day=${date}`} className="text-sm text-blush">
            Thêm ảnh
          </Link>
        </div>
        {data.media.length === 0 ? (
          <p className="text-ink-soft">Chưa có ảnh ngày này.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {data.media.map((item) => (
              <Polaroid
                key={item.id}
                src={`/api/files/${item.id}`}
                type={item.type}
                caption={item.caption}
                frame={item.frame}
                stickers={JSON.parse(item.stickers || "[]")}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm text-ink-soft">Notes ngày này</h2>
        {data.notes.length === 0 ? (
          <p className="text-ink-soft">Chưa có thư gắn ngày này.</p>
        ) : (
          <ul className="space-y-2">
            {data.notes.map((note) => (
              <li key={note.id}>
                <Link href={`/notes/${note.id}`} className="block rounded-2xl bg-white p-3">
                  <span className="text-xs text-gold">{note.sender.displayName}</span>
                  <p className="line-clamp-2">{note.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
