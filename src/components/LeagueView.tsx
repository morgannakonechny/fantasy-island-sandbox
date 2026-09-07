export type StandingsTeam = {
  teamKey: string;
  name: string;
  logoUrl?: string;
  managerName?: string;
  rank?: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor?: number;
};

export type MatchupTeam = {
  teamKey: string;
  name: string;
  logoUrl?: string;
  managerName?: string;
  points?: number;
};

export type Matchup = {
  isTied: boolean;
  winnerTeamKey?: string;
  teams: MatchupTeam[];
};

export type LeagueData = {
  standings: StandingsTeam[];
  week?: string;
  matchups: Matchup[];
};

const PALETTE = ["EF3B3B", "FF8A3D", "3D8BFF", "2FC97D", "C74DFF", "FFC93D", "3DD6D0", "FF4D9E"];

function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function Avatar({ name, teamKey, logoUrl }: { name: string; teamKey: string; logoUrl?: string }) {
  const src =
    logoUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colorFor(teamKey)}&color=fff&bold=true&size=96`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- source host varies (Yahoo CDN in prod, placeholder service in mock data)
    <img src={src} alt="" className="h-9 w-9 shrink-0 rounded-full bg-surface-2 object-cover" />
  );
}

export function LeagueView({ data, homeHref }: { data: LeagueData; homeHref: string }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">League</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Standings</h1>
        </div>
        <a
          href={homeHref}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          Roster
        </a>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-border bg-surface">
        {data.standings.map((t, i) => (
          <div
            key={t.teamKey}
            className={`flex items-center gap-3 px-4 py-3 ${
              i !== data.standings.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="w-5 shrink-0 text-center text-sm font-semibold text-muted">
              {t.rank ?? i + 1}
            </span>
            <Avatar name={t.name} teamKey={t.teamKey} logoUrl={t.logoUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{t.name}</p>
              {t.managerName && <p className="truncate text-sm text-muted">{t.managerName}</p>}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-foreground">
                {t.wins}-{t.losses}
                {t.ties ? `-${t.ties}` : ""}
              </p>
              {t.pointsFor !== undefined && (
                <p className="text-xs text-muted">{t.pointsFor.toFixed(1)} pf</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.matchups.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
            {data.week ? `Week ${data.week} Matchups` : "This Week's Matchups"}
          </h2>
          <div className="space-y-3">
            {data.matchups.map((m, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface p-4"
              >
                {m.teams.map((t) => {
                  const isWinner = m.winnerTeamKey === t.teamKey;
                  return (
                    <div key={t.teamKey} className="flex items-center gap-3 py-1.5">
                      <Avatar name={t.name} teamKey={t.teamKey} logoUrl={t.logoUrl} />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-medium ${isWinner ? "text-foreground" : "text-muted"}`}
                        >
                          {t.name}
                        </p>
                      </div>
                      <p
                        className={`shrink-0 font-semibold ${isWinner ? "text-accent" : "text-muted"}`}
                      >
                        {t.points !== undefined ? t.points.toFixed(1) : "--"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
