import { redirect } from "next/navigation";
import { hasUsers } from "@/lib/auth";
import { signInAction } from "@/actions/auth";
import { Button } from "@/components/Button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  if (!(await hasUsers())) redirect("/setup");
  const { next, error } = await searchParams;

  return (
    <div className="bg-surface border border-border rounded-xl p-7">
      {error ? (
        <div className="bg-[rgba(255,84,112,0.12)] text-danger border border-[rgba(255,84,112,0.3)] rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          Wrong username or password.
        </div>
      ) : null}
      <h1 className="text-xl font-bold mb-1">Sign in</h1>
      <div className="text-muted text-sm mb-6">auto-seo dashboard</div>
      <form action={signInAction} className="flex flex-col gap-1">
        <input type="hidden" name="next" value={next ?? ""} />
        <label className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3">
          Username
        </label>
        <input type="text" name="username" autoComplete="username" required />
        <label className="text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3">
          Password
        </label>
        <input type="password" name="password" autoComplete="current-password" required />
        <Button type="submit" full className="mt-5">Sign in</Button>
      </form>
    </div>
  );
}
