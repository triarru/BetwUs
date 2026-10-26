import Link from "next/link";
import { PageTitle } from "@/components/ui";
import { daysInMonth, todayKey, toDayKey } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";
import { loadTimeline } from "@/lib/queries";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireSpace();
  const { month } = await searchParams;
  const now = month ? new Date(`${month}-01`) : new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const count = daysInMonth(year, monthIndex);
  const timeline = await loadTimeline(user.spaceId!);
  const marked = new Set(timeline.map((item) => item.day));
  const special = new Set(
    timeline.flatMap((item) => item.moments.length ? [item.day] : []),
  );
  const today = todayKey();
  const prev = new Date(year, monthIndex - 1, 1);
  const next = new Date(year, monthIndex + 1, 1);

  return (
    <div>
      <PageTitle
        kicker="Calendar"
        title={now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
      />
      <div className="mb-4 flex gap-2">
        <Link
          className="rounded-full border border-line bg-white px-4 py-2 text-sm"
          href={`/calendar?month=${toDayKey(prev).slice(0, 7)}`}
        >
          Tháng trước
        </Link>
        <Link
          className="rounded-full border border-line bg-white px-4 py-2 text-sm"
          href={`/calendar?month=${toDayKey(next).slice(0, 7)}`}
        >
          Tháng sau
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-ink-soft">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: count }).map((_, i) => {
          const day = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          return (
            <Link
              key={day}
              href={`/day/${day}`}
              className={`rounded-2xl py-3 text-sm ${day === today ? "bg-blush text-white" : "bg-white"}`}
            >
              {i + 1}
              <span className="mt-1 block h-1.5">
                {marked.has(day) ? (
                  <span className={`mx-auto block h-1.5 w-1.5 rounded-full ${special.has(day) ? "bg-gold" : day === today ? "bg-white" : "bg-blush"}`} />
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
