"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FieldDef, TableDef } from "@/lib/catalog";
import { downloadIntakeTemplate, planImport, readWorkbook, type ImportPlan } from "@/lib/workbook";
import { importTableRows, saveRecord } from "@/server/actions";

export default function IntakeWorkspace({
  slug,
  tables,
  table,
}: {
  slug: string;
  tables: TableDef[];
  table: TableDef;
}) {
  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">
          Table {table.code}: {table.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{table.instructions}</p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-cpbh-navy">{table.centerNote}</p>
        {table.owner ? <p className="mt-2 text-sm text-slate-500">Lead: {table.owner}</p> : null}
      </section>
      <ExcelImport slug={slug} tables={tables} />
      <IntakeForm key={table.code} table={table} />
    </div>
  );
}

function ExcelImport({ slug, tables }: { slug: string; tables: TableDef[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState("");
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const ready = (plan?.byTable.reduce((sum, item) => sum + item.rows.length, 0) ?? 0) > 0;

  async function onFile(file: File | null) {
    setPlan(null);
    setMessage(null);
    setFileName(file?.name ?? "");
    if (!file) return;
    try {
      setPlan(planImport(tables, await readWorkbook(await file.arrayBuffer())));
    } catch {
      setMessage("That file could not be read. Use an Excel workbook or the template.");
    }
  }

  function importRows() {
    if (!plan) return;
    setPending(true);
    setMessage(null);
    void (async () => {
      let inserted = 0;
      for (const item of plan.byTable) {
        const result = await importTableRows(item.code, item.rows);
        if ("error" in result) {
          setMessage(result.error);
          setPending(false);
          return;
        }
        inserted += result.inserted;
      }
      setMessage(`${inserted} ${inserted === 1 ? "row" : "rows"} imported.`);
      setPending(false);
      setPlan(null);
      router.refresh();
    })().catch(() => {
      setMessage("Could not import that spreadsheet.");
      setPending(false);
    });
  }

  return (
    <section className="panel-3d p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold text-cpbh-navy">Import from Excel</h2>
      <p className="mt-1 text-sm text-slate-600">
        The template has one sheet per table. Column names are the same questions as the form. A sheet named A1 fills
        Table A1. Any other sheet is matched by its headers.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-secondary" onClick={() => void downloadIntakeTemplate(slug, tables)}>
          Download template
        </button>
        <label className="btn-secondary cursor-pointer">
          Choose Excel file
          <input
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="sr-only"
            onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <button
          type="button"
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!ready || pending}
          onClick={importRows}
        >
          {pending ? "Importing…" : "Import rows"}
        </button>
      </div>
      {fileName ? <p className="mt-3 text-sm text-slate-500">{fileName}</p> : null}
      {plan ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-cpbh-navy">
            {plan.byTable.length === 0
              ? "No matching rows."
              : plan.byTable
                  .map((item) => `${item.code}: ${item.rows.length} ${item.rows.length === 1 ? "row" : "rows"}`)
                  .join(" · ")}
          </p>
          {plan.warnings.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-cpbh-cardinal">
              {plan.warnings.slice(0, 8).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}

function IntakeForm({ table }: { table: TableDef }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const sections = groupSections(table.fields);

  return (
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
            setMessage("Row saved. It is on Overview and in the RPPR table.");
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
        <h2 className="font-display text-2xl font-bold">Intake form</h2>
        <p className="mt-1 text-sm text-slate-500">
          These questions are the columns for Table {table.code}. Every field is optional.
        </p>
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
