"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TableDef } from "@/lib/catalog";
import { NACC_REFERENCE, statusLabel } from "@/lib/catalog";
import type { StoredRow } from "@/lib/db";
import TableWorkspace from "../tables/[code]/TableWorkspace";

export default function AdminBrowser({
  tables,
  rowsByCode,
  initial,
}: {
  tables: TableDef[];
  rowsByCode: Record<string, StoredRow[]>;
  initial: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initial);
  const table = tables.find((item) => item.code === code) ?? tables[0];

  function openTable(next: string) {
    setCode(next);
    router.replace(`/admin?table=${next.toLowerCase()}`, { scroll: false });
  }

  return (
    <div className="relative min-h-screen pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-hero-bar" aria-hidden />
      <header className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
            ← All tables
          </Link>
          <div className="mt-4 max-w-3xl">
            <p className="pill-gold mb-3">Admin tables</p>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Tables A1–A7</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">
              One workflow for the administrative tables. Choose a table above the form to review its rows.
            </p>
          </div>
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Admin tables">
            {tables.map((item) => {
              const current = item.code === table.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => openTable(item.code)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    current ? "bg-cpbh-gold text-cpbh-navy" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {item.code}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <section className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">
              Table {table.code}: {table.title}
            </h2>
            <span className="pill-gold">{statusLabel(table.status)}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{table.instructions}</p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-cpbh-navy">{table.centerNote}</p>
          {table.owner ? <p className="mt-2 text-sm text-slate-500">Lead: {table.owner}</p> : null}
          <p className="mt-3 text-xs text-slate-500">
            Reference:{" "}
            <a href={NACC_REFERENCE} className="underline-offset-2 hover:underline">
              NACC progress reports to NIA
            </a>
          </p>
        </section>
        <TableWorkspace key={table.code} table={table} rows={rowsByCode[table.code] ?? []} />
      </main>
    </div>
  );
}
