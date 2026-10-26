"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/days", label: "Days" },
  { href: "/moments", label: "Moments" },
  { href: "/notes", label: "Notes" },
  { href: "/us", label: "Us" },
];

export function AppShell({
  children,
  unread = 0,
}: {
  children: React.ReactNode;
  unread?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-full pb-24 md:pb-8 md:pl-52">
      <aside className="fixed top-0 left-0 hidden h-full w-52 flex-col border-r border-line bg-white/80 p-5 md:flex">
        <Link href="/days" className="hand text-2xl">
          BetweenUs
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-3 py-2 text-sm ${active ? "bg-paper-deep text-ink" : "text-ink-soft hover:bg-paper"}`}
              >
                {tab.label}
                {tab.href === "/notes" && unread > 0 ? (
                  <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-xs text-white">
                    {unread}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/new"
          className="mt-auto rounded-full bg-blush px-4 py-3 text-center text-sm text-white"
        >
          + Thêm
        </Link>
      </aside>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-white/95 md:hidden">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center py-3 text-xs ${active ? "text-blush" : "text-ink-soft"}`}
            >
              {tab.label}
              {tab.href === "/notes" && unread > 0 ? (
                <span className="absolute top-1.5 right-[22%] h-2 w-2 rounded-full bg-blush" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/new"
        className="fixed right-4 bottom-20 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-blush text-2xl text-white shadow-lg md:hidden"
        aria-label="Thêm kỷ niệm"
      >
        +
      </Link>
    </div>
  );
}
