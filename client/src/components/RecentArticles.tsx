import { useTranslation } from "react-i18next";
import { getRecentLocalizedArticles } from "@/lib/articles";
import { ArticlePreview } from "@/components/ArticlePreview";

export default function RecentArticles() {
  const { i18n } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {getRecentLocalizedArticles(3, i18n.language).map((article) => (
        <ArticlePreview key={article.id} article={article} />
      ))}
    </div>
  );
}
