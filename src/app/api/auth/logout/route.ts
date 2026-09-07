import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  for (const name of ["yahoo_access_token", "yahoo_refresh_token", "yahoo_token_expires"]) {
    res.cookies.delete(name);
  }
  return res;
}
