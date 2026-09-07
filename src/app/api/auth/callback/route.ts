import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/yahoo";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yahooError = searchParams.get("error");

  if (yahooError) {
    const description = searchParams.get("error_description") ?? yahooError;
    console.error("Yahoo returned an OAuth error:", yahooError, description);
    const url = new URL("/", req.url);
    url.searchParams.set("error", description);
    return NextResponse.redirect(url);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get("yahoo_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    console.error("OAuth state/code mismatch", { hasCode: !!code, hasState: !!state, hasStoredState: !!storedState });
    return NextResponse.redirect(new URL("/?error=oauth_failed", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const res = NextResponse.redirect(new URL("/roster", req.url));

    res.cookies.set("yahoo_access_token", tokens.access_token, {
      ...cookieOpts,
      maxAge: tokens.expires_in,
    });
    res.cookies.set("yahoo_refresh_token", tokens.refresh_token, {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.set("yahoo_token_expires", String(Date.now() + tokens.expires_in * 1000), {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.delete("yahoo_oauth_state");

    return res;
  } catch (err) {
    console.error("Yahoo token exchange failed", err);
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", req.url));
  }
}
