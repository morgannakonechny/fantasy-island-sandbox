import Link from "next/link";
import { RosterView } from "@/components/RosterView";
import { mockRoster } from "@/lib/mockRoster";

export default function RosterDemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <p className="border-b border-accent/20 bg-accent/10 px-4 py-2 text-center text-sm text-amber-300">
        Preview mode — showing sample data while Yahoo Fantasy Sports API access is pending.{" "}
        <Link href="/" className="underline">
          Back home
        </Link>
      </p>
      <RosterView data={mockRoster} />
    </div>
  );
}
