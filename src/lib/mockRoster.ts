import type { RosterData } from "@/components/RosterView";
import { teamColor } from "@/lib/nflTeamColors";

function avatarFor(name: string, team: string): string {
  const bg = teamColor(team).replace("#", "");
  const initials = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${initials}&background=${bg}&color=fff&bold=true&size=128`;
}

const raw: Array<{
  playerKey: string;
  name: string;
  team: string;
  position: string;
  status?: string;
  statusFull?: string;
  points: number;
  actualPoints?: number;
  projectedPoints?: number;
}> = [
  {
    playerKey: "demo-1",
    name: "Josh Allen",
    team: "BUF",
    position: "QB",
    points: 24.6,
    actualPoints: 24.6,
    projectedPoints: 22.0,
  },
  {
    playerKey: "demo-2",
    name: "Christian McCaffrey",
    team: "SF",
    position: "RB",
    status: "Q",
    statusFull: "Questionable — Achilles",
    points: 18.2,
    actualPoints: 18.2,
    projectedPoints: 16.5,
  },
  {
    playerKey: "demo-3",
    name: "Bijan Robinson",
    team: "ATL",
    position: "RB",
    points: 16.9,
    actualPoints: 16.9,
    projectedPoints: 15.0,
  },
  {
    playerKey: "demo-4",
    name: "CeeDee Lamb",
    team: "DAL",
    position: "WR",
    points: 15.4,
    actualPoints: 15.4,
    projectedPoints: 14.0,
  },
  {
    playerKey: "demo-5",
    name: "Amon-Ra St. Brown",
    team: "DET",
    position: "WR",
    points: 14.8,
    actualPoints: 14.8,
    projectedPoints: 13.5,
  },
  { playerKey: "demo-6", name: "Puka Nacua", team: "LAR", position: "WR", points: 12.8, projectedPoints: 12.8 },
  { playerKey: "demo-7", name: "Sam LaPorta", team: "DET", position: "TE", points: 10.9, projectedPoints: 10.9 },
  {
    playerKey: "demo-8",
    name: "Rachaad White",
    team: "TB",
    position: "W/R/T",
    points: 9.0,
    projectedPoints: 9.0,
  },
  { playerKey: "demo-9", name: "Justin Tucker", team: "BAL", position: "K", points: 7.8, projectedPoints: 7.8 },
  { playerKey: "demo-10", name: "49ers", team: "SF", position: "DEF", points: 6.5, projectedPoints: 6.5 },
  { playerKey: "demo-11", name: "Jayden Reed", team: "GB", position: "BN", points: 10.2 },
  { playerKey: "demo-12", name: "Tank Bigsby", team: "JAX", position: "BN", points: 6.4 },
  {
    playerKey: "demo-13",
    name: "Trey McBride",
    team: "ARI",
    position: "BN",
    status: "D",
    statusFull: "Doubtful — Hamstring",
    points: 9.8,
  },
  {
    playerKey: "demo-14",
    name: "Jaylen Warren",
    team: "PIT",
    position: "BN",
    status: "IR",
    statusFull: "Injured Reserve — Knee",
    points: 4.1,
  },
];

export const mockRoster: RosterData = {
  teamName: "Fantasy Island Dashboard (Demo)",
  players: raw.map((p) => ({ ...p, imageUrl: avatarFor(p.name, p.team) })),
};
