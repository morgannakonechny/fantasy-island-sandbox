"use client";

import { teamTextColor } from "@/lib/nflTeamColors";
import { positionStyle } from "@/lib/positionStyles";
import { useTheme } from "@/lib/theme";
import type { ScheduleDay } from "@/lib/parseSchedule";

export type { ScheduleDay };

export function ScheduleView({ teamName, days }: { teamName: string; days: ScheduleDay[] }) {
  const { theme } = useTheme();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{teamName}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
          Your Schedule This Week
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day) => (
          <div key={day.sortKey} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-baseline justify-between px-4 pt-4">
              <h2 className="text-lg font-bold tracking-wide text-foreground">{day.dayName}</h2>
              <p className="text-xs text-muted">{day.dateLabel}</p>
            </div>

            {day.players.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">
                No games for your team
              </p>
            ) : (
              <div className="mt-3 divide-y divide-border">
                {day.players.map((p) => (
                  <div key={p.playerKey} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className="h-8 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: teamTextColor(p.team, theme) }}
                      aria-hidden
                    />
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- source host varies (Yahoo CDN in prod, placeholder service in mock data)
                      <img
                        src={p.imageUrl}
                        alt=""
                        className={`h-10 w-10 shrink-0 rounded-full bg-surface-2 object-cover ${p.isStarter ? "" : "opacity-50"}`}
                      />
                    ) : (
                      <span
                        className={`h-10 w-10 shrink-0 rounded-full bg-surface-2 ${p.isStarter ? "" : "opacity-50"}`}
                        aria-hidden
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-medium ${p.isStarter ? "text-foreground" : "text-muted opacity-70"}`}
                      >
                        {p.name}
                      </p>
                      <p className={`text-sm ${p.isStarter ? "text-muted" : "text-muted opacity-60"}`}>
                        <span style={{ color: teamTextColor(p.team, theme) }}>{p.team}</span>
                        {" "}
                        {p.isHome ? "vs" : "@"}{" "}
                        <span style={{ color: teamTextColor(p.opponent, theme) }}>{p.opponent}</span>
                        {" · "}
                        {p.timeLabel}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${positionStyle(p.position)} ${p.isStarter ? "" : "opacity-60"}`}
                    >
                      {p.position}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="pb-4" />
          </div>
        ))}
      </div>
    </main>
  );
}
