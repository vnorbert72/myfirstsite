import type { Article } from "@shared/articles";
import {
  ARTICLE_FILE_RE,
  parseArticleFile,
  parseTags,
  type ArticleLang,
  type ParsedArticleFile,
} from "@shared/article-frontmatter";
import { normalizeLang } from "./article-dates";

const rawFiles = import.meta.glob("../../../content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

interface ArticleEntry {
  slug: string;
  files: Partial<Record<ArticleLang, ParsedArticleFile>>;
}

const entries = new Map<string, ArticleEntry>();

for (const [path, raw] of Object.entries(rawFiles)) {
  const fileName = path.split("/").pop() ?? "";
  const match = ARTICLE_FILE_RE.exec(fileName);
  if (!match) continue;
  const slug = match[1];
  const lang = match[2] as ArticleLang;
  const entry = entries.get(slug) ?? { slug, files: {} };
  entry.files[lang] = parseArticleFile(raw);
  entries.set(slug, entry);
}

function stripLeadingHeading(body: string): string {
  return body.replace(/^#\s[^\n]*\r?\n+/, "");
}

function toArticle(entry: ArticleEntry, lang: ArticleLang): Article | undefined {
  const en = entry.files.en;
  if (!en) return undefined;
  if (en.meta.draft === "true") return undefined;
  const loc = lang === "en" ? undefined : entry.files[lang];
  return {
    id: Number(en.meta.id) || 0,
    slug: entry.slug,
    title: loc?.meta.title || en.meta.title || entry.slug,
    excerpt: loc?.meta.excerpt || en.meta.excerpt || "",
    content: stripLeadingHeading(loc?.body ? loc.body : en.body),
    category: (en.meta.category as Article["category"]) || "Tips",
    author: en.meta.author || "",
    publishDate: en.meta.publishDate || "",
    modifiedDate: en.meta.modifiedDate || undefined,
    readTime: Number(en.meta.readTime) || 1,
    imageUrl: en.meta.imageUrl || undefined,
    imageAlt: loc?.meta.imageAlt || en.meta.imageAlt || undefined,
    seoTitle: loc?.meta.seoTitle || en.meta.seoTitle || undefined,
    seoDescription: loc?.meta.seoDescription || en.meta.seoDescription || undefined,
    tags: parseTags(en.meta.tags),
  };
}

export function getLocalizedArticles(language: string = "en"): Article[] {
  const lang = normalizeLang(language);
  const list: Article[] = [];
  entries.forEach((entry) => {
    const article = toArticle(entry, lang);
    if (article) list.push(article);
  });
  return list.sort(
    (a, b) => b.publishDate.localeCompare(a.publishDate) || b.id - a.id
  );
}

export function getLocalizedArticleBySlug(
  slug: string,
  language: string = "en"
): Article | undefined {
  const entry = entries.get(slug);
  if (!entry) return undefined;
  return toArticle(entry, normalizeLang(language));
}

export function getLocalizedArticlesByCategory(
  category: string,
  language: string = "en"
): Article[] {
  return getLocalizedArticles(language).filter(
    (article) => article.category === category
  );
}

export function searchLocalizedArticles(
  query: string,
  language: string = "en"
): Article[] {
  const term = query.toLowerCase();
  return getLocalizedArticles(language).filter(
    (article) =>
      article.title.toLowerCase().includes(term) ||
      article.excerpt.toLowerCase().includes(term) ||
      article.tags.some((tag) => tag.toLowerCase().includes(term)) ||
      article.author.toLowerCase().includes(term)
  );
}

export function getRecentLocalizedArticles(
  count: number = 3,
  language: string = "en"
): Article[] {
  return getLocalizedArticles(language).slice(0, count);
}
