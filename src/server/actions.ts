"use server";

import { revalidatePath } from "next/cache";
import { deleteRecord, insertRecords, tableForSave } from "@/lib/db";

export type ActionResult = { ok: true } | { error: string };

export async function saveRecord(code: string, formData: FormData): Promise<ActionResult> {
  let table;
  try {
    table = tableForSave(code);
  } catch {
    return { error: "This table cannot be saved here." };
  }

  const payload: Record<string, string> = {};
  for (const field of table.fields) {
    const raw = formData.get(field.key);
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value) payload[field.key] = value;
  }

  const meaningful = Object.entries(payload).filter(([key]) => key !== "reporting_year");
  if (meaningful.length === 0) {
    return { error: "Enter at least one field before saving." };
  }

  try {
    await insertRecords(table, [payload]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "The row could not be saved.";
    return { error: msg };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeRecord(code: string, id: number): Promise<ActionResult> {
  let table;
  try {
    table = tableForSave(code);
  } catch {
    return { error: "This table cannot be edited here." };
  }

  try {
    const removed = await deleteRecord(table.code, id);
    if (!removed) return { error: "That row is no longer in the table." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "The row could not be removed.";
    return { error: msg };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function importTableRows(
  code: string,
  rows: Record<string, string>[]
): Promise<{ ok: true; inserted: number } | { error: string }> {
  let table;
  try {
    table = tableForSave(code);
  } catch {
    return { error: "This table cannot be imported here." };
  }

  const allowed = new Set(table.fields.map((field) => field.key));
  const payloads: Record<string, string>[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const payload: Record<string, string> = {};
    for (const [key, raw] of Object.entries(row)) {
      if (!allowed.has(key) || typeof raw !== "string") continue;
      const value = raw.trim();
      if (value) payload[key] = value;
    }
    const meaningful = Object.keys(payload).filter((key) => key !== "reporting_year");
    if (meaningful.length > 0) payloads.push(payload);
  }
  if (payloads.length === 0) return { error: "No rows with values were found." };

  try {
    await insertRecords(table, payloads);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "The spreadsheet could not be imported.";
    return { error: msg };
  }

  revalidatePath("/", "layout");
  return { ok: true, inserted: payloads.length };
}
