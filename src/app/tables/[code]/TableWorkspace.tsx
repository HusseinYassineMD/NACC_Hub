"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FieldDef, TableDef } from "@/lib/catalog";
import type { StoredRow } from "@/lib/db";
import { removeRecord, saveRecord } from "@/server/actions";

export default function TableWorkspace({ table, rows }: { table: TableDef; rows: StoredRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [npOnly, setNpOnly] = useState(false);
  const hasNp = table.fields.some((field) => field.key === "np_core");

  const visible = useMemo(() => {
    if (!npOnly) return rows;
    return rows.filter((row) => row.payload.np_core === "Yes" || row.payload.annie_mike_np === "Yes");
  }, [npOnly, rows]);

  const sections = groupSections(table.fields);
  const columns = table.fields.map((field) => ({ key: field.key, label: field.label }));

  return (
    <div className="space-y-6">
      <form
        className="panel-3d overflow-hidden"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          setPending(true);
          setMessage(null);
          void saveRecord(table.code, data)
            .then((result) => {
              if ("error" in result) {
                setMessage(result.error);
                setPending(false);
                return;
              }
              form.reset();
              setMessage("Row saved.");
              setPending(false);
              router.refresh();
            })
            .catch(() => {
              setMessage("Could not save this row.");
              setPending(false);
            });
        }}
      >
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="font-display text-2xl font-bold">Add a row</h2>
          <p className="mt-1 text-sm text-slate-500">Every field is optional. Fill in what you have for this line.</p>
        </div>
        <div className="space-y-4 px-6 py-6 sm:px-8">
          {sections.map(([title, fields]) => (
            <section key={title} className="section-accent pl-5 sm:pl-6">
              <h3 className="mb-4 font-display text-lg font-semibold">{title}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <FieldInput key={field.key} field={field} />
                ))}
              </div>
            </section>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save row"}
            </button>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </div>
        </div>
      </form>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Saved rows</h2>
            <p className="text-sm text-slate-500">
              {visible.length} shown{npOnly ? ` of ${rows.length}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hasNp ? (
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={npOnly}
                  onChange={(event) => setNpOnly(event.target.checked)}
                  className="h-4 w-4 accent-cpbh-navy"
                />
                NP Core rows only
              </label>
            ) : null}
            <button type="button" className="btn-secondary" onClick={() => downloadCsv(table, visible)}>
              Download CSV
            </button>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No rows yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="table-rppr w-full">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  {table.ratio ? <th>{table.ratio.label}</th> : null}
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td key={column.key} className="max-w-xs">
                        <span className="line-clamp-4" title={row.payload[column.key] || ""}>
                          {row.payload[column.key] || "—"}
                        </span>
                      </td>
                    ))}
                    {table.ratio ? <td>{formatRatio(row.payload, table.ratio)}</td> : null}
                    <td className="whitespace-nowrap text-slate-500">{row.updatedAt.slice(0, 16)}</td>
                    <td>
                      <button
                        type="button"
                        className="text-xs font-semibold text-cpbh-cardinal hover:underline"
                        onClick={() => {
                          if (!window.confirm("Remove this row?")) return;
                          setMessage(null);
                          void removeRecord(table.code, row.id).then((result) => {
                            if ("error" in result) {
                              setMessage(result.error);
                              return;
                            }
                            setMessage("Row removed.");
                            router.refresh();
                          });
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FieldInput({ field }: { field: FieldDef }) {
  const wide = field.wide || field.type === "textarea";
  return (
    <div className={`field ${wide ? "sm:col-span-2" : ""}`}>
      <label htmlFor={field.key}>{field.label}</label>
      {field.type === "textarea" ? (
        <textarea id={field.key} name={field.key} rows={3} />
      ) : field.type === "select" || field.type === "yesno" ? (
        <select id={field.key} name={field.key} defaultValue="">
          <option value="">—</option>
          {(field.type === "yesno" ? ["Yes", "No"] : field.options ?? []).map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input id={field.key} name={field.key} type={field.type === "number" ? "number" : field.type} />
      )}
      {field.hint ? <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{field.hint}</p> : null}
    </div>
  );
}

function groupSections(fields: FieldDef[]): [string, FieldDef[]][] {
  const order: string[] = [];
  const map = new Map<string, FieldDef[]>();
  for (const field of fields) {
    const list = map.get(field.section);
    if (list) list.push(field);
    else {
      order.push(field.section);
      map.set(field.section, [field]);
    }
  }
  return order.map((title) => [title, map.get(title) ?? []]);
}

function formatRatio(
  payload: Record<string, string>,
  ratio: NonNullable<TableDef["ratio"]>
): string {
  const numerator = Number(payload[ratio.numerator]);
  const denominator = Number(payload[ratio.denominator]);
  if (!payload[ratio.numerator] || !payload[ratio.denominator] || !denominator || Number.isNaN(numerator)) {
    return "—";
  }
  return `${numerator} / ${denominator} (${Math.round((numerator / denominator) * 100)}%)`;
}

function downloadCsv(table: TableDef, rows: StoredRow[]) {
  const headers = table.fields.map((field) => field.label);
  if (table.ratio) headers.push(table.ratio.label);
  const lines = [headers, ...rows.map((row) => {
    const cells = table.fields.map((field) => row.payload[field.key] ?? "");
    if (table.ratio) cells.push(formatRatio(row.payload, table.ratio));
    return cells;
  })];
  const csv = lines.map((line) => line.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `table-${table.code.toLowerCase()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
