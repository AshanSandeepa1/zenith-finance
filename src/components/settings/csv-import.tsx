"use client";

import { useMemo, useState, useTransition } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Download, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { importTransactions } from "@/app/actions/import";
import type { Category } from "@prisma/client";

const NONE = "__none__";

type ParsedRow = Record<string, string>;

type PreviewRow = {
  raw: ParsedRow;
  date: Date | null;
  amount: number | null;
  description?: string;
  categoryName?: string;
  error?: string;
};

function tryParseDate(value: string): Date | null {
  if (!value) return null;
  const iso = new Date(value);
  if (!Number.isNaN(iso.getTime())) return iso;

  // Fall back to common DD/MM/YYYY or MM/DD/YYYY separated formats.
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const [, a, b, y] = match;
    const year = y.length === 2 ? Number(y) + 2000 : Number(y);
    // Assume DD/MM/YYYY (more common outside the US) when the first part > 12.
    const [month, day] = Number(a) > 12 ? [Number(b), Number(a)] : [Number(a), Number(b)];
    const d = new Date(year, month - 1, day);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function downloadTemplate() {
  const csv = "date,amount,description,category\n2026-01-05,4500,Groceries run,Groceries & Bills\n2026-01-06,870,Monthly salary,Income\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "zenith-finance-transactions-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImport({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<ParsedRow[]>([]);
  const [dateCol, setDateCol] = useState<string>(NONE);
  const [amountCol, setAmountCol] = useState<string>(NONE);
  const [descCol, setDescCol] = useState<string>(NONE);
  const [categoryCol, setCategoryCol] = useState<string>(NONE);
  const [currency, setCurrency] = useState<"USD" | "LKR">("LKR");

  function handleFile(file: File) {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        setHeaders(fields);
        setRawRows(results.data);
        setFileName(file.name);

        const guess = (candidates: string[]) =>
          fields.find((f) => candidates.some((c) => f.toLowerCase().includes(c))) ?? NONE;
        setDateCol(guess(["date"]));
        setAmountCol(guess(["amount", "value"]));
        setDescCol(guess(["description", "memo", "note"]));
        setCategoryCol(guess(["category", "type"]));
      },
      error: (err) => toast.error(`Couldn't parse file: ${err.message}`),
    });
  }

  const preview: PreviewRow[] = useMemo(() => {
    if (dateCol === NONE || amountCol === NONE) return [];

    return rawRows.map((raw) => {
      const dateRaw = raw[dateCol]?.trim() ?? "";
      const amountRaw = raw[amountCol]?.trim() ?? "";
      const date = tryParseDate(dateRaw);
      const amount = amountRaw ? Number(amountRaw.replace(/[,\s]/g, "")) : NaN;

      let error: string | undefined;
      if (!date) error = `Invalid date: "${dateRaw}"`;
      else if (!Number.isFinite(amount)) error = `Invalid amount: "${amountRaw}"`;

      return {
        raw,
        date,
        amount: Number.isFinite(amount) ? amount : null,
        description: descCol !== NONE ? raw[descCol] : undefined,
        categoryName: categoryCol !== NONE ? raw[categoryCol] : undefined,
        error,
      };
    });
  }, [rawRows, dateCol, amountCol, descCol, categoryCol]);

  const validRows = preview.filter((r) => !r.error);
  const invalidRows = preview.filter((r) => r.error);

  function handleImport() {
    if (validRows.length === 0) return;

    startTransition(async () => {
      try {
        const { imported } = await importTransactions({
          currency,
          rows: validRows.map((r) => ({
            date: r.date as Date,
            amount: r.amount as number,
            description: r.description,
            categoryName: r.categoryName,
          })),
        });
        toast.success(`Imported ${imported} transaction${imported === 1 ? "" : "s"}`);
        setFileName(null);
        setRawRows([]);
        setHeaders([]);
        router.push("/dashboard/expenses");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Import failed");
      }
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Import transactions from CSV</p>
          <p className="text-xs text-muted-foreground">
            Bring in historical expenses from a bank export or spreadsheet
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadTemplate}>
          <Download className="h-3.5 w-3.5" /> Template
        </Button>
      </div>

      {!fileName ? (
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-sm text-muted-foreground cursor-pointer hover:bg-accent/50 transition-colors">
          <Upload className="h-5 w-5" />
          Click to choose a CSV file
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{fileName}</span> · {rawRows.length} rows
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFileName(null);
                setRawRows([]);
                setHeaders([]);
              }}
            >
              Choose different file
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Date column</Label>
              <SelectNative value={dateCol} onChange={(e) => setDateCol(e.target.value)}>
                <option value={NONE}>Select...</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-1.5">
              <Label>Amount column</Label>
              <SelectNative value={amountCol} onChange={(e) => setAmountCol(e.target.value)}>
                <option value={NONE}>Select...</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <SelectNative value={descCol} onChange={(e) => setDescCol(e.target.value)}>
                <option value={NONE}>None</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-1.5">
              <Label>Category (optional)</Label>
              <SelectNative value={categoryCol} onChange={(e) => setCategoryCol(e.target.value)}>
                <option value={NONE}>None</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </SelectNative>
            </div>
          </div>

          {dateCol !== NONE && amountCol !== NONE && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {validRows.length} valid
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <XCircle className="h-3.5 w-3.5" /> {invalidRows.length} skipped
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="import-currency" className="text-xs">
                    Currency
                  </Label>
                  <SelectNative
                    id="import-currency"
                    className="w-24"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as "USD" | "LKR")}
                  >
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                  </SelectNative>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.slice(0, 200).map((row, i) => (
                      <tr key={i} className={row.error ? "text-rose-400" : ""}>
                        <td className="px-3 py-1.5">
                          {row.error ?? row.date?.toLocaleDateString("en-US")}
                        </td>
                        <td className="px-3 py-1.5 tabular-nums">
                          {!row.error && row.amount?.toLocaleString()}
                        </td>
                        <td className="px-3 py-1.5 truncate max-w-40">
                          {!row.error && (row.description || "—")}
                        </td>
                        <td className="px-3 py-1.5">{!row.error && (row.categoryName || "Other")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button onClick={handleImport} disabled={isPending || validRows.length === 0}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {validRows.length} transaction{validRows.length === 1 ? "" : "s"}
              </Button>
            </>
          )}
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Unmatched categories fall back to &quot;Other&quot;. Your categories:{" "}
        {categories.map((c) => c.name).join(", ")}
      </p>
    </div>
  );
}
