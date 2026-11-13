import Link from "next/link";
import {
  INPUT_DEADLINE,
  NACC_REFERENCE,
  REC_FACULTY_URL,
  WORKFLOWS,
  tablesInGroup,
} from "@/lib/catalog";
import { countByTable } from "@/lib/db";

export default async function HomePage() {
  let counts: Record<string, number> = {};
  let dbError: string | null = null;
  try {
    counts = await countByTable();
  } catch (err) {
    dbError = err instanceof Error ? err.message : "The database is unavailable.";
  }

  return (
    <div className="relative min-h-screen pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-hero-bar" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-cpbh-gold/20 blur-3xl" aria-hidden />

      <header className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
          <p className="pill-gold mb-4">USC ADRC · Progress reports to NIA</p>
          <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            NACC RPPR tables
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
            Each letter is one workflow: Overview, an intake form built from that table’s columns, and the RPPR.
            The individual tables sit beside the workflow, not on separate pages.
          </p>
          <p className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20">
            Inputs requested by {INPUT_DEADLINE}
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-2 max-w-6xl space-y-10 px-4 sm:px-6">
        {dbError ? (
          <p className="rounded-2xl border border-cpbh-cardinal/20 bg-white px-4 py-3 text-sm text-cpbh-cardinal">
            Saved rows could not be counted. {dbError}
          </p>
        ) : (
          <p className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-card">
            Year 6 rows from the shared files are already in the tables. New rows can be typed, imported from Excel,
            or downloaded as a CSV, PDF, or JSON report. Table G opens the REC faculty Overview.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {WORKFLOWS.map((workflow) => {
            const tables = tablesInGroup(workflow.group);
            const total = tables.reduce((sum, table) => sum + (counts[table.code] ?? 0), 0);
            return (
              <Link key={workflow.slug} href={`/w/${workflow.slug}`} className="card-link">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-3xl font-bold text-cpbh-navy">{workflow.title}</span>
                  <span className="pill-gold">Overview · Intake · RPPR</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-cpbh-navy">{tables.map((table) => table.code).join("  ")}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{workflow.summary}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {total === 1 ? "1 saved row" : `${total} saved rows`}
                </p>
                <p className="mt-3 text-sm font-semibold text-cpbh-navy">
                  Open workflow <span aria-hidden>→</span>
                </p>
              </Link>
            );
          })}
          <a href={REC_FACULTY_URL} className="card-link">
            <div className="flex items-start justify-between gap-3">
              <span className="font-display text-3xl font-bold text-cpbh-navy">Table G</span>
              <span className="pill-teal">REC faculty workflow</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-cpbh-navy">G1  G2</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              Scholars, trainees, and events. Lands on Overview, same as the other workflows. Intake and RPPR (G1 · G2) are next to it.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Opens Overview on the REC site</p>
            <p className="mt-3 text-sm font-semibold text-cpbh-navy">
              Open workflow <span aria-hidden>→</span>
            </p>
          </a>
        </div>
      </main>

      <footer className="mx-auto mt-12 max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
        Field list follows the{" "}
        <a href={NACC_REFERENCE} className="font-medium text-cpbh-navy/80 underline-offset-2 hover:underline">
          NACC progress-report tables
        </a>
        . Official spreadsheet column labels can be adjusted when the template for this cycle is final.
      </footer>
    </div>
  );
}
