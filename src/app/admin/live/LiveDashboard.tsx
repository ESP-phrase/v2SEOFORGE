"use client";

import { useEffect, useRef, useState } from "react";

type Hop = { path: string; bucket: string; at: number };
type Sess = {
  ipHash: string;
  firstSeen: number;
  lastSeen: number;
  country: string;
  referrer: string;
  bucket: string;
  hops: Hop[];
  pageCount: number;
  userEmail: string | null;
};
type Checkout = {
  id: string;
  amount: number | null;
  currency: string | null;
  status: string | null;
  payment_status: string | null;
  customer_email: string | null;
  created: number;
  metadata_plan: string | null;
};
type Sub = {
  id: string;
  status: string;
  customer: string;
  created: number;
  price_id: string | null;
  amount: number | null;
  trial_end: number | null;
  cancel_at_period_end: boolean;
};
type Signup = {
  id: string;
  email: string;
  createdAt: number;
  lastLogin: number | null;
  plan: string;
  credits: number;
  used: number;
  hasStripe: boolean;
};
type Data = {
  ok: true;
  now: number;
  active: { now_60s: number; min5: number; min30: number };
  sessions: Sess[];
  funnel24h: Record<string, number>;
  geo24h: [string, number][];
  referrers24h: [string, number][];
  signups: Signup[];
  stripeCheckouts: Checkout[];
  stripeSubs: Sub[];
  stripeErr: string | null;
};

const POLL_MS = 5000;

export function LiveDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled || inFlight.current) return;
      inFlight.current = true;
      try {
        const r = await fetch("/admin/live/data", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as Data;
        if (!cancelled) {
          setData(j);
          setErr(null);
          setLastFetch(Date.now());
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        inFlight.current = false;
      }
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-bg text-text grid place-items-center">
        <div className="text-muted text-sm">
          {err ? `Error: ${err}` : "Loading live data…"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
        <header className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
                <span className="relative w-2 h-2 rounded-full bg-accent" />
              </span>
              Mission Control
            </h1>
            <div className="text-muted text-sm mt-1">
              Live traffic + checkout funnel. Polls every {POLL_MS / 1000}s.
            </div>
          </div>
          <div className="text-muted-2 text-xs">
            Last fetch: {new Date(lastFetch).toLocaleTimeString()}
            {err ? <span className="text-danger ml-2">· {err}</span> : null}
          </div>
        </header>

        {/* Active visitor counters */}
        <section className="grid grid-cols-3 gap-4">
          <BigCounter label="Active now (60s)" value={data.active.now_60s} accent />
          <BigCounter label="Last 5 min"        value={data.active.min5} />
          <BigCounter label="Last 30 min"       value={data.active.min30} />
        </section>

        {/* Live visitors — focused list: country → current page · ago */}
        <section className="bg-card-grad border border-border rounded-2xl p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-bold flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
                <span className="relative w-2 h-2 rounded-full bg-accent" />
              </span>
              Live right now
            </h2>
            <div className="text-muted-2 text-xs">last 5 minutes</div>
          </div>
          {data.sessions.filter((s) => data.now - s.lastSeen <= 5 * 60 * 1000).length === 0 ? (
            <div className="text-muted text-sm">Nobody's on the site right now.</div>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.sessions
                .filter((s) => data.now - s.lastSeen <= 5 * 60 * 1000)
                .map((s) => {
                  const currentPath = s.hops[0]?.path ?? "/";
                  return (
                    <li key={s.ipHash} className="flex items-center gap-3 py-2.5">
                      <span className="text-xl shrink-0 w-7 text-center" title={s.country}>
                        {countryFlag(s.country)}
                      </span>
                      <span className="flex-1 min-w-0 flex flex-col">
                        <span className="text-sm text-text font-semibold truncate">
                          {s.userEmail ?? `Anonymous · ${s.country}`}
                        </span>
                        <code className="text-[0.7rem] text-accent font-mono truncate">{currentPath}</code>
                      </span>
                      <span className="text-[0.7rem] text-muted shrink-0">
                        {s.pageCount > 1 ? `${s.pageCount} pages` : "1 page"}
                      </span>
                      <span className="text-[0.7rem] text-muted-2 shrink-0 w-12 text-right">
                        {ago(data.now - s.lastSeen)} ago
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>

        {/* 24h funnel */}
        <section className="bg-card-grad border border-border rounded-2xl p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-bold">24h Funnel (unique visitors per stage)</h2>
            <div className="text-muted text-xs">
              {data.funnel24h.total_uniques ?? 0} uniques · {data.funnel24h.total_pageviews ?? 0} pageviews
            </div>
          </div>
          <FunnelRow data={data.funnel24h} />
        </section>

        {/* Live sessions */}
        <section className="bg-card-grad border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-3">
            Live sessions (last 30 min) — {data.sessions.length}
          </h2>
          {data.sessions.length === 0 ? (
            <div className="text-muted text-sm">No active sessions.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[0.65rem] text-muted-2 uppercase tracking-wider border-b border-border">
                    <th className="text-left py-2 pr-3">User</th>
                    <th className="text-left py-2 pr-3">Geo</th>
                    <th className="text-left py-2 pr-3">Referrer</th>
                    <th className="text-left py-2 pr-3">Current</th>
                    <th className="text-left py-2 pr-3">Path trail (newest→)</th>
                    <th className="text-right py-2 pr-3">Pages</th>
                    <th className="text-right py-2">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map((s) => (
                    <tr key={s.ipHash} className="border-b border-border/40">
                      <td className="py-2 pr-3 text-[0.7rem]">
                        {s.userEmail ?? <span className="text-muted-2 font-mono">anon · {s.ipHash.slice(0, 6)}</span>}
                      </td>
                      <td className="py-2 pr-3 text-[0.7rem]">{s.country}</td>
                      <td className="py-2 pr-3 text-[0.7rem] text-muted truncate max-w-[140px]">{trimRef(s.referrer)}</td>
                      <td className="py-2 pr-3"><BucketPill bucket={s.bucket} /></td>
                      <td className="py-2 pr-3 text-[0.7rem] text-muted">
                        <div className="flex gap-1 flex-wrap">
                          {s.hops.map((h, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-surface-2 rounded text-text/80 font-mono">
                              {h.path}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-right text-[0.7rem]">{s.pageCount}</td>
                      <td className="py-2 text-right text-[0.7rem] text-muted-2">{ago(data.now - s.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Two-column: signups + Stripe */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card-grad border border-border rounded-2xl p-5">
            <h2 className="font-bold mb-3">Signups (last 7 days) — {data.signups.length}</h2>
            {data.signups.length === 0 ? (
              <div className="text-muted text-sm">No recent signups.</div>
            ) : (
              <div className="space-y-2">
                {data.signups.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm border-b border-border/40 pb-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{u.email}</div>
                      <div className="text-muted text-[0.65rem]">
                        plan <span className="text-text font-mono">{u.plan}</span> · {u.used}/{u.credits} credits · {u.hasStripe ? "has Stripe" : "no Stripe"}
                      </div>
                    </div>
                    <div className="text-muted-2 text-[0.65rem] ml-3 shrink-0 text-right">
                      <div>{new Date(u.createdAt).toLocaleString()}</div>
                      {u.lastLogin ? <div>last in: {ago(data.now - u.lastLogin)} ago</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card-grad border border-border rounded-2xl p-5">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              Stripe — checkouts + subs
              {data.stripeErr ? <span className="text-danger text-[0.65rem] font-normal">({data.stripeErr.slice(0, 80)})</span> : null}
            </h2>
            <div className="text-[0.7rem] text-muted-2 uppercase tracking-wider mb-2">Recent checkouts</div>
            {data.stripeCheckouts.length === 0 ? (
              <div className="text-muted text-sm mb-4">None yet.</div>
            ) : (
              <div className="space-y-1.5 mb-4">
                {data.stripeCheckouts.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-[0.75rem] border-b border-border/30 pb-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider ${stripeStatusCls(c.payment_status)}`}>
                      {c.payment_status ?? c.status ?? "?"}
                    </span>
                    <span className="font-mono text-[0.65rem] text-muted-2">{c.metadata_plan ?? "—"}</span>
                    <span className="flex-1 truncate text-text">{c.customer_email ?? "(no email)"}</span>
                    <span className="text-muted">{fmtAmount(c.amount, c.currency)}</span>
                    <span className="text-muted-2 text-[0.6rem]">{ago(data.now - c.created)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="text-[0.7rem] text-muted-2 uppercase tracking-wider mb-2">Active subs</div>
            {data.stripeSubs.length === 0 ? (
              <div className="text-muted text-sm">None.</div>
            ) : (
              <div className="space-y-1.5">
                {data.stripeSubs.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-[0.75rem] border-b border-border/30 pb-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider ${subStatusCls(s.status)}`}>
                      {s.status}
                    </span>
                    <span className="font-mono text-[0.65rem] text-muted-2 truncate max-w-[160px]">{s.customer}</span>
                    <span className="flex-1 text-muted text-[0.65rem] truncate">{s.price_id ?? "—"}</span>
                    <span className="text-muted">{fmtAmount(s.amount, "usd")}/mo</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Geo + Referrers */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card-grad border border-border rounded-2xl p-5">
            <h2 className="font-bold mb-3">Geo (24h pageviews)</h2>
            <BreakdownList rows={data.geo24h} />
          </div>
          <div className="bg-card-grad border border-border rounded-2xl p-5">
            <h2 className="font-bold mb-3">Referrers (24h)</h2>
            <BreakdownList rows={data.referrers24h} />
          </div>
        </section>
      </div>
    </div>
  );
}

function BigCounter({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${accent ? "bg-accent-dim border border-accent-border" : "bg-card-grad border border-border"}`}>
      <div className="text-muted text-[0.65rem] uppercase tracking-wider font-bold">{label}</div>
      <div className={`text-4xl font-extrabold tracking-tight mt-1 ${accent ? "text-accent" : "text-text"}`}>{value}</div>
    </div>
  );
}

function FunnelRow({ data }: { data: Record<string, number> }) {
  const order = ["homepage", "features", "pricing", "login", "signup", "dashboard", "billing"];
  const max = Math.max(1, ...order.map((k) => data[k] ?? 0));
  return (
    <div className="grid grid-cols-7 gap-2">
      {order.map((k) => {
        const v = data[k] ?? 0;
        const pct = (v / max) * 100;
        return (
          <div key={k} className="flex flex-col items-stretch">
            <div className="text-[0.65rem] text-muted uppercase tracking-wider font-bold text-center mb-1">{k}</div>
            <div className="h-20 bg-surface-2 rounded relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-accent/30 border-t-2 border-accent transition-all"
                style={{ height: `${pct}%` }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-text font-extrabold text-lg">{v}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BucketPill({ bucket }: { bucket: string }) {
  const cls =
    bucket === "pricing" || bucket === "signup" || bucket === "billing"
      ? "bg-accent-dim text-accent border border-accent-border"
      : "bg-surface-2 text-text border border-border";
  return <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider ${cls}`}>{bucket}</span>;
}

function BreakdownList({ rows }: { rows: [string, number][] }) {
  if (rows.length === 0) return <div className="text-muted text-sm">No data.</div>;
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="space-y-1.5">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center gap-3 text-sm">
          <div className="w-28 truncate text-muted text-[0.75rem]">{k}</div>
          <div className="flex-1 h-2 bg-surface-2 rounded overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <div className="w-10 text-right text-text font-mono text-[0.7rem]">{v}</div>
        </div>
      ))}
    </div>
  );
}

function countryFlag(code: string): string {
  // Convert ISO-3166 2-letter country code to flag emoji via regional indicators.
  // Returns a globe for unknown / "—".
  if (!code || code.length !== 2 || /[^A-Za-z]/.test(code)) return "🌐";
  const base = 0x1F1E6;
  return String.fromCodePoint(
    base + (code.toUpperCase().charCodeAt(0) - 65),
    base + (code.toUpperCase().charCodeAt(1) - 65),
  );
}

function trimRef(r: string): string {
  if (!r || r === "—") return "direct";
  return r.replace(/^https?:\/\//, "").split("/")[0];
}

function ago(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

function fmtAmount(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const sign = (currency ?? "usd").toLowerCase() === "usd" ? "$" : "";
  return `${sign}${(amount / 100).toFixed(2)}`;
}

function stripeStatusCls(s: string | null): string {
  if (s === "paid") return "bg-accent-dim text-accent border border-accent-border";
  if (s === "unpaid" || s === "no_payment_required") return "bg-tile-amber/15 text-tile-amber border border-tile-amber/30";
  if (s === "failed") return "bg-danger/15 text-danger border border-danger/30";
  return "bg-surface-2 text-muted border border-border";
}

function subStatusCls(s: string): string {
  if (s === "active" || s === "trialing") return "bg-accent-dim text-accent border border-accent-border";
  if (s === "past_due" || s === "incomplete") return "bg-tile-amber/15 text-tile-amber border border-tile-amber/30";
  if (s === "canceled" || s === "unpaid") return "bg-danger/15 text-danger border border-danger/30";
  return "bg-surface-2 text-muted border border-border";
}
