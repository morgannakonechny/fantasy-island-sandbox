/* eslint-disable @typescript-eslint/no-explicit-any -- shape is dictated by Yahoo's untyped API response */
import { mergeMeta, findByKey } from "@/lib/yahooParseUtils";

export function deriveLeagueKey(teamKey: string): string {
  return teamKey.replace(/\.t\.\d+$/, "");
}

function logoUrl(meta: Record<string, any>): string | undefined {
  const logo = meta.team_logo;
  if (!logo) return undefined;
  return typeof logo === "string" ? logo : logo.url;
}

function firstManagerNickname(managersField: any): string | undefined {
  if (!managersField) return undefined;
  if (Array.isArray(managersField)) {
    const m = managersField[0];
    return m?.manager?.nickname ?? m?.nickname;
  }
  const first = managersField["0"]?.manager;
  if (!first) return undefined;
  return Array.isArray(first) ? mergeMeta(first).nickname : first.nickname;
}

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

export function extractStandings(response: any): StandingsTeam[] {
  const league = response?.fantasy_content?.league;
  if (!Array.isArray(league)) return [];

  const standingsBlock = findByKey(league, "standings");
  const teamsContainer = standingsBlock?.["0"]?.teams;
  if (!teamsContainer) return [];

  const count = Number(teamsContainer.count ?? 0);
  const teams: StandingsTeam[] = [];

  for (let i = 0; i < count; i++) {
    const entry = teamsContainer[String(i)]?.team;
    if (!entry) continue;

    const meta = mergeMeta(entry[0]);
    const standingsMeta = mergeMeta(findByKey(entry, "team_standings") ?? []);
    const outcomes = standingsMeta.outcome_totals ?? {};
    const pointsFor =
      standingsMeta.points_for !== undefined ? Number(standingsMeta.points_for) : undefined;

    teams.push({
      teamKey: meta.team_key,
      name: meta.name ?? "Unnamed team",
      logoUrl: logoUrl(meta),
      managerName: firstManagerNickname(meta.managers),
      rank: standingsMeta.rank !== undefined ? Number(standingsMeta.rank) : undefined,
      wins: Number(outcomes.wins ?? 0),
      losses: Number(outcomes.losses ?? 0),
      ties: Number(outcomes.ties ?? 0),
      pointsFor: Number.isFinite(pointsFor) ? pointsFor : undefined,
    });
  }

  return teams.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
}

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

export function extractScoreboard(response: any): { week?: string; matchups: Matchup[] } {
  const league = response?.fantasy_content?.league;
  if (!Array.isArray(league)) return { matchups: [] };

  const scoreboardBlock = findByKey(league, "scoreboard");
  const matchupsContainer = scoreboardBlock?.["0"]?.matchups;
  if (!matchupsContainer) return { matchups: [] };

  const count = Number(matchupsContainer.count ?? 0);
  const matchups: Matchup[] = [];
  let week: string | undefined;

  for (let i = 0; i < count; i++) {
    const raw = matchupsContainer[String(i)]?.matchup;
    if (!raw) continue;

    const matchupMeta = Array.isArray(raw) ? mergeMeta(raw) : raw;
    week = matchupMeta.week ?? week;

    const teamsContainer = Array.isArray(raw)
      ? findByKey(raw, "teams")
      : matchupMeta.teams;
    const teamCount = Number(teamsContainer?.count ?? 0);
    const teams: MatchupTeam[] = [];

    for (let j = 0; j < teamCount; j++) {
      const entry = teamsContainer[String(j)]?.team;
      if (!entry) continue;

      const meta = mergeMeta(entry[0]);
      const pointsBlock = findByKey(entry, "team_points") ?? findByKey(entry, "points");
      const points = pointsBlock?.total !== undefined ? Number(pointsBlock.total) : undefined;

      teams.push({
        teamKey: meta.team_key,
        name: meta.name ?? "Unnamed team",
        logoUrl: logoUrl(meta),
        managerName: firstManagerNickname(meta.managers),
        points: Number.isFinite(points) ? points : undefined,
      });
    }

    matchups.push({
      isTied: Boolean(matchupMeta.is_tied),
      winnerTeamKey: matchupMeta.winner_team_key,
      teams,
    });
  }

  return { week, matchups };
}
