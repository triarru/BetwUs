import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/guard";
import { unreadNoteCount } from "@/lib/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unread = user.spaceId ? await unreadNoteCount(user.id) : 0;

  return <AppShell unread={unread}>{children}</AppShell>;
}
