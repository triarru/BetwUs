import Link from "next/link";
import { Polaroid } from "@/components/Polaroid";
import { PageTitle } from "@/components/ui";
import { formatDayShort } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function MomentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSpace();
  const { id } = await params;
  const moment = await prisma.moment.findFirst({
    where: { id, spaceId: user.spaceId! },
    include: { media: { include: { author: true }, orderBy: { day: "asc" } } },
  });
  if (!moment) notFound();

  return (
    <div>
      <PageTitle
        kicker="Moment"
        title={moment.name}
        body={`${formatDayShort(moment.startDay)}${moment.endDay !== moment.startDay ? ` — ${formatDayShort(moment.endDay)}` : ""}`}
      />
      <Link href={`/day/${moment.startDay}`} className="text-sm text-blush">
        Xem theo ngày
      </Link>
      <div className="mt-6 flex flex-wrap gap-4">
        {moment.media.map((item) => (
          <Polaroid
            key={item.id}
            src={`/api/files/${item.id}`}
            type={item.type}
            caption={`${item.caption || item.day}`}
            frame={item.frame}
            stickers={JSON.parse(item.stickers || "[]")}
          />
        ))}
      </div>
    </div>
  );
}
