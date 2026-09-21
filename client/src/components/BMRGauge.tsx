import { useTranslation } from "react-i18next";

interface BMRGaugeProps {
  bmr: number;
}

export function BMRGauge({ bmr }: BMRGaugeProps) {
  const { t } = useTranslation();

  const min = 1000;
  const max = 2400;
  const clamped = Math.min(Math.max(bmr, min), max);
  const position = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="space-y-4" data-testid="bmr-gauge">
      <div className="relative h-8 rounded-full overflow-hidden bg-muted">
        <div className="absolute inset-0 flex">
          <div className="bg-chart-3" style={{ width: "21.43%" }} />
          <div className="bg-chart-2" style={{ width: "21.43%" }} />
          <div className="bg-chart-2" style={{ width: "21.43%" }} />
          <div className="bg-chart-3" style={{ width: "14.28%" }} />
          <div className="bg-destructive" style={{ width: "21.43%" }} />
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-foreground transition-all duration-500"
          style={{ left: `${position}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-foreground" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 text-xs text-muted-foreground text-center">
        <span>
          {t("bmrCalculator.gauge.low", { defaultValue: "Low" })}
          <br />
          &lt;1300
        </span>
        <span>
          {t("bmrCalculator.gauge.belowAvg", { defaultValue: "Below avg." })}
          <br />
          1300-1600
        </span>
        <span>
          {t("bmrCalculator.gauge.average", { defaultValue: "Average" })}
          <br />
          1600-1900
        </span>
        <span>
          {t("bmrCalculator.gauge.aboveAvg", { defaultValue: "Above avg." })}
          <br />
          1900-2100
        </span>
        <span>
          {t("bmrCalculator.gauge.high", { defaultValue: "High" })}
          <br />
          &gt;2100
        </span>
      </div>
    </div>
  );
}
