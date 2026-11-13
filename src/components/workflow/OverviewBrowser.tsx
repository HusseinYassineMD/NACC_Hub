"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TableDef } from "@/lib/catalog";
import type { StoredRow } from "@/lib/db";
import { downloadCsv, tableCells, tableHeaders } from "@/lib/row-format";
import { removeRecord } from "@/server/actions";

export default function OverviewBrowser({ table, rows }: { table: TableDef; rows: StoredRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const headers = tableHeaders(table);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      tableCells(table, row.payload).some((cell) => cell.toLowerCase().includes(needle))
    );
  }, [query, rows, table]);

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">
            Table {table.code}: {table.title}
          </h2>
          <span className="pill-gold">{rows.length} saved</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{table.instructions}</p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-cpbh-navy">{table.centerNote}</p>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Saved rows</h2>
            <p className="text-sm text-slate-500">{visible.length} shown</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this table"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              aria-label="Search this table"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                downloadCsv(
                  `table-${table.code.toLowerCase()}.csv`,
                  headers,
                  visible.map((row) => tableCells(table, row.payload))
                )
              }
            >
              Download CSV
            </button>
          </div>
        </div>
        {message ? <p className="px-5 pt-4 text-sm text-slate-600">{message}</p> : null}
        {visible.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No rows yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="table-rppr w-full">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    {tableCells(table, row.payload).map((cell, index) => (
                      <td key={headers[index]} className="max-w-xs">
                        <span className="whitespace-pre-line line-clamp-6" title={cell}>
                          {cell || "—"}
                        </span>
                      </td>
                    ))}
                    <td>
                      <button
                        type="button"
                        className="text-xs font-semibold text-cpbh-cardinal hover:underline"
                        onClick={() => {
                          if (!window.confirm("Remove this row?")) return;
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
