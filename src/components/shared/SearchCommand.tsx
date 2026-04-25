"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { create } from "zustand";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  createBeanSearch,
  getRecentSearches,
  pushRecentSearch,
} from "@/lib/search";
import { useBrewMap } from "@/store";
import { countryFlagEmoji, flavorNoteLabel } from "@/lib/utils";
import type { CoffeeBean, FlavorNotesData } from "@/types";

interface SearchUiStore {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export const useSearchUi = create<SearchUiStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

interface Props {
  beans: CoffeeBean[];
  flavorNotes: FlavorNotesData;
}

const RECENTS_LISTENERS = new Set<() => void>();
function subscribeRecents(cb: () => void) {
  RECENTS_LISTENERS.add(cb);
  return () => {
    RECENTS_LISTENERS.delete(cb);
  };
}
function notifyRecentsChanged() {
  RECENTS_LISTENERS.forEach((cb) => cb());
}
function getRecentsSnapshot() {
  return getRecentSearches().join(",");
}

export function SearchCommand({ beans, flavorNotes }: Props) {
  const { open, setOpen } = useSearchUi();
  const [query, setQuery] = useState("");

  const recentsKey = useSyncExternalStore(
    subscribeRecents,
    getRecentsSnapshot,
    () => "",
  );
  const recentIds = useMemo(
    () => (recentsKey ? recentsKey.split(",").filter(Boolean) : []),
    [recentsKey],
  );

  const fuse = useMemo(() => createBeanSearch(beans), [beans]);

  // Cmd/Ctrl + K toggles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useSearchUi.getState().setOpen(!useSearchUi.getState().open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query, { limit: 12 }).map((r) => r.item);
  }, [fuse, query]);

  const recents = useMemo(
    () =>
      recentIds
        .map((id) => beans.find((b) => b.id === id))
        .filter((b): b is CoffeeBean => Boolean(b)),
    [recentIds, beans],
  );

  const onSelect = (bean: CoffeeBean) => {
    pushRecentSearch(bean.id);
    notifyRecentsChanged();
    useBrewMap.getState().selectBean(bean.id);
    useBrewMap.getState().setViewport({
      longitude: bean.coordinates[0],
      latitude: bean.coordinates[1],
      zoom: 5,
    });
    setOpen(false);
    setQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search beans by name, country, region, or flavor…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!query.trim() && recents.length > 0 && (
          <CommandGroup heading="Recent">
            {recents.map((bean) => (
              <CommandItem
                key={bean.id}
                value={`recent-${bean.id}`}
                onSelect={() => onSelect(bean)}
              >
                <BeanRow bean={bean} flavorNotes={flavorNotes} />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query.trim() && results.length === 0 && (
          <CommandEmpty>
            No matches. Try a country, region, or flavor note.
          </CommandEmpty>
        )}

        {results.length > 0 && (
          <CommandGroup heading="Beans">
            {results.map((bean) => (
              <CommandItem
                key={bean.id}
                value={`${bean.name} ${bean.country} ${bean.region}`}
                onSelect={() => onSelect(bean)}
              >
                <BeanRow bean={bean} flavorNotes={flavorNotes} />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

function BeanRow({
  bean,
  flavorNotes,
}: {
  bean: CoffeeBean;
  flavorNotes: FlavorNotesData;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <span aria-hidden className="text-base leading-none">
        {countryFlagEmoji(bean.countryCode)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{bean.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {bean.region} ·{" "}
          {bean.flavorNotes
            .slice(0, 2)
            .map((id) => flavorNoteLabel(flavorNotes, id))
            .join(" · ")}
        </div>
      </div>
    </div>
  );
}
