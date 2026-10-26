import { ActionForm } from "@/components/ActionForm";
import {
  addDateIdeaAction,
  markDateDoneAction,
  voteDateIdeaAction,
} from "@/app/actions/together";
import { Button, Field, EmptyState, PageTitle } from "@/components/ui";
import { weekStartKey } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function ThisWeekPage() {
  const user = await requireSpace();
  const weekStart = weekStartKey();
  const ideas = await prisma.dateIdea.findMany({
    where: { spaceId: user.spaceId! },
    include: { votes: true, author: true },
    orderBy: { createdAt: "desc" },
  });
  const weekVotes = ideas.flatMap((idea) =>
    idea.votes.filter((vote) => vote.weekStart === weekStart),
  );
  const tally = new Map<string, number>();
  for (const vote of weekVotes) {
    tally.set(vote.ideaId, (tally.get(vote.ideaId) ?? 0) + 1);
  }
  const max = Math.max(0, ...tally.values());
  const winners = ideas.filter((idea) => (tally.get(idea.id) ?? 0) === max && max > 0);
  const myVote = weekVotes.find((vote) => vote.userId === user.id);

  return (
    <div>
      <PageTitle
        kicker="This week"
        title={
          winners.length === 1
            ? `Tuần này: ${winners[0].title}`
            : winners.length > 1
              ? "Tuần này: hòa, chọn tay"
              : "Tuần này chưa quyết"
        }
        body="Mỗi người một vote mỗi tuần. List ý tưởng giữ lại."
      />
      <ActionForm action={addDateIdeaAction} className="mb-6 flex gap-2">
        <div className="flex-1">
          <Field name="title" label="Ý tưởng mới" placeholder="Đi ăn phở, xem phim, Đà Lạt..." />
        </div>
        <Button type="submit" className="mt-7">
          Thêm
        </Button>
      </ActionForm>
      {ideas.length === 0 ? (
        <EmptyState title="Chưa có idea" body="Ai cũng thêm được. Vote cho tuần này." />
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea) => (
            <li key={idea.id} className="flex items-center gap-2 rounded-3xl bg-white p-4">
              <div className="flex-1">
                <p className={idea.doneAt ? "text-ink-soft line-through" : ""}>{idea.title}</p>
                <p className="text-xs text-gold">
                  {tally.get(idea.id) ?? 0} vote tuần này · {idea.author.displayName}
                </p>
              </div>
              <ActionForm action={voteDateIdeaAction.bind(null, idea.id)}>
                <Button variant={myVote?.ideaId === idea.id ? "primary" : "line"} type="submit">
                  Vote
                </Button>
              </ActionForm>
              {!idea.doneAt ? (
                <ActionForm action={markDateDoneAction.bind(null, idea.id)}>
                  <Button variant="ghost" type="submit">
                    Đã đi
                  </Button>
                </ActionForm>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
