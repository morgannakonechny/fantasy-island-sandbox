"use client";

import { useEffect, useState } from "react";
import { ScheduleView, type ScheduleDay } from "@/components/ScheduleView";
import { formatRelativeTime } from "@/lib/relativeTime";

type ScheduleResponse = { teamName: string; days: ScheduleDay[]; fetchedAt?: string };

export default function SchedulePage() {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedule")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((json: ScheduleResponse) => setData(json))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="flex-1 p-8 text-center text-muted">Loading your schedule…</main>;
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-400">Couldn&apos;t load your schedule ({error}).</p>
        <a href="/api/auth/login" className="text-accent underline">
          Sign in again
        </a>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScheduleView teamName={data!.teamName} days={data!.days} homeHref="/roster" />
      {data?.fetchedAt && (
        <p className="pb-4 text-center text-xs text-muted">
          Updated {formatRelativeTime(data.fetchedAt)}
        </p>
      )}
    </div>
  );
}
