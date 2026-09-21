import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MacroChart } from "@/components/MacroChart";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { PdfExportButton } from "@/components/PdfExportButton";
import { References, type Reference } from "@/components/References";

const MACRO_REFERENCES: Reference[] = [
  {
    title: "International Society of Sports Nutrition Position Stand: protein and exercise",
    source: "Jäger R. et al., Journal of the International Society of Sports Nutrition (2017)",
    url: "https://pubmed.ncbi.nlm.nih.gov/28642676/",
  },
  {
    title: "Carbohydrates for training and competition",
    source: "Burke LM. et al., Journal of Sports Sciences (2011)",
    url: "https://pubmed.ncbi.nlm.nih.gov/21660838/",
  },
  {
    title: "Acceptable Macronutrient Distribution Ranges (AMDR)",
    source: "U.S. National Institutes of Health (NIH)",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK56068/",
  },
];

export default function MacroCalculator() {
  const { t } = useTranslation();
  const [calories, setCalories] = useState("");
  const [goal, setGoal] = useState("maintenance");
  const [result, setResult] = useState<{ protein: number; carbs: number; fats: number } | null>(null);

  const goals = [
    { value: "loss", label: t("macroCalculator.weightLoss"), protein: 0.35, carbs: 0.35, fats: 0.30 },
    { value: "maintenance", label: t("macroCalculator.maintenance"), protein: 0.30, carbs: 0.40, fats: 0.30 },
    { value: "gain", label: t("macroCalculator.muscleGain"), protein: 0.30, carbs: 0.45, fats: 0.25 },
  ];

  const calculateMacros = () => {
    const cal = parseFloat(calories);
    if (!cal || cal <= 0) return;

    const selectedGoal = goals.find(g => g.value === goal) || goals[1];

    const proteinCal = cal * selectedGoal.protein;
    const carbsCal = cal * selectedGoal.carbs;
    const fatsCal = cal * selectedGoal.fats;

    setResult({
      protein: Math.round(proteinCal / 4),
      carbs: Math.round(carbsCal / 4),
      fats: Math.round(fatsCal / 9),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${t("macroCalculator.title")} | ${t("common.appName")}`}
        description={t("macroCalculator.description")}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: t("macroCalculator.title"),
          description: t("macroCalculator.description"),
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("macroCalculator.title")}</h1>
            <p className="text-muted-foreground">
              {t("macroCalculator.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t("macroCalculator.inputTitle")}</h2>

              <div className="space-y-2">
                <Label htmlFor="calories">{t("macroCalculator.dailyCalorieTarget")}</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="2000"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  data-testid="input-calories"
                />
                <p className="text-xs text-muted-foreground">
                  {t("macroCalculator.useCalculator")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">{t("macroCalculator.fitnessGoal")}</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger id="goal" data-testid="select-goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateMacros} className="w-full transition-transform duration-300 hover:scale-105" data-testid="button-calculate">
                {t("common.calculate")} {t("macroCalculator.macros")}
              </Button>
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t("macroCalculator.yourMacros")}</h2>

              {result !== null ? (
                <div className="space-y-6">
                  <div id="macro-result-export" className="space-y-6 bg-background">
                    <MacroChart protein={result.protein} carbs={result.carbs} fats={result.fats} />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-chart-1/10 border border-chart-1/20 rounded-lg">
                        <span className="font-medium">{t("macroCalculator.protein")}</span>
                        <span className="text-lg font-bold" data-testid="text-protein">
                          {result.protein}g
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                        <span className="font-medium">{t("macroCalculator.carbs")}</span>
                        <span className="text-lg font-bold" data-testid="text-carbs">
                          {result.carbs}g
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-chart-3/10 border border-chart-3/20 rounded-lg">
                        <span className="font-medium">{t("macroCalculator.fat")}</span>
                        <span className="text-lg font-bold" data-testid="text-fats">
                          {result.fats}g
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">{t("bmrCalculator.whatItMeans")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("macroCalculator.resultDescription").replace("{goal}", goals.find(g => g.value === goal)?.label.toLowerCase() || "")}
                      </p>
                    </div>

                    <References references={MACRO_REFERENCES} />
                  </div>

                  <div className="flex justify-center pt-4 border-t">
                    <PdfExportButton targetId="macro-result-export" filename="fitfusion-macros-result.pdf" />
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
                <h3 className="text-lg font-semibold">{t("macroCalculator.aboutMacros")}</h3>
                <ChevronDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4 text-sm text-muted-foreground">
                <div>
                  <strong>{t("macroCalculator.proteinRole")}</strong>
                </div>
                <div>
                  <strong>{t("macroCalculator.carbsRole")}</strong>
                </div>
                <div>
                  <strong>{t("macroCalculator.fatRole")}</strong>
                </div>
                <p className="pt-2">
                  {t("macroCalculator.choosingSplitDescription")}
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
