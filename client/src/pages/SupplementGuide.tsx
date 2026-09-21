import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Pill, BookOpen, Shield, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { PdfExportButton } from "@/components/PdfExportButton";
import { References, type Reference } from "@/components/References";
import { GenderToggle } from "@/components/GenderToggle";

const SUPPLEMENT_REFERENCES: Reference[] = [
  {
    title: "Office of Dietary Supplements – Health Information",
    source: "U.S. National Institutes of Health (NIH)",
    url: "https://ods.od.nih.gov/HealthInformation/healthinformation.aspx",
  },
  {
    title: "International Society of Sports Nutrition Position Stand: creatine supplementation and exercise",
    source: "Kreider RB. et al., Journal of the International Society of Sports Nutrition (2017)",
    url: "https://pubmed.ncbi.nlm.nih.gov/28615996/",
  },
  {
    title: "Vitamin D supplementation and athletic performance",
    source: "Owens DJ. et al., Sports Medicine (2018)",
    url: "https://pubmed.ncbi.nlm.nih.gov/29243060/",
  },
];

interface SupplementRecommendation {
  name: string;
  dosage: string;
  timing: string;
  priority: "essential" | "beneficial" | "optional";
}

export default function SupplementGuide() {
  const { t } = useTranslation();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [recommendations, setRecommendations] = useState<SupplementRecommendation[] | null>(null);

  const calculateRecommendations = () => {
    if (!age || !weight || !goal || !activityLevel) return;

    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const supplements: SupplementRecommendation[] = [];

    // Protein powder
    const proteinPerKg = goal === "muscle_gain" ? 2.0 : goal === "weight_loss" ? 1.8 : 1.6;
    const dailyProtein = Math.round(weightNum * proteinPerKg);
    supplements.push({
      name: t("supplements.recommendations.protein.name"),
      dosage: t("supplements.recommendations.protein.dosage", { amount: dailyProtein }),
      timing: t("supplements.recommendations.protein.timing"),
      priority: goal === "muscle_gain" ? "essential" : "beneficial"
    });

    // Creatine (for muscle gain and active individuals)
    if (goal === "muscle_gain" || activityLevel === "very_active" || activityLevel === "extra_active") {
      supplements.push({
        name: t("supplements.recommendations.creatine.name"),
        dosage: t("supplements.recommendations.creatine.dosage"),
        timing: t("supplements.recommendations.creatine.timing"),
        priority: "beneficial"
      });
    }

    // Multivitamin
    supplements.push({
      name: t("supplements.recommendations.multivitamin.name"),
      dosage: t("supplements.recommendations.multivitamin.dosage"),
      timing: t("supplements.recommendations.multivitamin.timing"),
      priority: "essential"
    });

    // Omega-3
    supplements.push({
      name: t("supplements.recommendations.omega3.name"),
      dosage: t("supplements.recommendations.omega3.dosage"),
      timing: t("supplements.recommendations.omega3.timing"),
      priority: "beneficial"
    });

    // Vitamin D (especially for older adults)
    if (ageNum > 40) {
      supplements.push({
        name: t("supplements.recommendations.vitaminD.name"),
        dosage: t("supplements.recommendations.vitaminD.dosage"),
        timing: t("supplements.recommendations.vitaminD.timing"),
        priority: "essential"
      });
    }

    // Calcium (for women and older adults)
    if (gender === "female" || ageNum > 50) {
      supplements.push({
        name: t("supplements.recommendations.calcium.name"),
        dosage: t("supplements.recommendations.calcium.dosage"),
        timing: t("supplements.recommendations.calcium.timing"),
        priority: ageNum > 50 ? "essential" : "beneficial"
      });
    }

    // BCAAs (optional for intense training)
    if (goal === "muscle_gain" && activityLevel === "extra_active") {
      supplements.push({
        name: t("supplements.recommendations.bcaa.name"),
        dosage: t("supplements.recommendations.bcaa.dosage"),
        timing: t("supplements.recommendations.bcaa.timing"),
        priority: "optional"
      });
    }

    setRecommendations(supplements);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateRecommendations();
  };

  const handleReset = () => {
    setAge("");
    setWeight("");
    setGoal("");
    setActivityLevel("");
    setRecommendations(null);
  };

  const commonSupplements = ["protein", "creatine", "multivitamin", "omega3", "vitaminD", "preworkout"];
  const safetyTips = ["tip1", "tip2", "tip3", "tip4", "tip5"];
  const avoidSupplements = ["avoid1", "avoid2", "avoid3", "avoid4"];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("supplements.seo.title")}
        description={t("supplements.seo.description")}
        keywords="supplement guide, dietary supplements, protein powder, creatine, vitamins, supplement safety"
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: t("supplements.seo.title"),
          description: t("supplements.seo.description"),
          applicationCategory: "HealthApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "FitFusion" },
        }}
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {t("supplements.badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-supplements-title">
              {t("supplements.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("supplements.subtitle")}
            </p>
          </div>

          <Alert className="mb-8 border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-sm ml-2">
              <strong>{t("supplements.disclaimer.title")}</strong> {t("supplements.disclaimer.message")}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-6 w-6 text-primary" />
                    {t("supplements.calculator.title")}
                  </CardTitle>
                  <CardDescription>{t("supplements.calculator.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">{t("bmrCalculator.age")}</Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="25"
                          min="18"
                          max="100"
                          required
                          data-testid="input-age"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">{t("bmiCalculator.weight")} (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="70"
                          min="30"
                          max="300"
                          step="0.1"
                          required
                          data-testid="input-weight"
                        />
                      </div>
                    </div>

                    <GenderToggle gender={gender} onGenderChange={setGender} />

                    <div className="space-y-2">
                      <Label htmlFor="goal">{t("macroCalculator.fitnessGoal")}</Label>
                      <Select value={goal} onValueChange={setGoal} required>
                        <SelectTrigger id="goal" data-testid="select-goal">
                          <SelectValue placeholder={t("macroCalculator.goalPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">{t("macroCalculator.weightLoss")}</SelectItem>
                          <SelectItem value="maintenance">{t("macroCalculator.maintenance")}</SelectItem>
                          <SelectItem value="muscle_gain">{t("macroCalculator.muscleGain")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activity">{t("calorieCalculator.activityLevel")}</Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel} required>
                        <SelectTrigger id="activity" data-testid="select-activity">
                          <SelectValue placeholder={t("calorieCalculator.selectActivity")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">{t("calorieCalculator.sedentary")}</SelectItem>
                          <SelectItem value="light">{t("calorieCalculator.lightlyActive")}</SelectItem>
                          <SelectItem value="moderate">{t("calorieCalculator.moderatelyActive")}</SelectItem>
                          <SelectItem value="very_active">{t("calorieCalculator.veryActive")}</SelectItem>
                          <SelectItem value="extra_active">{t("calorieCalculator.extraActive")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1 transition-transform duration-300 hover:scale-105" data-testid="button-calculate">
                        {t("common.calculate")}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleReset} data-testid="button-reset">
                        {t("common.reset")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-primary/5 border-primary/20 sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-primary" />
                    {t("supplements.importantNote.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{t("supplements.importantNote.point1")}</p>
                  <p className="text-muted-foreground">{t("supplements.importantNote.point2")}</p>
                  <p className="text-muted-foreground">{t("supplements.importantNote.point3")}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {recommendations && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t("supplements.yourRecommendations")}</CardTitle>
                <CardDescription>{t("supplements.recommendationsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div id="supplement-result-export" className="space-y-4 bg-background">
                  {recommendations.map((supplement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        supplement.priority === "essential" ? "bg-chart-2" :
                        supplement.priority === "beneficial" ? "bg-primary" : "bg-muted-foreground"
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{supplement.name}</h3>
                          <Badge variant={
                            supplement.priority === "essential" ? "default" :
                            supplement.priority === "beneficial" ? "secondary" : "outline"
                          } className="text-xs">
                            {t(`supplements.priority.${supplement.priority}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>{t("supplements.dosageLabel")}:</strong> {supplement.dosage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>{t("supplements.timingLabel")}:</strong> {supplement.timing}
                        </p>
                      </div>
                    </div>
                  ))}
                  <References references={SUPPLEMENT_REFERENCES} />
                </div>
                <div className="flex justify-center pt-4 mt-4 border-t">
                  <PdfExportButton targetId="supplement-result-export" filename="fitfusion-supplements.pdf" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {t("supplements.commonSupplements.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {commonSupplements.map((supplement) => (
                  <div key={supplement} className="space-y-2">
                    <h3 className="font-semibold text-lg">
                      {t(`supplements.common.${supplement}.name`)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>{t("supplements.benefitsLabel")}:</strong> {t(`supplements.common.${supplement}.benefits`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>{t("supplements.typicalDosageLabel")}:</strong> {t(`supplements.common.${supplement}.dosage`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>{t("supplements.bestForLabel")}:</strong> {t(`supplements.common.${supplement}.bestFor`)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                {t("supplements.safety.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t("supplements.safety.intro")}</p>
              <div className="space-y-3">
                {safetyTips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{t(`supplements.safety.${tip}`)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                {t("supplements.avoid.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t("supplements.avoid.intro")}</p>
              <div className="space-y-3">
                {avoidSupplements.map((avoid) => (
                  <div key={avoid} className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{t(`supplements.avoid.${avoid}`)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">{t("supplements.finalNote.title")}</h3>
                <p className="text-lg text-muted-foreground">
                  {t("supplements.finalNote.message")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
