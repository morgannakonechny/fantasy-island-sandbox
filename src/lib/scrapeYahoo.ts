// Parses Yahoo Fantasy Football's classic server-rendered HTML pages into the
// same shapes the app already uses (RosterPlayer / StandingsTeam / Matchup).
//
// Built against real captured HTML from a live Yahoo Fantasy account (this
// is legacy server-rendered markup, not a React SPA — no JSON hydration blob
// to parse instead). Selectors key off stable-looking attributes
// (data-ys-playerid, data-pos, data-target, distinctive classes like
// "Tst-wlt"/"pts") rather than generic utility class names where possible,
// but this WILL break if Yahoo changes their markup — see the explicit
// sanity checks in scripts/scrape-and-push.ts that fail loudly rather than
// silently pushing empty/wrong data when that happens.

import * as cheerio from "cheerio";
import type { RosterPlayer } from "@/lib/parseRoster";
import type { StandingsTeam, Matchup, MatchupTeam } from "@/lib/parseLeague";

function parseNum(text: string): number | undefined {
  const n = Number.parseFloat(text);
  return Number.isFinite(n) ? n : undefined;
}

export function scrapeRoster(html: string): RosterPlayer[] {
  const $ = cheerio.load(html);
  const players: RosterPlayer[] = [];

  // Your OWN roster is the editable view: data-pos lives on the <tr> itself
  // (plus swap-target/dropdown attributes for the lineup editor). Any OTHER
  // team's roster is read-only and has no data-pos on the row at all — the
  // position only shows up on an inner <span class="pos-label" data-pos="...">.
  // Select on rows containing a player link either way, and try the <tr>
  // attribute first, falling back to the inner pos-label span.
  $("#team-roster tr").each((_, el) => {
    const row = $(el);
    const nameLink = row.find("a[data-ys-playerid]").first();
    if (nameLink.length === 0) return; // header row, or an empty/unfilled slot

    const playerKey = nameLink.attr("data-ys-playerid") ?? "";
    const name = nameLink.attr("title")?.trim() || nameLink.text().trim() || "Unknown player";
    const rawPosition = row.attr("data-pos") ?? row.find(".pos-label[data-pos]").first().attr("data-pos") ?? "";
    const position = rawPosition.replace(/_/g, "/");

    // Scoped to .D-b specifically — a generic ".Fz-xxs" selector also matches
    // the injury-status badge (see below), which sits earlier in the DOM for
    // players who have one, and would otherwise be matched first by mistake.
    const teamPosText = row.find(".D-b .Fz-xxs").first().text().trim();
    const [teamRaw] = teamPosText.split(" - ");
    const team = (teamRaw ?? "").trim().toUpperCase();

    const imageUrl = row.find("img").first().attr("src");

    const statusEl = row.find(".ysf-player-status").first();
    const status = statusEl.text().trim() || undefined;
    const statusFull = statusEl.find("[title]").first().attr("title") || undefined;

    const fanPtsText = row.find("td.pts").first().text().trim();
    const projPtsText = row.find("td.pts").first().next().text().trim();
    // actualPoints is only set once the player's game has started/finished —
    // Yahoo shows an em dash ("–") for Fan Pts before then. points keeps the
    // existing display fallback (actual once played, else projected) used by
    // the per-player badge; actualPoints/projectedPoints stay separate so
    // roster-level totals can tell "scored so far" from "still projected".
    const actualPoints = parseNum(fanPtsText);
    const projectedPoints = parseNum(projPtsText);
    const points = actualPoints ?? projectedPoints;

    players.push({
      playerKey,
      name,
      team,
      position,
      status,
      statusFull,
      imageUrl,
      points,
      actualPoints,
      projectedPoints,
    });
  });

  return players;
}

function teamIdFromHref(href: string | undefined): string {
  return (href ?? "").match(/\/(\d+)\/?$/)?.[1] ?? "";
}

export function scrapeStandings(html: string): StandingsTeam[] {
  const $ = cheerio.load(html);
  const teams: StandingsTeam[] = [];

  $("#standingstable tbody tr").each((i, el) => {
    const row = $(el);
    const teamKey = teamIdFromHref(row.attr("data-target"));
    const name = row.find("a.F-reset").first().text().trim() || "Unnamed team";
    const logoUrl = row.find("img.Avatar-sm").attr("src");

    const wlt = row.find("td.Tst-wlt").first().text().trim();
    const [wins, losses, ties] = wlt.split("-").map((n) => Number.parseInt(n, 10) || 0);

    const tds = row.find("> td");
    const pointsFor = Number.parseFloat(tds.eq(3).text().trim());

    teams.push({
      teamKey,
      name,
      logoUrl,
      rank: i + 1, // Yahoo renders standings pre-sorted; no explicit rank text pre-season
      wins: wins ?? 0,
      losses: losses ?? 0,
      ties: ties ?? 0,
      pointsFor: Number.isFinite(pointsFor) ? pointsFor : undefined,
    });
  });

  return teams;
}

export function scrapeMatchups(html: string): { week?: string; matchups: Matchup[] } {
  const $ = cheerio.load(html);
  const matchups: Matchup[] = [];
  let week: string | undefined;

  $('li[data-target*="/matchup?"]').each((_, el) => {
    const li = $(el);
    const target = li.attr("data-target") ?? "";
    week = target.match(/week=(\d+)/)?.[1] ?? week;

    const teams: MatchupTeam[] = [];
    li.find(".Grid-u-6-13").each((_, sideEl) => {
      const side = $(sideEl);
      const nameLink = side.find("a.F-link").first();
      const name = nameLink.text().trim() || "Unnamed team";
      const teamKey = teamIdFromHref(nameLink.attr("href"));
      const logoUrl = side.find("img.Avatar-med").attr("src");

      const scoreBlock = side
        .find("div")
        .filter((_, d) => {
          const dd = $(d);
          return dd.children(".Fz-lg").length > 0 && dd.children(".F-shade").length > 0;
        })
        .first();
      const actual = Number.parseFloat(scoreBlock.children(".Fz-lg").first().text().trim());
      const projected = Number.parseFloat(scoreBlock.children(".F-shade").first().text().trim());

      teams.push({
        teamKey,
        name,
        logoUrl,
        points: Number.isFinite(actual) ? actual : undefined,
        projectedPoints: Number.isFinite(projected) ? projected : undefined,
      });
    });

    if (teams.length !== 2) return; // malformed card, skip rather than push bad data

    const [a, b] = teams;
    const isTied = a.points !== undefined && a.points === b.points;
    const winnerTeamKey =
      !isTied && a.points !== undefined && b.points !== undefined
        ? (a.points > b.points ? a.teamKey : b.teamKey)
        : undefined;

    matchups.push({ isTied, winnerTeamKey, teams });
  });

  return { week, matchups };
}
