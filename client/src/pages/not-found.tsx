import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Page Not Found - FitFusion"
        description="The page you're looking for doesn't exist. Return to FitFusion to explore our fitness calculators and health resources."
        noIndex={true}
      />
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">404</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {t("errors.pageNotFound", "Page Not Found")}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t("errors.pageNotFoundDescription", "The page you're looking for doesn't exist or has been moved.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button data-testid="button-go-home">
                  <Home className="mr-2 h-4 w-4" />
                  {t("nav.home", "Go Home")}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.history.back()} data-testid="button-go-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("actions.goBack", "Go Back")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
