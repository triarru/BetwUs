import { joinAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { prisma } from "@/lib/prisma";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const inviteCode = code.toUpperCase();
  const space = await prisma.space.findUnique({
    where: { inviteCode },
    include: { users: true },
  });

  const invalid = !space;
  const expired = Boolean(space?.inviteExpiresAt && space.inviteExpiresAt < new Date());
  const full = Boolean(space && space.users.length >= 2);

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-12">
      <p className="hand text-3xl">BetweenUs</p>
      <h1 className="mt-6 text-2xl font-medium">Có một chỗ chỉ giữa chúng mình</h1>
      {invalid || expired || full ? (
        <p className="mt-4 text-ink-soft">
          {full
            ? "Chỗ này đã đủ hai người."
            : expired
              ? "Mã đã hết hạn. Nhờ người kia tạo mã mới."
              : "Mã không đúng."}
        </p>
      ) : (
        <>
          <p className="mt-2 text-ink-soft">
            Mở link này, tạo tài khoản, xong là đủ hai người.
          </p>
          <div className="mt-6 rounded-3xl border border-line bg-white p-5">
            <AuthForm
              action={joinAction.bind(null, inviteCode)}
              submitLabel="Vào BetweenUs"
              showName
            />
          </div>
        </>
      )}
    </div>
  );
}
