interface BMIGaugeProps {
  bmi: number;
}

export function BMIGauge({ bmi }: BMIGaugeProps) {
  const getCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "bg-chart-3" };
    if (bmi < 25) return { label: "Normal Weight", color: "bg-chart-2" };
    if (bmi < 30) return { label: "Overweight", color: "bg-chart-3" };
    return { label: "Obese", color: "bg-destructive" };
  };

  const category = getCategory(bmi);

  const getPosition = (bmi: number) => {
    const clampedBMI = Math.min(Math.max(bmi, 10), 40);
    return ((clampedBMI - 10) / 30) * 100;
  };

  const position = getPosition(bmi);

  return (
    <div className="space-y-4">
      <div className="relative h-8 rounded-full overflow-hidden bg-muted">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-chart-3" style={{ width: "28.3%" }} />
          <div className="flex-1 bg-chart-2" style={{ width: "21.7%" }} />
          <div className="flex-1 bg-chart-3" style={{ width: "16.7%" }} />
          <div className="flex-1 bg-destructive" style={{ width: "33.3%" }} />
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-foreground transition-all duration-500"
          style={{ left: `${position}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-foreground" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-foreground" />
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Underweight<br/>&lt;18.5</span>
        <span>Normal<br/>18.5-24.9</span>
        <span>Overweight<br/>25-29.9</span>
        <span>Obese<br/>≥30</span>
      </div>
    </div>
  );
}
