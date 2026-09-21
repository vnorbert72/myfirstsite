import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, Sparkles, ShieldCheck, Globe, FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";

export default function About() {
  const { t } = useTranslation();

  const offerings = ["what1", "what2", "what3", "what4"];
  const values = [
    { icon: FlaskConical, titleKey: "accuracyTitle", textKey: "accuracyText" },
    { icon: Globe, titleKey: "accessibilityTitle", textKey: "accessibilityText" },
    { icon: ShieldCheck, titleKey: "transparencyTitle", textKey: "transparencyText" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("aboutPage.seoTitle")}
        description={t("aboutPage.seoDescription")}
        keywords="about FitFusion, fitness calculators, nutrition tools, science-based fitness"
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {t("aboutPage.badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-about-title">
              {t("aboutPage.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("aboutPage.subtitle")}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                {t("aboutPage.missionTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t("aboutPage.missionP1")}</p>
              <p className="text-muted-foreground">{t("aboutPage.missionP2")}</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                {t("aboutPage.whatTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t("aboutPage.whatIntro")}</p>
              <ul className="space-y-3">
                {offerings.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t(`aboutPage.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("aboutPage.valuesTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {values.map((value) => (
                  <div key={value.titleKey} className="flex flex-col gap-2 p-4 rounded-md bg-muted/50">
                    <value.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{t(`aboutPage.${value.titleKey}`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`aboutPage.${value.textKey}`)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                {t("aboutPage.disclaimerTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("aboutPage.disclaimerText")}</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
