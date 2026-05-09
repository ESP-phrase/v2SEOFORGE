/**
 * Standalone preview — no sidebar, no sidebar layout. Renders the article
 * HTML in a magazine-style frame. Auth still required (middleware).
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id: Number(id) } });
  if (!article) notFound();

  return (
    <main className="bg-white text-[#1a1a1a] min-h-screen py-10 px-4">
      <article className="max-w-[760px] mx-auto leading-[1.65]">
        <h1 className="text-3xl font-bold mb-1">{article.title}</h1>
        <div className="text-[#666] text-sm mb-8">{article.metaDescription}</div>
        <div
          className="prose-preview"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </article>
      <style>{`
        .prose-preview h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 0.5rem; }
        .prose-preview h3 { font-size: 1.1rem; font-weight: 700; margin: 1.5rem 0 0.4rem; }
        .prose-preview p { margin: 0.7rem 0; }
        .prose-preview ul, .prose-preview ol { margin: 0.7rem 0 0.7rem 1.5rem; }
        .prose-preview a { color: #0a66c2; }
        .prose-preview hr { border: 0; border-top: 1px solid #eee; margin: 2rem 0; }
      `}</style>
    </main>
  );
}
