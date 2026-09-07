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
  projectedPoints?: number;
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

export function LeagueView({ data }: { data: LeagueData }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">League</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
          {data.week ? `Week ${data.week} Matchups` : "This Week's Matchups"}
        </h1>
      </div>

      {data.matchups.length > 0 && (
        <div className="mb-8 space-y-3">
          {data.matchups.map((m, i) => {
            const totalProjected = m.teams.reduce(
              (sum, t) => sum + (t.projectedPoints ?? 0),
              0
            );
            const winPct = (t: MatchupTeam) =>
              totalProjected > 0 && t.projectedPoints !== undefined
                ? Math.round((t.projectedPoints / totalProjected) * 100)
                : undefined;
            const [teamA, teamB] = m.teams;
            const pctA = teamA ? winPct(teamA) : undefined;
            const pctB = teamB ? winPct(teamB) : undefined;

            return (
              <div key={i} className="rounded-xl border border-border bg-surface p-4">
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
                      <div className="shrink-0 text-right">
                        <p
                          className={`font-semibold ${isWinner ? "text-accent" : "text-muted"}`}
                        >
                          {t.points !== undefined ? t.points.toFixed(1) : "--"}
                        </p>
                        {t.projectedPoints !== undefined && (
                          <p className="text-xs text-muted">proj {t.projectedPoints.toFixed(1)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {pctA !== undefined && pctB !== undefined && teamA && teamB && (
                  <div className="mt-3">
                    <div className="flex h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full"
                        style={{ width: `${pctA}%`, backgroundColor: `#${colorFor(teamA.teamKey)}` }}
                      />
                      <div
                        className="h-full"
                        style={{ width: `${pctB}%`, backgroundColor: `#${colorFor(teamB.teamKey)}` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-muted">
                      <span>{pctA}% proj. to win</span>
                      <span>{pctB}% proj. to win</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
        Standings
      </h2>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
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
    </main>
  );
}
