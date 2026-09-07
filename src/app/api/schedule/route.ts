import { NextRequest, NextResponse } from "next/server";
import { refreshTokens, yahooFantasyGet } from "@/lib/yahoo";
import { extractTeamKey, extractRoster } from "@/lib/parseRoster";
import { fetchWeekTeamGames } from "@/lib/espnSchedule";
import { buildSchedule } from "@/lib/parseSchedule";
import { getSnapshot } from "@/lib/upstashSnapshot";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(req: NextRequest) {
  if (process.env.DATA_SOURCE === "scrape") return getScrapedSchedule();
  return getLiveSchedule(req);
}

async function getScrapedSchedule() {
  const { snapshot } = await getSnapshot();
  if (!snapshot) {
    return NextResponse.json({ error: "no_data_yet" }, { status: 503 });
  }
  return NextResponse.json(
    { ...snapshot.schedule, fetchedAt: snapshot.fetchedAt },
    { headers: { "Cache-Control": "no-store" } }
  );
}

async function getLiveSchedule(req: NextRequest) {
  let accessToken = req.cookies.get("yahoo_access_token")?.value;
  const refreshToken = req.cookies.get("yahoo_refresh_token")?.value;
  const expiresAt = Number(req.cookies.get("yahoo_token_expires")?.value ?? 0);

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let refreshed: Awaited<ReturnType<typeof refreshTokens>> | null = null;
  if ((!accessToken || Date.now() > expiresAt - 60_000) && refreshToken) {
    try {
      refreshed = await refreshTokens(refreshToken);
      accessToken = refreshed.access_token;
    } catch (err) {
      console.error("Yahoo token refresh failed", err);
      return NextResponse.json({ error: "session_expired" }, { status: 401 });
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    const [teamsData, teamGames] = await Promise.all([
      yahooFantasyGet("users;use_login=1/games;game_keys=nfl/teams", accessToken),
      fetchWeekTeamGames(),
    ]);

    const teamInfo = extractTeamKey(teamsData);
    if (!teamInfo) {
      return NextResponse.json({ error: "no_team_found" }, { status: 404 });
    }

    const rosterData = await yahooFantasyGet(`team/${teamInfo.teamKey}/roster`, accessToken);
    const players = extractRoster(rosterData);
    const days = buildSchedule(players, teamGames);

    const res = NextResponse.json({ teamName: teamInfo.teamName, days });

    if (refreshed) {
      res.cookies.set("yahoo_access_token", refreshed.access_token, {
        ...cookieOpts,
        maxAge: refreshed.expires_in,
      });
      res.cookies.set("yahoo_refresh_token", refreshed.refresh_token, {
        ...cookieOpts,
        maxAge: 60 * 60 * 24 * 30,
      });
      res.cookies.set(
        "yahoo_token_expires",
        String(Date.now() + refreshed.expires_in * 1000),
        { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 }
      );
    }

    return res;
  } catch (err) {
    console.error("Failed to build schedule", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
