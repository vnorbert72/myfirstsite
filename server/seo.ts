import { getArticleSeoBySlug } from "./articles-reader";

// The canonical origin for this site. Hardcoded (rather than derived from
// the request) so a misconfigured proxy header can never produce an http://
// or wrong-host canonical URL — this must always match scripts/generate-sitemap.ts.
export const SITE_URL = "https://fit-fusion.eu";

interface RouteMeta {
  title: string;
  description: string;
}

// Title/description for every static (non-article) route, taken verbatim
// from client/src/i18n/locales/en.json so the raw server HTML a crawler
// sees before any JS runs already matches what the hydrated page sets.
const STATIC_ROUTES: Record<string, RouteMeta> = {
  "/": {
    title: "FitFusion - Free Science-Based Fitness & Nutrition Calculators",
    description:
      "Free calculators for BMI, BMR, daily calories, and macros. Personalized supplement guidance, expert nutrition tips, and a global food database.",
  },
  "/bmi": {
    title: "BMI Calculator | FitFusion",
    description:
      "Calculate your Body Mass Index (BMI) to understand your weight category and health status",
  },
  "/bmr": {
    title: "BMR Calculator | FitFusion",
    description:
      "Calculate your Basal Metabolic Rate (BMR) - the calories your body burns at rest",
  },
  "/calories": {
    title: "Daily Calorie Calculator | FitFusion",
    description:
      "Calculate your daily calorie needs based on your activity level and goals",
  },
  "/macros": {
    title: "Macronutrient Calculator | FitFusion",
    description:
      "Calculate your optimal protein, carbs, and fat intake for your fitness goals",
  },
  "/food": {
    title: "Food & Nutrition | FitFusion",
    description:
      "Explore healthy ingredients, workout recipes, and detailed nutrition information",
  },
  "/blog": {
    title: "Blog & Articles - FitFusion Nutrition, Training & Wellness Insights",
    description:
      "Evidence-based articles on nutrition, training, supplements, and wellness — written and reviewed by certified health professionals.",
  },
  "/tips": {
    title: "Fitness Tips for Beginners | FitFusion",
    description:
      "Essential fitness tips and advice for beginners and returning athletes. Learn how to start your fitness journey safely and effectively.",
  },
  "/supplements": {
    title: "Supplement Guide & Recommendations | FitFusion",
    description:
      "Evidence-based supplement recommendations based on your age, weight, and fitness goals. Learn about safe supplementation and which supplements to avoid.",
  },
  "/about": {
    title: "About Us - FitFusion Fitness & Nutrition Calculators",
    description:
      "Learn about FitFusion's mission to make science-backed fitness and nutrition tools free and accessible to everyone, in multiple languages.",
  },
  "/privacy": {
    title: "Privacy Policy - FitFusion",
    description:
      "How FitFusion handles your data: what we collect, how we use it, and your rights. We keep data collection to a minimum.",
  },
  "/contact": {
    title: "Contact Us - FitFusion",
    description:
      "Get in touch with the FitFusion team. Email us at info@fit-fusion.eu, reach us on Instagram, or subscribe to our newsletter for updates.",
  },
};

export interface ResolvedPageMeta {
  title: string;
  description: string;
  image?: string;
  canonicalPath: string;
  found: boolean;
}

/** Resolve the SEO metadata for a request path, independent of any client
 * JS. `pathname` must already have its query string and trailing slash
 * (other than "/") stripped. */
export function resolvePageMeta(pathname: string): ResolvedPageMeta {
  const staticMeta = STATIC_ROUTES[pathname];
  if (staticMeta) {
    return { ...staticMeta, canonicalPath: pathname, found: true };
  }

  const articleMatch = /^\/blog\/([^/]+)$/.exec(pathname);
  if (articleMatch) {
    const slug = articleMatch[1];
    const seo = getArticleSeoBySlug(slug);
    if (seo) {
      return {
        title: seo.title,
        description: seo.description,
        image: seo.image,
        canonicalPath: pathname,
        found: true,
      };
    }
  }

  return {
    title: "Page Not Found | FitFusion",
    description: "The page you are looking for could not be found.",
    canonicalPath: pathname,
    found: false,
  };
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Inject a per-route <title>, meta description, canonical link, and
 * matching Open Graph / Twitter tags into the raw index.html template, so
 * the FIRST HTML byte a crawler sees (before any client JS executes) is
 * already unique per page and carries an explicit canonical URL.
 *
 * Without this, every single route served the exact same static HTML
 * (same title, no canonical tag at all), which is what produced Search
 * Console's "Duplicate without user-selected canonical" and "Crawled -
 * currently not indexed" reports — Google's initial crawl had no per-page
 * signal to go on. The client-side SEOHead component still runs afterward
 * for hydrated visitors and keeps handling the hreflang language variants,
 * which is unaffected by this change.
 */
export function injectSeo(template: string, meta: ResolvedPageMeta): string {
  let html = template;

  const titleAttr = escapeAttr(meta.title);
  const descAttr = escapeAttr(meta.description);
  const canonicalUrl = `${SITE_URL}${meta.canonicalPath}`;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${titleAttr}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${descAttr}" />`,
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${titleAttr}" />`,
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${descAttr}" />`,
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`,
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${titleAttr}" />`,
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${descAttr}" />`,
  );

  if (meta.image) {
    const imageUrl = meta.image.startsWith("http")
      ? meta.image
      : `${SITE_URL}${meta.image}`;
    const imageAttr = escapeAttr(imageUrl);
    html = html.replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${imageAttr}" />`,
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${imageAttr}" />`,
    );
  }

  const extraTags = [
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`,
  ];
  if (!meta.found) {
    extraTags.push(`<meta name="robots" content="noindex, nofollow" />`);
  }
  html = html.replace("</title>", `</title>\n    ${extraTags.join("\n    ")}`);

  return html;
}
