import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function countryFlagEmoji(iso2: string): string {
  if (iso2.length !== 2) return "";
  const base = 0x1f1e6;
  const A = "A".charCodeAt(0);
  const upper = iso2.toUpperCase();
  return String.fromCodePoint(
    base + (upper.charCodeAt(0) - A),
    base + (upper.charCodeAt(1) - A),
  );
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthName(m: number): string {
  return MONTH_NAMES[(m - 1) % 12] ?? "";
}

export function formatAltitude(range: [number, number]): string {
  return `${range[0]}–${range[1]} masl`;
}
