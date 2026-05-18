"use client";

import dynamic from "next/dynamic";

export const FlavorWheelLazy = dynamic(
  () => import("./FlavorWheel").then((m) => m.FlavorWheel),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="aspect-square w-full animate-pulse rounded-full bg-parchment/60 dark:bg-roast-dark/40"
      />
    ),
  },
);
