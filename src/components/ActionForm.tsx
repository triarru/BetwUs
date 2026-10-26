"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";

export type ActionResult = { error?: string } | void;

// Runs a server action and shows its `{ error }` message. Unlike passing the
// action straight to <form action>, the fields are only reset on success, so
// a rejected submit keeps what the person typed.
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = true,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode | ((pending: boolean) => ReactNode);
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    // Keep the clicked button's name/value (mood emoji uses this).
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(form, submitter);
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (resetOnSuccess) form.reset();
    });
  }

  return (
    // Fields stay direct children of <form> so `space-y-*` / `gap-*` on
    // className keep working. `inert` blocks a second submit while pending.
    <form
      onSubmit={handleSubmit}
      className={`aria-busy:opacity-60 ${className ?? ""}`}
      aria-busy={pending}
      inert={pending}
    >
      {typeof children === "function" ? children(pending) : children}
      {error ? (
        <p role="alert" className="w-full text-sm text-blush-deep">
          {error}
        </p>
      ) : null}
    </form>
  );
}
