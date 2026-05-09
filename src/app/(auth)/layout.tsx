export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 font-extrabold text-lg mb-7">
          <span className="w-[30px] h-[30px] bg-accent text-black rounded-lg grid place-items-center font-black">
            A
          </span>
          <span>auto-seo</span>
        </div>
        {children}
      </div>
    </main>
  );
}
