import type { CoffeeBean } from "@/types";

const AXES: Array<keyof CoffeeBean["flavorProfile"]> = [
  "acidity",
  "body",
  "sweetness",
  "bitterness",
  "complexity",
  "fruitiness",
];

function flavorDistance(a: CoffeeBean, b: CoffeeBean): number {
  let sum = 0;
  for (const axis of AXES) {
    const d = a.flavorProfile[axis] - b.flavorProfile[axis];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function findSimilarBeans(
  target: CoffeeBean,
  pool: CoffeeBean[],
  limit = 3,
): CoffeeBean[] {
  return pool
    .filter(
      (b) => b.id !== target.id && b.countryCode !== target.countryCode,
    )
    .map((b) => ({ bean: b, distance: flavorDistance(target, b) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((x) => x.bean);
}
