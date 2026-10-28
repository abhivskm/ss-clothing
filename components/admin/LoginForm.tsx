"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Password</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1 w-full border border-line px-3 py-2.5 focus:border-ink"
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="w-full bg-ink py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60">
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
