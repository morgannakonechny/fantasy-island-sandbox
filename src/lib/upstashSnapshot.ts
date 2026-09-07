import { Redis } from "@upstash/redis";
import type { RosterPlayer } from "@/lib/parseRoster";
import type { StandingsTeam, Matchup } from "@/lib/parseLeague";
import type { ScheduleDay } from "@/lib/parseSchedule";

const SNAPSHOT_KEY = "fantasy:latest";
const STALE_AFTER_MS = 90 * 60 * 1000; // 3 missed 30-min scrape cycles

export type FantasySnapshot = {
  fetchedAt: string;
  roster: { teamName: string; players: RosterPlayer[] };
  league: { standings: StandingsTeam[]; week?: string; matchups: Matchup[] };
  schedule: { teamName: string; days: ScheduleDay[] };
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
