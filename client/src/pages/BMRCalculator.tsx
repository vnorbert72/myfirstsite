import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UnitToggle } from "@/components/UnitToggle";
import { GenderToggle } from "@/components/GenderToggle";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { BMRGauge } from "@/components/BMRGauge";
import { PdfExportButton } from "@/components/PdfExportButton";
import { References, type Reference } from "@/components/References";

const BMR_REFERENCES: Reference[] = [
  {
    title: "A new predictive equation for resting energy expenditure in healthy individuals",
    source: "Mifflin MD et al., American Journal of Clinical Nutrition (1990)",
    url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
  },
  {
    title: "Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids",
    source: "U.S. National Academies / NIH",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK56068/",
  },
  {
    title: "Estimating energy requirements in adults",
    source: "World Health Organization (WHO) Technical Report",
    url: "https://www.who.int/publications/i/item/9241209356",
  },
];

export default function BMRCalculator() {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const hasCalculated = useRef(false);

  const calculateBMR = () => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!a || !h || !w || a <= 0 || h <= 0 || w <= 0) {
      setResult(null);
      return;
    }

    let bmr: number;
    if (unit === "metric") {
      if (gender === "male") {
        bmr = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        bmr = 10 * w + 6.25 * h - 5 * a - 161;
      }
    } else {
      const weightKg = w * 0.453592;
      const heightCm = h * 2.54;
      if (gender === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * a + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * a - 161;
      }
    }

    setResult(bmr);
    hasCalculated.current = true;
  };

  useEffect(() => {
    if (hasCalculated.current && age && height && weight) {
      const a = parseFloat(age);
      const h = parseFloat(height);
      const w = parseFloat(weight);

      if (!a || !h || !w || a <= 0 || h <= 0 || w <= 0) {
        return;
      }

      let bmr: number;
      if (unit === "metric") {
        if (gender === "male") {
          bmr = 10 * w + 6.25 * h - 5 * a + 5;
        } else {
          bmr = 10 * w + 6.25 * h - 5 * a - 161;
        }
      } else {
        const weightKg = w * 0.453592;
        const heightCm = h * 2.54;
        if (gender === "male") {
          bmr = 10 * weightKg + 6.25 * heightCm - 5 * a + 5;
        } else {
          bmr = 10 * weightKg + 6.25 * heightCm - 5 * a - 161;
        }
      }

      setResult(bmr);
    }
  }, [gender, age, height, weight, unit]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${t("bmrCalculator.title")} | ${t("common.appName")}`}
        description={t("bmrCalculator.description")}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: t("bmrCalculator.title"),
          description: t("bmrCalculator.description"),
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("bmrCalculator.title")}</h1>
            <p className="text-muted-foreground">
              {t("bmrCalculator.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t("bmrCalculator.inputTitle")}</h2>

              <GenderToggle gender={gender} onGenderChange={setGender} />

              <UnitToggle unit={unit} onUnitChange={setUnit} />

              <div className="space-y-2">
                <Label htmlFor="age">{t("bmrCalculator.ageYears")}</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="30"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  data-testid="input-age"
                />
              </div>

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

              <Button onClick={calculateBMR} className="w-full transition-transform duration-300 hover:scale-105" data-testid="button-calculate">
                {t("common.calculate")} BMR
              </Button>
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t("bmrCalculator.yourBMR")}</h2>

              {result !== null ? (
                <div className="space-y-6">
                  <div id="bmr-result-export" className="space-y-6 bg-background">
                    <div className="text-center space-y-2">
                      <div className="text-5xl font-bold text-primary" data-testid="text-bmr-result">
                        {Math.round(result)}
                      </div>
                      <Badge variant="secondary">{t("bmrCalculator.caloriesPerDay")}</Badge>
                    </div>

                    <BMRGauge bmr={result} />

                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">{t("bmrCalculator.whatItMeans")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("bmrCalculator.whatItMeansDescription").replace("{bmr}", Math.round(result).toString())}
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">{t("bmrCalculator.quickReference")}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("bmrCalculator.sedentary")}:</span>
                          <span className="font-semibold">{Math.round(result * 1.2)} cal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("bmrCalculator.lightExercise")}:</span>
                          <span className="font-semibold">{Math.round(result * 1.375)} cal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("bmrCalculator.moderate")}:</span>
                          <span className="font-semibold">{Math.round(result * 1.55)} cal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("bmrCalculator.veryActive")}:</span>
                          <span className="font-semibold">{Math.round(result * 1.725)} cal</span>
                        </div>
                      </div>
                    </div>

                    <References references={BMR_REFERENCES} />
                  </div>

                  <div className="flex justify-center pt-4 border-t">
                    <PdfExportButton targetId="bmr-result-export" filename="fitfusion-bmr-result.pdf" />
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
                <h3 className="text-lg font-semibold">{t("bmrCalculator.aboutBMR")}</h3>
                <ChevronDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4 text-sm text-muted-foreground">
                <p>
                  {t("bmrCalculator.aboutDescription")}
                </p>
                <p>
                  {t("bmrCalculator.additionalInfo")}
                </p>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
