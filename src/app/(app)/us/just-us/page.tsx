import { ActionForm } from "@/components/ActionForm";
import { rotateInviteAction } from "@/app/actions/space";
import { Button, PageTitle } from "@/components/ui";
import { partnerOf } from "@/lib/auth";
import { requireSpace } from "@/lib/guard";

export default async function JustUsPage() {
  const user = await requireSpace();
  const partner = partnerOf(user);
  const full = user.space!.users.length >= 2;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div>
      <PageTitle
        kicker="Just us"
        title={full ? "Đủ chúng mình rồi" : "Còn một chỗ"}
        body="Chỉ hai tài khoản. Invite dùng một lần. Ảnh không public, không SEO."
      />
      <div className="rounded-3xl border border-line bg-white p-5">
        <ul className="space-y-2">
          {user.space!.users.map((member) => (
            <li key={member.id}>
              {member.displayName} · {member.email}
              {member.id === user.id ? " (mình)" : ""}
            </li>
          ))}
        </ul>
      </div>
      {full ? (
        <p className="mt-4 text-ink-soft">Mã mời đã tắt. Không thêm người thứ ba.</p>
      ) : (
        <div className="mt-4 rounded-3xl bg-paper-deep p-5">
          <p className="hand text-4xl tracking-[0.3em]">{user.space!.inviteCode ?? "—"}</p>
          {user.space!.inviteCode ? (
            <p className="mt-2 break-all text-sm">
              {origin}/join/{user.space!.inviteCode}
            </p>
          ) : (
            <p className="mt-2 text-sm">Chưa có mã. Tạo mã mới.</p>
          )}
          <ActionForm action={rotateInviteAction} className="mt-4">
            <Button type="submit">Tạo mã mới</Button>
          </ActionForm>
        </div>
      )}
    </div>
  );
}
