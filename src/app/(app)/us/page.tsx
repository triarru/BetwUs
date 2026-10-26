import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Button, PageTitle } from "@/components/ui";
import { partnerOf } from "@/lib/auth";
import { daysBetween } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";

const links = [
  { href: "/us/since", title: "Since", body: "Ngày yêu, đếm ngày, mốc 100 / 365 / 1000" },
  { href: "/us/this-week", title: "This week", body: "Date idea và vote tuần này đi đâu" },
  { href: "/us/for-you", title: "For you", body: "Wishlist quà muốn được tặng" },
  { href: "/us/just-us", title: "Just us", body: "Invite, slot 2/2, privacy" },
];

export default async function UsPage() {
  const user = await requireSpace();
  const partner = partnerOf(user);
  const dayCount = user.space?.startedOn ? daysBetween(user.space.startedOn) : null;

  return (
    <div>
      <PageTitle
        kicker="Us"
        title={partner ? `${user.displayName} & ${partner.displayName}` : user.displayName}
        body={dayCount ? `Day ${dayCount}` : "Chưa chọn ngày bắt đầu."}
      />
      <div className="space-y-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block rounded-3xl border border-line bg-white p-5">
            <h2 className="hand text-2xl">{link.title}</h2>
            <p className="text-sm text-ink-soft">{link.body}</p>
          </Link>
        ))}
      </div>
      <form action={logoutAction} className="mt-8">
        <Button variant="line" type="submit">
          Đăng xuất
        </Button>
      </form>
    </div>
  );
}
