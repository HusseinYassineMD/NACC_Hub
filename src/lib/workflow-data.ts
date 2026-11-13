import { notFound } from "next/navigation";
import { findWorkflow, tablesInGroup, type TableDef, type WorkflowDef } from "@/lib/catalog";
import { listRecords, type StoredRow } from "@/lib/db";

export async function loadWorkflow(slug: string, requested?: string) {
  const workflow = findWorkflow(slug);
  if (!workflow) notFound();
  const tables = tablesInGroup(workflow.group).filter((table) => table.fields.length > 0);
  if (tables.length === 0) notFound();
  const table =
    tables.find((item) => item.code.toLowerCase() === (requested || "").toLowerCase()) ?? tables[0];
  const rowsByCode: Record<string, StoredRow[]> = {};
  await Promise.all(
    tables.map(async (item) => {
      rowsByCode[item.code] = await listRecords(item.code);
    })
  );
  return { workflow, tables, table, rows: rowsByCode[table.code] ?? [], rowsByCode };
}

export type LoadedWorkflow = {
  workflow: WorkflowDef;
  tables: TableDef[];
  table: TableDef;
  rows: StoredRow[];
  rowsByCode: Record<string, StoredRow[]>;
};
