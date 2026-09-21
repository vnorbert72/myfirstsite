import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface UnitToggleProps {
  unit: "metric" | "imperial";
  onUnitChange: (unit: "metric" | "imperial") => void;
}

export function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>{t("bmiCalculator.unit")}</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={unit === "metric" ? "default" : "outline"}
          onClick={() => onUnitChange("metric")}
          className="flex-1"
          data-testid="button-unit-metric"
        >
          {t("bmiCalculator.metric")}
        </Button>
        <Button
          type="button"
          variant={unit === "imperial" ? "default" : "outline"}
          onClick={() => onUnitChange("imperial")}
          className="flex-1"
          data-testid="button-unit-imperial"
        >
          {t("bmiCalculator.imperial")}
        </Button>
      </div>
    </div>
  );
}
