import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import type { Article } from "@shared/articles";
import { useTranslation } from "react-i18next";
import { formatArticleDate } from "@/lib/article-dates";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { t, i18n } = useTranslation();
  return (
    <Link href={`/blog/${article.slug}`}>
      <Card className="p-6 hover-elevate transition-all duration-200 h-full flex flex-col">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.imageAlt || article.title}
            loading="lazy"
            className="w-full aspect-video object-cover rounded-md mb-4"
            data-testid={`img-article-card-${article.id}`}
          />
        )}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="secondary">{article.category}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{t("common.minuteRead", { minutes: article.readTime })}</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2 line-clamp-2" data-testid={`text-article-title-${article.id}`}>
          {article.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t text-sm">
          <span className="text-muted-foreground">{article.author}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatArticleDate(article.publishDate, i18n.language)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
