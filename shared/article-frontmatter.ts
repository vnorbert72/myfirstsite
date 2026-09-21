export interface ParsedArticleFile {
  meta: Record<string, string>;
  body: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseArticleFile(raw: string): ParsedArticleFile {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) {
    return { meta: {}, body: raw.trim() };
  }
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

export function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export const ARTICLE_LANGS = ["en", "hu", "es"] as const;
export type ArticleLang = (typeof ARTICLE_LANGS)[number];

export const ARTICLE_FILE_RE = /^(.+)\.(en|hu|es)\.md$/;

export const REQUIRED_EN_META = [
  "id",
  "title",
  "excerpt",
  "category",
  "author",
  "publishDate",
  "readTime",
  "tags",
] as const;

export const REQUIRED_TRANSLATION_META = ["title", "excerpt"] as const;
