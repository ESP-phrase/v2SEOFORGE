"use client";

import { useFormStatus } from "react-dom";

/**
 * Form-aware submit button. Reads useFormStatus from the enclosing <form>
 * so the button disables + shows a spinner while the server action runs.
 *
 * Fixes the rage-click pattern Clarity caught: users hammering "Sign in"
 * because the page looked frozen during the action (no visible state
 * change between click and redirect).
 */
export function SubmitButton({ idleLabel, busyLabel }: { idleLabel: string; busyLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-accent text-black rounded-xl font-extrabold text-sm hover:bg-accent/90 transition-colors relative disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Spinner />
          {busyLabel}
        </>
      ) : (
        <>
          {idleLabel}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="absolute right-4"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
