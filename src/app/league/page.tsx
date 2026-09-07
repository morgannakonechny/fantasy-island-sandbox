"use client";

import { useEffect, useState } from "react";
import { LeagueView, type LeagueData } from "@/components/LeagueView";
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

  if (loading) {
    return <main className="flex-1 p-8 text-center text-muted">Loading your league…</main>;
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-400">Couldn&apos;t load your league ({error}).</p>
        <a href="/api/auth/login" className="text-accent underline">
          Sign in again
        </a>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <LeagueView data={data!} homeHref="/roster" />
      {data?.fetchedAt && (
        <p className="pb-4 text-center text-xs text-muted">
          Updated {formatRelativeTime(data.fetchedAt)}
        </p>
      )}
    </div>
  );
}
