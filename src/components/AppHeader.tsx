import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { key: "roster", label: "Roster", href: "/roster" },
  { key: "schedule", label: "Schedule", href: "/schedule" },
  { key: "league", label: "League", href: "/league" },
] as const;

export function AppHeader({
  current,
  logoutHref,
}: {
  current: "roster" | "schedule" | "league";
  logoutHref: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 px-6 pt-6 sm:px-8">
      <Link
        href="/"
        className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-sm font-bold tracking-wide text-transparent"
      >
        Fantasy Island
      </Link>
      <nav className="flex flex-wrap justify-end gap-2">
        {NAV_ITEMS.filter((item) => item.key !== current).map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
        <a
          href={logoutHref}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          Log out
        </a>
        <ThemeToggle />
      </nav>
    </div>
  );
}
