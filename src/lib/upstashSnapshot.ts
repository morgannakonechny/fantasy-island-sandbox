import { Redis } from "@upstash/redis";
import type { RosterPlayer } from "@/lib/parseRoster";
import type { StandingsTeam, Matchup } from "@/lib/parseLeague";
import type { ScheduleDay } from "@/lib/parseSchedule";

const SNAPSHOT_KEY = "fantasy:latest";
const STALE_AFTER_MS = 90 * 60 * 1000; // 3 missed 30-min scrape cycles

// Long-lived, follows the same httpOnly/secure/sameSite=lax pattern as the
// yahoo_* OAuth cookies. Shared here (not redefined per-route) so a name
// mismatch between call sites can't become a silent "pick your team, get
// redirected, roster page still says pick your team" bug.
export const SELECTED_TEAM_COOKIE = "selected_team_id";

export type TeamSnapshot = {
  teamName: string;
  players: RosterPlayer[];
  days: ScheduleDay[];
};

export type FantasySnapshot = {
  fetchedAt: string;
  teams: Record<string /* teamId, e.g. "8" */, TeamSnapshot>;
  league: { standings: StandingsTeam[]; week?: string; matchups: Matchup[] };
};

let client: Redis | null = null;
function redis(): Redis {
  if (!client) {
    client = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return client;
}

export async function getSnapshot(): Promise<{
  snapshot: FantasySnapshot | null;
  stale: boolean;
}> {
  const raw = await redis().get<FantasySnapshot | string>(SNAPSHOT_KEY);
  if (!raw) return { snapshot: null, stale: false };

  const snapshot: FantasySnapshot = typeof raw === "string" ? JSON.parse(raw) : raw;
  const stale = Date.now() - new Date(snapshot.fetchedAt).getTime() > STALE_AFTER_MS;
  return { snapshot, stale };
}

// Teams the homepage dropdown can offer, and the only IDs /api/select-team
// will accept. Sourced from standings (has rank order + display names) but
// filtered to teams that actually have roster data this cycle — a team can
// be briefly missing from `teams` right after its first-ever scrape attempt
// fails with no previous snapshot to carry forward.
export function availableTeams(
  snapshot: FantasySnapshot
): { teamId: string; name: string }[] {
  return snapshot.league.standings
    .filter((t) => t.teamKey in snapshot.teams)
    .map((t) => ({ teamId: t.teamKey, name: t.name }));
}
