import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ExamResult } from "./types";
import { fmtDate, fmtLocalDate, minutesToHMM, pct } from "./utils";

export function RecentExamsTable({ exams }: { exams: ExamResult[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Exams</CardTitle>
        <CardDescription>
          Review and retake to lock in progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Time</TableHead>
              <TableHead className="text-right">Flags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{fmtLocalDate(e.dateISO)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{e.mode}</Badge>
                </TableCell>
                <TableCell className="truncate max-w-[160px]">
                  {e.label ?? "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {pct(e.accuracy)}%
                </TableCell>
                <TableCell className="text-right">
                  {minutesToHMM(e.minutesSpent)}
                </TableCell>
                <TableCell className="text-right">{e.flaggedCount}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/review/${e.id}`}>Review</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/exam/retry?from=${e.id}`}>Retake</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
