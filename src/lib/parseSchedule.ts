import type { RosterPlayer } from "@/lib/parseRoster";
import { normalizeTeamAbbr, type TeamGame } from "@/lib/espnSchedule";

const CT_ZONE = "America/Chicago";

function dayParts(iso: string) {
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: CT_ZONE,
    weekday: "long",
  })
    .format(date)
    .toUpperCase();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: CT_ZONE,
    month: "long",
    day: "numeric",
  }).format(date);
  // YYYY-MM-DD in CT, used purely for chronological sorting/grouping
  const sortKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: CT_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: CT_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return { weekday, dateLabel, sortKey, timeLabel };
}

export type ScheduleEntry = RosterPlayer & {
  isStarter: boolean;
  opponent: string;
  isHome: boolean;
  timeLabel: string;
};

export type ScheduleDay = {
  dayName: string;
  dateLabel: string;
  sortKey: string;
  players: ScheduleEntry[];
};

export function buildSchedule(
  players: RosterPlayer[],
  teamGames: Record<string, TeamGame>
): ScheduleDay[] {
  const days = new Map<string, ScheduleDay>();

  // Seed every day that has at least one real NFL game this week, so days
  // with zero of the user's players (but real games happening) still show up.
  for (const game of Object.values(teamGames)) {
    const { weekday, dateLabel, sortKey } = dayParts(game.kickoff);
    if (!days.has(sortKey)) {
      days.set(sortKey, { dayName: weekday, dateLabel, sortKey, players: [] });
    }
  }

  for (const player of players) {
    const game = teamGames[normalizeTeamAbbr(player.team)];
    if (!game) continue; // bye week or team not found this cycle

    const { sortKey, timeLabel } = dayParts(game.kickoff);
    const day = days.get(sortKey);
    if (!day) continue;

    day.players.push({
      ...player,
      isStarter: player.position !== "BN",
      opponent: game.opponent,
      isHome: game.isHome,
      timeLabel,
    });
  }

  for (const day of days.values()) {
    day.players.sort((a, b) => Number(b.isStarter) - Number(a.isStarter));
  }

  return Array.from(days.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
