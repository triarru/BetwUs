import Link from "next/link";
import { Polaroid } from "@/components/Polaroid";
import { EmptyState, PageTitle } from "@/components/ui";
import { partnerOf } from "@/lib/auth";
import { daysBetween, formatDay, todayKey } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";
import { loadTimeline } from "@/lib/queries";

export default async function DaysPage() {
  const user = await requireSpace();
  const partner = partnerOf(user);
  const timeline = await loadTimeline(user.spaceId!);
  const dayCount = user.space?.startedOn ? daysBetween(user.space.startedOn) : null;

  return (
    <div>
      <PageTitle
        kicker="Days"
        title={dayCount ? `Day ${dayCount}` : "Những ngày của chúng mình"}
        body={
          partner
            ? `${user.displayName} & ${partner.displayName}`
            : "Đang đợi thêm một người. Có thể ghi ngày hôm nay trước."
        }
      />

      <div className="mb-5 flex gap-2 text-sm">
        <Link href="/calendar" className="rounded-full bg-white px-4 py-2 border border-line">
          Lịch
        </Link>
        <Link href={`/day/${todayKey()}`} className="rounded-full bg-white px-4 py-2 border border-line">
          Hôm nay
        </Link>
      </div>

      {timeline.length === 0 ? (
        <EmptyState
          title="Chưa có ngày nào"
          body="Đợi thêm một người, hoặc ghi ngày hôm nay."
          action={
            <Link href="/new" className="rounded-full bg-blush px-5 py-2.5 text-white">
              Viết hôm nay
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {timeline.map((entry) => (
            <article key={entry.day} className="rounded-3xl border border-line bg-white/80 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/day/${entry.day}`} className="hand text-2xl capitalize">
                    {formatDay(entry.day)}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {entry.moments.map((moment) => (
                      <Link
                        key={moment.id}
                        href={`/moments/${moment.id}`}
                        className="rounded-full bg-paper-deep px-3 py-1 text-xs"
                      >
                        {moment.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="text-xl">
                  {entry.moods.map((mood) => (
                    <span key={mood.id} title={mood.author.displayName}>
                      {mood.emoji}
                    </span>
                  ))}
                </div>
              </div>

              {entry.media.length > 0 ? (
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {entry.media.map((item) => (
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
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {user.space!.users.map((member) => {
                  const journal = entry.journals.find((item) => item.authorId === member.id);
                  return (
                    <div key={member.id} className="rounded-2xl bg-paper p-3">
                      <p className="text-xs uppercase tracking-wide text-gold">{member.displayName}</p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {journal?.body ?? "Chưa viết hôm nay"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
