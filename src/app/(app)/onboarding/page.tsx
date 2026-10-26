import { logoutAction } from "@/app/actions/auth";
import { saveOnboardingAction } from "@/app/actions/space";
import { ActionForm } from "@/components/ActionForm";
import { Button, Field, PageTitle } from "@/components/ui";
import { requireSpace } from "@/lib/guard";

export default async function OnboardingPage() {
  const user = await requireSpace();
  const partner = user.space!.users.find((item) => item.id !== user.id);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div>
      <PageTitle
        kicker="Just us"
        title="Chỗ này của chúng mình"
        body="Đặt tên gọi, chọn ngày bắt đầu, rồi mời người còn lại."
      />
      <ActionForm
        action={saveOnboardingAction}
        resetOnSuccess={false}
        className="space-y-4 rounded-3xl border border-line bg-white p-5"
      >
        <Field
          name="displayName"
          label="Tên gọi của bạn"
          defaultValue={user.displayName}
          required
        />
        <Field
          name="startedOn"
          type="date"
          label="Ngày bắt đầu yêu (có thể để trống)"
          defaultValue={user.space?.startedOn ?? ""}
        />
        <Button type="submit">Xong, vào Days</Button>
      </ActionForm>

      {!partner && user.space?.inviteCode ? (
        <div className="mt-6 rounded-3xl bg-paper-deep p-5">
          <p className="text-sm text-ink-soft">Mã mời một lần</p>
          <p className="hand mt-1 text-4xl tracking-[0.3em]">{user.space.inviteCode}</p>
          <p className="mt-3 break-all text-sm">
            {origin || "http://localhost:3000"}/join/{user.space.inviteCode}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Có một chỗ chỉ giữa chúng mình. Mở link này, xong là đủ hai người.
          </p>
        </div>
      ) : null}

      <form action={logoutAction} className="mt-8">
        <Button variant="ghost" type="submit">
          Đăng xuất
        </Button>
      </form>
    </div>
  );
}
