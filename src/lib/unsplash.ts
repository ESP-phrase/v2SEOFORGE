/**
 * Unsplash hero-image fetcher.
 *
 * Returns the URL + photographer credit for the first matching image, or
 * null if no API key is set or the search returns nothing. Free demo tier:
 * 50 requests/hour, no card required.
 *
 * Sign up: https://unsplash.com/developers
 */

const ENDPOINT = "https://api.unsplash.com/search/photos";

export type HeroImage = {
  url: string;            // direct image URL (regular size)
  thumb: string;          // tiny preview URL
  alt: string;            // description for alt text
  photographer: string;   // photographer name
  photographerUrl: string; // photographer profile URL
  pageUrl: string;        // URL of the image's page on Unsplash
};

type UnsplashPhoto = {
  urls: { regular: string; thumb: string };
  alt_description: string | null;
  description: string | null;
  user: { name: string; links: { html: string } };
  links: { html: string };
};

type UnsplashSearch = {
  results?: UnsplashPhoto[];
};

export async function fetchHeroImage(query: string): Promise<HeroImage | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return null;

  const params = new URLSearchParams({
    query: trimmed,
    per_page: "5",
    orientation: "landscape",
    content_filter: "high",
  });

  const resp = await fetch(`${ENDPOINT}?${params}`, {
    headers: {
      Authorization: `Client-ID ${key}`,
      "Accept-Version": "v1",
    },
    cache: "no-store",
  });
  if (!resp.ok) return null;
  const data = (await resp.json()) as UnsplashSearch;
  const photo = data.results?.[0];
  if (!photo) return null;

  return {
    url: photo.urls.regular,
    thumb: photo.urls.thumb,
    alt: photo.alt_description ?? photo.description ?? query,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    pageUrl: photo.links.html,
  };
}

/**
 * Renders the hero image as <figure> HTML to inject at the top of an article.
 * Includes attribution per Unsplash's API guidelines.
 */
export function heroImageHtml(image: HeroImage | null): string {
  if (!image) return "";
  const utm = "?utm_source=seoforge&utm_medium=referral";
  return `
<figure class="hero-image" style="margin:0 0 1.5rem">
  <img src="${image.url}" alt="${escapeAttr(image.alt)}" loading="eager" />
  <figcaption style="font-size:0.85em;color:#777;margin-top:0.4rem">
    Photo by <a href="${image.photographerUrl}${utm}" rel="nofollow noopener" target="_blank">${escapeHtml(image.photographer)}</a>
    on <a href="${image.pageUrl}${utm}" rel="nofollow noopener" target="_blank">Unsplash</a>
  </figcaption>
</figure>`.trim();
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
