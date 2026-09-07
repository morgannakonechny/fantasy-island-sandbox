const AUTH_URL = "https://api.login.yahoo.com/oauth2/request_auth";
const TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token";
const FANTASY_BASE = "https://fantasysports.yahooapis.com/fantasy/v2";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getRedirectUri(): string {
  return requireEnv("YAHOO_REDIRECT_URI");
}

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("YAHOO_CLIENT_ID"),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "fspt-r",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type YahooTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  xoauth_yahoo_guid: string;
};

function basicAuthHeader(): string {
  const id = requireEnv("YAHOO_CLIENT_ID");
  const secret = requireEnv("YAHOO_CLIENT_SECRET");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

async function requestTokens(body: URLSearchParams): Promise<YahooTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Yahoo token request failed (${res.status}): ${text}`);
  }

  return res.json();
}

export function exchangeCodeForTokens(code: string): Promise<YahooTokens> {
  return requestTokens(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
    })
  );
}

export function refreshTokens(refreshToken: string): Promise<YahooTokens> {
  return requestTokens(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  );
}

export async function yahooFantasyGet(path: string, accessToken: string) {
  const url = `${FANTASY_BASE}/${path}${path.includes("?") ? "&" : "?"}format=json`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Yahoo Fantasy API request failed (${res.status}): ${text}`);
  }

  return res.json();
}
