import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { findTable, type TableDef } from "./catalog";
import tableASeed from "../../Table_A_Workflow/seed.json";
import tableESeed from "../../Table_E_Workflow/seed.json";
import { createSqlDb, remoteDatabaseConfig, type SqlDb } from "./sql-db";

export type StoredRow = {
  id: number;
  payload: Record<string, string>;
  updatedAt: string;
};

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS rppr_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_code TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rppr_records_code ON rppr_records(table_code);
`;

let opening: Promise<SqlDb> | null = null;
let seeding: Promise<void> | null = null;

function openDatabase(): Promise<SqlDb> {
  if (!opening) {
    opening = initDatabase().catch((err) => {
      opening = null;
      throw err;
    });
  }
  return opening;
}

async function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = seedEmptyAdminTables().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  await seeding;
}

async function seedEmptyAdminTables(): Promise<void> {
  const database = await openDatabase();
  const seed = { ...tableASeed, ...tableESeed } as Record<string, Record<string, string>[]>;
  for (const [code, rows] of Object.entries(seed)) {
    const existing = await database.get<{ c: number }>(
      "SELECT COUNT(*) AS c FROM rppr_records WHERE table_code = :code",
      { code }
    );
    if (Number(existing?.c ?? 0) > 0 || rows.length === 0) continue;
    await database.batch(
      rows.map((payload) => ({
        sql: "INSERT INTO rppr_records (table_code, payload_json) VALUES (:code, :payload)",
        args: { code, payload: JSON.stringify(payload) },
      }))
    );
  }
}

async function initDatabase(): Promise<SqlDb> {
  const remote = remoteDatabaseConfig();
  try {
    const database = await createSqlDb(remote);
    await database.exec(SCHEMA_SQL);
    console.log(remote ? "NACC tables database: Turso" : "NACC tables database: local SQLite");
    return database;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      remote
        ? `Turso did not open. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN. ${msg}`
        : `Local database did not open. ${msg}`
    );
  }
}

export async function countByTable(): Promise<Record<string, number>> {
  noStore();
  await ensureSeeded();
  const database = await openDatabase();
  const rows = await database.all<{ table_code: string; c: number }>(
    "SELECT table_code, COUNT(*) AS c FROM rppr_records GROUP BY table_code"
  );
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.table_code] = Number(row.c);
  return counts;
}

export async function listRecords(code: string): Promise<StoredRow[]> {
  noStore();
  await ensureSeeded();
  const database = await openDatabase();
  const rows = await database.all<{ id: number; payload_json: string; updated_at: string }>(
    "SELECT id, payload_json, updated_at FROM rppr_records WHERE table_code = :code ORDER BY id DESC",
    { code }
  );
  return rows.map((row) => ({
    id: Number(row.id),
    payload: parsePayload(row.payload_json),
    updatedAt: row.updated_at,
  }));
}

export async function insertRecord(table: TableDef, payload: Record<string, string>): Promise<void> {
  await insertRecords(table, [payload]);
}

export async function insertRecords(table: TableDef, payloads: Record<string, string>[]): Promise<void> {
  if (payloads.length === 0) return;
  const database = await openDatabase();
  await database.batch(
    payloads.map((payload) => ({
      sql: "INSERT INTO rppr_records (table_code, payload_json) VALUES (:code, :payload)",
      args: { code: table.code, payload: JSON.stringify(payload) },
    }))
  );
}

export async function deleteRecord(code: string, id: number): Promise<boolean> {
  const database = await openDatabase();
  const result = await database.run(
    "DELETE FROM rppr_records WHERE id = :id AND table_code = :code",
    { id, code }
  );
  return result.changes > 0;
}

export function tableForSave(code: string): TableDef {
  const table = findTable(code);
  if (!table || table.externalHref || table.fields.length === 0) {
    throw new Error("This table is not saved in the hub.");
  }
  return table;
}

function parsePayload(json: string): Record<string, string> {
  try {
    const value = JSON.parse(json) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const payload: Record<string, string> = {};
    for (const [key, item] of Object.entries(value)) {
      if (typeof item === "string") payload[key] = item;
      else if (typeof item === "number") payload[key] = String(item);
    }
    return payload;
  } catch {
    return {};
  }
}
