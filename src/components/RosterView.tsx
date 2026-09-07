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
};

export type RosterData = { teamName: string; players: Player[] };

export function RosterView({ data }: { data: RosterData }) {
  const starters = data.players.filter((p) => p.position !== "BN").length;
  const bench = data.players.length - starters;

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
                  <span title={p.statusFull ?? p.status}> · {p.status}</span>
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
