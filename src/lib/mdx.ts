import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type LearnCategory = "processing" | "brewing";

export interface ArticleFrontmatter {
  title: string;
  description: string;
  summary?: string;
  readingTimeMinutes?: number;
  related?: string[];
}

export interface ArticleSummary {
  category: LearnCategory;
  slug: string;
  frontmatter: ArticleFrontmatter;
}

export interface ArticleSource {
  category: LearnCategory;
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

function categoryDir(category: LearnCategory): string {
  return path.join(CONTENT_DIR, category);
}

function readDirSafe(dir: string): string[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith(".mdx"))
      .map((d) => d.name);
  } catch {
    return [];
  }
}

export function getArticleSlugs(category: LearnCategory): string[] {
  return readDirSafe(categoryDir(category)).map((f) => f.replace(/\.mdx$/, ""));
}

export function getArticle(
  category: LearnCategory,
  slug: string,
): ArticleSource | null {
  const filePath = path.join(categoryDir(category), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const frontmatter = parsed.data as ArticleFrontmatter;
  return {
    category,
    slug,
    frontmatter,
    content: parsed.content,
  };
}

export function getAllArticles(category: LearnCategory): ArticleSummary[] {
  return getArticleSlugs(category)
    .map((slug) => {
      const article = getArticle(category, slug);
      return article
        ? { category, slug, frontmatter: article.frontmatter }
        : null;
    })
    .filter((a): a is ArticleSummary => a !== null);
}
