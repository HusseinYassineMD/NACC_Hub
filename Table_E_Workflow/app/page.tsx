import type { Metadata } from "next";
import OverviewBrowser from "../../src/components/workflow/OverviewBrowser";
import { loadWorkflow } from "../../src/lib/workflow-data";

export const metadata: Metadata = { title: "Table E overview" };

export default async function Page({ searchParams }: { searchParams: { table?: string } }) {
  const loaded = await loadWorkflow("e", searchParams.table);
  return <OverviewBrowser table={loaded.table} rows={loaded.rows} />;
}
