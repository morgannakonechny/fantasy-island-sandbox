import Link from "next/link";
import { LeagueView } from "@/components/LeagueView";
import { mockLeague } from "@/lib/mockLeague";

export default function LeagueDemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <p className="border-b border-accent/20 bg-accent/10 px-4 py-2 text-center text-sm text-amber-300">
        Preview mode — showing sample data while Yahoo Fantasy Sports API access is pending.{" "}
        <Link href="/" className="underline">
          Back home
        </Link>
      </p>
      <LeagueView data={mockLeague} />
    </div>
  );
}
