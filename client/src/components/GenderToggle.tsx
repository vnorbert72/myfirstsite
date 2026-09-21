import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface GenderToggleProps {
  gender: "male" | "female";
  onGenderChange: (gender: "male" | "female") => void;
}

export function GenderToggle({ gender, onGenderChange }: GenderToggleProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>{t("bmrCalculator.gender")}</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={gender === "male" ? "default" : "outline"}
          onClick={() => onGenderChange("male")}
          className="flex-1"
          data-testid="button-gender-male"
        >
          {t("bmrCalculator.male")}
        </Button>
        <Button
          type="button"
          variant={gender === "female" ? "default" : "outline"}
          onClick={() => onGenderChange("female")}
          className="flex-1"
          data-testid="button-gender-female"
        >
          {t("bmrCalculator.female")}
        </Button>
      </div>
    </div>
  );
}
