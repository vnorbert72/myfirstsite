import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface CalculatorCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export function CalculatorCard({ icon: Icon, title, description, href }: CalculatorCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="p-6 hover-elevate transition-all duration-200 flex flex-col items-center text-center gap-4">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
        <Icon className="h-12 w-12 text-primary-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
      <Link href={href} className="mt-auto w-full">
        <Button
          className="w-full"
          data-testid={`button-calculator-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {t("common.calculateNow", { defaultValue: "Calculate Now" })}
        </Button>
      </Link>
    </Card>
  );
}
