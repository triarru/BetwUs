import Link from "next/link";
import { EmptyState, PageTitle } from "@/components/ui";
import { formatDayShort } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function MomentsPage() {
  const user = await requireSpace();
  const moments = await prisma.moment.findMany({
    where: { spaceId: user.spaceId! },
    include: { media: { orderBy: { createdAt: "asc" }, take: 1 } },
    orderBy: { startDay: "desc" },
  });

  return (
    <div>
      <PageTitle kicker="Moments" title="Ngày đặc biệt" body="Valentine, sinh nhật, trip — gom thành album." />
      <Link href="/new?type=moment" className="mb-5 inline-block rounded-full bg-blush px-4 py-2 text-sm text-white">
        Tạo moment
      </Link>
      {moments.length === 0 ? (
        <EmptyState title="Chưa có moment" body="Đánh dấu một ngày đặc biệt khi đăng ảnh, hoặc tạo album trước." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {moments.map((moment) => (
            <Link key={moment.id} href={`/moments/${moment.id}`} className="overflow-hidden rounded-3xl bg-white border border-line">
              {moment.media[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/files/${moment.media[0].id}`}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-paper-deep hand text-2xl">
                  {moment.name}
                </div>
              )}
              <div className="p-4">
                <h2 className="hand text-xl">{moment.name}</h2>
                <p className="text-sm text-ink-soft">
                  {formatDayShort(moment.startDay)}
                  {moment.endDay !== moment.startDay ? ` — ${formatDayShort(moment.endDay)}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
