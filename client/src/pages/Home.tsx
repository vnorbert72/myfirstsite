import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CalculatorCard } from "@/components/CalculatorCard";
import { Card } from "@/components/ui/card";
import {
  Scale,
  Activity,
  Flame,
  Pizza,
  UtensilsCrossed,
  CheckCircle,
  ArrowRight,
  BadgeCheck,
  FlaskConical,
  ShieldCheck,
  Compass,
  Check,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";

const RecentArticles = lazy(() => import("@/components/RecentArticles"));

export default function Home() {
  const { t, i18n } = useTranslation();

  const calculators = [
    {
      icon: Scale,
      title: t("calculators.bmi.title"),
      description: t("calculators.bmi.description"),
      href: "/bmi",
    },
    {
      icon: Activity,
      title: t("calculators.bmr.title"),
      description: t("calculators.bmr.description"),
      href: "/bmr",
    },
    {
      icon: Flame,
      title: t("calculators.calories.title"),
      description: t("calculators.calories.description"),
      href: "/calories",
    },
    {
      icon: Pizza,
      title: t("calculators.macros.title"),
      description: t("calculators.macros.description"),
      href: "/macros",
    },
    {
      icon: UtensilsCrossed,
      title: t("calculators.food.title"),
      description: t("calculators.food.description"),
      href: "/food",
    },
  ];

  const benefits = [
    {
      icon: BadgeCheck,
      title: t("home.benefits.free.title"),
      description: t("home.benefits.free.description"),
      key: "free",
    },
    {
      icon: FlaskConical,
      title: t("home.benefits.science.title"),
      description: t("home.benefits.science.description"),
      key: "science",
    },
    {
      icon: ShieldCheck,
      title: t("home.benefits.privacy.title"),
      description: t("home.benefits.privacy.description"),
      key: "privacy",
    },
    {
      icon: Compass,
      title: t("home.benefits.guidance.title"),
      description: t("home.benefits.guidance.description"),
      key: "guidance",
    },
  ];

  const steps = [
    {
      number: 1,
      title: t("home.howItWorks.step1.title"),
      description: t("home.howItWorks.step1.description"),
    },
    {
      number: 2,
      title: t("home.howItWorks.step2.title"),
      description: t("home.howItWorks.step2.description"),
    },
    {
      number: 3,
      title: t("home.howItWorks.step3.title"),
      description: t("home.howItWorks.step3.description"),
    },
  ];

  const foodBullets = [
    t("home.food.bullet1"),
    t("home.food.bullet2"),
    t("home.food.bullet3"),
  ];

  const supplementBullets = [
    t("home.supplements.bullet1"),
    t("home.supplements.bullet2"),
    t("home.supplements.bullet3"),
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("seo.home.title")}
        description={t("seo.home.description")}
        keywords={t("seo.home.keywords")}
        image="/images/hero-1408.webp"
        imageWidth={1408}
        imageHeight={768}
        type="website"
      />
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "FitFusion",
            url: "https://fit-fusion.eu/",
            inLanguage: ["en", "hu", "es"],
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "FitFusion",
            url: "https://fit-fusion.eu/",
            logo: "https://fit-fusion.eu/images/logo-256.webp",
            sameAs: ["https://www.instagram.com/fitfusion25eu"],
          },
        ]}
      />
      <Header />

      <main className="flex-1">
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src="/images/hero-1408.webp"
          srcSet="/images/hero-768.webp 768w, /images/hero-1120.webp 1120w, /images/hero-1408.webp 1408w"
          sizes="100vw"
          alt=""
          aria-hidden="true"
          decoding="async"
          width={1408}
          height={768}
          className="absolute inset-0 w-full h-full object-cover object-center"
          {...({ fetchpriority: "high" } as any)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            {t("hero.title")}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => scrollToSection("calculators")}
              data-testid="button-start-calculating"
            >
              {t("hero.ctaCalculate")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 backdrop-blur-md bg-white/10 text-white border-white/40"
              onClick={() => scrollToSection("how-it-works")}
              data-testid="button-hero-secondary"
            >
              {t("hero.ctaLearn")}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" aria-labelledby="benefits-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="benefits-heading" className="text-3xl sm:text-4xl font-bold mb-4">
              {t("home.benefits.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("home.benefits.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.key}
                className="text-center space-y-3"
                data-testid={`benefit-${benefit.key}`}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <benefit.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="calculators" className="py-12 sm:py-16 scroll-mt-16" aria-labelledby="calculators-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="calculators-heading" className="text-3xl sm:text-4xl font-bold mb-4">
              {t("calculators.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("calculators.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc) => (
              <CalculatorCard key={calc.href} {...calc} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 sm:py-16 bg-card scroll-mt-16" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="how-it-works-heading" className="text-3xl font-bold mb-4">
              {t("home.howItWorks.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("home.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" aria-labelledby="food-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <UtensilsCrossed className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 id="food-heading" className="text-3xl font-bold">
                {t("home.food.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("home.food.description")}
              </p>
              <Link href="/food">
                <Button size="lg" data-testid="button-food-database">
                  {t("home.food.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            <Card className="p-6 sm:p-8">
              <ul className="space-y-4">
                {foodBullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3" data-testid={`text-food-bullet-${index}`}>
                    <Check className="h-5 w-5 text-chart-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm sm:text-base">{bullet}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-card" aria-labelledby="supplements-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:order-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Pill className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 id="supplements-heading" className="text-3xl font-bold">
                {t("home.supplements.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("home.supplements.description")}
              </p>
              <Link href="/supplements">
                <Button size="lg" data-testid="button-supplement-guide">
                  {t("home.supplements.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            <ul className="space-y-4 md:order-1">
              {supplementBullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3" data-testid={`text-supplement-bullet-${index}`}>
                  <Check className="h-5 w-5 text-chart-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm sm:text-base">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" aria-labelledby="trust-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="trust-heading" className="text-3xl font-bold mb-4">
              {t("scientificFormulas.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("scientificFormulas.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["mifflin", "who", "usda"] as const).map((key) => (
              <div key={key} className="flex items-start gap-3 p-6 rounded-md bg-card">
                <CheckCircle className="h-6 w-6 text-chart-2 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold mb-2">{t(`scientificFormulas.${key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`scientificFormulas.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto" data-testid="text-trust-note">
            {t("scientificFormulas.note")}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-card" aria-labelledby="articles-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div>
              <h2 id="articles-heading" className="text-3xl font-bold mb-2">
                {t("blog.latestArticles")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("blog.subtitle")}
              </p>
            </div>
            <Link href="/blog">
              <Button variant="outline" data-testid="button-view-all-articles">
                {t("common.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="min-h-64 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            }
          >
            <RecentArticles />
          </Suspense>
        </div>
      </section>

      <section className="py-14 sm:py-20" aria-labelledby="final-cta-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 id="final-cta-heading" className="text-3xl sm:text-4xl font-bold">
            {t("home.finalCta.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("home.finalCta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
            <Link href="/calories">
              <Button size="lg" className="text-lg px-8" data-testid="button-final-cta-calories">
                <Flame className="mr-2 h-5 w-5" aria-hidden="true" />
                {t("home.finalCta.ctaPrimary")}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() => scrollToSection("calculators")}
              data-testid="button-final-cta-all"
            >
              {t("home.finalCta.ctaSecondary")}
            </Button>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
