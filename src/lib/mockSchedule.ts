import type { ScheduleDay } from "@/components/ScheduleView";
import { mockRoster } from "@/lib/mockRoster";

function player(name: string) {
  const p = mockRoster.players.find((pl) => pl.name === name);
  if (!p) throw new Error(`mock player not found: ${name}`);
  return p;
}

export const mockScheduleDays: ScheduleDay[] = [
  {
    dayName: "MONDAY",
    dateLabel: "August 10",
    sortKey: "2026-08-10",
    players: [
      {
        ...player("Josh Allen"),
        isStarter: true,
        opponent: "MIA",
        isHome: false,
        timeLabel: "5:30 PM",
      },
      {
        ...player("Jayden Reed"),
        isStarter: false,
        opponent: "CHI",
        isHome: true,
        timeLabel: "6:30 PM",
      },
    ],
  },
  {
    dayName: "THURSDAY",
    dateLabel: "August 13",
    sortKey: "2026-08-13",
    players: [],
  },
  {
    dayName: "SATURDAY",
    dateLabel: "August 15",
    sortKey: "2026-08-15",
    players: [
      {
        ...player("Christian McCaffrey"),
        isStarter: true,
        opponent: "SEA",
        isHome: false,
        timeLabel: "3:00 PM",
      },
      {
        ...player("Trey McBride"),
        isStarter: false,
        opponent: "LAR",
        isHome: true,
        timeLabel: "7:00 PM",
      },
    ],
  },
  {
    dayName: "SUNDAY",
    dateLabel: "August 16",
    sortKey: "2026-08-16",
    players: [
      {
        ...player("CeeDee Lamb"),
        isStarter: true,
        opponent: "NYG",
        isHome: true,
        timeLabel: "12:00 PM",
      },
      {
        ...player("Amon-Ra St. Brown"),
        isStarter: true,
        opponent: "GB",
        isHome: false,
        timeLabel: "12:00 PM",
      },
      {
        ...player("Sam LaPorta"),
        isStarter: true,
        opponent: "GB",
        isHome: false,
        timeLabel: "12:00 PM",
      },
      {
        ...player("Tank Bigsby"),
        isStarter: false,
        opponent: "HOU",
        isHome: true,
        timeLabel: "3:05 PM",
      },
    ],
  },
];
