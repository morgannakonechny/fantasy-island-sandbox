/* eslint-disable @typescript-eslint/no-explicit-any -- shape is dictated by Yahoo's untyped API response */
import { mergeMeta, findByKey } from "@/lib/yahooParseUtils";

export type RosterPlayer = {
  playerKey: string;
  name: string;
  team: string;
  position: string;
  status?: string;
  statusFull?: string;
  imageUrl?: string;
  points?: number;
};

export function extractTeamKey(
  gamesTeamsResponse: any
): { teamKey: string; teamName: string } | null {
  const users = gamesTeamsResponse?.fantasy_content?.users;
  const user = users?.["0"]?.user;
  if (!Array.isArray(user)) return null;

  const gamesContainer = user.find((x: any) => x && x.games)?.games;
  const game = gamesContainer?.["0"]?.game;
  if (!Array.isArray(game)) return null;

  const teamsContainer = game.find((x: any) => x && x.teams)?.teams;
  const teamEntry = teamsContainer?.["0"]?.team;
  if (!teamEntry) return null;

  const meta = mergeMeta(teamEntry[0]);
  if (!meta.team_key) return null;
  return { teamKey: meta.team_key, teamName: meta.name ?? "My Team" };
}

export function extractRoster(rosterResponse: any): RosterPlayer[] {
  const team = rosterResponse?.fantasy_content?.team;
  if (!Array.isArray(team)) return [];

  const rosterContainer = team.find((x: any) => x && x.roster)?.roster;
  const playersContainer = rosterContainer?.["0"]?.players;
  if (!playersContainer) return [];

  const count = Number(playersContainer.count ?? 0);
  const players: RosterPlayer[] = [];

  for (let i = 0; i < count; i++) {
    const entry = playersContainer[String(i)]?.player;
    if (!entry) continue;

    const meta = mergeMeta(entry[0]);
    let position = meta.display_position ?? "";

    const posBlock = findByKey(entry, "selected_position");
    if (posBlock) {
      const posMeta = mergeMeta(posBlock);
      if (posMeta.position) position = posMeta.position;
    }

    const pointsBlock = findByKey(entry, "player_points");
    const points = pointsBlock?.total !== undefined ? Number(pointsBlock.total) : undefined;

    players.push({
      playerKey: meta.player_key,
      name: meta.name?.full ?? "Unknown player",
      team: meta.editorial_team_abbr ?? "",
      position,
      status: meta.status,
      statusFull: meta.status_full,
      imageUrl: meta.image_url,
      points: Number.isFinite(points) ? points : undefined,
    });
  }

  return players;
}
