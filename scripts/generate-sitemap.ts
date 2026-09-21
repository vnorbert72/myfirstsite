/**
 * Dynamic sitemap + RSS feed generator.
 *
 * Builds `client/public/sitemap.xml` and `client/public/feed.xml` from the
 * canonical list of routes plus every article in `content/articles/`. Run via:
 *
 *   npx tsx scripts/generate-sitemap.ts
 *   npx tsx scripts/generate-sitemap.ts https://yourdomain.com
 *
 * If no base URL is provided as the first arg, the value of the SITE_URL
 * environment variable is used; otherwise it falls back to the current
 * production placeholder.
 */

import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ARTICLE_FILE_RE, parseArticleFile } from "../shared/article-frontmatter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, "../client/public/sitemap.xml");
const FEED_OUTPUT = resolve(__dirname, "../client/public/feed.xml");
const CONTENT_DIR = resolve(__dirname, "../content/articles");

interface ArticleRef {
  slug: string;
  title?: string;
  excerpt?: string;
  category?: string;
  author?: string;
  publishDate?: string;
  modifiedDate?: string;
}

function loadArticles(): ArticleRef[] {
  const refs: ArticleRef[] = [];
  for (const file of readdirSync(CONTENT_DIR)) {
    const match = ARTICLE_FILE_RE.exec(file);
    if (!match || match[2] !== "en") continue;
    const { meta } = parseArticleFile(
      readFileSync(resolve(CONTENT_DIR, file), "utf8")
    );
    if (meta.draft === "true") continue;
    refs.push({
      slug: match[1],
      title: meta.title,
      excerpt: meta.excerpt,
      category: meta.category,
      author: meta.author,
      publishDate: meta.publishDate,
      modifiedDate: meta.modifiedDate,
    });
  }
  return refs.sort((a, b) => a.slug.localeCompare(b.slug));
}

const articles = loadArticles();

const SUPPORTED_LANGS = ["en", "hu", "es"] as const;

interface Entry {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  lastmod?: string;
  alternates?: boolean;
}

const STATIC_ROUTES: Entry[] = [
  { path: "/", changefreq: "weekly", priority: 1.0, alternates: true },
  { path: "/bmi", changefreq: "monthly", priority: 0.9, alternates: true },
  { path: "/bmr", changefreq: "monthly", priority: 0.9, alternates: true },
  { path: "/calories", changefreq: "monthly", priority: 0.9, alternates: true },
  { path: "/macros", changefreq: "monthly", priority: 0.9, alternates: true },
  { path: "/food", changefreq: "monthly", priority: 0.8, alternates: true },
  { path: "/tips", changefreq: "monthly", priority: 0.8, alternates: true },
  { path: "/supplements", changefreq: "monthly", priority: 0.8, alternates: true },
  { path: "/blog", changefreq: "weekly", priority: 0.8, alternates: true },
  { path: "/about", changefreq: "yearly", priority: 0.5, alternates: true },
  { path: "/privacy", changefreq: "yearly", priority: 0.3, alternates: true },
  { path: "/contact", changefreq: "yearly", priority: 0.5, alternates: true },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildEntry(entry: Entry, baseUrl: string): string {
  const loc = `${baseUrl}${entry.path}`;
  const parts: string[] = [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
  ];

  if (entry.lastmod) {
    parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  }

  if (entry.alternates) {
    for (const lang of SUPPORTED_LANGS) {
      parts.push(
        `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(
          `${loc}?lang=${lang}`
        )}"/>`
      );
    }
    parts.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}"/>`
    );
  }

  parts.push("  </url>");
  return parts.join("\n");
}

function generate(baseUrl: string): string {
  const trimmedBase = baseUrl.replace(/\/$/, "");

  const articleEntries: Entry[] = articles.map((article) => ({
    path: `/blog/${article.slug}`,
    changefreq: "monthly",
    priority: 0.7,
    lastmod: article.modifiedDate || article.publishDate,
    alternates: true,
  }));

  const allEntries = [...STATIC_ROUTES, ...articleEntries];
  const body = allEntries.map((e) => buildEntry(e, trimmedBase)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

function toRssDate(date?: string): string {
  const parsed = date ? new Date(`${date}T00:00:00Z`) : new Date();
  return parsed.toUTCString();
}

function generateFeed(baseUrl: string): string {
  const trimmedBase = baseUrl.replace(/\/$/, "");
  const sorted = [...articles].sort((a, b) =>
    (b.publishDate ?? "").localeCompare(a.publishDate ?? "")
  );

  const items = sorted
    .map((article) => {
      const link = `${trimmedBase}/blog/${article.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(article.title ?? article.slug)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <description>${escapeXml(article.excerpt ?? "")}</description>`,
        article.category
          ? `      <category>${escapeXml(article.category)}</category>`
          : undefined,
        `      <pubDate>${toRssDate(article.publishDate)}</pubDate>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const latestDate = sorted
    .map((a) => a.modifiedDate || a.publishDate || "")
    .filter(Boolean)
    .sort()
    .pop();
  const lastBuild = toRssDate(latestDate);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FitFusion Blog</title>
    <link>${escapeXml(`${trimmedBase}/blog`)}</link>
    <description>Expert insights on nutrition, workouts, and wellness from FitFusion.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(`${trimmedBase}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

function main() {
  const baseUrl =
    process.argv[2] ?? process.env.SITE_URL ?? "https://fit-fusion.eu";
  const xml = generate(baseUrl);
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, xml, "utf8");
  writeFileSync(FEED_OUTPUT, generateFeed(baseUrl), "utf8");
  console.log(`✓ Sitemap written to ${OUTPUT}`);
  console.log(`✓ RSS feed written to ${FEED_OUTPUT}`);
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Total URLs: ${STATIC_ROUTES.length + articles.length}`);
  console.log(`  Feed items: ${articles.length}`);
}

main();
