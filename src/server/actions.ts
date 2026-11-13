"use server";

import { revalidatePath } from "next/cache";
import { deleteRecord, insertRecord, tableForSave } from "@/lib/db";

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
    await insertRecord(table, payload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "The row could not be saved.";
    return { error: msg };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/tables/${table.code.toLowerCase()}`, "page");
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
  revalidatePath(`/tables/${table.code.toLowerCase()}`, "page");
  return { ok: true };
}
