import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Info } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";

export default function Contact() {
  const { t } = useTranslation();

  const topics = ["topic1", "topic2", "topic3", "topic4"];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("contactPage.seoTitle")}
        description={t("contactPage.seoDescription")}
        keywords="contact FitFusion, feedback, support"
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {t("contactPage.badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-contact-title">
              {t("contactPage.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("contactPage.subtitle")}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                {t("contactPage.emailTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t("contactPage.emailText")}</p>
              <Button asChild data-testid="button-contact-email">
                <a href="mailto:info@fit-fusion.eu">
                  <Mail className="h-4 w-4" />
                  info@fit-fusion.eu
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SiInstagram className="h-6 w-6 text-primary" />
                {t("contactPage.instagramTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t("contactPage.instagramText")}</p>
              <Button asChild data-testid="button-contact-instagram">
                <a
                  href="https://www.instagram.com/fitfusion25eu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiInstagram className="h-4 w-4" />
                  {t("contactPage.instagramCta")}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                {t("contactPage.newsletterTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("contactPage.newsletterText")}</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("contactPage.topicsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {topics.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t(`contactPage.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                {t("contactPage.noteTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("contactPage.noteText")}</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
