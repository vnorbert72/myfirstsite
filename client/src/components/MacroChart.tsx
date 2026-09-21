import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface MacroChartProps {
  protein: number;
  carbs: number;
  fats: number;
}

export function MacroChart({ protein, carbs, fats }: MacroChartProps) {
  const data = [
    { name: "Protein", value: protein, color: "hsl(var(--chart-1))" },
    { name: "Carbs", value: carbs, color: "hsl(var(--chart-2))" },
    { name: "Fats", value: fats, color: "hsl(var(--chart-3))" },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
