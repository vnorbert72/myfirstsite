import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UnitToggle } from "@/components/UnitToggle";
import { BMIGauge } from "@/components/BMIGauge";
import { Badge } from "@/components/ui/badge";
import ShareButtons from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { PdfExportButton } from "@/components/PdfExportButton";
import { References, type Reference } from "@/components/References";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const BMI_REFERENCES: Reference[] = [
  {
    title: "Body mass index (BMI) — A useful tool for population assessment",
    source: "World Health Organization (WHO)",
    url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
  },
  {
    title: "Assessing Your Weight and Health Risk",
    source: "U.S. National Heart, Lung, and Blood Institute (NIH)",
    url: "https://www.nhlbi.nih.gov/health/educational/lose_wt/risk.htm",
  },
  {
    title: "About Adult BMI",
    source: "U.S. Centers for Disease Control and Prevention (CDC)",
    url: "https://www.cdc.gov/healthyweight/assessing/bmi/adult_bmi/index.html",
  },
];

export default function BMICalculator() {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!h || !w || h <= 0 || w <= 0) return;

    let bmi: number;
    if (unit === "metric") {
      bmi = w / ((h / 100) ** 2);
    } else {
      bmi = (w / (h ** 2)) * 703;
    }

    setResult(bmi);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: t("bmiCalculator.underweight"), variant: "secondary" as const };
    if (bmi < 25) return { label: t("bmiCalculator.normalWeight"), variant: "default" as const };
    if (bmi < 30) return { label: t("bmiCalculator.overweight"), variant: "secondary" as const };
    return { label: t("bmiCalculator.obese"), variant: "destructive" as const };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${t("bmiCalculator.title")} | ${t("common.appName")}`}
        description={t("bmiCalculator.description")}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: t("bmiCalculator.title"),
          description: t("bmiCalculator.description"),
          applicationCategory: "HealthApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "FitFusion" },
        }}
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("bmiCalculator.title")}</h1>
            <p className="text-muted-foreground">
              {t("bmiCalculator.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t("bmiCalculator.inputTitle")}</h2>

              <UnitToggle unit={unit} onUnitChange={setUnit} />

              <div className="space-y-2">
                <Label htmlFor="height">{t("bmiCalculator.height")} ({unit === "metric" ? "cm" : "inches"})</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder={unit === "metric" ? "170" : "67"}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  data-testid="input-height"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">{t("bmiCalculator.weight")} ({unit === "metric" ? "kg" : "lbs"})</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={unit === "metric" ? "70" : "154"}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  data-testid="input-weight"
                />
              </div>

              <Button onClick={calculateBMI} className="w-full transition-transform duration-300 hover:scale-105" data-testid="button-calculate">
                {t("common.calculate")} BMI
              </Button>
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t("bmiCalculator.yourBMI")}</h2>

              {result !== null ? (
                <div className="space-y-6">
                  <div id="bmi-result-export" className="space-y-6 bg-background">
                    <div className="text-center space-y-2">
                      <div className="text-5xl font-bold text-primary" data-testid="text-bmi-result">
                        {result.toFixed(1)}
                      </div>
                      <Badge variant={getBMICategory(result).variant} data-testid="badge-category">
                        {getBMICategory(result).label}
                      </Badge>
                    </div>

                    <BMIGauge bmi={result} />

                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">{t("bmrCalculator.whatItMeans")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {result < 18.5 && t("bmiCalculator.underweightDescription")}
                        {result >= 18.5 && result < 25 && t("bmiCalculator.normalWeightDescription")}
                        {result >= 25 && result < 30 && t("bmiCalculator.overweightDescription")}
                        {result >= 30 && t("bmiCalculator.obeseDescription")}
                      </p>
                    </div>

                    <References references={BMI_REFERENCES} />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t">
                    <PdfExportButton targetId="bmi-result-export" filename="fitfusion-bmi-result.pdf" />
                    <ShareButtons
                      url="/bmi"
                      title={`My BMI is ${result.toFixed(1)} - ${getBMICategory(result).label}`}
                      description={t("bmiCalculator.description")}
                      size="sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  {t("bmiCalculator.enterInfo")}
                </div>
              )}
            </Card>
          </div>

          <Card className="mt-6 p-6">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover-elevate active-elevate-2 p-4 rounded-md">
                <h3 className="text-lg font-semibold">{t("bmiCalculator.aboutBMI")}</h3>
                <ChevronDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4 text-sm text-muted-foreground">
                <p>
                  {t("bmiCalculator.aboutDescription")}
                </p>
                <p>
                  {t("bmiCalculator.limitationsDescription")}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <strong>{t("bmiCalculator.underweight")}:</strong> {t("bmiCalculator.categoryUnderweight")}
                  </div>
                  <div>
                    <strong>{t("bmiCalculator.normalWeight")}:</strong> {t("bmiCalculator.categoryNormal")}
                  </div>
                  <div>
                    <strong>{t("bmiCalculator.overweight")}:</strong> {t("bmiCalculator.categoryOverweight")}
                  </div>
                  <div>
                    <strong>{t("bmiCalculator.obese")}:</strong> {t("bmiCalculator.categoryObese")}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
