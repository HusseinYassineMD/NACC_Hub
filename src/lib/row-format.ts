import type { TableDef } from "./catalog";

export function formatRatio(payload: Record<string, string>, ratio: NonNullable<TableDef["ratio"]>): string {
  const numerator = Number(payload[ratio.numerator]);
  const denominator = Number(payload[ratio.denominator]);
  if (!payload[ratio.numerator] || !payload[ratio.denominator] || !denominator || Number.isNaN(numerator)) {
    return "";
  }
  return `${numerator} / ${denominator} (${Math.round((numerator / denominator) * 100)}%)`;
}

export function tableHeaders(table: TableDef): string[] {
  const headers = table.fields.map((field) => field.label);
  if (table.ratio) headers.push(table.ratio.label);
  return headers;
}

export function tableCells(table: TableDef, payload: Record<string, string>): string[] {
  const cells = table.fields.map((field) => payload[field.key] ?? "");
  if (table.ratio) cells.push(formatRatio(payload, table.ratio));
  return cells;
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const lines = [headers, ...rows].map((line) => line.map(csvCell).join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
