import { teamTextColor } from "@/lib/nflTeamColors";
import { positionStyle } from "@/lib/positionStyles";

export type Player = {
  playerKey: string;
  name: string;
  team: string;
  position: string;
  status?: string;
  statusFull?: string;
  imageUrl?: string;
  points?: number;
  actualPoints?: number;
  projectedPoints?: number;
};

export type RosterData = { teamName: string; players: Player[] };

const WARNING_STATUSES = new Set(["Q", "O", "D", "IR"]);

export function RosterView({ data }: { data: RosterData }) {
  const starterPlayers = data.players.filter((p) => p.position !== "BN");
  const starters = starterPlayers.length;
  const bench = data.players.length - starters;

  const hasProjections = starterPlayers.some((p) => p.projectedPoints !== undefined);
  const gamesPlayed = starterPlayers.filter((p) => p.actualPoints !== undefined).length;
  const totalPoints = starterPlayers.reduce((sum, p) => sum + (p.actualPoints ?? 0), 0);
  const totalProjected = starterPlayers.reduce((sum, p) => sum + (p.projectedPoints ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Your Roster
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
          {data.teamName}
        </h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Starters</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{starters}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Bench</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{bench}</p>
        </div>
      </div>

      {hasProjections && (
        <div className="mb-6 flex items-center justify-around rounded-2xl border border-border bg-surface px-4 py-4 text-center">
          <div>
            <p className="text-xs text-muted">Total points</p>
            <p className="mt-1 text-lg font-bold text-foreground">{totalPoints.toFixed(1)}</p>
          </div>
          <div className="h-8 w-px shrink-0 bg-border" aria-hidden />
          <div>
            <p className="text-xs text-muted">Games played</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {gamesPlayed}/{starters}
            </p>
          </div>
          <div className="h-8 w-px shrink-0 bg-border" aria-hidden />
          <div>
            <p className="text-xs text-muted">Projected points</p>
            <p className="mt-1 text-lg font-bold text-foreground">{totalProjected.toFixed(1)}</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {data.players.map((p, i) => (
          <div
            key={p.playerKey}
            className={`flex items-center gap-3 px-4 py-3 ${
              i !== data.players.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: teamTextColor(p.team) }}
              aria-hidden
            />
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- source host varies (Yahoo CDN in prod, placeholder service in mock data)
              <img
                src={p.imageUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full bg-surface-2 object-cover"
              />
            ) : (
              <span className="h-10 w-10 shrink-0 rounded-full bg-surface-2" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{p.name}</p>
              <p className="text-sm text-muted">
                {p.team}
                {p.status && (
                  <span
                    title={p.statusFull ?? p.status}
                    className="inline-flex items-center gap-1"
                  >
                    {" · "}
                    {p.status}
                    {WARNING_STATUSES.has(p.status) && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3 w-3 text-amber-400"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                )}
              </p>
            </div>
            {p.points !== undefined && (
              <div className="shrink-0 text-right">
                <p className="font-semibold text-foreground">{p.points.toFixed(1)}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted">Pts</p>
              </div>
            )}
            <span
              className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${positionStyle(p.position)}`}
            >
              {p.position}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
