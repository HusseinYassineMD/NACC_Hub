import type { Metadata } from "next";
import IntakeWorkspace from "../../../src/components/workflow/IntakeWorkspace";
import { loadWorkflow } from "../../../src/lib/workflow-data";

export const metadata: Metadata = { title: "Table B intake" };

export default async function Page({ searchParams }: { searchParams: { table?: string } }) {
  const loaded = await loadWorkflow("b", searchParams.table);
  return <IntakeWorkspace slug={loaded.workflow.slug} tables={loaded.tables} table={loaded.table} />;
}
