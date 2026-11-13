import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { findTable, workflowForGroup } from "@/lib/catalog";

type PageProps = { params: { code: string } };

export function generateMetadata({ params }: PageProps): Metadata {
  const table = findTable(params.code);
  if (!table) return { title: "Table not found" };
  return { title: `Table ${table.code} · ${table.title}` };
}

export default function TablePage({ params }: PageProps) {
  const table = findTable(params.code);
  if (!table) notFound();
  if (table.externalHref) redirect(table.externalHref);
  const workflow = workflowForGroup(table.group);
  if (workflow) redirect(`/w/${workflow.slug}?table=${table.code.toLowerCase()}`);
  notFound();
}
