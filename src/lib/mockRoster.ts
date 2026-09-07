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
}> = [
  { playerKey: "demo-1", name: "Josh Allen", team: "BUF", position: "QB", points: 24.6 },
  {
    playerKey: "demo-2",
    name: "Christian McCaffrey",
    team: "SF",
    position: "RB",
    status: "Q",
    statusFull: "Questionable — Achilles",
    points: 18.2,
  },
  { playerKey: "demo-3", name: "Bijan Robinson", team: "ATL", position: "RB", points: 16.9 },
  { playerKey: "demo-4", name: "CeeDee Lamb", team: "DAL", position: "WR", points: 15.4 },
  { playerKey: "demo-5", name: "Amon-Ra St. Brown", team: "DET", position: "WR", points: 14.8 },
  { playerKey: "demo-6", name: "Puka Nacua", team: "LAR", position: "WR", points: 13.1 },
  { playerKey: "demo-7", name: "Sam LaPorta", team: "DET", position: "TE", points: 11.7 },
  { playerKey: "demo-8", name: "Rachaad White", team: "TB", position: "W/R/T", points: 9.3 },
  { playerKey: "demo-9", name: "Justin Tucker", team: "BAL", position: "K", points: 8.0 },
  { playerKey: "demo-10", name: "49ers", team: "SF", position: "DEF", points: 7.5 },
  { playerKey: "demo-11", name: "Jayden Reed", team: "GB", position: "BN", points: 10.2 },
  { playerKey: "demo-12", name: "Tank Bigsby", team: "JAX", position: "BN", points: 6.4 },
  { playerKey: "demo-13", name: "Trey McBride", team: "ARI", position: "BN", points: 9.8 },
  {
    playerKey: "demo-14",
    name: "Jaylen Warren",
    team: "PIT",
    position: "BN",
    status: "O",
    statusFull: "Out — Knee",
    points: 4.1,
  },
];

export const mockRoster: RosterData = {
  teamName: "Fantasy Island Dashboard (Demo)",
  players: raw.map((p) => ({ ...p, imageUrl: avatarFor(p.name, p.team) })),
};
