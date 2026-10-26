"use client";

import { ActionForm, type ActionResult } from "@/components/ActionForm";
import { Button, Field } from "@/components/ui";

export function AuthForm({
  action,
  submitLabel,
  showName = false,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  showName?: boolean;
}) {
  return (
    <ActionForm action={action} className="space-y-4" resetOnSuccess={false}>
      {(pending) => (
        <>
          {showName ? (
            <Field name="displayName" label="Tên gọi" placeholder="Em, Minh, ..." />
          ) : null}
          <Field name="email" type="email" label="Email" required />
          <Field name="password" type="password" label="Mật khẩu" required />
          <Button type="submit" className="w-full">
            {pending ? "Đang xử lý..." : submitLabel}
          </Button>
        </>
      )}
    </ActionForm>
  );
}
