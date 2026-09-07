// Run this yourself in your own terminal: node scripts/yahoo-login-and-capture.mjs
//
// Opens a real, visible browser window. YOU log into Yahoo yourself in that
// window (this script never sees or handles your password). You'll then be
// prompted three times to navigate to a specific page (roster, league
// standings, scoreboard/matchups) and press Enter — each time the script
// dumps that page's HTML + a screenshot into ./scratch/ so Claude can read
// the real page structure and write accurate scraper selectors instead of
// guessing.
//
// If a page is split across separate tabs/views (e.g. a "Bench" tab showing
// different players than the main roster view), you'll be asked after each
// capture whether you need to grab another view of that same page before
// moving on — say yes and it'll capture roster-2, roster-3, etc. Plain
// scrolling within one continuous page needs no extra captures — the full
// page source is captured regardless of what's visible on screen.
//
// At the end it also exports a lightweight, portable session file
// (scratch/storage-state.json — just cookies + localStorage) that the
// recurring scraper reuses so it never has to log in again. That file goes
// into a GitHub Actions secret later; it is just as sensitive as a password,
// never commit it, never share it.
//
// The full browser profile also lives in .yahoo-session/ (gitignored) purely
// so this script itself remembers your login on repeat local runs.

import { chromium } from "playwright";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const userDataDir = path.join(root, ".yahoo-session");
const scratchDir = path.join(root, "scratch");

fs.mkdirSync(scratchDir, { recursive: true });

function ask(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function waitForEnter(prompt) {
  return ask(prompt);
}

async function capture(page, name) {
  const url = page.url();
  const html = await page.content();
  fs.writeFileSync(path.join(scratchDir, `${name}.html`), html);
  await page.screenshot({ path: path.join(scratchDir, `${name}.png`), fullPage: true });
  fs.writeFileSync(path.join(scratchDir, `${name}-url.txt`), url);
  console.log(`  Captured "${name}" → scratch/${name}.html / .png (URL: ${url})`);
}

// Captures one page, then keeps asking "is there another tab/view of THIS
// same page you need to capture too?" so a roster split across e.g. a
// separate Bench tab doesn't get missed. Plain scrolling never needs this —
// only actual separate tabs/clicks that swap out what's in the page.
async function captureWithFollowUps(page, baseName, description) {
  await capture(page, baseName);
  let n = 2;
  while (true) {
    const more = await ask(
      `\nIs there another tab/view on this ${description} page with MORE content ` +
        `not shown in what was just captured (e.g. a separate Bench/IR tab)?\n` +
        `If so, click over to it now, then type "y" and Enter. Otherwise just press Enter to continue.\n> `
    );
    if (more !== "y" && more !== "yes") break;
    await capture(page, `${baseName}-${n}`);
    n++;
  }
}

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1400, height: 1000 },
});

const page = context.pages()[0] ?? (await context.newPage());
await page.goto("https://login.yahoo.com/");

await waitForEnter(
  "\nA Chrome window should have opened.\n" +
    "1. Log into your Yahoo account there (complete any 2FA).\n" +
    "2. Navigate to your Yahoo Fantasy Football TEAM/ROSTER page.\n" +
    "3. Once you can see your actual roster on screen, come back here and press Enter.\n" +
    "   (If you need to scroll to see everyone, that's fine — no need to do anything extra.)\n"
);
await captureWithFollowUps(page, "roster", "roster");

await waitForEnter("\nNow navigate to your LEAGUE STANDINGS page, then press Enter.\n");
await captureWithFollowUps(page, "standings", "standings");

await waitForEnter(
  "\nNow navigate to the SCOREBOARD / this week's MATCHUPS page, then press Enter.\n" +
    "(If standings and matchups turn out to be the same page/tabs, that's fine —\n" +
    "just press Enter again on whatever page you're on.)\n"
);
await captureWithFollowUps(page, "scoreboard", "scoreboard");

const storageStatePath = path.join(scratchDir, "storage-state.json");
const rawState = await context.storageState();

// The page loads a huge amount of third-party ad-tech, which leaves hundreds
// of tracking cookies in the captured session — none of it needed to
// authenticate with Yahoo, and it blows well past GitHub Actions' 64KB
// secret size limit. Keep only Yahoo's own domains.
const isYahoo = (s) => /yahoo\.com|yahoo\.net|yahoodns\.net|yimg\.com/i.test(s);
const trimmedState = {
  ...rawState,
  cookies: rawState.cookies.filter((c) => isYahoo(c.domain)),
  origins: (rawState.origins ?? []).filter((o) => isYahoo(o.origin)),
};
fs.writeFileSync(storageStatePath, JSON.stringify(trimmedState));
console.log(
  `  (trimmed session from ${rawState.cookies.length} to ${trimmedState.cookies.length} cookies, ` +
    "dropping third-party ad-tech domains not needed for Yahoo auth)"
);

console.log("\nAll captures saved to scratch/.");
console.log(`Session exported to ${storageStatePath}`);
console.log(
  "Next step: gzip + base64-encode that file and store it as the YAHOO_STORAGE_STATE GitHub secret\n" +
    "  (e.g. gzip -9 -c scratch/storage-state.json | base64 | tr -d '\\n' | gh secret set YAHOO_STORAGE_STATE)"
);
console.log("You can close the browser window now.\n");

await context.close();
