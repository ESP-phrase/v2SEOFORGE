import { redirect } from "next/navigation";
import { hasUsers } from "@/lib/auth";
import { setupAction } from "@/actions/auth";
import { Button } from "@/components/Button";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await hasUsers()) redirect("/login");
  const { error } = await searchParams;

  return (
    <div className="bg-surface border border-border rounded-xl p-7">
      {error ? (
        <div className="bg-[rgba(255,84,112,0.12)] text-danger border border-[rgba(255,84,112,0.3)] rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      ) : null}
      <h1 className="text-xl font-bold mb-1">Set up auto-seo</h1>
      <div className="text-muted text-sm mb-6">
        Create the admin account. Only one account is supported — there&apos;s no signup beyond this.
      </div>
      <form action={setupAction} className="flex flex-col gap-1">
        <label className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3">
          Username
        </label>
        <input type="text" name="username" autoComplete="username" required minLength={3} />
        <label className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3">
          Password
        </label>
        <input type="password" name="password" autoComplete="new-password" required minLength={8} />
        <label className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3">
          Confirm password
        </label>
        <input type="password" name="password2" autoComplete="new-password" required minLength={8} />
        <Button type="submit" full className="mt-5">Create account</Button>
      </form>
    </div>
  );
}
