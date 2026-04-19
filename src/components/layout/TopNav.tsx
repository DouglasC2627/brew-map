import Link from "next/link";
import { Coffee, Search } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-roast-medium" />
          <span className="font-display text-lg tracking-tight">BrewMap</span>
        </Link>

        <button
          type="button"
          disabled
          className="hidden items-center gap-2 rounded-md border border-border bg-surface/60 px-3 py-1.5 text-sm text-muted-foreground md:inline-flex"
          aria-label="Search (coming in Phase 2)"
        >
          <Search className="h-4 w-4" />
          <span>Search beans…</span>
          <kbd className="ml-2 rounded bg-parchment px-1.5 py-0.5 text-[10px] font-mono text-roast-dark dark:bg-roast-dark dark:text-parchment">
            ⌘K
          </kbd>
        </button>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-md px-2 py-1 text-sm hover:text-roast-medium"
          >
            Explore
          </Link>
          <Link
            href="/beans"
            className="rounded-md px-2 py-1 text-sm hover:text-roast-medium"
          >
            Beans
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
