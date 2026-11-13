import Link from "next/link";
import {
  GROUPS,
  INPUT_DEADLINE,
  NACC_REFERENCE,
  REC_FACULTY_URL,
  statusLabel,
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
            One landing page for the annual tables. Open a table to enter rows and review what is saved.
            Tables G1 and G2 open the REC faculty workflow.
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
            Admin, clinical, and ORE rows save to the Turso database shared with the REC faculty workflow.
            G1 and G2 stay on that site:{" "}
            <a className="font-semibold text-cpbh-navy underline-offset-2 hover:underline" href={REC_FACULTY_URL}>
              rec-faculty-workflow.vercel.app
            </a>
            .
          </p>
        )}

        {GROUPS.map((group) => (
          <section key={group}>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-cpbh-navy">
                {group === "ORE" ? "ORE Core" : group === "REC" ? "REC" : `${group} tables`}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tablesInGroup(group).map((table) => {
                const href = table.externalHref ?? `/tables/${table.code.toLowerCase()}`;
                const external = Boolean(table.externalHref);
                const count = counts[table.code] ?? 0;
                const body = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-display text-3xl font-bold text-cpbh-navy">{table.code}</span>
                      <span
                        className={
                          table.status === "live" ? "pill-teal" : table.status === "na" ? "pill-navy" : "pill-gold"
                        }
                      >
                        {statusLabel(table.status)}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{table.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{table.summary}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {external ? "Opens the REC faculty site" : count === 1 ? "1 saved row" : `${count} saved rows`}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-cpbh-navy">
                      {external ? "Open REC workflow" : "Open table"} <span aria-hidden>→</span>
                    </p>
                  </>
                );
                const className = "card-link";
                return external ? (
                  <a key={table.code} href={href} className={className}>
                    {body}
                  </a>
                ) : (
                  <Link key={table.code} href={href} className={className}>
                    {body}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
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
