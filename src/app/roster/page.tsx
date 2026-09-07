"use client";

import { useEffect, useState } from "react";
import { RosterView, type RosterData } from "@/components/RosterView";
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

  if (loading) {
    return <main className="flex-1 p-8 text-center text-muted">Loading your roster…</main>;
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-400">Couldn&apos;t load your roster ({error}).</p>
        <a href="/api/auth/login" className="text-accent underline">
          Sign in again
        </a>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <RosterView
        data={data!}
        logoutHref="/api/auth/logout"
        leagueHref="/league"
        scheduleHref="/schedule"
      />
      {data?.fetchedAt && (
        <p className="pb-4 text-center text-xs text-muted">
          Updated {formatRelativeTime(data.fetchedAt)}
        </p>
      )}
    </div>
  );
}
