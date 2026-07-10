"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";

export type CsvColumn = { key: string; label: string; required?: boolean };

export function CsvUploader<T extends Record<string, string> = Record<string, string>>({
  columns,
  templateName,
  onSubmit,
  successLabel,
}: {
  columns: CsvColumn[];
  templateName: string;
  onSubmit: (rows: T[]) => Promise<{ ok: boolean; created: number; skipped: number; error?: string }>;
  successLabel: (created: number, skipped: number) => string;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    setSubmitError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const missingCols = columns.filter((c) => c.required && !res.meta.fields?.some((f) => f.toLowerCase() === c.key.toLowerCase()));
        if (missingCols.length > 0) {
          setParseError(`Missing required column(s): ${missingCols.map((c) => c.label).join(", ")}`);
          setRows([]);
          return;
        }
        setParseError(null);
        const normalized = res.data.map((row) => {
          const out: Record<string, string> = {};
          for (const c of columns) {
            const foundKey = Object.keys(row).find((k) => k.toLowerCase() === c.key.toLowerCase());
            out[c.key] = foundKey ? row[foundKey]?.trim() ?? "" : "";
          }
          return out as T;
        });
        setRows(normalized);
      },
      error: (err) => {
        setParseError(err.message);
        setRows([]);
      },
    });
  }

  function downloadTemplate() {
    const csv = columns.map((c) => c.key).join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="mt-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Upload CSV</p>
          <p className="text-xs text-muted">
            Columns: {columns.map((c) => c.label).join(", ")}
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-brand-light hover:text-brand-dark"
        >
          Download template
        </button>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-brand">
        <span className="text-sm font-medium">
          {fileName ?? "Click to choose a .csv file"}
        </span>
        <span className="text-xs text-muted">or drag and drop</span>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {parseError && <p className="mt-3 text-sm text-rose-600">{parseError}</p>}

      {rows.length > 0 && !parseError && (
        <div className="mt-4">
          <p className="text-sm font-medium">{rows.length} row(s) ready to import</p>
          <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="border-b border-border bg-surface text-left text-muted">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="p-2 font-medium">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {columns.map((c) => (
                      <td key={c.key} className="p-2">{r[c.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 20 && (
            <p className="mt-1 text-xs text-muted">+ {rows.length - 20} more row(s) not shown</p>
          )}

          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await onSubmit(rows);
                if (res.ok) {
                  setResult({ created: res.created, skipped: res.skipped });
                  setRows([]);
                  setFileName(null);
                } else {
                  setSubmitError(res.error ?? "Import failed.");
                }
              })
            }
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {isPending ? "Importing…" : `Import ${rows.length} row(s)`}
          </button>
        </div>
      )}

      {submitError && <p className="mt-3 text-sm text-rose-600">{submitError}</p>}
      {result && (
        <p className="mt-3 text-sm text-emerald-600">
          {successLabel(result.created, result.skipped)}
        </p>
      )}
    </Card>
  );
}
