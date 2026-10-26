import { ActionForm } from "@/components/ActionForm";
import { addWishlistAction, markGiftedAction } from "@/app/actions/together";
import { Button, Field, PageTitle } from "@/components/ui";
import { requireSpace } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function ForYouPage() {
  const user = await requireSpace();
  const items = await prisma.wishlistItem.findMany({
    where: { spaceId: user.spaceId! },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });

  const columns = user.space!.users.map((member) => ({
    member,
    items: items.filter((item) => item.ownerId === member.id),
  }));

  return (
    <div>
      <PageTitle kicker="For you" title="Quà muốn được tặng" />
      <ActionForm action={addWishlistAction} className="mb-6 space-y-3 rounded-3xl border border-line bg-white p-5">
        <Field name="title" label="Mình muốn" required />
        <Field name="note" label="Ghi chú" />
        <Field name="url" label="Link" />
        <Button type="submit">Thêm vào list của mình</Button>
      </ActionForm>
      <div className="grid gap-4 sm:grid-cols-2">
        {columns.map(({ member, items: list }) => (
          <section key={member.id} className="rounded-3xl bg-white p-4">
            <h2 className="hand text-2xl">{member.displayName} muốn</h2>
            <ul className="mt-3 space-y-3">
              {list.map((item) => (
                <li key={item.id} className={item.giftedAt ? "opacity-50" : ""}>
                  <p className="font-medium">{item.title}</p>
                  {item.note ? <p className="text-sm text-ink-soft">{item.note}</p> : null}
                  {item.url ? (
                    <a href={item.url} className="text-sm text-blush" target="_blank" rel="noreferrer">
                      Link
                    </a>
                  ) : null}
                  {item.giftedAt ? (
                    <p className="text-xs text-gold">Đã tặng</p>
                  ) : member.id !== user.id ? (
                    <ActionForm action={markGiftedAction.bind(null, item.id)} className="mt-2">
                      <Button variant="line" type="submit">
                        Đã tặng
                      </Button>
                    </ActionForm>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
