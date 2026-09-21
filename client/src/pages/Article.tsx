import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, RefreshCw, ChevronRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { getLocalizedArticleBySlug, getLocalizedArticles } from "@/lib/articles";
import { formatArticleDate } from "@/lib/article-dates";
import { MarkdownContent } from "@/components/MarkdownContent";
import { ArticleCard } from "@/components/ArticleCard";
import ShareButtons from "@/components/ShareButtons";
import { AuthorBio } from "@/components/AuthorBio";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import NotFound from "@/pages/not-found";
import { useTranslation } from "react-i18next";

const RELATED_TOOLS: Record<string, { href: string; labelKey: string }[]> = {
  Nutrition: [
    { href: "/macros", labelKey: "macroCalculator.title" },
    { href: "/calories", labelKey: "calorieCalculator.title" },
    { href: "/food", labelKey: "nav.foodSearch" },
  ],
  Workouts: [
    { href: "/bmr", labelKey: "bmrCalculator.title" },
    { href: "/calories", labelKey: "calorieCalculator.title" },
  ],
  Sports: [
    { href: "/bmr", labelKey: "bmrCalculator.title" },
    { href: "/macros", labelKey: "macroCalculator.title" },
  ],
  Wellness: [
    { href: "/bmi", labelKey: "bmiCalculator.title" },
    { href: "/tips", labelKey: "nav.tips" },
  ],
  Tips: [
    { href: "/bmi", labelKey: "bmiCalculator.title" },
    { href: "/calories", labelKey: "calorieCalculator.title" },
  ],
};

export default function Article() {
  const [, params] = useRoute("/blog/:slug");
  const { t, i18n } = useTranslation();
  const article = params?.slug ? getLocalizedArticleBySlug(params.slug, i18n.language) : undefined;

  if (!article) {
    return <NotFound />;
  }

  const allArticles = getLocalizedArticles(i18n.language).filter(a => a.id !== article.id);
  const relatedArticles = [
    ...allArticles.filter(a => a.category === article.category),
    ...allArticles.filter(a => a.category !== article.category),
  ].slice(0, 3);
  const currentUrl = `/blog/${article.slug}`;

  const hashtags = article.tags.slice(0, 3).map(tag => tag.replace(/\s+/g, ''));

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={article.seoTitle || `${article.title} | ${t("common.appName")}`}
        description={article.seoDescription || article.excerpt}
        type="article"
        author={article.author}
        publishedTime={article.publishDate}
        modifiedTime={article.modifiedDate}
        image={article.imageUrl}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.seoDescription || article.excerpt,
          image: article.imageUrl
            ? [article.imageUrl.startsWith("http") ? article.imageUrl : `${window.location.origin}${article.imageUrl}`]
            : undefined,
          datePublished: article.publishDate,
          dateModified: article.modifiedDate || article.publishDate,
          author: {
            "@type": "Person",
            name: article.author,
          },
          publisher: {
            "@type": "Organization",
            name: "FitFusion",
            logo: {
              "@type": "ImageObject",
              url: `${window.location.origin}/favicon.ico`,
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${window.location.origin}/blog/${article.slug}`,
          },
          articleSection: article.category,
          keywords: article.tags.join(", "),
          inLanguage: i18n.language || "en",
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: window.location.origin + "/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: window.location.origin + "/blog",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: article.title,
              item: `${window.location.origin}/blog/${article.slug}`,
            },
          ],
        }}
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground" data-testid="link-breadcrumb-home">
                  {t("nav.home")}
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li>
                <Link href="/blog" className="hover:text-foreground" data-testid="link-breadcrumb-blog">
                  {t("nav.blog")}
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li aria-current="page" className="truncate max-w-[16rem] sm:max-w-md">
                {article.title}
              </li>
            </ol>
          </nav>
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-to-blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.backToBlog")}
            </Button>
          </Link>

          <article>
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="secondary">{article.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t("common.minuteRead", { minutes: article.readTime })}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatArticleDate(article.publishDate, i18n.language, "long")}</span>
                </div>
                {article.modifiedDate && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="text-article-updated">
                    <RefreshCw className="h-4 w-4" />
                    <span>{t("blog.updatedOn", { date: formatArticleDate(article.modifiedDate, i18n.language, "long") })}</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" data-testid="text-article-title">
                {article.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <p className="text-lg text-muted-foreground">{t("blog.by")} {article.author}</p>
                <ShareButtons
                  url={currentUrl}
                  title={article.title}
                  description={article.excerpt}
                  hashtags={hashtags}
                  showLabels={true}
                  size="sm"
                />
              </div>
            </div>

            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.imageAlt || article.title}
                decoding="async"
                className="w-full rounded-md mb-8 object-cover max-h-96"
                data-testid="img-article-hero"
              />
            )}

            <Card className="p-6 sm:p-8 mb-8">
              <MarkdownContent
                className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
                content={article.content}
              />
            </Card>

            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">{t("blog.relatedToolsTitle")}</h2>
              <div className="flex flex-wrap gap-3">
                {(RELATED_TOOLS[article.category] ?? RELATED_TOOLS.Tips).map((tool) => (
                  <Link key={tool.href} href={tool.href}>
                    <Button variant="outline" size="sm" data-testid={`link-related-tool-${tool.href.slice(1)}`}>
                      {t(tool.labelKey)}
                    </Button>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-6 mb-8 bg-muted/50">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">{t("blog.tagsLabel")}</span>
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("blog.enjoyedArticle", { defaultValue: "Enjoyed this article? Share it with others!" })}
                </p>
                <ShareButtons
                  url={currentUrl}
                  title={article.title}
                  description={article.excerpt}
                  hashtags={hashtags}
                  size="md"
                />
              </div>
            </Card>

            <AuthorBio authorName={article.author} />
          </article>

          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">{t("blog.relatedArticles")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
