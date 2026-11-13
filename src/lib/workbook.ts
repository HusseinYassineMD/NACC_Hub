import type { TableDef } from "./catalog";

export type SheetGrid = { name: string; rows: string[][] };

export type ImportPlan = {
  byTable: { code: string; rows: Record<string, string>[] }[];
  warnings: string[];
};

function norm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function readWorkbook(buffer: ArrayBuffer): Promise<SheetGrid[]> {
  const XLSX = await import("xlsx");
  const book = XLSX.read(buffer, { type: "array" });
  return book.SheetNames.map((name) => {
    const grid = XLSX.utils.sheet_to_json<(string | number | null)[]>(book.Sheets[name], {
      header: 1,
      raw: false,
      defval: "",
    });
    return {
      name,
      rows: grid.map((row) => row.map((cell) => String(cell ?? "").trim())),
    };
  });
}

export async function downloadIntakeTemplate(slug: string, tables: TableDef[]) {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();
  for (const table of tables) {
    const sheet = XLSX.utils.aoa_to_sheet([table.fields.map((field) => field.label)]);
    XLSX.utils.book_append_sheet(book, sheet, table.code.slice(0, 31));
  }
  XLSX.writeFile(book, `table-${slug}-intake-template.xlsx`);
}

export function planImport(tables: TableDef[], sheets: SheetGrid[]): ImportPlan {
  const warnings: string[] = [];
  const byCode = new Map<string, Record<string, string>[]>();

  for (const sheet of sheets) {
    const headerIndex = sheet.rows.findIndex((row) => row.some((cell) => cell));
    if (headerIndex < 0) continue;
    const headers = sheet.rows[headerIndex];
    const table = matchTable(tables, sheet.name, headers);
    if (!table) {
      warnings.push(`${sheet.name}: the headers do not match a table in this workflow.`);
      continue;
    }
    const columns = headers.map((header) => {
      const key = norm(header);
      return table.fields.find((field) => norm(field.label) === key || norm(field.key) === key) ?? null;
    });
    if (!columns.some(Boolean)) {
      warnings.push(`${sheet.name}: no column matched ${table.code}.`);
      continue;
    }
    const parsed: Record<string, string>[] = [];
    sheet.rows.slice(headerIndex + 1).forEach((row, index) => {
      const payload: Record<string, string> = {};
      columns.forEach((field, column) => {
        if (!field) return;
        const value = cleanValue(field, row[column] ?? "");
        if (!value) return;
        if (field.type === "yesno" && value !== "Yes" && value !== "No") {
          warnings.push(`${table.code} row ${index + 2}: ${field.label} “${row[column]}” was left blank. Use Yes or No.`);
          return;
        }
        if (field.type === "select" && field.options && !field.options.includes(value)) {
          warnings.push(`${table.code} row ${index + 2}: ${field.label} “${row[column]}” is not one of the listed choices.`);
          return;
        }
        payload[field.key] = value;
      });
      if (Object.keys(payload).some((key) => key !== "reporting_year")) parsed.push(payload);
    });
    const existing = byCode.get(table.code) ?? [];
    existing.push(...parsed);
    byCode.set(table.code, existing);
  }

  return {
    byTable: [...byCode.entries()].map(([code, rows]) => ({ code, rows })),
    warnings,
  };
}

function matchTable(tables: TableDef[], sheetName: string, headers: string[]) {
  const named = tables.find((table) => norm(sheetName) === norm(table.code) || norm(sheetName).includes(norm(table.code)));
  if (named && score(named, headers) > 0) return named;
  let best: TableDef | undefined;
  let bestScore = 0;
  for (const table of tables) {
    const value = score(table, headers);
    if (value > bestScore) {
      best = table;
      bestScore = value;
    }
  }
  return bestScore > 0 ? best : undefined;
}

function score(table: TableDef, headers: string[]) {
  const keys = new Set(headers.map(norm));
  return table.fields.filter((field) => keys.has(norm(field.label)) || keys.has(norm(field.key))).length;
}

function cleanValue(field: TableDef["fields"][number], raw: string) {
  const value = raw.trim();
  if (!value) return "";
  if (field.type === "yesno") {
    const token = value.toLowerCase();
    if (["y", "yes", "true"].includes(token)) return "Yes";
    if (["n", "no", "false"].includes(token)) return "No";
  }
  if (field.type === "select" && field.options) {
    const match = field.options.find((option) => option.toLowerCase() === value.toLowerCase());
    if (match) return match;
  }
  return value;
}
