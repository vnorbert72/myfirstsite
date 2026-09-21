import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { Article } from "@shared/articles";
import { useTranslation } from "react-i18next";
import { formatArticleDate } from "@/lib/article-dates";

interface ArticlePreviewProps {
  article: Article;
  featured?: boolean;
}

export function ArticlePreview({ article, featured = false }: ArticlePreviewProps) {
  const { t, i18n } = useTranslation();
  return (
    <Card className={`p-6 hover-elevate transition-all duration-200 ${featured ? 'md:col-span-2' : ''}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="secondary">{article.category}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{t("common.minuteRead", { minutes: article.readTime })}</span>
          </div>
        </div>

        <h3 className={`font-semibold mb-2 ${featured ? 'text-2xl' : 'text-lg'}`}>
          {article.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{article.author}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatArticleDate(article.publishDate, i18n.language)}</span>
            </div>
          </div>

          <Link href={`/blog/${article.slug}`} aria-label={`${t("common.readMore")}: ${article.title}`}>
            <Button variant="ghost" size="sm" data-testid={`button-read-article-${article.id}`}>
              {t("common.readMore")}
              <span className="sr-only">: {article.title}</span>
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
