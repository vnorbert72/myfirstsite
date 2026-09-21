/**
 * Blog content validation.
 *
 * Checks that every article in `content/articles/` is complete:
 *   - each slug has en, hu, and es files
 *   - the en file has all required frontmatter fields (id, title, excerpt,
 *     category, author, publishDate, readTime, tags)
 *   - ids and slugs are unique, dates are YYYY-MM-DD, readTime is numeric
 *   - hu/es files have translated title + excerpt and a non-empty body
 *   - every slug appears in client/public/sitemap.xml and feed.xml (run
 *     `npx tsx scripts/generate-sitemap.ts` after adding an article)
 *
 * Run via: npx tsx scripts/check-articles.ts
 * Exits non-zero if any problem is found.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ARTICLE_FILE_RE,
  ARTICLE_LANGS,
  REQUIRED_EN_META,
  REQUIRED_TRANSLATION_META,
  parseArticleFile,
  parseTags,
} from "../shared/article-frontmatter";
import { categories } from "../shared/articles";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, "../content/articles");
const SITEMAP = resolve(__dirname, "../client/public/sitemap.xml");
const FEED = resolve(__dirname, "../client/public/feed.xml");

const VALID_CATEGORIES = categories.filter((c) => c !== "all");

const errors: string[] = [];

const filesByLang = new Map<string, Map<string, string>>();
for (const lang of ARTICLE_LANGS) filesByLang.set(lang, new Map());

for (const file of readdirSync(CONTENT_DIR)) {
  if (!file.endsWith(".md")) continue;
  const match = ARTICLE_FILE_RE.exec(file);
  if (!match) {
    if (!file.startsWith("_") && file !== "README.md") {
      errors.push(`${file}: file name must be <slug>.<en|hu|es>.md`);
    }
    continue;
  }
  filesByLang.get(match[2])!.set(match[1], file);
}

const enFiles = filesByLang.get("en")!;
const seenIds = new Map<number, string>();

if (enFiles.size === 0) {
  errors.push(`no articles found in ${CONTENT_DIR}`);
}

const sitemap = existsSync(SITEMAP) ? readFileSync(SITEMAP, "utf8") : "";
if (!sitemap) {
  errors.push("client/public/sitemap.xml is missing — run: npx tsx scripts/generate-sitemap.ts");
}

const feed = existsSync(FEED) ? readFileSync(FEED, "utf8") : "";
if (!feed) {
  errors.push("client/public/feed.xml is missing — run: npx tsx scripts/generate-sitemap.ts");
}

for (const [slug, file] of Array.from(enFiles.entries()).sort()) {
  const { meta, body } = parseArticleFile(
    readFileSync(resolve(CONTENT_DIR, file), "utf8")
  );

  for (const key of REQUIRED_EN_META) {
    if (!meta[key]) errors.push(`${file}: missing required frontmatter field "${key}"`);
  }
  if (meta.id) {
    const id = Number(meta.id);
    if (!Number.isInteger(id) || id <= 0) {
      errors.push(`${file}: id must be a positive integer (got "${meta.id}")`);
    } else if (seenIds.has(id)) {
      errors.push(`${file}: duplicate id ${id} (also used by ${seenIds.get(id)})`);
    } else {
      seenIds.set(id, file);
    }
  }
  if (meta.publishDate && !/^\d{4}-\d{2}-\d{2}$/.test(meta.publishDate)) {
    errors.push(`${file}: publishDate must be YYYY-MM-DD (got "${meta.publishDate}")`);
  }
  if (meta.modifiedDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.modifiedDate)) {
      errors.push(`${file}: modifiedDate must be YYYY-MM-DD (got "${meta.modifiedDate}")`);
    } else if (meta.publishDate && meta.modifiedDate < meta.publishDate) {
      errors.push(`${file}: modifiedDate (${meta.modifiedDate}) is before publishDate (${meta.publishDate})`);
    }
  }
  if (meta.readTime && (!Number.isFinite(Number(meta.readTime)) || Number(meta.readTime) <= 0)) {
    errors.push(`${file}: readTime must be a positive number (got "${meta.readTime}")`);
  }
  if (meta.category && !VALID_CATEGORIES.includes(meta.category)) {
    errors.push(`${file}: unknown category "${meta.category}" (valid: ${VALID_CATEGORIES.join(", ")})`);
  }
  if (meta.tags && parseTags(meta.tags).length === 0) {
    errors.push(`${file}: tags must be a comma-separated list`);
  }
  if (!body) {
    errors.push(`${file}: article body is empty`);
  }

  if (meta.draft === "true") continue;

  for (const lang of ARTICLE_LANGS) {
    if (lang === "en") continue;
    const translated = filesByLang.get(lang)!.get(slug);
    if (!translated) {
      errors.push(`${slug}: missing ${lang} file (${slug}.${lang}.md)`);
      continue;
    }
    const parsed = parseArticleFile(
      readFileSync(resolve(CONTENT_DIR, translated), "utf8")
    );
    for (const key of REQUIRED_TRANSLATION_META) {
      if (!parsed.meta[key]) {
        errors.push(`${translated}: missing required frontmatter field "${key}"`);
      }
    }
    if (!parsed.body) {
      errors.push(`${translated}: translated body is empty`);
    }
  }

  if (sitemap && !sitemap.includes(`/blog/${slug}</loc>`)) {
    errors.push(`${slug}: missing from sitemap.xml — run: npx tsx scripts/generate-sitemap.ts`);
  }
  if (feed && !feed.includes(`/blog/${slug}</link>`)) {
    errors.push(`${slug}: missing from feed.xml — run: npx tsx scripts/generate-sitemap.ts`);
  }
}

for (const lang of ARTICLE_LANGS) {
  if (lang === "en") continue;
  for (const [slug, file] of filesByLang.get(lang)!) {
    if (!enFiles.has(slug)) {
      errors.push(`${file}: has no matching ${slug}.en.md source file`);
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ Article content check failed (${errors.length} problem${errors.length === 1 ? "" : "s"}):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`✓ ${enFiles.size} articles OK (en/hu/es complete, frontmatter valid, sitemap + feed in sync)`);
