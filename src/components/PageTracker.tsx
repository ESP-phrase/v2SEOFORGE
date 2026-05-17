"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Marketing-site pageview beacon. Fires once on mount and once per route
 * change. Uses navigator.sendBeacon when available so we still log the hit
 * even if the user navigates away before the request returns. Server stores
 * the row in PageView with siteId=null (the marker for "our own site, not a
 * customer's WordPress install") — that's how /admin/live filters.
 */
export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = window.location.origin + pathname + window.location.search;
    const payload = JSON.stringify({ url, referrer: document.referrer });
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
        return;
      }
    } catch {
      /* fall through to fetch */
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => { /* swallow */ });
  }, [pathname]);

  return null;
}
