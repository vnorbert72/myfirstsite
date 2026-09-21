import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Heart, Brain, Dumbbell, Apple, Moon, Shield, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";

export default function FitnessTips() {
  const { t } = useTranslation();

  const benefits = [
    { icon: Heart, key: "cardiovascular" },
    { icon: Brain, key: "mental" },
    { icon: Dumbbell, key: "strength" },
    { icon: TrendingUp, key: "flexibility" },
  ];

  const tips = ["tip1", "tip2", "tip3", "tip4", "tip5"];
  const routineSteps = ["step1", "step2", "step3", "step4", "step5"];
  const injuryPrevention = ["injury1", "injury2", "injury3", "injury4"];
  const recoveryTips = ["recovery1", "recovery2", "recovery3", "recovery4"];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("tips.seo.title")}
        description={t("tips.seo.description")}
        keywords="fitness tips, beginner workout, exercise advice, fitness journey, health tips"
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {t("tips.badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-tips-title">
              {t("tips.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("tips.subtitle")}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                {t("tips.whyExercise.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("tips.whyExercise.intro")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.key} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <benefit.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">
                        {t(`tips.benefits.${benefit.key}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`tips.benefits.${benefit.key}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-6 w-6 text-primary" />
                {t("tips.beginnerTips.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("tips.beginnerTips.intro")}
              </p>
              <div className="space-y-3">
                {tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      {t(`tips.beginnerTips.${tip}`)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                {t("tips.buildingRoutine.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("tips.buildingRoutine.intro")}
              </p>
              <div className="space-y-4">
                {routineSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        {t(`tips.routine.${step}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`tips.routine.${step}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                {t("tips.injury.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("tips.injury.intro")}
              </p>
              <div className="space-y-3">
                {injuryPrevention.map((injury) => (
                  <div key={injury} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      {t(`tips.injury.${injury}`)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-6 w-6 text-primary" />
                <Apple className="h-6 w-6 text-primary" />
                {t("tips.recovery.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("tips.recovery.intro")}
              </p>
              <div className="space-y-3">
                {recoveryTips.map((recovery) => (
                  <div key={recovery} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      {t(`tips.recovery.${recovery}`)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">{t("tips.motivation.title")}</h3>
                <p className="text-lg text-muted-foreground mb-4">
                  {t("tips.motivation.message")}
                </p>
                <p className="text-muted-foreground italic">
                  {t("tips.motivation.quote")}
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
