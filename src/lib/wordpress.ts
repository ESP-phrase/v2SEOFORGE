/**
 * WordPress REST API publisher. Handles category/tag taxonomy creation.
 */
import { decrypt } from "@/lib/encryption";

export type SiteCreds = {
  wpUrl: string;
  wpUsername: string;
  wpAppPasswordEnc: string;
};

export type PublishStatus = "draft" | "publish" | "private" | "pending";

export type ArticlePayload = {
  title: string;
  slug: string;
  html: string;
  meta_description: string;
  category?: string;
  tags?: string[];
};

function authHeader(site: SiteCreds): string {
  const password = decrypt(site.wpAppPasswordEnc);
  const token = Buffer.from(`${site.wpUsername}:${password}`).toString("base64");
  return `Basic ${token}`;
}

function base(site: SiteCreds): string {
  return `${site.wpUrl.replace(/\/+$/, "")}/wp-json/wp/v2`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function ensureTerm(
  site: SiteCreds,
  taxonomy: "categories" | "tags",
  name: string,
): Promise<number | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugify(trimmed);
  const headers = { Authorization: authHeader(site), "Content-Type": "application/json" };

  // Existing?
  const lookup = await fetch(`${base(site)}/${taxonomy}?slug=${encodeURIComponent(slug)}`, {
    headers,
    cache: "no-store",
  });
  if (lookup.ok) {
    const found = (await lookup.json()) as Array<{ id: number }>;
    if (found.length > 0) return found[0].id;
  }

  const create = await fetch(`${base(site)}/${taxonomy}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: trimmed, slug }),
  });
  if (create.ok) {
    const j = (await create.json()) as { id: number };
    return j.id;
  }
  if (create.status === 400) {
    const body = (await create.json().catch(() => ({}))) as {
      data?: { term_id?: number };
    };
    if (body?.data?.term_id) return body.data.term_id;
    const fallback = await fetch(
      `${base(site)}/${taxonomy}?search=${encodeURIComponent(trimmed)}`,
      { headers, cache: "no-store" },
    );
    if (fallback.ok) {
      const found = (await fallback.json()) as Array<{ id: number }>;
      if (found.length > 0) return found[0].id;
    }
  }
  return null;
}

async function resolveTerms(
  site: SiteCreds,
  taxonomy: "categories" | "tags",
  names: string[],
): Promise<number[]> {
  const ids: number[] = [];
  for (const n of names) {
    const id = await ensureTerm(site, taxonomy, n);
    if (id != null) ids.push(id);
  }
  return ids;
}

export async function publish(
  article: ArticlePayload,
  site: SiteCreds,
  status: PublishStatus,
): Promise<{ id: number; url: string; status: string }> {
  const payload: Record<string, unknown> = {
    title: article.title,
    slug: article.slug,
    content: article.html,
    excerpt: article.meta_description,
    status,
  };

  if (article.category) {
    const ids = await resolveTerms(site, "categories", [article.category]);
    if (ids.length) payload.categories = ids;
  }
  if (article.tags?.length) {
    const ids = await resolveTerms(site, "tags", article.tags);
    if (ids.length) payload.tags = ids;
  }

  const resp = await fetch(`${base(site)}/posts`, {
    method: "POST",
    headers: { Authorization: authHeader(site), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`WordPress publish failed (${resp.status}): ${text.slice(0, 300)}`);
  }
  const j = (await resp.json()) as { id: number; link?: string; status?: string };
  return { id: j.id, url: j.link ?? "", status: j.status ?? status };
}

export async function updatePostHtml(
  postId: number,
  html: string,
  site: SiteCreds,
): Promise<void> {
  const resp = await fetch(`${base(site)}/posts/${postId}`, {
    method: "POST",
    headers: { Authorization: authHeader(site), "Content-Type": "application/json" },
    body: JSON.stringify({ content: html }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`WordPress update failed (${resp.status}): ${text.slice(0, 300)}`);
  }
}

export async function testConnection(site: SiteCreds): Promise<{ ok: boolean; message: string }> {
  try {
    const resp = await fetch(`${base(site)}/users/me`, {
      headers: { Authorization: authHeader(site) },
      cache: "no-store",
    });
    if (resp.ok) {
      const j = (await resp.json()) as { name?: string };
      return { ok: true, message: `OK as ${j.name ?? "?"}` };
    }
    const text = await resp.text();
    return { ok: false, message: `HTTP ${resp.status}: ${text.slice(0, 200)}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}
