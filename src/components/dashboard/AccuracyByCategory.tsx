import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import type { CategoryStat } from "./types";

export function AccuracyByCategory({ data }: { data: CategoryStat[] }) {
  const chart = data.map((d) => ({
    category: d.category,
    accuracy: Math.round(d.accuracy * 100),
  }));

  const tooltipFormatter = (value: number | string): React.ReactNode =>
    `${value}%`;
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Accuracy by Category</CardTitle>
        <CardDescription>P
          Track where you’re strongest and where to focus next.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis unit="%" />
            <RTooltip formatter={tooltipFormatter} />

            <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
