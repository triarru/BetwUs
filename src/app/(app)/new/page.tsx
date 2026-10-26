import { ActionForm } from "@/components/ActionForm";
import { createMediaAction, createMomentAction, saveJournalAction } from "@/app/actions/memories";
import { sendNoteAction } from "@/app/actions/notes";
import { Button, Field, PageTitle } from "@/components/ui";
import { FRAMES, STICKERS } from "@/lib/constants";
import { todayKey } from "@/lib/dates";
import { requireSpace } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { MoodForm } from "@/components/MoodForm";
import Link from "next/link";

const types = [
  { id: "media", label: "Ảnh / video" },
  { id: "journal", label: "Nhật ký" },
  { id: "note", label: "Thư" },
  { id: "mood", label: "Mood" },
  { id: "moment", label: "Moment" },
] as const;

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; day?: string }>;
}) {
  const user = await requireSpace();
  const params = await searchParams;
  const type = types.some((item) => item.id === params.type) ? params.type : "media";
  const day = params.day || todayKey();
  const moments = await prisma.moment.findMany({
    where: { spaceId: user.spaceId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageTitle kicker="Composer" title="Thêm vào chúng mình" />
      <div className="mb-5 flex flex-wrap gap-2">
        {types.map((item) => (
          <Link
            key={item.id}
            href={`/new?type=${item.id}&day=${day}`}
            className={`rounded-full px-4 py-2 text-sm ${type === item.id ? "bg-blush text-white" : "bg-white border border-line"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        {type === "media" ? (
          <ActionForm action={createMediaAction} className="space-y-4">
            <Field name="day" type="date" label="Ngày" defaultValue={day} required />
            <label className="block space-y-1.5">
              <span className="text-sm text-ink-soft">Ảnh hoặc video</span>
              <input name="file" type="file" accept="image/*,video/*" required className="w-full text-sm" />
            </label>
            <Field name="caption" label="Caption" placeholder="Một câu cho ngày này" />
            <label className="block space-y-1.5">
              <span className="text-sm text-ink-soft">Khung</span>
              <select name="frame" defaultValue="polaroid" className="w-full rounded-2xl border border-line bg-white px-4 py-3">
                {FRAMES.map((frame) => (
                  <option key={frame.id} value={frame.id}>
                    {frame.label}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="space-y-2">
              <legend className="text-sm text-ink-soft">Sticker</legend>
              <div className="flex flex-wrap gap-3">
                {STICKERS.map((sticker) => (
                  <label key={sticker} className="flex items-center gap-1 text-lg">
                    <input type="checkbox" name="stickers" value={sticker} />
                    {sticker}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="markMoment" /> Đây là ngày đặc biệt
            </label>
            <Field name="momentName" label="Tên moment mới" placeholder="Trip Đà Lạt, Valentine..." />
            <label className="block space-y-1.5">
              <span className="text-sm text-ink-soft">Hoặc gắn moment có sẵn</span>
              <select name="momentId" className="w-full rounded-2xl border border-line bg-white px-4 py-3">
                <option value="">—</option>
                {moments.map((moment) => (
                  <option key={moment.id} value={moment.id}>
                    {moment.name}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" className="mt-2">Đăng</Button>
          </ActionForm>
        ) : null}

        {type === "journal" ? (
          <ActionForm action={saveJournalAction} className="space-y-4">
            <Field name="day" type="date" label="Ngày" defaultValue={day} required />
            <label className="block space-y-1.5">
              <span className="text-sm text-ink-soft">Ô của {user.displayName}</span>
              <textarea
                name="body"
                rows={6}
                required
                className="w-full rounded-2xl border border-line px-4 py-3"
                placeholder="Hôm nay..."
              />
            </label>
            <Button type="submit" className="mt-2">Lưu nhật ký</Button>
          </ActionForm>
        ) : null}

        {type === "note" ? (
          <ActionForm action={sendNoteAction} className="space-y-4">
            <Field name="day" type="date" label="Gắn ngày (tuỳ chọn)" defaultValue={day} />
            <label className="block space-y-1.5">
              <span className="text-sm text-ink-soft">Loại</span>
              <select name="kind" className="w-full rounded-2xl border border-line px-4 py-3">
                <option value="sticky">Sticky</option>
                <option value="letter">Thư</option>
              </select>
            </label>
            <textarea
              name="body"
              rows={6}
              required
              className="w-full rounded-2xl border border-line px-4 py-3"
              placeholder="Gửi cho người kia..."
            />
            <Button type="submit" className="mt-2">Gửi</Button>
          </ActionForm>
        ) : null}

        {type === "mood" ? <MoodForm day={day} /> : null}

        {type === "moment" ? (
          <ActionForm action={createMomentAction} className="space-y-4">
            <Field name="name" label="Tên" placeholder="Valentine, sinh nhật, trip..." required />
            <Field name="startDay" type="date" label="Từ ngày" defaultValue={day} required />
            <Field name="endDay" type="date" label="Đến ngày" defaultValue={day} required />
            <Button type="submit" className="mt-2">Tạo moment</Button>
          </ActionForm>
        ) : null}
      </div>
    </div>
  );
}
