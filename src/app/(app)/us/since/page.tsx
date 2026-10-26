import { ActionForm } from "@/components/ActionForm";
import { updateSinceAction } from "@/app/actions/space";
import { Button, Field, PageTitle } from "@/components/ui";
import { MILESTONES } from "@/lib/constants";
import { daysBetween, todayKey } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";

export default async function SincePage() {
  const user = await requireSpace();
  const startedOn = user.space?.startedOn;
  const count = startedOn ? daysBetween(startedOn) : null;

  return (
    <div>
      <PageTitle kicker="Since" title={count ? `Day ${count}` : "Chọn ngày chúng mình bắt đầu"} />
      <ActionForm action={updateSinceAction} resetOnSuccess={false} className="space-y-4 rounded-3xl border border-line bg-white p-5">
        <Field name="startedOn" type="date" label="Ngày bắt đầu" defaultValue={startedOn ?? ""} />
        <Button type="submit">Lưu</Button>
      </ActionForm>
      {startedOn ? (
        <ul className="mt-6 space-y-2">
          {MILESTONES.map((milestone) => {
            const reached = (count ?? 0) >= milestone;
            return (
              <li key={milestone} className="rounded-2xl bg-white px-4 py-3">
                Day {milestone} {reached ? "· đã tới" : "· sắp tới"}
                {count === milestone && todayKey() ? " · hôm nay" : ""}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
