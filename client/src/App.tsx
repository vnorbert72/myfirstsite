import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { BackToTop } from "@/components/BackToTop";
import "./i18n";

const BMICalculator = lazy(() => import("@/pages/BMICalculator"));
const BMRCalculator = lazy(() => import("@/pages/BMRCalculator"));
const CalorieCalculator = lazy(() => import("@/pages/CalorieCalculator"));
const MacroCalculator = lazy(() => import("@/pages/MacroCalculator"));
const FoodSearch = lazy(() => import("@/pages/FoodSearch"));
const Blog = lazy(() => import("@/pages/Blog"));
const Article = lazy(() => import("@/pages/Article"));
const FitnessTips = lazy(() => import("@/pages/FitnessTips"));
const SupplementGuide = lazy(() => import("@/pages/SupplementGuide"));
const About = lazy(() => import("@/pages/About"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Contact = lazy(() => import("@/pages/Contact"));

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bmi" component={BMICalculator} />
        <Route path="/bmr" component={BMRCalculator} />
        <Route path="/calories" component={CalorieCalculator} />
        <Route path="/macros" component={MacroCalculator} />
        <Route path="/food" component={FoodSearch} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={Article} />
        <Route path="/tips" component={FitnessTips} />
        <Route path="/supplements" component={SupplementGuide} />
        <Route path="/about" component={About} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <BackToTop />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
