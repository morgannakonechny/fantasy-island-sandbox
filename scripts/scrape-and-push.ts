// The recurring scrape job. Run locally for testing, or by the GitHub
// Actions workflow on a schedule (headless, no interaction).
//
// Session: reuses the storageState exported by yahoo-login-and-capture.mjs.
// In CI, YAHOO_STORAGE_STATE_B64 (a gzip+base64-encoded copy of that file —
// gzip because raw base64 blows past GitHub's 64KB secret size limit) is
// decoded to a temp file; locally it falls back to scratch/storage-state.json.
//
// Scrapes EVERY team's roster (not just one) so the homepage "who am I?"
// picker can show any team's data. Per-team failures carry forward that
// team's last-known-good data rather than blanking it out for a cycle; the
// whole run only aborts (writing nothing) if literally every team fails,
// which is what an expired session or a real markup change looks like.

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
import type { FantasySnapshot, TeamSnapshot } from "../src/lib/upstashSnapshot";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const LEAGUE_ID = process.env.YAHOO_LEAGUE_ID ?? "802000";
const LEAGUE_HOME_URL = `https://football.fantasysports.yahoo.com/f1/${LEAGUE_ID}`;
const rosterUrl = (teamId: string) =>
  `https://football.fantasysports.yahoo.com/f1/${LEAGUE_ID}/${teamId}`;

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

  const redisUrl = process.env.KV_REST_API_URL;
  const redisToken = process.env.KV_REST_API_TOKEN;
  const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

  // Read the previous snapshot so a transient per-team failure this cycle
  // can fall back to last-known-good data for THAT team, instead of the team
  // vanishing from the dashboard for up to 30 minutes over a one-off hiccup.
  let previousTeams: Record<string, TeamSnapshot> = {};
  if (redis) {
    try {
      const raw = await redis.get<FantasySnapshot | string>(SNAPSHOT_KEY);
      const prev: FantasySnapshot | null = raw
        ? typeof raw === "string"
          ? JSON.parse(raw)
          : raw
        : null;
      previousTeams = prev?.teams ?? {};
    } catch (err) {
      console.warn("Couldn't read previous snapshot for fallback purposes:", err);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: storageStatePath });
  const page = await context.newPage();

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

  console.log("Fetching real NFL schedule from ESPN for the roster-day grouping...");
  const teamGames = await fetchWeekTeamGames();

  const teams: Record<string, TeamSnapshot> = {};
  let failures = 0;

  for (const team of standings) {
    const teamId = team.teamKey;
    if (!teamId) {
      console.warn(`  Skipping standings row with no resolvable team id (name: "${team.name}").`);
      failures++;
      continue;
    }
    const url = rosterUrl(teamId);
    try {
      console.log(`Navigating to roster for team ${teamId} (${team.name}): ${url}`);
      await page.goto(url, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(1500);

      if (page.url().includes("login.yahoo.com")) {
        throw new Error("redirected to Yahoo login — session has expired");
      }
      const rosterHtml = await page.content();
      if (!rosterHtml.includes('id="team-roster"')) {
        throw new Error("#team-roster wasn't found — page structure may have changed");
      }
      const players = scrapeRoster(rosterHtml);
      if (players.length === 0) {
        throw new Error(
          "parsed but found zero players — parser likely broken, not a real empty roster"
        );
      }

      const days = buildSchedule(players, teamGames);
      teams[teamId] = { teamName: team.name, players, days };
      console.log(`  Found ${players.length} players for ${team.name}.`);
    } catch (err) {
      failures++;
      const message = err instanceof Error ? err.message : String(err);
      if (previousTeams[teamId]) {
        teams[teamId] = previousTeams[teamId];
        console.warn(
          `  ⚠️  Team ${teamId} (${team.name}) failed this cycle (${message}) — carrying forward last-known-good roster.`
        );
      } else {
        console.warn(
          `  ⚠️  Team ${teamId} (${team.name}) failed this cycle (${message}) — no previous data to fall back to, omitting.`
        );
      }
    }
  }

  await context.close();
  await browser.close();

  // A true systemic problem (expired session, Yahoo markup change) fails on
  // the league-home fetch above, or on literally every team in this loop —
  // both already result in zero successes. One-off per-team hiccups are
  // handled by the carry-forward above, so the only abort condition left is
  // "we have nothing at all to push."
  if (Object.keys(teams).length === 0) {
    fail(
      "Every team's roster scrape failed and no previous data exists to fall back to — not pushing an empty snapshot."
    );
  }
  if (failures > 0) {
    console.warn(`\n⚠️  ${failures} of ${standings.length} teams had a scrape failure this cycle (see warnings above).`);
  }

  const snapshot: FantasySnapshot = {
    fetchedAt: new Date().toISOString(),
    teams,
    league: { standings, week, matchups },
  };

  if (!redis) {
    console.log("\nKV_REST_API_URL/TOKEN not set — skipping push, dry run only.");
    console.log(JSON.stringify(snapshot, null, 2).slice(0, 2000) + "\n...(truncated)");
    return;
  }

  await redis.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
  console.log(
    `\n✅ Pushed snapshot to Upstash (${SNAPSHOT_KEY}) at ${snapshot.fetchedAt} — ${Object.keys(teams).length}/${standings.length} teams.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
