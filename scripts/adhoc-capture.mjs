// One-off helper: reuses the already-saved .yahoo-session/ login to capture
// a specific URL headlessly, no interaction needed. Usage:
//   node scripts/adhoc-capture.mjs <url> <output-name>
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const userDataDir = path.join(root, ".yahoo-session");
const scratchDir = path.join(root, "scratch");

const [, , url, name] = process.argv;
if (!url || !name) {
  console.error("Usage: node scripts/adhoc-capture.mjs <url> <output-name>");
  process.exit(1);
}

const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(url, { waitUntil: "load", timeout: 45000 });
await page.waitForTimeout(2000);

fs.writeFileSync(path.join(scratchDir, `${name}.html`), await page.content());
await page.screenshot({ path: path.join(scratchDir, `${name}.png`), fullPage: true });
fs.writeFileSync(path.join(scratchDir, `${name}-url.txt`), page.url());

console.log(`Captured ${name} from ${page.url()}`);
await context.close();
