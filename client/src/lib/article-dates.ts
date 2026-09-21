export type ArticleDateLang = "en" | "hu" | "es";

export function normalizeLang(language: string = "en"): ArticleDateLang {
  if (language.startsWith("hu")) return "hu";
  if (language.startsWith("es")) return "es";
  return "en";
}

const DATE_LOCALES: Record<ArticleDateLang, string> = {
  en: "en-US",
  hu: "hu-HU",
  es: "es-ES",
};

export function formatArticleDate(
  date: string,
  language: string = "en",
  monthStyle: "short" | "long" = "short"
): string {
  return new Date(date).toLocaleDateString(DATE_LOCALES[normalizeLang(language)], {
    month: monthStyle,
    day: "numeric",
    year: "numeric",
  });
}
