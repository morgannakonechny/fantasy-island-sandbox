"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LeagueView, type LeagueData } from "@/components/LeagueView";
import { AppHeader } from "@/components/AppHeader";
import { formatRelativeTime } from "@/lib/relativeTime";

type LeagueResponse = LeagueData & { fetchedAt?: string };

export default function LeaguePage() {
  const [data, setData] = useState<LeagueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/league")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((json: LeagueResponse) => setData(json))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const scrapedModeError = error === "no_data_yet";
  const scrapedMode = Boolean(data?.fetchedAt) || scrapedModeError;
  const logoutHref = scrapedMode ? "/api/select-team?clear=1" : "/api/auth/logout";

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader current="league" logoutHref={logoutHref} />

      {loading ? (
        <main className="flex-1 p-8 text-center text-muted">Loading your league…</main>
      ) : error ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-red-400">
            {error === "no_data_yet"
              ? "No data yet — the scraper hasn't run yet. Check back in a bit."
              : `Couldn't load your league (${error}).`}
          </p>
          {scrapedModeError ? (
            <Link href="/" className="text-accent underline">
              Who am I?
            </Link>
          ) : (
            <a href="/api/auth/login" className="text-accent underline">
              Sign in again
            </a>
          )}
        </main>
      ) : (
        <>
          <LeagueView data={data!} />
          {data?.fetchedAt && (
            <p className="pb-4 text-center text-xs text-muted">
              Updated {formatRelativeTime(data.fetchedAt)}
            </p>
          )}
        </>
      )}
    </div>
  );
}
