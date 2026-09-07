import { cookies } from "next/headers";
import { getSnapshot, availableTeams, SELECTED_TEAM_COOKIE } from "@/lib/upstashSnapshot";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function Home(props: PageProps<"/">) {
  const scraped = process.env.DATA_SOURCE === "scrape";
  const cookieStore = await cookies();
  const searchParams = await props.searchParams;
  const error = searchParams.error;
  const errorMessage = Array.isArray(error) ? error[0] : error;

  let loggedIn = false;
  let teamOptions: { teamId: string; name: string }[] = [];
  let selectedTeam: { teamId: string; name: string } | undefined;
  let snapshotExists = false;

  if (scraped) {
    const { snapshot } = await getSnapshot();
    if (snapshot) {
      snapshotExists = true;
      teamOptions = availableTeams(snapshot);
      const selectedId = cookieStore.get(SELECTED_TEAM_COOKIE)?.value;
      selectedTeam = teamOptions.find((t) => t.teamId === selectedId);
    }
  } else {
    loggedIn = Boolean(
      cookieStore.get("yahoo_access_token") ?? cookieStore.get("yahoo_refresh_token")
    );
  }

  return (
    <main className="hero flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <ThemeToggle className="absolute right-4 top-4 z-10" />
      <div className="hero-moon-glow" aria-hidden />

      <svg
        className="wave-svg wave-a"
        viewBox="0 0 2400 150"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--wave-a-1)" }} />
            <stop offset="100%" style={{ stopColor: "var(--wave-a-2)" }} />
          </linearGradient>
        </defs>
        <path
          d="M0,100.0 L15.0,104.4 L30.0,108.7 L45.0,112.7 L60.0,116.5 L75.0,119.8 L90.0,122.7 L105.0,124.9 L120.0,126.6 L135.0,127.7 L150.0,128.0 L165.0,127.7 L180.0,126.6 L195.0,124.9 L210.0,122.7 L225.0,119.8 L240.0,116.5 L255.0,112.7 L270.0,108.7 L285.0,104.4 L300.0,100.0 L315.0,95.6 L330.0,91.3 L345.0,87.3 L360.0,83.5 L375.0,80.2 L390.0,77.3 L405.0,75.1 L420.0,73.4 L435.0,72.3 L450.0,72.0 L465.0,72.3 L480.0,73.4 L495.0,75.1 L510.0,77.3 L525.0,80.2 L540.0,83.5 L555.0,87.3 L570.0,91.3 L585.0,95.6 L600.0,100.0 L615.0,104.4 L630.0,108.7 L645.0,112.7 L660.0,116.5 L675.0,119.8 L690.0,122.7 L705.0,124.9 L720.0,126.6 L735.0,127.7 L750.0,128.0 L765.0,127.7 L780.0,126.6 L795.0,124.9 L810.0,122.7 L825.0,119.8 L840.0,116.5 L855.0,112.7 L870.0,108.7 L885.0,104.4 L900.0,100.0 L915.0,95.6 L930.0,91.3 L945.0,87.3 L960.0,83.5 L975.0,80.2 L990.0,77.3 L1005.0,75.1 L1020.0,73.4 L1035.0,72.3 L1050.0,72.0 L1065.0,72.3 L1080.0,73.4 L1095.0,75.1 L1110.0,77.3 L1125.0,80.2 L1140.0,83.5 L1155.0,87.3 L1170.0,91.3 L1185.0,95.6 L1200.0,100.0 L1200,150 L0,150 Z"
          fill="url(#gradA)"
        />
        <path
          d="M0,100.0 L15.0,104.4 L30.0,108.7 L45.0,112.7 L60.0,116.5 L75.0,119.8 L90.0,122.7 L105.0,124.9 L120.0,126.6 L135.0,127.7 L150.0,128.0 L165.0,127.7 L180.0,126.6 L195.0,124.9 L210.0,122.7 L225.0,119.8 L240.0,116.5 L255.0,112.7 L270.0,108.7 L285.0,104.4 L300.0,100.0 L315.0,95.6 L330.0,91.3 L345.0,87.3 L360.0,83.5 L375.0,80.2 L390.0,77.3 L405.0,75.1 L420.0,73.4 L435.0,72.3 L450.0,72.0 L465.0,72.3 L480.0,73.4 L495.0,75.1 L510.0,77.3 L525.0,80.2 L540.0,83.5 L555.0,87.3 L570.0,91.3 L585.0,95.6 L600.0,100.0 L615.0,104.4 L630.0,108.7 L645.0,112.7 L660.0,116.5 L675.0,119.8 L690.0,122.7 L705.0,124.9 L720.0,126.6 L735.0,127.7 L750.0,128.0 L765.0,127.7 L780.0,126.6 L795.0,124.9 L810.0,122.7 L825.0,119.8 L840.0,116.5 L855.0,112.7 L870.0,108.7 L885.0,104.4 L900.0,100.0 L915.0,95.6 L930.0,91.3 L945.0,87.3 L960.0,83.5 L975.0,80.2 L990.0,77.3 L1005.0,75.1 L1020.0,73.4 L1035.0,72.3 L1050.0,72.0 L1065.0,72.3 L1080.0,73.4 L1095.0,75.1 L1110.0,77.3 L1125.0,80.2 L1140.0,83.5 L1155.0,87.3 L1170.0,91.3 L1185.0,95.6 L1200.0,100.0 L1200,150 L0,150 Z"
          fill="url(#gradA)"
          transform="translate(1200,0)"
        />
      </svg>

      <svg
        className="wave-svg wave-b"
        viewBox="0 0 2400 115"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--wave-b-1)" }} />
            <stop offset="100%" style={{ stopColor: "var(--wave-b-2)" }} />
          </linearGradient>
        </defs>
        <path
          d="M0,93.7 L15.0,94.0 L30.0,93.0 L45.0,90.9 L60.0,87.8 L75.0,83.8 L90.0,79.1 L105.0,74.0 L120.0,68.9 L135.0,63.9 L150.0,59.3 L165.0,55.5 L180.0,52.5 L195.0,50.7 L210.0,50.0 L225.0,50.5 L240.0,52.3 L255.0,55.1 L270.0,58.8 L285.0,63.3 L300.0,68.3 L315.0,73.4 L330.0,78.5 L345.0,83.2 L360.0,87.3 L375.0,90.6 L390.0,92.8 L405.0,93.9 L420.0,93.8 L435.0,92.4 L450.0,90.0 L465.0,86.5 L480.0,82.3 L495.0,77.4 L510.0,72.3 L525.0,67.2 L540.0,62.3 L555.0,57.9 L570.0,54.4 L585.0,51.8 L600.0,50.3 L615.0,50.0 L630.0,51.0 L645.0,53.1 L660.0,56.2 L675.0,60.2 L690.0,64.9 L705.0,70.0 L720.0,75.1 L735.0,80.1 L750.0,84.7 L765.0,88.5 L780.0,91.5 L795.0,93.3 L810.0,94.0 L825.0,93.5 L840.0,91.7 L855.0,88.9 L870.0,85.2 L885.0,80.7 L900.0,75.7 L915.0,70.6 L930.0,65.5 L945.0,60.8 L960.0,56.7 L975.0,53.4 L990.0,51.2 L1005.0,50.1 L1020.0,50.2 L1035.0,51.6 L1050.0,54.0 L1065.0,57.5 L1080.0,61.7 L1095.0,66.6 L1110.0,71.7 L1125.0,76.8 L1140.0,81.7 L1155.0,86.1 L1170.0,89.6 L1185.0,92.2 L1200.0,93.7 L1200,115 L0,115 Z"
          fill="url(#gradB)"
        />
        <path
          d="M0,93.7 L15.0,94.0 L30.0,93.0 L45.0,90.9 L60.0,87.8 L75.0,83.8 L90.0,79.1 L105.0,74.0 L120.0,68.9 L135.0,63.9 L150.0,59.3 L165.0,55.5 L180.0,52.5 L195.0,50.7 L210.0,50.0 L225.0,50.5 L240.0,52.3 L255.0,55.1 L270.0,58.8 L285.0,63.3 L300.0,68.3 L315.0,73.4 L330.0,78.5 L345.0,83.2 L360.0,87.3 L375.0,90.6 L390.0,92.8 L405.0,93.9 L420.0,93.8 L435.0,92.4 L450.0,90.0 L465.0,86.5 L480.0,82.3 L495.0,77.4 L510.0,72.3 L525.0,67.2 L540.0,62.3 L555.0,57.9 L570.0,54.4 L585.0,51.8 L600.0,50.3 L615.0,50.0 L630.0,51.0 L645.0,53.1 L660.0,56.2 L675.0,60.2 L690.0,64.9 L705.0,70.0 L720.0,75.1 L735.0,80.1 L750.0,84.7 L765.0,88.5 L780.0,91.5 L795.0,93.3 L810.0,94.0 L825.0,93.5 L840.0,91.7 L855.0,88.9 L870.0,85.2 L885.0,80.7 L900.0,75.7 L915.0,70.6 L930.0,65.5 L945.0,60.8 L960.0,56.7 L975.0,53.4 L990.0,51.2 L1005.0,50.1 L1020.0,50.2 L1035.0,51.6 L1050.0,54.0 L1065.0,57.5 L1080.0,61.7 L1095.0,66.6 L1110.0,71.7 L1125.0,76.8 L1140.0,81.7 L1155.0,86.1 L1170.0,89.6 L1185.0,92.2 L1200.0,93.7 L1200,115 L0,115 Z"
          fill="url(#gradB)"
          transform="translate(1200,0)"
        />
      </svg>

      <svg
        className="wave-svg wave-c"
        viewBox="0 0 2400 85"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--wave-c-1)" }} />
            <stop offset="100%" style={{ stopColor: "var(--wave-c-2)" }} />
          </linearGradient>
          <linearGradient id="crest" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: "var(--crest-edge)" }} stopOpacity="0" />
            <stop offset="50%" style={{ stopColor: "var(--crest-mid)" }} />
            <stop offset="100%" style={{ stopColor: "var(--crest-edge)" }} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,38.0 L15.0,35.6 L30.0,33.4 L45.0,31.6 L60.0,30.1 L75.0,29.0 L90.0,28.3 L105.0,28.0 L120.0,28.2 L135.0,28.8 L150.0,29.9 L165.0,31.3 L180.0,33.1 L195.0,35.2 L210.0,37.6 L225.0,40.2 L240.0,43.0 L255.0,45.8 L270.0,48.6 L285.0,51.3 L300.0,54.0 L315.0,56.4 L330.0,58.6 L345.0,60.4 L360.0,61.9 L375.0,63.0 L390.0,63.7 L405.0,64.0 L420.0,63.8 L435.0,63.2 L450.0,62.1 L465.0,60.7 L480.0,58.9 L495.0,56.8 L510.0,54.4 L525.0,51.8 L540.0,49.0 L555.0,46.2 L570.0,43.4 L585.0,40.7 L600.0,38.0 L615.0,35.6 L630.0,33.4 L645.0,31.6 L660.0,30.1 L675.0,29.0 L690.0,28.3 L705.0,28.0 L720.0,28.2 L735.0,28.8 L750.0,29.9 L765.0,31.3 L780.0,33.1 L795.0,35.2 L810.0,37.6 L825.0,40.2 L840.0,43.0 L855.0,45.8 L870.0,48.6 L885.0,51.3 L900.0,54.0 L915.0,56.4 L930.0,58.6 L945.0,60.4 L960.0,61.9 L975.0,63.0 L990.0,63.7 L1005.0,64.0 L1020.0,63.8 L1035.0,63.2 L1050.0,62.1 L1065.0,60.7 L1080.0,58.9 L1095.0,56.8 L1110.0,54.4 L1125.0,51.8 L1140.0,49.0 L1155.0,46.2 L1170.0,43.4 L1185.0,40.7 L1200.0,38.0 L1200,85 L0,85 Z"
          fill="url(#gradC)"
        />
        <path
          d="M0,38.0 L15.0,35.6 L30.0,33.4 L45.0,31.6 L60.0,30.1 L75.0,29.0 L90.0,28.3 L105.0,28.0 L120.0,28.2 L135.0,28.8 L150.0,29.9 L165.0,31.3 L180.0,33.1 L195.0,35.2 L210.0,37.6 L225.0,40.2 L240.0,43.0 L255.0,45.8 L270.0,48.6 L285.0,51.3 L300.0,54.0 L315.0,56.4 L330.0,58.6 L345.0,60.4 L360.0,61.9 L375.0,63.0 L390.0,63.7 L405.0,64.0 L420.0,63.8 L435.0,63.2 L450.0,62.1 L465.0,60.7 L480.0,58.9 L495.0,56.8 L510.0,54.4 L525.0,51.8 L540.0,49.0 L555.0,46.2 L570.0,43.4 L585.0,40.7 L600.0,38.0 L615.0,35.6 L630.0,33.4 L645.0,31.6 L660.0,30.1 L675.0,29.0 L690.0,28.3 L705.0,28.0 L720.0,28.2 L735.0,28.8 L750.0,29.9 L765.0,31.3 L780.0,33.1 L795.0,35.2 L810.0,37.6 L825.0,40.2 L840.0,43.0 L855.0,45.8 L870.0,48.6 L885.0,51.3 L900.0,54.0 L915.0,56.4 L930.0,58.6 L945.0,60.4 L960.0,61.9 L975.0,63.0 L990.0,63.7 L1005.0,64.0 L1020.0,63.8 L1035.0,63.2 L1050.0,62.1 L1065.0,60.7 L1080.0,58.9 L1095.0,56.8 L1110.0,54.4 L1125.0,51.8 L1140.0,49.0 L1155.0,46.2 L1170.0,43.4 L1185.0,40.7 L1200.0,38.0 L1200,85 L0,85 Z"
          fill="url(#gradC)"
          transform="translate(1200,0)"
        />
        <path
          d="M0,38.0 L15.0,35.6 L30.0,33.4 L45.0,31.6 L60.0,30.1 L75.0,29.0 L90.0,28.3 L105.0,28.0 L120.0,28.2 L135.0,28.8 L150.0,29.9 L165.0,31.3 L180.0,33.1 L195.0,35.2 L210.0,37.6 L225.0,40.2 L240.0,43.0 L255.0,45.8 L270.0,48.6 L285.0,51.3 L300.0,54.0 L315.0,56.4 L330.0,58.6 L345.0,60.4 L360.0,61.9 L375.0,63.0 L390.0,63.7 L405.0,64.0 L420.0,63.8 L435.0,63.2 L450.0,62.1 L465.0,60.7 L480.0,58.9 L495.0,56.8 L510.0,54.4 L525.0,51.8 L540.0,49.0 L555.0,46.2 L570.0,43.4 L585.0,40.7 L600.0,38.0 L615.0,35.6 L630.0,33.4 L645.0,31.6 L660.0,30.1 L675.0,29.0 L690.0,28.3 L705.0,28.0 L720.0,28.2 L735.0,28.8 L750.0,29.9 L765.0,31.3 L780.0,33.1 L795.0,35.2 L810.0,37.6 L825.0,40.2 L840.0,43.0 L855.0,45.8 L870.0,48.6 L885.0,51.3 L900.0,54.0 L915.0,56.4 L930.0,58.6 L945.0,60.4 L960.0,61.9 L975.0,63.0 L990.0,63.7 L1005.0,64.0 L1020.0,63.8 L1035.0,63.2 L1050.0,62.1 L1065.0,60.7 L1080.0,58.9 L1095.0,56.8 L1110.0,54.4 L1125.0,51.8 L1140.0,49.0 L1155.0,46.2 L1170.0,43.4 L1185.0,40.7 L1200.0,38.0"
          fill="none"
          stroke="url(#crest)"
          strokeWidth="2.5"
        />
        <path
          d="M0,38.0 L15.0,35.6 L30.0,33.4 L45.0,31.6 L60.0,30.1 L75.0,29.0 L90.0,28.3 L105.0,28.0 L120.0,28.2 L135.0,28.8 L150.0,29.9 L165.0,31.3 L180.0,33.1 L195.0,35.2 L210.0,37.6 L225.0,40.2 L240.0,43.0 L255.0,45.8 L270.0,48.6 L285.0,51.3 L300.0,54.0 L315.0,56.4 L330.0,58.6 L345.0,60.4 L360.0,61.9 L375.0,63.0 L390.0,63.7 L405.0,64.0 L420.0,63.8 L435.0,63.2 L450.0,62.1 L465.0,60.7 L480.0,58.9 L495.0,56.8 L510.0,54.4 L525.0,51.8 L540.0,49.0 L555.0,46.2 L570.0,43.4 L585.0,40.7 L600.0,38.0 L615.0,35.6 L630.0,33.4 L645.0,31.6 L660.0,30.1 L675.0,29.0 L690.0,28.3 L705.0,28.0 L720.0,28.2 L735.0,28.8 L750.0,29.9 L765.0,31.3 L780.0,33.1 L795.0,35.2 L810.0,37.6 L825.0,40.2 L840.0,43.0 L855.0,45.8 L870.0,48.6 L885.0,51.3 L900.0,54.0 L915.0,56.4 L930.0,58.6 L945.0,60.4 L960.0,61.9 L975.0,63.0 L990.0,63.7 L1005.0,64.0 L1020.0,63.8 L1035.0,63.2 L1050.0,62.1 L1065.0,60.7 L1080.0,58.9 L1095.0,56.8 L1110.0,54.4 L1125.0,51.8 L1140.0,49.0 L1155.0,46.2 L1170.0,43.4 L1185.0,40.7 L1200.0,38.0"
          fill="none"
          stroke="url(#crest)"
          strokeWidth="2.5"
          transform="translate(1200,0)"
        />
      </svg>

      <div className="sparkle" style={{ left: "22%", bottom: "15%", animationDelay: "0s" }} aria-hidden />
      <div className="sparkle" style={{ left: "58%", bottom: "20%", animationDelay: "1.2s" }} aria-hidden />
      <div className="sparkle" style={{ left: "78%", bottom: "13%", animationDelay: "2.4s" }} aria-hidden />
      <div className="sparkle" style={{ left: "38%", bottom: "24%", animationDelay: "0.7s" }} aria-hidden />

      <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-accent">
        Fantasy League Dashboard
      </p>
      <h1 className="relative bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
        Welcome to Fantasy Island
      </h1>
      {errorMessage && (
        <p className="relative max-w-sm rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      )}
      {scraped ? (
        selectedTeam ? (
          <div className="relative flex flex-col items-center gap-2">
            <a
              href="/roster"
              className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-medium text-white shadow-[0_15px_40px_-10px_var(--accent-glow)] transition-transform hover:scale-[1.02]"
            >
              View my roster
            </a>
            <p className="text-xs text-muted">
              Viewing as {selectedTeam.name} ·{" "}
              <a href="/api/select-team?clear=1" className="underline hover:text-foreground">
                switch team
              </a>
            </p>
          </div>
        ) : teamOptions.length > 0 ? (
          <form
            action="/api/select-team"
            method="GET"
            className="relative flex flex-col items-center gap-3"
          >
            <label
              htmlFor="teamId"
              className="text-xs font-semibold uppercase tracking-widest text-accent"
            >
              Who am I?
            </label>
            <div className="flex gap-2">
              <select
                id="teamId"
                name="teamId"
                required
                defaultValue=""
                className="rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="" disabled>
                  Pick your team…
                </option>
                {teamOptions.map((t) => (
                  <option key={t.teamId} value={t.teamId}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-6 py-2 font-medium text-white shadow-[0_15px_40px_-10px_var(--accent-glow)] transition-transform hover:scale-[1.02]"
              >
                Let&apos;s go
              </button>
            </div>
          </form>
        ) : (
          <p className="relative max-w-sm text-sm text-muted">
            {snapshotExists
              ? "No teams found in the last scrape — check back in a bit."
              : "No data yet — the scraper hasn't run yet. Check back in a bit."}
          </p>
        )
      ) : loggedIn ? (
        <a
          href="/roster"
          className="relative rounded-lg bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-medium text-white shadow-[0_15px_40px_-10px_var(--accent-glow)] transition-transform hover:scale-[1.02]"
        >
          View my roster
        </a>
      ) : (
        <a
          href="/api/auth/login"
          className="relative rounded-lg bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-medium text-white shadow-[0_15px_40px_-10px_var(--accent-glow)] transition-transform hover:scale-[1.02]"
        >
          Sign in with Yahoo
        </a>
      )}
    </main>
  );
}
