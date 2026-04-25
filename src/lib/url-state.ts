import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

export const ROAST_LITERALS = [
  "light",
  "medium-light",
  "medium",
  "medium-dark",
  "dark",
] as const;

export const PROCESSING_LITERALS = [
  "washed",
  "natural",
  "honey",
  "anaerobic",
  "wet-hulled",
] as const;

export const urlParsers = {
  bean: parseAsString,
  lng: parseAsFloat,
  lat: parseAsFloat,
  zoom: parseAsFloat,
  region: parseAsArrayOf(parseAsString).withDefault([]),
  processing: parseAsArrayOf(
    parseAsStringLiteral(PROCESSING_LITERALS),
  ).withDefault([]),
  roast: parseAsArrayOf(
    parseAsStringLiteral(ROAST_LITERALS),
  ).withDefault([]),
  altMin: parseAsFloat,
  altMax: parseAsFloat,
};
