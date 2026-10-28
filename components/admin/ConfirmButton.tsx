"use client";

import { useTransition } from "react";

/** A button that asks "Are you sure?" before running a Server Action. */
export function ConfirmButton({
  action,
  message,
  children,
  className,
}: {
  action: () => Promise<void>;
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(message)) startTransition(action);
      }}
      className={className}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
