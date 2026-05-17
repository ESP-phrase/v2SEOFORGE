import Link from "next/link";
import {
  signInWithGoogleAction,
  signInWithGitHubAction,
  signInWithPasswordAction,
  signUpAction,
} from "@/actions/auth";
import { isGitHubAuthConfigured } from "@/lib/auth";
import { SubmitButton } from "./SubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string; next?: string }>;
}) {
  const { error, mode, next } = await searchParams;
  const isSignup = mode === "signup";
  const nextPath = next && next.startsWith("/") && !next.startsWith("//") ? next : "";
  const nextQs = nextPath ? `&next=${encodeURIComponent(nextPath)}` : "";
  const oppositeHref = isSignup
    ? `/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`
    : `/login?mode=signup${nextQs}`;

  return (
    <>
      <div className="text-center mb-7">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
          {isSignup ? (
            <>
              <span className="text-text">Start with </span>
              <span className="text-accent">SEOForge</span>
            </>
          ) : (
            <>
              <span className="text-text">Welcome </span>
              <span className="text-accent">back</span>
            </>
          )}
        </h1>
        {isSignup ? (
          <p className="text-muted text-sm mt-2">
            Free 3-day trial · cancel anytime · no contracts
          </p>
        ) : (
          <p className="text-muted text-sm mt-2">Sign in to pick up where you left off.</p>
        )}
      </div>

      <div className="relative">
        {/* lime glow ring */}
        <div
          aria-hidden
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(190,248,72,0.55) 0%, rgba(190,248,72,0.08) 30%, transparent 60%, rgba(190,248,72,0.08) 80%, rgba(190,248,72,0.5) 100%)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: 1,
          }}
        />
        <div className="relative bg-card-grad rounded-2xl p-7 shadow-panel">
          {error ? (
            <div className="bg-[rgba(248,113,113,0.12)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-3.5 py-2.5 mb-4 text-sm">
              {error}
            </div>
          ) : null}

          {/* Primary path: Google OAuth — visually dominant. Clarity recordings
              showed users bouncing at the password form; one-tap Google removes
              the typing friction entirely. */}
          <form action={signInWithGoogleAction}>
            <button
              type="submit"
              className="relative w-full flex items-center justify-center gap-3 px-4 py-4 bg-white text-gray-900 rounded-xl font-bold text-base hover:bg-gray-100 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden>
                <path fill="#4285F4" d="M16.51 8.18c0-.57-.05-1.13-.15-1.66H9v3.13h4.21c-.18.99-.74 1.83-1.58 2.39v1.97h2.55c1.49-1.38 2.34-3.41 2.34-5.83z" />
                <path fill="#34A853" d="M9 17c2.13 0 3.92-.71 5.23-1.92l-2.55-1.97c-.71.47-1.61.75-2.68.75-2.06 0-3.81-1.39-4.43-3.26H1.93v2.04C3.23 15.18 5.92 17 9 17z" />
                <path fill="#FBBC05" d="M4.57 10.6c-.16-.47-.25-.97-.25-1.5 0-.52.09-1.03.25-1.5V5.55H1.93C1.34 6.61 1 7.78 1 9.1c0 1.32.34 2.49.93 3.55l2.64-2.05z" />
                <path fill="#EA4335" d="M9 4.34c1.16 0 2.21.4 3.03 1.18l2.27-2.27C12.92 1.99 11.13 1.2 9 1.2 5.92 1.2 3.23 3.02 1.93 5.55l2.64 2.05C5.19 5.73 6.94 4.34 9 4.34z" />
              </svg>
              {isSignup ? "Continue with Google" : "Sign in with Google"}
              {isSignup ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent text-black text-[0.55rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                  1-tap
                </span>
              ) : null}
            </button>
          </form>

          {/* GitHub — only if configured */}
          {isGitHubAuthConfigured() ? (
            <form action={signInWithGitHubAction} className="mt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1a1a1a] text-white border border-white/10 rounded-xl font-semibold text-sm hover:bg-[#2a2a2a] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Continue with GitHub
              </button>
            </form>
          ) : null}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-2 text-[0.6rem] uppercase tracking-[0.18em] font-bold">
              or use email
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Secondary path: email + password */}
          <form action={isSignup ? signUpAction : signInWithPasswordAction} className="space-y-3">
            {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
            <div className="relative">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full pl-11 pr-3 py-3 bg-bg border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent-border placeholder:text-muted-2"
              />
            </div>
            <div className="relative">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder={isSignup ? "Pick a password (8+ characters)" : "Password"}
                className="w-full pl-11 pr-3 py-3 bg-bg border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent-border placeholder:text-muted-2"
              />
            </div>
            <SubmitButton
              idleLabel={isSignup ? "Create free account" : "Sign in"}
              busyLabel={isSignup ? "Creating account…" : "Signing in…"}
            />
          </form>

          {/* Subtle swap link replaces the old tab toggle that confused users
              into thinking it was the submit button. */}
          <div className="text-center mt-5 text-muted text-xs">
            {isSignup ? "Already have an account? " : "Don't have an account yet? "}
            <Link href={oppositeHref} className="text-accent font-semibold hover:underline no-underline">
              {isSignup ? "Sign in →" : "Sign up free →"}
            </Link>
          </div>
        </div>
      </div>

      {/* Page footer links */}
      <div className="flex items-center justify-center gap-5 text-muted text-xs mt-8">
        <Link href="/privacy" className="hover:text-text no-underline">
          Privacy Policy
        </Link>
        <span className="text-muted-2">•</span>
        <Link href="/terms" className="hover:text-text no-underline">
          Terms of Service
        </Link>
        <span className="text-muted-2">•</span>
        <a href="mailto:aubreynicholsacc@gmail.com" className="hover:text-text no-underline">
          Contact
        </a>
      </div>
    </>
  );
}
