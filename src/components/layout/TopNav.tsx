"use client";

import Link from "next/link";
import { Coffee, Search } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useSearchUi } from "@/components/shared/SearchCommand";

export function TopNav() {
  const setOpen = useSearchUi((s) => s.setOpen);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto grid h-full max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <Link href="/" className="flex items-center gap-2 justify-self-start">
          <Coffee className="h-5 w-5 text-roast-medium" />
          <span className="font-display text-lg tracking-tight">BrewMap</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden items-center gap-2 rounded-md border border-border bg-surface/60 px-3 py-1.5 text-sm text-muted-foreground justify-self-center hover:border-roast-medium md:inline-flex"
          aria-label="Search beans"
        >
          <Search className="h-4 w-4" />
          <span>Search beans…</span>
          <kbd className="ml-2 rounded bg-parchment px-1.5 py-0.5 text-[10px] font-mono text-roast-dark dark:bg-roast-dark dark:text-parchment">
            ⌘K
          </kbd>
        </button>

        <nav className="flex items-center gap-3 justify-self-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Search"
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
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
