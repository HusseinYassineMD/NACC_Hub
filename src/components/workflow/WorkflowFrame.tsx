import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findWorkflow, tablesInGroup } from "@/lib/catalog";
import WorkflowNav from "./WorkflowNav";

export default function WorkflowFrame({ slug, children }: { slug: string; children: React.ReactNode }) {
  const workflow = findWorkflow(slug);
  if (!workflow) notFound();
  const tables = tablesInGroup(workflow.group);

  return (
    <div className="relative min-h-screen pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-hero-bar" aria-hidden />
      <header className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
            ← All workflows
          </Link>
          <p className="pill-gold mb-3 mt-4">{workflow.title}</p>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{workflow.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">{workflow.summary}</p>
          <div className="mt-6">
            <Suspense fallback={<div className="nav-dock h-11" />}>
              <WorkflowNav slug={workflow.slug} tables={tables.map((table) => ({ code: table.code }))} />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 sm:px-6">{children}</main>
    </div>
  );
}
