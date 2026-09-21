import fs from "fs";
import path from "path";
import {
  ARTICLE_FILE_RE,
  ARTICLE_LANGS,
  parseArticleFile,
  type ArticleLang,
  type ParsedArticleFile,
} from "@shared/article-frontmatter";

const ARTICLES_DIR = path.resolve(import.meta.dirname, "..", "content", "articles");

interface ArticleEntry {
  slug: string;
  files: Partial<Record<ArticleLang, ParsedArticleFile>>;
}

function loadEntries(): Map<string, ArticleEntry> {
  const entries = new Map<string, ArticleEntry>();
  let fileNames: string[] = [];
  try {
    fileNames = fs.readdirSync(ARTICLES_DIR);
  } catch {
    return entries;
  }
  for (const fileName of fileNames) {
    const match = ARTICLE_FILE_RE.exec(fileName);
    if (!match) continue;
    const slug = match[1];
    const lang = match[2] as ArticleLang;
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, fileName), "utf8");
    const entry = entries.get(slug) ?? { slug, files: {} };
    entry.files[lang] = parseArticleFile(raw);
    entries.set(slug, entry);
  }
  return entries;
}

export interface NewsletterArticle {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  category: string;
}

/** Latest `limit` published articles, localized per language with an
 * English fallback for any language missing a translation. */
export function getLatestArticlesByLang(
  limit = 3,
): Record<ArticleLang, NewsletterArticle[]> {
  const entries = loadEntries();
  const result = Object.fromEntries(
    ARTICLE_LANGS.map((lang) => [lang, [] as NewsletterArticle[]]),
  ) as Record<ArticleLang, NewsletterArticle[]>;

  const candidates: Array<{ slug: string; en: ParsedArticleFile }> = [];
  entries.forEach((entry) => {
    const en = entry.files.en;
    if (!en) return;
    if (en.meta.draft === "true") return;
    candidates.push({ slug: entry.slug, en });
  });
  candidates.sort((a, b) =>
    (b.en.meta.publishDate || "").localeCompare(a.en.meta.publishDate || ""),
  );
  const top = candidates.slice(0, limit);

  for (const lang of ARTICLE_LANGS) {
    result[lang] = top.map(({ slug, en }) => {
      const entry = entries.get(slug)!;
      const loc = lang === "en" ? undefined : entry.files[lang];
      return {
        slug,
        title: loc?.meta.title || en.meta.title || slug,
        excerpt: loc?.meta.excerpt || en.meta.excerpt || "",
        publishDate: en.meta.publishDate || "",
        category: en.meta.category || "",
      };
    });
  }
  return result;
}
