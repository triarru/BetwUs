import Link from "next/link";
import { loginAction, registerAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/days");
  const { mode } = await searchParams;
  const create = mode === "create";

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="hand text-3xl">
        BetweenUs
      </Link>
      <h1 className="mt-6 text-2xl font-medium">
        {create ? "Tạo chỗ cho hai đứa" : "Đăng nhập"}
      </h1>
      <p className="mt-2 text-ink-soft">
        {create
          ? "Người đầu tiên tạo space, rồi mời người kia bằng mã một lần."
          : "Chỉ hai tài khoản trong một chỗ."}
      </p>
      <div className="mt-6 rounded-3xl border border-line bg-white p-5">
        {create ? (
          <AuthForm action={registerAction} submitLabel="Tạo chỗ" showName />
        ) : (
          <AuthForm action={loginAction} submitLabel="Vào" />
        )}
      </div>
      <p className="mt-4 text-sm text-ink-soft">
        {create ? (
          <Link href="/login">Đã có tài khoản?</Link>
        ) : (
          <Link href="/login?mode=create">Tạo chỗ mới</Link>
        )}
      </p>
    </div>
  );
}
