// ESPN's public scoreboard endpoint — no auth/key required. Undocumented but
// widely relied on; used here only because Yahoo's Fantasy API has no real
// NFL game-schedule data (its "matchup" resources are fantasy-team-vs-fantasy-team,
// not real NFL games). Calling with no query params returns whichever NFL
// week is currently happening in the real world.
const ESPN_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

// Yahoo and ESPN agree on team abbreviations except Washington.
const ABBR_ALIASES: Record<string, string> = {
  WAS: "WSH",
};

export function normalizeTeamAbbr(abbr: string): string {
  const upper = abbr.toUpperCase();
  return ABBR_ALIASES[upper] ?? upper;
}

export type TeamGame = {
  opponent: string;
  isHome: boolean;
  kickoff: string; // ISO 8601
};

export async function fetchWeekTeamGames(): Promise<Record<string, TeamGame>> {
  const res = await fetch(ESPN_SCOREBOARD_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`ESPN scoreboard request failed (${res.status})`);
  }

  const data = await res.json();
  const byTeam: Record<string, TeamGame> = {};

  for (const event of data.events ?? []) {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors ?? [];
    const kickoff = competition?.date ?? event.date;
    if (!kickoff) continue;

    for (const competitor of competitors) {
      const abbr = competitor?.team?.abbreviation;
      if (!abbr) continue;

      const opponentEntry = competitors.find((c: unknown) => c !== competitor);
      const opponentAbbr = opponentEntry?.team?.abbreviation;
      if (!opponentAbbr) continue;

      byTeam[normalizeTeamAbbr(abbr)] = {
        opponent: normalizeTeamAbbr(opponentAbbr),
        isHome: competitor.homeAway === "home",
        kickoff,
      };
    }
  }

  return byTeam;
}
