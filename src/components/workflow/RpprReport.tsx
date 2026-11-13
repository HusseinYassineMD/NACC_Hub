"use client";

import { useState } from "react";
import type { TableDef } from "@/lib/catalog";
import type { StoredRow } from "@/lib/db";
import { downloadJsonReport, downloadWorkflowPdf } from "@/lib/report-pdf";
import { tableCells, tableHeaders } from "@/lib/row-format";

export default function RpprReport({
  workflowTitle,
  slug,
  tables,
  rowsByCode,
  table,
}: {
  workflowTitle: string;
  slug: string;
  tables: TableDef[];
  rowsByCode: Record<string, StoredRow[]>;
  table: TableDef;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const headers = tableHeaders(table);
  const rows = (rowsByCode[table.code] ?? []).map((row) => tableCells(table, row.payload));

  function reportBody() {
    return {
      workflow: workflowTitle,
      generatedAt: new Date().toISOString(),
      tables: tables.map((item) => ({
        code: item.code,
        title: item.title,
        headers: tableHeaders(item),
        rows: (rowsByCode[item.code] ?? []).map((row) => tableCells(item, row.payload)),
      })),
    };
  }

  return (
    <div className="space-y-6">
      <section className="panel-3d p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold text-cpbh-navy">Download report</h2>
        <p className="mt-1 text-sm text-slate-600">
          One PDF with every table in this workflow. The JSON file is the same report.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setMessage(null);
              void downloadWorkflowPdf({
                filename: `table-${slug}-rppr.pdf`,
                title: `${workflowTitle} RPPR`,
                tables: tables.map((item) => ({
                  table: item,
                  headers: tableHeaders(item),
                  rows: (rowsByCode[item.code] ?? []).map((row) => tableCells(item, row.payload)),
                })),
              })
                .then(() => setMessage(`Downloaded table-${slug}-rppr.pdf`))
                .catch(() => setMessage("Could not prepare the PDF."))
                .finally(() => setBusy(false));
            }}
          >
            {busy ? "Preparing PDF…" : "Download report"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => downloadJsonReport(`table-${slug}-rppr.json`, reportBody())}
          >
            Download JSON
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="panel-3d overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 bg-gradient-to-br from-white via-white to-amber-50/80 px-5 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cpbh-teal">Table {table.code}</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-cpbh-navy">{table.title}</h2>
          </div>
          <p className="rounded-full bg-cpbh-navy px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </p>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No rows yet. Add them from the intake form.</p>
        ) : (
          <div className="table-scroll">
            <table className="table-rppr w-full">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="max-w-xs">
                        <span className="whitespace-pre-line line-clamp-6">{cell || "—"}</span>
                      </td>
                    ))}
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
