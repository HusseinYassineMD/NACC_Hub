import type { Metadata } from "next";
import RpprReport from "../../../src/components/workflow/RpprReport";
import { loadWorkflow } from "../../../src/lib/workflow-data";

export const metadata: Metadata = { title: "Table A RPPR" };

export default async function Page({ searchParams }: { searchParams: { table?: string } }) {
  const loaded = await loadWorkflow("a", searchParams.table);
  return (
    <RpprReport
      workflowTitle={loaded.workflow.title}
      slug={loaded.workflow.slug}
      tables={loaded.tables}
      rowsByCode={loaded.rowsByCode}
      table={loaded.table}
    />
  );
}
