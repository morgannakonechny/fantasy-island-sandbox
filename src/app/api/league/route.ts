import { NextRequest, NextResponse } from "next/server";
import { refreshTokens, yahooFantasyGet } from "@/lib/yahoo";
import { extractTeamKey } from "@/lib/parseRoster";
import { deriveLeagueKey, extractStandings, extractScoreboard } from "@/lib/parseLeague";
import { getSnapshot } from "@/lib/upstashSnapshot";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(req: NextRequest) {
  if (process.env.DATA_SOURCE === "scrape") return getScrapedLeague();
  return getLiveLeague(req);
}

async function getScrapedLeague() {
  const { snapshot } = await getSnapshot();
  if (!snapshot) {
    return NextResponse.json({ error: "no_data_yet" }, { status: 503 });
  }
  return NextResponse.json(
    { ...snapshot.league, fetchedAt: snapshot.fetchedAt },
    { headers: { "Cache-Control": "no-store" } }
  );
}

async function getLiveLeague(req: NextRequest) {
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
    const teamsData = await yahooFantasyGet(
      "users;use_login=1/games;game_keys=nfl/teams",
      accessToken
    );
    const teamInfo = extractTeamKey(teamsData);
    if (!teamInfo) {
      return NextResponse.json({ error: "no_team_found" }, { status: 404 });
    }

    const leagueKey = deriveLeagueKey(teamInfo.teamKey);
    const leagueData = await yahooFantasyGet(
      `league/${leagueKey};out=standings,scoreboard`,
      accessToken
    );

    const standings = extractStandings(leagueData);
    const { week, matchups } = extractScoreboard(leagueData);

    const res = NextResponse.json({ standings, week, matchups });

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
    console.error("Failed to fetch league data from Yahoo", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
