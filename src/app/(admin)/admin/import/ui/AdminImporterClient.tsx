// app/(admin)/admin/import/ui/AdminImporterClient.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const Example = {
  examKey: "2024_FORM_A",
  questions: [
    {
      index: 1,
      type: "MULTIPLE_CHOICE",
      category: "Algebra (Linear Equations)",
      stem: "What is 2x + 3 = 9?",
      choices: [
        { id: "A", text: "x = 2" },
        { id: "B", text: "x = 3" },
        { id: "C", text: "x = 4" },
        { id: "D", text: "x = 5" },
      ],
      answer: "B",
    },
  ],
};

type Props = {
  onImportAction: (fd: FormData) => Promise<{ inserted: number; examKey: string }>;
  onDeleteAction: (fd: FormData) => Promise<{ deleted: number; examKey: string }>;
};

export default function AdminImporterClient({ onImportAction, onDeleteAction }: Props) {
  const [jsonText, setJsonText] = React.useState(JSON.stringify(Example, null, 2));
  const [busy, setBusy] = React.useState<null | "import" | "delete">(null);
  const [msg, setMsg] = React.useState<string>("");

  async function submitImport() {
    setMsg("");
    setBusy("import");
    try {
      // Quick client-side sanity check
      const parsed = JSON.parse(jsonText);
      if (!parsed.examKey || !Array.isArray(parsed.questions)) {
        throw new Error("JSON must include { examKey, questions: [...] }");
      }
      const fd = new FormData();
      fd.set("json", jsonText);
      const res = await onImportAction(fd);
      setMsg(`✅ Inserted ${res.inserted} question(s) for examKey "${res.examKey}"`);
    } catch (e: any) {
      setMsg(`❌ ${e?.message ?? "Import failed"}`);
    } finally {
      setBusy(null);
    }
  }

  async function submitDelete(examKey?: string) {
    setMsg("");
    setBusy("delete");
    try {
      const key = examKey ?? (JSON.parse(jsonText)?.examKey as string);
      if (!key) throw new Error("Provide examKey (either in JSON or below).");
      const fd = new FormData();
      fd.set("examKey", key);
      const res = await onDeleteAction(fd);
      setMsg(`🗑️ Deleted ${res.deleted} question(s) for examKey "${res.examKey}"`);
    } catch (e: any) {
      setMsg(`❌ ${e?.message ?? "Delete failed"}`);
    } finally {
      setBusy(null);
    }
  }

  const [manualKey, setManualKey] = React.useState("");

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Import / Delete by examKey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="text-sm font-medium">JSON Payload</label>
        <Textarea
          className="min-h-[300px] font-mono text-sm"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='{"examKey":"2024_FORM_A","questions":[...]}'
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Manual examKey (optional)</label>
          <Input
            placeholder="Override examKey here (optional)"
            value={manualKey}
            onChange={(e) => setManualKey(e.target.value)}
          />
        </div>

        {msg ? <p className="text-sm">{msg}</p> : null}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={submitImport} disabled={busy === "import"}>
          {busy === "import" ? "Importing…" : "Import Questions"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => submitDelete(manualKey || undefined)}
          disabled={busy === "delete"}
        >
          {busy === "delete" ? "Deleting…" : "Delete by examKey"}
        </Button>
      </CardFooter>
    </Card>
  );
}
