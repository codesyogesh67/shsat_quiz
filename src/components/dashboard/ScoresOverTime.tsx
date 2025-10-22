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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import type { ExamResult } from "./types";
import { fmtDate } from "./utils";

export function ScoresOverTime({ exams }: { exams: ExamResult[] }) {
  const data = exams
    .slice()
    .reverse()
    .map((e) => ({
      date: fmtDate(e.dateISO),
      score: Math.round((e.accuracy || 0) * 100),
    }));
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Scores over Time</CardTitle>
        <CardDescription>Your recent performance trend.</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis unit="%" />
            <RTooltip formatter={(v: any) => `${v}%`} />
            <Line type="monotone" dataKey="score" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
