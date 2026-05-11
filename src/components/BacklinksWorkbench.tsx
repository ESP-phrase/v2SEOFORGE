"use client";

import { useState, useTransition } from "react";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StatTile } from "@/components/StatTile";
import {
  findProspectsAction,
  draftEmailAction,
  updateProspectAction,
  deleteProspectAction,
} from "@/actions/outreach";

type Prospect = {
  id: number;
  url: string;
  domain: string;
  pageTitle: string;
  snippet: string;
  searchSeed: string;
  relevanceScore: number;
  scoreReason: string;
  status: string;
  contactEmail: string | null;
  draftSubject: string;
  draftBody: string;
  notes: string;
  targetArticleId: number | null;
  targetArticleTitle: string | null;
};

type Article = { id: number; title: string; wpUrl: string };

const STATUS_FLOW = ["new", "drafted", "sent", "replied", "won", "dead"];

export function BacklinksWorkbench({
  siteId,
  prospects,
  articles,
  stats,
}: {
  siteId: number;
  prospects: Prospect[];
  articles: Article[];
  stats: { total: number; new: number; drafted: number; sent: number; replied: number; won: number };
}) {
  const [seed, setSeed] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [openProspect, setOpenProspect] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  async function handleFind(e: React.FormEvent) {
    e.preventDefault();
    if (!seed.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    const result = await findProspectsAction(siteId, seed.trim());
    setSearching(false);
    if (!result.ok) {
      setSearchError(result.error);
      return;
    }
    setSearchResult(
      `Found ${result.total} prospects (${result.inserted} new, ${result.updated} updated) across ${result.searches} searches · $${result.costUsd.toFixed(3)}`,
    );
    startTransition(() => {
      window.location.reload();
    });
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
        <StatTile value={stats.total} label="Total" />
        <StatTile value={stats.new} label="New" />
        <StatTile value={stats.drafted} label="Drafted" />
        <StatTile value={stats.sent} label="Sent" />
        <StatTile value={stats.replied} label="Replied" />
        <StatTile value={stats.won} label="Linked ✓" />
      </div>

      {/* Search form */}
      <Panel
        title="Find new prospects"
        subtitle="Searches resource-page intent queries (best X resources, top Y blogs, etc.) and AI-scores each result."
      >
        <form onSubmit={handleFind} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[20rem]">
            <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-1.5">
              Seed term
            </label>
            <input
              type="text"
              required
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. resume writing tips"
              disabled={searching}
            />
          </div>
          <Button type="submit" disabled={searching}>
            {searching ? "Searching…" : "Find prospects"}
          </Button>
        </form>
        {searchError ? (
          <div className="mt-3 bg-[rgba(248,113,113,0.12)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-3.5 py-2.5 text-sm">
            {searchError}
          </div>
        ) : null}
        {searchResult ? (
          <div className="mt-3 bg-accent-dim text-accent border border-accent-border rounded-lg px-3.5 py-2.5 text-sm">
            {searchResult} — reloading…
          </div>
        ) : null}
        <p className="text-muted-2 text-xs mt-3">
          Uses 5 SerpApi credits per seed search. Then Claude Haiku ranks each prospect (~$0.003).
        </p>
      </Panel>

      {/* Prospects table */}
      <Panel
        title="Prospects"
        subtitle={
          articles.length === 0
            ? "Publish at least one article before drafting emails — they need a URL to pitch."
            : `${prospects.length} total · click any row to expand and draft an outreach email`
        }
      >
        {prospects.length === 0 ? (
          <div className="py-10 text-center text-muted text-sm">
            No prospects yet. Run a search above with your article&apos;s topic as the seed.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th>Score</Th>
                <Th>Domain &amp; page</Th>
                <Th>Status</Th>
                <Th>Target article</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => {
                const isOpen = openProspect === p.id;
                const scoreClass =
                  p.relevanceScore >= 70
                    ? "bg-[rgba(74,222,128,0.15)] text-success"
                    : p.relevanceScore >= 40
                      ? "bg-[rgba(251,191,36,0.15)] text-warning"
                      : "bg-[rgba(248,113,113,0.15)] text-danger";
                return (
                  <>
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-surface-2 cursor-pointer"
                      onClick={() => setOpenProspect(isOpen ? null : p.id)}
                    >
                      <Td>
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[0.75rem] ${scoreClass}`}>
                          {p.relevanceScore}
                        </span>
                      </Td>
                      <Td>
                        <div className="font-semibold text-text">{p.domain}</div>
                        <div className="text-muted text-xs truncate max-w-[28rem]">{p.pageTitle}</div>
                      </Td>
                      <Td>
                        <Pill status={p.status === "won" ? "published" : p.status === "dead" ? "failed" : p.status === "sent" || p.status === "replied" ? "draft" : "queued"}>
                          {p.status}
                        </Pill>
                      </Td>
                      <Td muted>{p.targetArticleTitle ?? "—"}</Td>
                      <Td align="right">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          visit ↗
                        </a>
                      </Td>
                    </tr>
                    {isOpen ? (
                      <tr key={`${p.id}-detail`}>
                        <td colSpan={5} className="bg-bg-2 border-b border-border">
                          <ProspectDetail
                            prospect={p}
                            articles={articles}
                            onClose={() => setOpenProspect(null)}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function ProspectDetail({
  prospect,
  articles,
  onClose,
}: {
  prospect: Prospect;
  articles: Article[];
  onClose: () => void;
}) {
  const [articleId, setArticleId] = useState<number | "">(prospect.targetArticleId ?? "");
  const [subject, setSubject] = useState(prospect.draftSubject);
  const [body, setBody] = useState(prospect.draftBody);
  const [contactEmail, setContactEmail] = useState(prospect.contactEmail ?? "");
  const [notes, setNotes] = useState(prospect.notes ?? "");
  const [status, setStatus] = useState(prospect.status);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  async function handleDraft() {
    if (articleId === "" || !articleId) {
      setError("Pick an article first.");
      return;
    }
    setDrafting(true);
    setError(null);
    const result = await draftEmailAction(prospect.id, Number(articleId));
    setDrafting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSubject(result.subject);
    setBody(result.body);
    setStatus("drafted");
  }

  async function handleMarkStatus(next: string) {
    setStatus(next);
    const result = await updateProspectAction(prospect.id, {
      status: next,
      notes,
      contactEmail,
    });
    if (!result.ok) {
      setError(result.error);
    } else {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    }
  }

  async function copyEmail() {
    const text = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(text);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Snippet + score reason */}
      <div className="bg-surface border border-border rounded-lg p-3">
        <div className="text-muted text-xs">
          <strong className="text-text">Snippet:</strong> {prospect.snippet || "—"}
        </div>
        {prospect.scoreReason ? (
          <div className="text-muted text-xs mt-2">
            <strong className="text-text">Why we scored {prospect.relevanceScore}:</strong>{" "}
            {prospect.scoreReason}
          </div>
        ) : null}
        <div className="text-muted-2 text-[0.7rem] mt-2">
          Surfaced via: <code>{prospect.searchSeed}</code>
        </div>
      </div>

      {/* Draft email pitch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-1.5">
            Pitch this article
          </label>
          <select
            value={articleId}
            onChange={(e) => setArticleId(e.target.value ? Number(e.target.value) : "")}
            disabled={articles.length === 0}
          >
            <option value="">— pick a published article —</option>
            {articles.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          {articles.length === 0 ? (
            <p className="text-warning text-xs mt-2">
              No published articles yet. Publish one first.
            </p>
          ) : null}
          <Button
            type="button"
            onClick={handleDraft}
            disabled={drafting || !articleId}
            className="mt-3"
          >
            {drafting ? "Drafting…" : subject ? "Re-draft email" : "Draft email"}
          </Button>
        </div>
        <div>
          <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-1.5">
            Contact email (optional)
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="editor@example.com"
          />
        </div>
      </div>

      {/* Subject + body */}
      <div>
        <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-1.5">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Draft an email above…"
        />
      </div>
      <div>
        <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-1.5">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Draft an email above…"
          className="!min-h-[12rem]"
          style={{ fontFamily: "inherit" }}
        />
      </div>

      <div>
        <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-1.5">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything you want to remember about this prospect…"
          className="!min-h-[4.5rem]"
        />
      </div>

      {error ? (
        <div className="bg-[rgba(248,113,113,0.12)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-3.5 py-2.5 text-sm">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-border">
        <Button type="button" onClick={copyEmail} variant="secondary" disabled={!subject || !body}>
          Copy email
        </Button>
        <div className="text-muted-2 text-xs ml-2">Status:</div>
        {STATUS_FLOW.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleMarkStatus(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
              status === s
                ? "bg-accent text-black"
                : "bg-surface border border-border text-muted hover:text-text"
            }`}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {savedFlash ? (
            <span className="text-accent text-xs">✓ saved</span>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              if (confirm("Delete this prospect?")) {
                await deleteProspectAction(prospect.id);
                window.location.reload();
              }
            }}
            className="text-danger text-xs"
          >
            delete
          </button>
          <button type="button" onClick={onClose} className="text-muted text-xs">
            close
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className="text-muted font-semibold text-[0.7rem] uppercase tracking-wider py-2.5 px-3 border-b border-border"
      style={{ textAlign: align ?? "left" }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  muted,
}: {
  children: React.ReactNode;
  align?: "right";
  muted?: boolean;
}) {
  return (
    <td
      className={`py-3 px-3 ${muted ? "text-muted text-xs" : ""}`}
      style={{ textAlign: align ?? "left" }}
    >
      {children}
    </td>
  );
}
