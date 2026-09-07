import type { LeagueData } from "@/components/LeagueView";

const teamNames = [
  { name: "Island Boyz", manager: "Morgan" },
  { name: "Gridiron Gurus", manager: "Sam" },
  { name: "Blitz Kids", manager: "Alex" },
  { name: "Pigskin Pirates", manager: "Jordan" },
  { name: "End Zone Elites", manager: "Casey" },
  { name: "Turf Titans", manager: "Riley" },
  { name: "Hail Mary Heroes", manager: "Drew" },
  { name: "Fumble Rumble", manager: "Taylor" },
];

export const mockLeague: LeagueData = {
  week: "1",
  standings: teamNames.map((t, i) => ({
    teamKey: `mock.t.${i + 1}`,
    name: t.name,
    managerName: t.manager,
    rank: i + 1,
    wins: Math.max(0, 8 - i),
    losses: Math.min(8, i),
    ties: 0,
    pointsFor: 1180 - i * 42.3,
  })),
  matchups: [
    {
      isTied: false,
      winnerTeamKey: "mock.t.1",
      teams: [
        {
          teamKey: "mock.t.1",
          name: "Island Boyz",
          managerName: "Morgan",
          points: 128.4,
          projectedPoints: 121.0,
        },
        {
          teamKey: "mock.t.4",
          name: "Pigskin Pirates",
          managerName: "Jordan",
          points: 109.7,
          projectedPoints: 114.6,
        },
      ],
    },
    {
      isTied: false,
      winnerTeamKey: "mock.t.2",
      teams: [
        {
          teamKey: "mock.t.2",
          name: "Gridiron Gurus",
          managerName: "Sam",
          points: 118.9,
          projectedPoints: 108.3,
        },
        {
          teamKey: "mock.t.7",
          name: "Hail Mary Heroes",
          managerName: "Drew",
          points: 96.2,
          projectedPoints: 99.5,
        },
      ],
    },
    {
      isTied: false,
      winnerTeamKey: "mock.t.6",
      teams: [
        {
          teamKey: "mock.t.3",
          name: "Blitz Kids",
          managerName: "Alex",
          points: 101.5,
          projectedPoints: 105.8,
        },
        {
          teamKey: "mock.t.6",
          name: "Turf Titans",
          managerName: "Riley",
          points: 114.3,
          projectedPoints: 110.2,
        },
      ],
    },
    {
      isTied: false,
      winnerTeamKey: "mock.t.5",
      teams: [
        {
          teamKey: "mock.t.5",
          name: "End Zone Elites",
          managerName: "Casey",
          points: 122.1,
          projectedPoints: 118.0,
        },
        {
          teamKey: "mock.t.8",
          name: "Fumble Rumble",
          managerName: "Taylor",
          points: 110.8,
          projectedPoints: 112.4,
        },
      ],
    },
  ],
};
