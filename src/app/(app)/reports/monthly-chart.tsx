
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type MonthlyData = {
  month: string;
  income: number;
  expenditure: number;
};

export default function MonthlyChart({
  data,
}: {
  data: MonthlyData[];
}) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        No transactions are available for this chart yet.
      </p>
    );
  }

  return (
    <div className="mt-6 h-80 w-full" role="img" aria-label="Monthly income and expenditure bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(value: number) =>
              `£${Number(value).toLocaleString("en-GB")}`
            }
          />
          <Tooltip
            formatter={(value) => [
              `£${Number(value ?? 0).toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            ]}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#477A61" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenditure" name="Expenditure" fill="#C66B62" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
