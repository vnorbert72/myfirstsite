#!/usr/bin/env python3
"""
content_gen.py
==============

Generate ready-to-edit HTML article templates for the FitFusion blog.

Each generated file is a self-contained HTML draft that mirrors the site's
brand (orange primary, dark text, Inter font), is fully responsive, and ships
with proper SEO + Open Graph + Twitter Card meta tags. Drafts can be reviewed
in any browser, then ported into Markdown files in `content/articles/`
(see content/articles/README.md) once finalized.

Usage
-----
    python scripts/content_gen.py \\
        --title "10 Foods That Boost Your Metabolism" \\
        --category nutrition \\
        --author "Dr. Sarah Mitchell" \\
        --excerpt "Discover the science behind metabolism-boosting foods." \\
        --tags "metabolism,nutrition,weight-loss" \\
        --read-time 8

    # Or run interactively (prompts for each field):
    python scripts/content_gen.py --interactive

    # Unattended monthly automation (auto-selects a topic, no prompts).
    # This is the mode to use from a Cron Job / Replit Scheduled Deployment:
    python scripts/content_gen.py --auto

    # Custom output folder (default: blog-drafts/):
    python scripts/content_gen.py --title "..." --out-dir blog-drafts

Arguments are validated and a slug is auto-derived from the title when not
provided. The script never overwrites an existing file unless --force is set.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import html
import re
import sys
import unicodedata
from pathlib import Path
from typing import Iterable


SITE_NAME = "FitFusion"
SITE_URL = "https://fit-fusion.eu"
DEFAULT_OG_IMAGE = "/og-image.jpg"

ALLOWED_CATEGORIES = ("nutrition", "workout", "wellness", "supplements")

# Curated, evergreen topic bank used by --auto (unattended) mode so the
# generator can run on a schedule with zero human input. The monthly topic
# is chosen deterministically from this list (see pick_auto_topic), so each
# month produces a different, predictable draft and the list cycles yearly.
TOPIC_BANK: tuple[dict, ...] = (
    {
        "title": "The Role of Hydration in Metabolic Rate",
        "category": "nutrition",
        "excerpt": "How daily water intake influences your metabolism, energy, and weight-loss results.",
        "tags": ["hydration", "metabolism", "water-intake"],
        "read_time": 7,
    },
    {
        "title": "How Protein Timing Affects Muscle Growth",
        "category": "nutrition",
        "excerpt": "What the research says about when to eat protein to maximize muscle repair and growth.",
        "tags": ["protein", "muscle", "nutrition"],
        "read_time": 8,
    },
    {
        "title": "Progressive Overload: The Key to Continuous Gains",
        "category": "workout",
        "excerpt": "Why steadily increasing training demand is the single most important strength principle.",
        "tags": ["strength", "progressive-overload", "training"],
        "read_time": 7,
    },
    {
        "title": "Why Sleep Is Your Most Underrated Recovery Tool",
        "category": "wellness",
        "excerpt": "How quality sleep drives recovery, hormones, and fitness progress more than most supplements.",
        "tags": ["sleep", "recovery", "wellness"],
        "read_time": 6,
    },
    {
        "title": "Creatine Monohydrate: What the Science Actually Says",
        "category": "supplements",
        "excerpt": "An evidence-based look at creatine, the most researched supplement in sports nutrition.",
        "tags": ["creatine", "supplements", "performance"],
        "read_time": 9,
    },
    {
        "title": "Understanding Macros: Carbs, Protein, and Fat Explained",
        "category": "nutrition",
        "excerpt": "A beginner-friendly guide to macronutrients and how to balance them for your goals.",
        "tags": ["macros", "nutrition", "diet"],
        "read_time": 8,
    },
    {
        "title": "HIIT vs Steady-State Cardio for Fat Loss",
        "category": "workout",
        "excerpt": "Comparing high-intensity intervals and steady cardio to find what fits your fat-loss goals.",
        "tags": ["cardio", "hiit", "fat-loss"],
        "read_time": 7,
    },
    {
        "title": "Managing Stress for Better Fitness Results",
        "category": "wellness",
        "excerpt": "How chronic stress and cortisol can stall progress, and practical ways to keep them in check.",
        "tags": ["stress", "cortisol", "wellness"],
        "read_time": 6,
    },
    {
        "title": "Do You Really Need a Multivitamin?",
        "category": "supplements",
        "excerpt": "When a multivitamin genuinely helps, when it doesn't, and how to spot real micronutrient gaps.",
        "tags": ["multivitamin", "supplements", "micronutrients"],
        "read_time": 6,
    },
    {
        "title": "Calorie Deficits Explained: Sustainable Weight Loss",
        "category": "nutrition",
        "excerpt": "How calorie deficits work and how to build one you can actually stick to long term.",
        "tags": ["calorie-deficit", "weight-loss", "tdee"],
        "read_time": 8,
    },
    {
        "title": "Building a Beginner-Friendly Strength Routine",
        "category": "workout",
        "excerpt": "A simple, balanced strength template for anyone starting their training journey.",
        "tags": ["beginners", "strength", "routine"],
        "read_time": 7,
    },
    {
        "title": "The Link Between Gut Health and Energy Levels",
        "category": "wellness",
        "excerpt": "How your gut microbiome affects energy, digestion, and overall well-being.",
        "tags": ["gut-health", "energy", "wellness"],
        "read_time": 7,
    },
)

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title_esc} | {site_name}</title>
  <meta name="description" content="{excerpt_esc}" />
  <meta name="keywords" content="{tags_csv_esc}" />
  <meta name="author" content="{author_esc}" />
  <link rel="canonical" href="{canonical}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="{site_name}" />
  <meta property="og:title" content="{title_esc}" />
  <meta property="og:description" content="{excerpt_esc}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:image" content="{image_url}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="{og_locale}" />
  <meta property="article:author" content="{author_esc}" />
  <meta property="article:published_time" content="{published_iso}" />
  <meta property="article:section" content="{category_label}" />
  {article_tags_meta}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title_esc}" />
  <meta name="twitter:description" content="{excerpt_esc}" />
  <meta name="twitter:image" content="{image_url}" />

  <!-- JSON-LD Article schema -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": {title_json},
    "description": {excerpt_json},
    "author": {{ "@type": "Person", "name": {author_json} }},
    "publisher": {{ "@type": "Organization", "name": "{site_name}" }},
    "datePublished": "{published_iso}",
    "image": "{image_url}",
    "mainEntityOfPage": "{canonical}"
  }}
  </script>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {{
      --bg: #ffffff;
      --fg: #1a1a1a;
      --muted: #6b7280;
      --border: #e5e7eb;
      --primary: hsl(14, 82%, 51%);
      --primary-soft: hsl(14, 82%, 97%);
      --card: #ffffff;
      --max-w: 760px;
      --radius: 6px;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --bg: #0c0c0d;
        --fg: #f5f5f5;
        --muted: #a1a1aa;
        --border: #27272a;
        --primary-soft: hsl(14, 60%, 12%);
        --card: #171718;
      }}
    }}
    * {{ box-sizing: border-box; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }}
    .container {{
      max-width: var(--max-w);
      margin: 0 auto;
      padding: 1.5rem;
    }}
    header.site {{
      border-bottom: 1px solid var(--border);
      background: var(--card);
    }}
    header.site .container {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-block: 1rem;
    }}
    .brand {{
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      font-size: 1.125rem;
      letter-spacing: -0.01em;
    }}
    .brand:hover {{ opacity: 0.85; }}
    nav a {{
      color: var(--muted);
      text-decoration: none;
      margin-left: 1rem;
      font-size: 0.9rem;
    }}
    nav a:hover {{ color: var(--fg); }}

    .meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      align-items: center;
      color: var(--muted);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }}
    .badge {{
      display: inline-block;
      background: var(--primary-soft);
      color: var(--primary);
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}
    h1 {{
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin: 0.5rem 0 1rem;
    }}
    h2 {{
      font-size: clamp(1.4rem, 3vw, 1.75rem);
      margin-top: 2.5rem;
      margin-bottom: 0.75rem;
      letter-spacing: -0.01em;
    }}
    h3 {{
      font-size: 1.2rem;
      margin-top: 1.75rem;
      margin-bottom: 0.5rem;
    }}
    p {{ margin: 0 0 1.1rem; }}
    a {{ color: var(--primary); }}
    img, figure {{
      max-width: 100%;
      height: auto;
      border-radius: var(--radius);
    }}
    figure {{ margin: 1.5rem 0; }}
    figcaption {{
      font-size: 0.85rem;
      color: var(--muted);
      margin-top: 0.5rem;
      text-align: center;
    }}
    blockquote {{
      border-left: 3px solid var(--primary);
      background: var(--primary-soft);
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
      border-radius: 0 var(--radius) var(--radius) 0;
      font-style: italic;
    }}
    ul, ol {{ padding-left: 1.4rem; margin: 0 0 1.1rem; }}
    li {{ margin-bottom: 0.5rem; }}
    .callout {{
      background: var(--primary-soft);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      margin: 1.5rem 0;
    }}
    .callout strong {{ color: var(--primary); }}
    .references {{
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      font-size: 0.9rem;
      color: var(--muted);
    }}
    .references ol {{ padding-left: 1.2rem; }}
    footer.site {{
      margin-top: 3rem;
      padding: 2rem 0;
      border-top: 1px solid var(--border);
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
    }}
    @media (max-width: 540px) {{
      header.site .container {{ flex-direction: column; align-items: flex-start; }}
      nav a {{ margin-left: 0; margin-right: 1rem; }}
    }}
  </style>
</head>
<body>
  <header class="site">
    <div class="container">
      <a class="brand" href="{site_url}">{site_name}</a>
      <nav>
        <a href="{site_url}/blog">Blog</a>
        <a href="{site_url}">Calculators</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <article>
      <div class="meta">
        <span class="badge">{category_label}</span>
        <span>By <strong>{author_esc}</strong></span>
        <span>·</span>
        <time datetime="{published_iso}">{published_human}</time>
        <span>·</span>
        <span>{read_time} min read</span>
      </div>

      <h1>{title_esc}</h1>
      <p style="font-size:1.15rem; color: var(--muted); margin-bottom: 2rem;">
        {excerpt_esc}
      </p>

      <!-- ============ EDIT BELOW ============ -->

      <h2>Introduction</h2>
      <p>Open with the problem, who it affects, and what the reader will learn.
      Cite a concrete number or surprising fact in the first 3 sentences to earn the click.</p>

      <h2>Section One Heading</h2>
      <p>Explain the first key concept. Keep paragraphs to 2-4 sentences.</p>
      <ul>
        <li>Bullet point one</li>
        <li>Bullet point two</li>
        <li>Bullet point three</li>
      </ul>

      <h2>Section Two Heading</h2>
      <p>Use real examples, numbers, or short tables. Link to relevant FitFusion
      calculators inline, e.g. <a href="{site_url}/bmi">BMI Calculator</a>.</p>

      <div class="callout">
        <strong>Quick tip:</strong> Replace this callout with a useful actionable insight.
      </div>

      <h2>Section Three Heading</h2>
      <p>Continue with practical guidance.</p>

      <blockquote>
        Optional pull-quote from a credible source or expert.
      </blockquote>

      <h2>Conclusion</h2>
      <p>Wrap up with the main takeaway and an invitation to try a related FitFusion tool.</p>

      <!-- ============ EDIT ABOVE ============ -->

      <section class="references" aria-label="References">
        <h3 style="margin-top:0;">References</h3>
        <ol>
          <li>Author A. <em>Title of source</em>. Journal/Org, Year. <a href="#">Link</a></li>
          <li>Author B. <em>Title of source</em>. Journal/Org, Year. <a href="#">Link</a></li>
        </ol>
      </section>
    </article>
  </main>

  <footer class="site">
    <div class="container">
      © {year} {site_name}. Educational content; not medical advice.
    </div>
  </footer>
</body>
</html>
"""


def slugify(value: str) -> str:
    """Convert an arbitrary string to a url-safe slug."""
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9\s-]", "", value).strip().lower()
    value = re.sub(r"[\s_-]+", "-", value)
    return value or "untitled-article"


def pick_auto_topic(today: _dt.date) -> dict:
    """Deterministically select this month's topic from TOPIC_BANK.

    Using year*12 + month as the index means each calendar month maps to a
    single, predictable entry and the bank cycles once a year. This keeps
    unattended (scheduled) runs reproducible and collision-free.
    """
    index = (today.year * 12 + (today.month - 1)) % len(TOPIC_BANK)
    return TOPIC_BANK[index]


def _esc(s: str) -> str:
    return html.escape(s, quote=True)


def _json_str(s: str) -> str:
    """Return a JSON-safe quoted string."""
    import json as _json
    return _json.dumps(s, ensure_ascii=False)


def _build_article_tag_meta(tags: Iterable[str]) -> str:
    return "\n  ".join(
        f'<meta property="article:tag" content="{_esc(t)}" />'
        for t in tags
        if t.strip()
    )


def render_html(
    *,
    title: str,
    slug: str,
    category: str,
    author: str,
    excerpt: str,
    tags: list[str],
    read_time: int,
    lang: str,
    image_url: str,
    published: _dt.date,
) -> str:
    canonical = f"{SITE_URL}/blog/{slug}"
    image_full = image_url if image_url.startswith("http") else f"{SITE_URL}{image_url}"
    og_locale = {"hu": "hu_HU", "es": "es_ES"}.get(lang, "en_US")
    return HTML_TEMPLATE.format(
        lang=lang,
        site_name=SITE_NAME,
        site_url=SITE_URL,
        title_esc=_esc(title),
        title_json=_json_str(title),
        excerpt_esc=_esc(excerpt),
        excerpt_json=_json_str(excerpt),
        author_esc=_esc(author),
        author_json=_json_str(author),
        tags_csv_esc=_esc(", ".join(tags)),
        article_tags_meta=_build_article_tag_meta(tags),
        canonical=canonical,
        image_url=image_full,
        og_locale=og_locale,
        category_label=category.capitalize(),
        published_iso=published.isoformat(),
        published_human=published.strftime("%B %d, %Y"),
        read_time=read_time,
        year=_dt.date.today().year,
    )


def _prompt(label: str, default: str | None = None, required: bool = True) -> str:
    suffix = f" [{default}]" if default else ""
    while True:
        value = input(f"{label}{suffix}: ").strip()
        if not value and default is not None:
            return default
        if value or not required:
            return value
        print("  This field is required.")


def parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="content_gen.py",
        description="Generate HTML article templates for the FitFusion blog.",
    )
    p.add_argument("--title", help="Article title")
    p.add_argument("--slug", help="URL slug (auto-derived from title if omitted)")
    p.add_argument(
        "--category",
        choices=ALLOWED_CATEGORIES,
        default="nutrition",
        help=f"Article category (one of: {', '.join(ALLOWED_CATEGORIES)})",
    )
    p.add_argument("--author", default="FitFusion Editorial Team", help="Author name")
    p.add_argument("--excerpt", help="One-sentence summary used in meta description")
    p.add_argument("--tags", default="", help="Comma-separated tags")
    p.add_argument("--read-time", type=int, default=6, help="Estimated read time in minutes")
    p.add_argument("--lang", default="en", choices=("en", "hu", "es"), help="Article language")
    p.add_argument("--image", default=DEFAULT_OG_IMAGE, help="Social/OG image URL or absolute path")
    p.add_argument("--date", help="Publish date (YYYY-MM-DD), defaults to today")
    p.add_argument("--out-dir", default="blog-drafts", help="Output folder")
    p.add_argument("--force", action="store_true", help="Overwrite if file already exists")
    p.add_argument("--interactive", action="store_true", help="Prompt for any missing required fields")
    p.add_argument(
        "--auto",
        action="store_true",
        help="Unattended mode: auto-select this month's topic from the built-in bank "
        "(no prompts). Use this for Cron Jobs / Replit Scheduled Deployments.",
    )
    p.add_argument(
        "--stdout",
        action="store_true",
        help="Write the rendered HTML to stdout instead of a file (status goes to "
        "stderr). Useful for piping the draft straight into an emailer.",
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv if argv is not None else sys.argv[1:])

    title = args.title
    excerpt = args.excerpt

    # In --stdout mode, stdout is reserved for the HTML document, so all
    # human-facing status lines must go to stderr to avoid corrupting it.
    info_stream = sys.stderr if args.stdout else sys.stdout

    def _info(msg: str = "") -> None:
        print(msg, file=info_stream)

    if args.auto:
        # Fully unattended: pick the monthly topic and fill every field so the
        # script never blocks on input() in a non-interactive (cron) context.
        topic = pick_auto_topic(_dt.date.today())
        title = topic["title"]
        excerpt = topic["excerpt"]
        args.category = topic["category"]
        args.tags = ",".join(topic["tags"])
        args.read_time = topic["read_time"]
        # Prefix the slug with the year-month so monthly drafts never collide,
        # and overwrite freely if the same month is regenerated.
        month_prefix = _dt.date.today().strftime("%Y-%m")
        args.slug = f"{month_prefix}-{slugify(title)}"
        args.force = True
        args.interactive = False
        _info(f"[auto] Monthly topic selected: {title} ({args.category})")

    # Never enter interactive prompting in --stdout mode: prompts would corrupt
    # the HTML on stdout. Missing fields then fall through to the validation
    # errors below (printed to stderr, exit 2).
    if (args.interactive or not title) and not args.stdout:
        _info("FitFusion article generator")
        _info("=========================")
        title = title or _prompt("Title")
        args.slug = args.slug or _prompt("Slug", default=slugify(title))
        excerpt = excerpt or _prompt("Excerpt (one sentence)")
        if args.interactive:
            args.category = _prompt(f"Category ({'/'.join(ALLOWED_CATEGORIES)})", default=args.category)
            args.author = _prompt("Author", default=args.author)
            args.tags = _prompt("Tags (comma-separated)", default=args.tags, required=False)

    if not title:
        print("error: --title is required (or use --interactive)", file=sys.stderr)
        return 2
    if not excerpt:
        print("error: --excerpt is required (or use --interactive)", file=sys.stderr)
        return 2
    if args.category not in ALLOWED_CATEGORIES:
        print(f"error: --category must be one of {ALLOWED_CATEGORIES}", file=sys.stderr)
        return 2

    raw_slug = args.slug or slugify(title)
    # Always re-slugify the user-provided slug BEFORE rendering so the
    # canonical URL and meta tags also use the safe value, and so a slug
    # like "../../etc/passwd" can never escape the output directory.
    safe_slug = slugify(raw_slug)
    if safe_slug != raw_slug:
        _info(f"  (sanitized slug to {safe_slug!r})")
    slug = safe_slug

    try:
        published = (
            _dt.date.fromisoformat(args.date) if args.date else _dt.date.today()
        )
    except ValueError:
        print("error: --date must be YYYY-MM-DD", file=sys.stderr)
        return 2

    tags = [t.strip() for t in args.tags.split(",") if t.strip()]

    html_doc = render_html(
        title=title,
        slug=slug,
        category=args.category,
        author=args.author,
        excerpt=excerpt,
        tags=tags,
        read_time=max(1, int(args.read_time)),
        lang=args.lang,
        image_url=args.image,
        published=published,
    )

    if args.stdout:
        # Emit the document to stdout (status already routed to stderr) so a
        # caller (e.g. the monthly emailer) can consume it without a file.
        sys.stdout.write(html_doc)
        _info(f"[stdout] Rendered draft: {title} ({slug})")
        return 0

    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = (out_dir / f"{safe_slug}.html").resolve()

    # Defensive check: even after slugify, confirm the resolved path
    # is contained inside the intended output directory.
    try:
        out_path.relative_to(out_dir)
    except ValueError:
        print(
            f"error: refusing to write outside output directory ({out_path})",
            file=sys.stderr,
        )
        return 2

    if out_path.exists() and not args.force:
        print(
            f"error: {out_path} already exists. Use --force to overwrite.",
            file=sys.stderr,
        )
        return 1

    out_path.write_text(html_doc, encoding="utf-8")

    _info(f"✓ Created {out_path}")
    _info(f"  Title:    {title}")
    _info(f"  Slug:     {slug}")
    _info(f"  Category: {args.category}")
    _info(f"  Language: {args.lang}")
    _info(f"  Tags:     {', '.join(tags) if tags else '(none)'}")
    _info("\nOpen the file in a browser to preview, then port the content into")
    _info("Markdown files in content/articles/ (see content/articles/README.md).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
