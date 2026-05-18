"use client";

import { useMemo, useState } from "react";
import {
  hierarchy,
  type HierarchyRectangularNode,
  partition,
} from "d3-hierarchy";
import { arc } from "d3-shape";
import type { CoffeeBean, FlavorNotesData } from "@/types";
import { cn } from "@/lib/utils";

type NodeKind = "root" | "category" | "subcategory" | "note";

interface WheelNode {
  id: string;
  kind: NodeKind;
  name: string;
  /** Hex color inherited from the top-level category. */
  baseColor: string;
  children?: WheelNode[];
}

type WheelRect = HierarchyRectangularNode<WheelNode>;

interface Props {
  beans: CoffeeBean[];
  flavorNotes: FlavorNotesData;
  size?: number;
  selectedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  className?: string;
  showLabels?: boolean;
}

const TWO_PI = Math.PI * 2;

/**
 * Blend the given hex color toward white by `amount` (0–1).
 */
function lighten(hex: string, amount: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const blend = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

function buildTree(data: FlavorNotesData): WheelNode {
  const subsByCat = new Map<string, FlavorNotesData["subcategories"]>();
  for (const s of data.subcategories) {
    const arr = subsByCat.get(s.categoryId) ?? [];
    arr.push(s);
    subsByCat.set(s.categoryId, arr);
  }
  const notesBySub = new Map<string, FlavorNotesData["notes"]>();
  for (const n of data.notes) {
    const arr = notesBySub.get(n.subcategoryId) ?? [];
    arr.push(n);
    notesBySub.set(n.subcategoryId, arr);
  }

  const root: WheelNode = {
    id: "__root__",
    kind: "root",
    name: "Flavor",
    baseColor: "#6F4E37",
    children: data.categories.map((c) => ({
      id: c.id,
      kind: "category",
      name: c.name,
      baseColor: c.color,
      children: (subsByCat.get(c.id) ?? []).map((s) => ({
        id: s.id,
        kind: "subcategory",
        name: s.name,
        baseColor: c.color,
        children: (notesBySub.get(s.id) ?? []).map((n) => ({
          id: n.id,
          kind: "note",
          name: n.name,
          baseColor: c.color,
        })),
      })),
    })),
  };
  return root;
}

interface BeanCounts {
  byId: Map<string, number>;
}

function computeCounts(
  beans: CoffeeBean[],
  data: FlavorNotesData,
): BeanCounts {
  const subToCat = new Map<string, string>();
  for (const s of data.subcategories) subToCat.set(s.id, s.categoryId);
  const noteToSub = new Map<string, string>();
  for (const n of data.notes) noteToSub.set(n.id, n.subcategoryId);

  const byId = new Map<string, number>();

  for (const bean of beans) {
    // Some ids overlap across levels (e.g. subcategory "tobacco" + note
    // "tobacco"). Dedupe per bean so a single tag doesn't double-count.
    const seen = new Set<string>();
    for (const noteId of bean.flavorNotes) {
      const ids = [noteId];
      const subId = noteToSub.get(noteId);
      if (subId) ids.push(subId);
      if (subId) {
        const catId = subToCat.get(subId);
        if (catId) ids.push(catId);
      }
      for (const id of ids) {
        if (seen.has(id)) continue;
        seen.add(id);
        byId.set(id, (byId.get(id) ?? 0) + 1);
      }
    }
  }
  return { byId };
}

export function FlavorWheel({
  beans,
  flavorNotes,
  size = 480,
  selectedIds,
  onToggle,
  className,
  showLabels = true,
}: Props) {
  const [hover, setHover] = useState<{
    id: string;
    name: string;
    kind: NodeKind;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const tree = useMemo(() => buildTree(flavorNotes), [flavorNotes]);
  const counts = useMemo(
    () => computeCounts(beans, flavorNotes),
    [beans, flavorNotes],
  );

  const root: WheelRect = useMemo(() => {
    const root = hierarchy<WheelNode>(tree)
      .count()
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    partition<WheelNode>().size([TWO_PI, 3])(root);
    return root as WheelRect;
  }, [tree]);

  const radius = size / 2;
  const center = size / 2;
  // 3 rings: category, subcategory, note
  const ringStops = [0.15, 0.42, 0.72, 1.0].map((f) => f * radius);

  const arcGen = useMemo(
    () =>
      arc<WheelRect>()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .innerRadius((d) => ringStops[d.depth - 1] ?? 0)
        .outerRadius((d) => ringStops[d.depth] ?? 0)
        .padAngle(0.002)
        .padRadius(radius),
    [ringStops, radius],
  );

  const allNodes: WheelRect[] = useMemo(
    () => (root.descendants() as WheelRect[]).filter((d) => d.depth > 0),
    [root],
  );

  const onSegmentEnter = (e: React.MouseEvent<SVGPathElement>, n: WheelRect) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement)
      .getBoundingClientRect();
    setHover({
      id: n.data.id,
      name: n.data.name,
      kind: n.data.kind,
      count: counts.byId.get(n.data.id) ?? 0,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn(
        "relative inline-block select-none motion-safe:animate-[radar-fade_400ms_ease-out]",
        className,
      )}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Coffee flavor wheel"
        className="overflow-visible"
      >
        <g transform={`translate(${center}, ${center}) rotate(-90)`}>
          {allNodes.map((n) => {
            const lightenAmount =
              n.depth === 1 ? 0 : n.depth === 2 ? 0.2 : 0.4;
            const isSelected = selectedIds.has(n.data.id);
            const count = counts.byId.get(n.data.id) ?? 0;
            const empty = count === 0;
            const fill = lighten(n.data.baseColor, lightenAmount);

            return (
              <path
                key={`${n.data.kind}-${n.data.id}`}
                d={arcGen(n) ?? undefined}
                fill={fill}
                fillOpacity={empty ? 0.25 : 0.95}
                stroke={
                  isSelected ? "var(--color-foreground, #1A0F09)" : "#FAF6F1"
                }
                strokeWidth={isSelected ? 2 : 0.5}
                className="cursor-pointer transition-[fill-opacity,stroke-width] duration-150 hover:fill-opacity-100"
                onMouseEnter={(e) => onSegmentEnter(e, n)}
                onMouseMove={(e) => onSegmentEnter(e, n)}
                onClick={() => onToggle(n.data.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(n.data.id);
                  }
                }}
                aria-label={`${n.data.name}, ${count} bean${count === 1 ? "" : "s"}${isSelected ? ", selected" : ""}`}
                aria-pressed={isSelected}
              />
            );
          })}

          {showLabels &&
            allNodes
              .filter((n) => n.depth === 1)
              .map((n) => {
                const mid = (n.x0 + n.x1) / 2;
                const r = (ringStops[0] + ringStops[1]) / 2;
                const x = Math.cos(mid) * r;
                const y = Math.sin(mid) * r;
                const angle = (mid * 180) / Math.PI;
                const flip = angle > 90 && angle < 270;
                return (
                  <text
                    key={`label-${n.data.id}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${flip ? angle + 180 : angle} ${x} ${y})`}
                    className="pointer-events-none fill-cream text-[11px] font-semibold uppercase tracking-wide"
                    style={{ paintOrder: "stroke" }}
                  >
                    {n.data.name}
                  </text>
                );
              })}
        </g>

        <circle
          cx={center}
          cy={center}
          r={ringStops[0]}
          fill="var(--color-background, #FAF6F1)"
          stroke="var(--color-border, #D4C4A8)"
          strokeWidth={1}
        />
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground text-[10px] uppercase tracking-wider"
        >
          Flavor
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground font-display text-base"
        >
          Wheel
        </text>
      </svg>

      {hover && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 rounded-md border border-border bg-background/95 px-2 py-1 text-xs shadow-md backdrop-blur"
          style={{
            left: hover.x + 12,
            top: hover.y + 12,
          }}
        >
          <div className="font-medium">{hover.name}</div>
          <div className="text-muted-foreground">
            {hover.count} bean{hover.count === 1 ? "" : "s"}
          </div>
        </div>
      )}

      <table className="sr-only">
        <caption>Coffee flavor wheel — categories, subcategories, and notes</caption>
        <thead>
          <tr>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Note</th>
            <th>Beans</th>
          </tr>
        </thead>
        <tbody>
          {flavorNotes.notes.map((n) => {
            const sub = flavorNotes.subcategories.find(
              (s) => s.id === n.subcategoryId,
            );
            const cat = sub
              ? flavorNotes.categories.find((c) => c.id === sub.categoryId)
              : undefined;
            return (
              <tr key={n.id}>
                <td>{cat?.name ?? ""}</td>
                <td>{sub?.name ?? ""}</td>
                <td>{n.name}</td>
                <td>{counts.byId.get(n.id) ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FlavorWheel;
