"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RosterView, type RosterData } from "@/components/RosterView";
import { AppHeader } from "@/components/AppHeader";
import { formatRelativeTime } from "@/lib/relativeTime";

type RosterResponse = RosterData & { fetchedAt?: string };

export default function RosterPage() {
  const [data, setData] = useState<RosterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/roster")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((json: RosterResponse) => setData(json))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const scrapedModeError = error === "no_data_yet" || error === "no_team_selected";
  const scrapedMode = Boolean(data?.fetchedAt) || scrapedModeError;
  const logoutHref = scrapedMode ? "/api/select-team?clear=1" : "/api/auth/logout";

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader current="roster" logoutHref={logoutHref} />

      {loading ? (
        <main className="flex-1 p-8 text-center text-muted">Loading your roster…</main>
      ) : error ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-red-400">
            {error === "no_team_selected"
              ? "Pick your team first."
              : error === "no_data_yet"
                ? "No data yet — the scraper hasn't run yet. Check back in a bit."
                : `Couldn't load your roster (${error}).`}
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
          <RosterView data={data!} />
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
