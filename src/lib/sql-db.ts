import "server-only";

import fs from "fs";
import path from "path";
import type { Client, InArgs, InValue, ResultSet } from "@libsql/client";

export const DB_PATH = process.env.NACC_DB_PATH
  ? path.resolve(process.env.NACC_DB_PATH)
  : path.join(process.cwd(), "data/nacc_tables.sqlite");

export type SqlValue = string | number | bigint | null;
export type SqlArgs = SqlValue[] | Record<string, SqlValue | undefined>;

export type SqlDb = {
  exec(sql: string): Promise<void>;
  all<T>(sql: string, args?: SqlArgs): Promise<T[]>;
  get<T>(sql: string, args?: SqlArgs): Promise<T | undefined>;
  run(sql: string, args?: SqlArgs): Promise<{ changes: number }>;
  batch(statements: { sql: string; args?: SqlArgs }[]): Promise<void>;
};

type RemoteConfig = { url: string; authToken: string };

export function remoteDatabaseConfig(): RemoteConfig | null {
  const url = process.env.TURSO_DATABASE_URL?.trim() ?? "";
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() ?? "";
  if (!url && !authToken) return null;
  if (!url || !authToken) {
    throw new Error(
      "Set both TURSO_DATABASE_URL and TURSO_AUTH_TOKEN, or leave both empty to use the local SQLite file."
    );
  }
  return { url, authToken };
}

function normalizeRecord(args: Record<string, SqlValue | undefined>): Record<string, InValue> {
  const out: Record<string, InValue> = {};
  for (const [key, value] of Object.entries(args)) {
    out[key] = value === undefined ? null : value;
  }
  return out;
}

function toInArgs(args?: SqlArgs): InArgs | undefined {
  if (args === undefined) return undefined;
  if (Array.isArray(args)) return args.map((value) => (value === undefined ? null : value));
  return normalizeRecord(args);
}

function rowsOf<T>(result: ResultSet): T[] {
  return result.rows.map((row) => ({ ...row }) as T);
}

function wrap(client: Client): SqlDb {
  return {
    async exec(sql) {
      await client.executeMultiple(sql);
    },
    async all<T>(sql: string, args?: SqlArgs) {
      const result = await client.execute({ sql, args: toInArgs(args) });
      return rowsOf<T>(result);
    },
    async get<T>(sql: string, args?: SqlArgs) {
      const rows = await this.all<T>(sql, args);
      return rows[0];
    },
    async run(sql, args) {
      const result = await client.execute({ sql, args: toInArgs(args) });
      return { changes: result.rowsAffected };
    },
    async batch(statements) {
      if (statements.length === 0) return;
      await client.batch(
        statements.map((statement) => ({ sql: statement.sql, args: toInArgs(statement.args) })),
        "write"
      );
    },
  };
}

export async function createSqlDb(remote: RemoteConfig | null): Promise<SqlDb> {
  const { createClient } = await import("@libsql/client");
  if (remote) {
    return wrap(createClient({ url: remote.url, authToken: remote.authToken, intMode: "number" }));
  }

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  return wrap(createClient({ url: `file:${DB_PATH}`, intMode: "number" }));
}
