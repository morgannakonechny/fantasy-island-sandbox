import { NextRequest, NextResponse } from "next/server";
import { getSnapshot, availableTeams, SELECTED_TEAM_COOKIE } from "@/lib/upstashSnapshot";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("clear")) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.delete(SELECTED_TEAM_COOKIE);
    return res;
  }

  const teamId = searchParams.get("teamId");
  if (!teamId) {
    return NextResponse.redirect(new URL("/?error=pick_a_team", req.url));
  }

  const { snapshot } = await getSnapshot();
  const valid = snapshot ? availableTeams(snapshot).some((t) => t.teamId === teamId) : false;
  if (!valid) {
    return NextResponse.redirect(new URL("/?error=unknown_team", req.url));
  }

  const res = NextResponse.redirect(new URL("/roster", req.url));
  res.cookies.set(SELECTED_TEAM_COOKIE, teamId, {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 365, // 1 year — "log in once, stay logged in"
  });
  return res;
}
