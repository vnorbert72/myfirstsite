import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UnitToggle } from "@/components/UnitToggle";
import { GenderToggle } from "@/components/GenderToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { PdfExportButton } from "@/components/PdfExportButton";
import { References, type Reference } from "@/components/References";

const CALORIE_REFERENCES: Reference[] = [
  {
    title: "Dietary Guidelines for Americans, 2020-2025",
    source: "U.S. Department of Agriculture & Department of Health & Human Services",
    url: "https://www.dietaryguidelines.gov/",
  },
  {
    title: "Energy and protein requirements",
    source: "World Health Organization (WHO/FAO/UNU Joint Expert Consultation)",
    url: "https://www.who.int/publications/i/item/9241209356",
  },
  {
    title: "Physical activity guidelines for Americans, 2nd edition",
    source: "U.S. Office of Disease Prevention and Health Promotion",
    url: "https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines",
  },
];

export default function CalorieCalculator() {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("1.55");
  const [result, setResult] = useState<number | null>(null);

  const activityLevels = [
    { value: "1.2", label: t("calorieCalculator.sedentary") },
    { value: "1.375", label: t("calorieCalculator.lightlyActive") },
    { value: "1.55", label: t("calorieCalculator.moderatelyActive") },
    { value: "1.725", label: t("calorieCalculator.veryActive") },
    { value: "1.9", label: t("calorieCalculator.extraActive") },
  ];

  const calculateTDEE = () => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const activityMultiplier = parseFloat(activity);

    if (!a || !h || !w || a <= 0 || h <= 0 || w <= 0) return;

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

    const tdee = bmr * activityMultiplier;
    setResult(tdee);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${t("calorieCalculator.title")} | ${t("common.appName")}`}
        description={t("calorieCalculator.description")}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: t("calorieCalculator.title"),
          description: t("calorieCalculator.description"),
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("calorieCalculator.title")}</h1>
            <p className="text-muted-foreground">
              {t("calorieCalculator.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t("calorieCalculator.inputTitle")}</h2>

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

              <div className="space-y-2">
                <Label htmlFor="activity">{t("calorieCalculator.activityLevel")}</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger id="activity" data-testid="select-activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateTDEE} className="w-full transition-transform duration-300 hover:scale-105" data-testid="button-calculate">
                {t("common.calculate")} {t("calorieCalculator.dailyCalories")}
              </Button>
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t("calorieCalculator.yourResults")}</h2>

              {result !== null ? (
                <div className="space-y-6">
                  <div id="calorie-result-export" className="space-y-6 bg-background">
                    <div className="text-center space-y-2">
                      <div className="text-5xl font-bold text-primary" data-testid="text-tdee-result">
                        {Math.round(result)}
                      </div>
                      <Badge variant="secondary">{t("bmrCalculator.caloriesPerDay")}</Badge>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">{t("bmrCalculator.whatItMeans")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("calorieCalculator.resultDescription").replace("{calories}", Math.round(result).toString())}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">{t("calorieCalculator.goalBased")}</h3>

                      <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{t("calorieCalculator.weightLoss")}</span>
                          <span className="text-lg font-bold">{Math.round(result - 500)} cal</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("calorieCalculator.deficitDescription")}</p>
                      </div>

                      <div className="p-4 border border-chart-2/20 rounded-lg bg-chart-2/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{t("calorieCalculator.maintenance")}</span>
                          <span className="text-lg font-bold">{Math.round(result)} cal</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("calorieCalculator.maintainWeight")}</p>
                      </div>

                      <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{t("calorieCalculator.muscleGain")}</span>
                          <span className="text-lg font-bold">{Math.round(result + 300)} cal</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("calorieCalculator.surplusDescription")}</p>
                      </div>
                    </div>

                    <References references={CALORIE_REFERENCES} />
                  </div>

                  <div className="flex justify-center pt-4 border-t">
                    <PdfExportButton targetId="calorie-result-export" filename="fitfusion-calories-result.pdf" />
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
                <h3 className="text-lg font-semibold">{t("calorieCalculator.aboutCalories")}</h3>
                <ChevronDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4 text-sm text-muted-foreground">
                <p>
                  {t("calorieCalculator.aboutDescription")}
                </p>
                <p>
                  {t("calorieCalculator.safeWeightLossDescription")}
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
