# Blog articles

Every blog post lives here as three Markdown files — one per language:

```
<slug>.en.md   English (source of truth: all metadata + body)
<slug>.hu.md   Hungarian (translated title, excerpt + body)
<slug>.es.md   Spanish (translated title, excerpt + body)
```

The site picks these up automatically at build time — no code changes needed.
The blog page always sorts by `publishDate`, newest first.

## Publishing a new article

1. Copy `_template.md` three times, e.g. `my-new-article.en.md`,
   `my-new-article.hu.md`, `my-new-article.es.md`. The slug (file name) becomes
   the URL: `/blog/my-new-article`.
2. Fill in the English file: all frontmatter fields plus the Markdown body.
   Use a unique `id` (next unused number) and `publishDate` as `YYYY-MM-DD`.
3. Fill in the Hungarian and Spanish files: `title:` and `excerpt:` in the
   frontmatter, then the translated body below.
4. Regenerate the sitemap + RSS feed: `npx tsx scripts/generate-sitemap.ts`
5. Check everything is complete: `npx tsx scripts/check-articles.ts`
6. Restart the app (or redeploy) — the article appears on /blog automatically,
   newest first, and the latest article becomes the featured post.

## Updating an old article

1. Edit the Markdown body (and the hu/es translations to match).
2. If the change is meaningful for readers, set `modifiedDate: YYYY-MM-DD` in
   the English file's frontmatter (today's date). This shows an "Updated ..."
   line on the article, updates `dateModified` in the structured data, and
   refreshes `<lastmod>` in the sitemap so search engines re-crawl the page.
   Don't bump `modifiedDate` for typo fixes — only for real content updates.
3. Never change `publishDate` on an existing article.
4. Re-run steps 4–6 above.

## Frontmatter fields (English file)

| Field       | Required | Example                                  |
|-------------|----------|------------------------------------------|
| id             | yes      | `13` (unique number)                      |
| title          | yes      | `How to Build a Morning Routine`          |
| excerpt        | yes      | 1–2 sentence summary shown on cards       |
| category       | yes      | One of: Nutrition, Workouts, Sports, Wellness, Tips |
| author         | yes      | `Dr. Sarah Mitchell`                      |
| publishDate    | yes      | `2026-01-15`                              |
| readTime       | yes      | `7` (minutes)                             |
| tags           | yes      | `protein, muscle building, nutrition`     |
| modifiedDate   | no       | `2026-03-01` — set when meaningfully updating an article |
| imageUrl       | no       | Path or URL to a hero image               |
| imageAlt       | no       | Alt text for the hero image (translatable in hu/es files) |
| seoTitle       | no       | Custom `<title>` tag (translatable in hu/es files) |
| seoDescription | no       | Custom meta description (translatable in hu/es files) |
| draft          | no       | `true` hides the article from the site    |

Hungarian/Spanish files only need `title:` and `excerpt:` (the rest is taken
from the English file). They may also override `imageAlt`, `seoTitle`, and
`seoDescription` with translated versions.

## Body conventions

- Start the body with an H1 (`# Title`) matching the title. The site strips it
  when rendering (the page shows its own headline), but it keeps the file
  readable on its own.
- Link calculator mentions so readers can act on advice:
  `[Macronutrient Calculator](/macros)`, `[Daily Calorie Calculator](/calories)`,
  `[BMI Calculator](/bmi)`, `[BMR Calculator](/bmr)`,
  `[our calculators](/#calculators)`. Translate the link text, keep the URL.
- Standard Markdown works: `##`/`###` headings, `**bold**`, lists, tables.
