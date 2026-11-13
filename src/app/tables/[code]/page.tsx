import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findTable, NACC_REFERENCE, TABLES, statusLabel } from "@/lib/catalog";
import { listRecords } from "@/lib/db";
import TableWorkspace from "./TableWorkspace";

type PageProps = { params: { code: string } };

export function generateMetadata({ params }: PageProps): Metadata {
  const table = findTable(params.code);
  if (!table) return { title: "Table not found" };
  return { title: `Table ${table.code} · ${table.title}` };
}

export default async function TablePage({ params }: PageProps) {
  const table = findTable(params.code);
  if (!table) notFound();
  if (table.externalHref) redirect(table.externalHref);

  let rows: Awaited<ReturnType<typeof listRecords>> = [];
  let dbError: string | null = null;
  try {
    rows = await listRecords(table.code);
  } catch (err) {
    dbError = err instanceof Error ? err.message : "The database is unavailable.";
  }

  return (
    <div className="relative min-h-screen pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-hero-bar" aria-hidden />
      <header className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
            ← All tables
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="pill-gold mb-3">Table {table.code}</p>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{table.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">{table.summary}</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cpbh-navy">
              {statusLabel(table.status)}
            </span>
          </div>
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="All RPPR tables">
            {TABLES.map((item) => {
              const current = item.code === table.code;
              const className = `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                current ? "bg-cpbh-gold text-cpbh-navy" : "bg-white/10 text-white hover:bg-white/20"
              }`;
              if (item.externalHref) {
                return (
                  <a key={item.code} href={item.externalHref} className={className}>
                    {item.code}
                  </a>
                );
              }
              return (
                <Link key={item.code} href={`/tables/${item.code.toLowerCase()}`} className={className}>
                  {item.code}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">What to include</h2>
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

        {dbError ? (
          <p className="rounded-2xl border border-cpbh-cardinal/20 bg-white px-4 py-3 text-sm text-cpbh-cardinal">{dbError}</p>
        ) : (
          <TableWorkspace table={table} rows={rows} />
        )}
      </main>
    </div>
  );
}
