import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";

export default function Privacy() {
  const { t } = useTranslation();

  const sections = [
    "data",
    "use",
    "newsletter",
    "cookies",
    "thirdParty",
    "rights",
    "changes",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("privacyPage.seoTitle")}
        description={t("privacyPage.seoDescription")}
        keywords="privacy policy, data protection, FitFusion privacy"
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3" data-testid="text-privacy-title">
              {t("privacyPage.title")}
            </h1>
            <p className="text-sm text-muted-foreground mb-6" data-testid="text-privacy-updated">
              {t("privacyPage.updated")}
            </p>
            <p className="text-lg text-muted-foreground">{t("privacyPage.intro")}</p>
          </div>

          <div className="space-y-6">
            {sections.map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-xl">{t(`privacyPage.${key}Title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t(`privacyPage.${key}Text`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
