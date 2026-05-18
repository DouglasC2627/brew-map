import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, type ArticleSummary, type LearnCategory } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Learn · BeanMap",
  description:
    "Background reading on coffee processing methods and brewing techniques.",
};

export default function LearnPage() {
  const processing = getAllArticles("processing");
  const brewing = getAllArticles("brewing");

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-lg) px-4 py-8 pb-24">
      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl">Learn</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Background reading on how coffee is processed and how to brew it.
        </p>
      </header>

      <Section
        title="Processing methods"
        category="processing"
        articles={processing}
        empty="Articles on washed, natural, honey, anaerobic, and wet-hulled processing are coming soon."
      />

      <Section
        title="Brewing guides"
        category="brewing"
        articles={brewing}
        empty="Guides for V60, Chemex, Kalita Wave, French Press, AeroPress, Espresso, Cold Brew, and Moka Pot are coming soon."
      />
    </div>
  );
}

function Section({
  title,
  category,
  articles,
  empty,
}: {
  title: string;
  category: LearnCategory;
  articles: ArticleSummary[];
  empty: string;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-xl">{title}</h2>
      {articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/learn/${category}/${a.slug}`}
                className="block rounded-lg border border-border bg-surface/60 p-4 transition hover:border-roast-medium"
              >
                <h3 className="font-display text-lg leading-tight">
                  {a.frontmatter.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {a.frontmatter.summary ?? a.frontmatter.description}
                </p>
                {a.frontmatter.readingTimeMinutes && (
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {a.frontmatter.readingTimeMinutes} min read
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
