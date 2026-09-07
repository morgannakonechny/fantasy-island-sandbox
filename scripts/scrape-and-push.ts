// The recurring scrape job. Run locally for testing, or by the GitHub
// Actions workflow on a schedule (headless, no interaction).
//
// Session: reuses the storageState exported by yahoo-login-and-capture.mjs.
// In CI, YAHOO_STORAGE_STATE_B64 (a gzip+base64-encoded copy of that file —
// gzip because raw base64 blows past GitHub's 64KB secret size limit) is
// decoded to a temp file; locally it falls back to scratch/storage-state.json.
//
// Fails loudly and writes nothing to Upstash if the scrape doesn't look
// right (redirected to login, expected content missing) — see FAILURE
// DETECTION below. A stale-but-good last snapshot beats a fresh bad one.

import { chromium } from "playwright";
import { Redis } from "@upstash/redis";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

import { scrapeRoster, scrapeStandings, scrapeMatchups } from "../src/lib/scrapeYahoo";
import { fetchWeekTeamGames } from "../src/lib/espnSchedule";
import { buildSchedule } from "../src/lib/parseSchedule";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const LEAGUE_ID = process.env.YAHOO_LEAGUE_ID ?? "802000";
const TEAM_ID = process.env.YAHOO_TEAM_ID ?? "8";
const ROSTER_URL = `https://football.fantasysports.yahoo.com/f1/${LEAGUE_ID}/${TEAM_ID}`;
const LEAGUE_HOME_URL = `https://football.fantasysports.yahoo.com/f1/${LEAGUE_ID}`;

const SNAPSHOT_KEY = "fantasy:latest";

function resolveStorageStatePath(): string {
  const b64 = process.env.YAHOO_STORAGE_STATE_B64;
  if (b64) {
    const compressed = Buffer.from(b64, "base64");
    const json = zlib.gunzipSync(compressed);
    const tmpPath = path.join(os.tmpdir(), `yahoo-storage-state-${Date.now()}.json`);
    fs.writeFileSync(tmpPath, json);
    return tmpPath;
  }
  const localPath = path.join(root, "scratch", "storage-state.json");
  if (!fs.existsSync(localPath)) {
    throw new Error(
      `No session found. Set YAHOO_STORAGE_STATE_B64, or run scripts/yahoo-login-and-capture.mjs ` +
        `locally first to create ${localPath}.`
    );
  }
  return localPath;
}

function fail(message: string): never {
  console.error(`\n❌ ${message}\n`);
  console.error(
    "This usually means the Yahoo session expired, or Yahoo changed their page structure.\n" +
      "Fix: re-run `node scripts/yahoo-login-and-capture.mjs` locally, re-export storage-state.json,\n" +
      "then update the YAHOO_STORAGE_STATE GitHub secret. Not touching Upstash — last good snapshot stays live."
  );
  process.exit(1);
}

async function main() {
  const storageStatePath = resolveStorageStatePath();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: storageStatePath });
  const page = await context.newPage();

  console.log(`Navigating to roster: ${ROSTER_URL}`);
  await page.goto(ROSTER_URL, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(1500);

  if (page.url().includes("login.yahoo.com")) {
    fail("Redirected to Yahoo login — session has expired.");
  }
  const rosterHtml = await page.content();
  if (!rosterHtml.includes('id="team-roster"')) {
    fail("Roster page loaded but #team-roster wasn't found — page structure may have changed.");
  }
  const players = scrapeRoster(rosterHtml);
  if (players.length === 0) {
    fail("Roster page parsed but found zero players — parser likely broken, not a real empty roster.");
  }
  console.log(`  Found ${players.length} players.`);

  console.log(`Navigating to league home: ${LEAGUE_HOME_URL}`);
  await page.goto(LEAGUE_HOME_URL, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(1500);

  if (page.url().includes("login.yahoo.com")) {
    fail("Redirected to Yahoo login while loading league home — session has expired.");
  }
  const leagueHtml = await page.content();
  if (!leagueHtml.includes('id="standingstable"')) {
    fail("League home loaded but #standingstable wasn't found — page structure may have changed.");
  }
  const standings = scrapeStandings(leagueHtml);
  if (standings.length === 0) {
    fail("League home parsed but found zero standings rows — parser likely broken.");
  }
  const { week, matchups } = scrapeMatchups(leagueHtml);
  console.log(`  Found ${standings.length} teams, ${matchups.length} matchups (week ${week ?? "?"}).`);

  await context.close();
  await browser.close();

  console.log("Fetching real NFL schedule from ESPN for the roster-day grouping...");
  const teamGames = await fetchWeekTeamGames();
  const days = buildSchedule(players, teamGames);

  const myTeamName =
    standings.find((t) => t.teamKey === TEAM_ID)?.name ?? "My Team";

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    roster: { teamName: myTeamName, players },
    league: { standings, week, matchups },
    schedule: { teamName: myTeamName, days },
  };

  const redisUrl = process.env.KV_REST_API_URL;
  const redisToken = process.env.KV_REST_API_TOKEN;
  if (!redisUrl || !redisToken) {
    console.log("\nKV_REST_API_URL/TOKEN not set — skipping push, dry run only.");
    console.log(JSON.stringify(snapshot, null, 2).slice(0, 2000) + "\n...(truncated)");
    return;
  }

  const redis = new Redis({ url: redisUrl, token: redisToken });
  await redis.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
  console.log(`\n✅ Pushed snapshot to Upstash (${SNAPSHOT_KEY}) at ${snapshot.fetchedAt}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
