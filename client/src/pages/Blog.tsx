import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Clock, Calendar } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { getLocalizedArticles, searchLocalizedArticles, getLocalizedArticlesByCategory } from "@/lib/articles";
import { formatArticleDate } from "@/lib/article-dates";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { t, i18n } = useTranslation();

  const filteredArticles = selectedCategory === "all"
    ? searchQuery
      ? searchLocalizedArticles(searchQuery, i18n.language)
      : getLocalizedArticles(i18n.language)
    : getLocalizedArticlesByCategory(selectedCategory, i18n.language).filter((article) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query)) ||
          article.author.toLowerCase().includes(query)
        );
      });

  const showFeatured = selectedCategory === "all" && !searchQuery && filteredArticles.length > 0;
  const featuredArticle = showFeatured ? filteredArticles[0] : undefined;
  const gridArticles = featuredArticle
    ? filteredArticles.filter((article) => article.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("seo.blog.title")}
        description={t("seo.blog.description")}
        keywords={t("seo.blog.keywords")}
        type="website"
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: t("blog.title"),
          description: t("blog.subtitle"),
          url: `${window.location.origin}/blog`,
          blogPost: getLocalizedArticles(i18n.language).slice(0, 10).map((article) => ({
            "@type": "BlogPosting",
            headline: article.title,
            datePublished: article.publishDate,
            dateModified: article.modifiedDate || article.publishDate,
            url: `${window.location.origin}/blog/${article.slug}`,
          })),
        }}
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("blog.title")}</h1>
            <p className="text-muted-foreground">
              {t("blog.subtitle")}
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t("common.searchPlaceholder")}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-articles"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Filter by category:</p>
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            </div>
          </Card>

          {filteredArticles.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {t("common.showingArticles", { count: filteredArticles.length })}
                  {selectedCategory !== "all" && ` in ${selectedCategory}`}
                </p>
              </div>

              {featuredArticle && (
                <Card className="p-6 sm:p-8 mb-8" data-testid={`card-featured-article-${featuredArticle.id}`}>
                  <div className={featuredArticle.imageUrl ? "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-center" : undefined}>
                    {featuredArticle.imageUrl && (
                      <img
                        src={featuredArticle.imageUrl}
                        alt={featuredArticle.imageAlt || featuredArticle.title}
                        decoding="async"
                        className="w-full aspect-video object-cover rounded-md order-first lg:order-last"
                        data-testid="img-featured-article"
                      />
                    )}
                    <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge>{t("blog.featured")}</Badge>
                    <Badge variant="secondary">{featuredArticle.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatArticleDate(featuredArticle.publishDate, i18n.language, "long")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t("common.minuteRead", { minutes: featuredArticle.readTime })}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3" data-testid="text-featured-title">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 max-w-3xl">{featuredArticle.excerpt}</p>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{t("blog.by")} {featuredArticle.author}</p>
                    <Link href={`/blog/${featuredArticle.slug}`} aria-label={`${t("blog.readArticle")}: ${featuredArticle.title}`}>
                      <Button data-testid="button-read-featured">
                        {t("blog.readArticle")}
                        <span className="sr-only">: {featuredArticle.title}</span>
                      </Button>
                    </Link>
                  </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {t("blog.noResults")}
              </p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
