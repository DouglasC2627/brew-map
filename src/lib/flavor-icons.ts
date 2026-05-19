/**
 * Visual cues on the flavor wheel.
 *
 * Categories use either a hand-drawn illustration (when present at
 * `/images/flavors/<id>.svg`) or fall back to an emoji glyph. Drop new
 * illustrations into `public/images/flavors/` and register their URL in
 * {@link CATEGORY_ICON_URL} to swap.
 */

export const CATEGORY_EMOJI: Record<string, string> = {
  floral: "🌸",
  fruity: "🍒",
  "sour-fermented": "🍷",
  "green-vegetative": "🌿",
  roasted: "🔥",
  spices: "🌶️",
  "nutty-cocoa": "🍫",
  sweet: "🍯",
  other: "✨",
};

/**
 * Map of category id -> public asset URL. Empty by default; populate as you
 * drop illustrations into `public/images/flavors/`. Recommended naming:
 * `/images/flavors/<id>.svg` (e.g. `fruity.svg`, `nutty-cocoa.svg`).
 */
export const CATEGORY_ICON_URL: Record<string, string> = {
  floral: "/images/flavors/floral.svg",
  fruity: "/images/flavors/fruity.svg",
  "sour-fermented": "/images/flavors/sour-fermented.svg",
  "green-vegetative": "/images/flavors/green-vegetative.svg",
  roasted: "/images/flavors/roasted.svg",
  spices: "/images/flavors/spices.svg",
  "nutty-cocoa": "/images/flavors/nutty-cocoa.svg",
  sweet: "/images/flavors/sweet.svg",
  other: "/images/flavors/other.svg",
};

export type CategoryIcon =
  | { type: "image"; url: string }
  | { type: "emoji"; char: string };

export function categoryIcon(id: string): CategoryIcon | null {
  const url = CATEGORY_ICON_URL[id];
  if (url) return { type: "image", url };
  const char = CATEGORY_EMOJI[id];
  if (char) return { type: "emoji", char };
  return null;
}

export const NOTE_EMOJI: Record<string, string> = {
  // floral
  "black-tea": "🍵",
  jasmine: "🌼",
  honeysuckle: "🌻",
  rose: "🌹",
  chamomile: "🌼",
  floral: "💐",

  // berry
  blackberry: "🫐",
  raspberry: "🍓",
  blueberry: "🫐",
  strawberry: "🍓",
  blackcurrant: "🍇",
  "red-fruit": "🍒",

  // dried fruit
  raisin: "🍇",
  prune: "🍇",
  date: "🌴",
  "dried-apricot": "🍑",
  fig: "🍑",

  // other fruit
  apple: "🍎",
  "red-apple": "🍎",
  peach: "🍑",
  pear: "🍐",
  apricot: "🍑",
  plum: "🍑",
  "stone-fruit": "🍑",
  "tropical-fruit": "🥭",
  pineapple: "🍍",
  mango: "🥭",
  "red-grape": "🍇",
  tomato: "🍅",

  // citrus
  lemon: "🍋",
  lime: "🍋",
  orange: "🍊",
  tangerine: "🍊",
  grapefruit: "🍊",
  "pink-grapefruit": "🍊",
  bergamot: "🍊",
  "citrus-zest": "🍋",

  // sour / fermented
  winey: "🍷",
  "red-wine": "🍷",
  whiskey: "🥃",
  fermented: "🫙",

  // green / vegetative
  herbal: "🌿",
  grassy: "🌱",
  vegetal: "🥬",

  // roasted
  tobacco: "🚬",
  smoky: "💨",
  earthy: "🪨",
  musty: "📜",
  malt: "🌾",
  grain: "🌾",

  // spices
  pepper: "🌶️",
  cinnamon: "🟤",
  clove: "🌰",
  cardamom: "🟢",
  nutmeg: "🌰",
  anise: "⭐",
  "brown-spice": "🟤",
  spice: "🌶️",
  cedar: "🌲",

  // nutty / cocoa
  almond: "🌰",
  "roasted-almond": "🌰",
  hazelnut: "🌰",
  peanut: "🥜",
  cashew: "🥜",
  walnut: "🌰",
  macadamia: "🌰",
  pecan: "🌰",
  nut: "🥜",
  cocoa: "🍫",
  "cocoa-nib": "🍫",
  chocolate: "🍫",
  "milk-chocolate": "🍫",
  "dark-chocolate": "🍫",

  // sweet
  "brown-sugar": "🟫",
  "cane-sugar": "🍬",
  panela: "🟫",
  molasses: "🍯",
  maple: "🍁",
  honey: "🍯",
  caramel: "🍮",
  toffee: "🍬",
  vanilla: "🍦",
  butter: "🧈",
  cream: "🥛",
};

export function noteEmoji(id: string): string | undefined {
  return NOTE_EMOJI[id];
}

export function categoryEmoji(id: string): string | undefined {
  return CATEGORY_EMOJI[id];
}
