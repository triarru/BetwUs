import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/days");

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Private for two</p>
      <h1 className="hand mt-3 text-5xl">BetweenUs</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Những gì chỉ có giữa chúng mình. Ảnh, nhật ký hai phía, thư, và những ngày
        đặc biệt — không public, không SEO.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-full bg-blush px-6 py-3 text-center text-white"
        >
          Vào chỗ của mình
        </Link>
        <Link
          href="/login?mode=create"
          className="rounded-full border border-line bg-white px-6 py-3 text-center"
        >
          Tạo chỗ mới
        </Link>
      </div>
    </div>
  );
}
