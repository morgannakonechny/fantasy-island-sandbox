import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/yahoo";

export async function GET() {
  const state = randomUUID();
  const res = NextResponse.redirect(getAuthorizationUrl(state));
  res.cookies.set("yahoo_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
