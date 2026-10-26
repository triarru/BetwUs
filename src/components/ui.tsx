import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "line";
}) {
  const styles = {
    primary: "bg-blush text-white hover:bg-blush-deep",
    ghost: "bg-transparent text-ink hover:bg-paper-deep",
    line: "bg-white text-ink border border-line hover:bg-paper-deep",
  }[variant];

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50 ${styles} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-ink-soft">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none focus:border-gold"
      />
    </label>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white/70 px-6 py-10 text-center">
      <h2 className="hand text-2xl">{title}</h2>
      <p className="mt-2 text-ink-soft">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageTitle({
  kicker,
  title,
  body,
}: {
  kicker?: string;
  title: string;
  body?: string;
}) {
  return (
    <header className="mb-6 space-y-1">
      {kicker ? (
        <p className="text-xs uppercase tracking-[0.2em] text-gold">{kicker}</p>
      ) : null}
      <h1 className="hand text-3xl leading-tight sm:text-4xl">{title}</h1>
      {body ? <p className="text-ink-soft">{body}</p> : null}
    </header>
  );
}
