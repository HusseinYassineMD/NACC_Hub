# NACC RPPR table hub

Landing page for the ADRC progress-report tables. Each letter is its own workflow folder.

**Live site:** https://nacc-hub.vercel.app/

## Workflow folders

| Folder | Tables | Notes |
|---|---|---|
| [`Table_A_Workflow/`](./Table_A_Workflow) | A1–A7 | Admin tables, seed data, Overview / Intake / RPPR |
| [`Table_B_Workflow/`](./Table_B_Workflow) | B1–B2 | Clinical imaging tables |
| [`Table_E_Workflow/`](./Table_E_Workflow) | E1–E2 | ORE outreach tables |
| [`Table_G_Workflow/`](./Table_G_Workflow) | G1–G2 | Points to the separate [REC faculty workflow](https://github.com/HusseinYassineMD/REC_Faculty_Workflow) |

The hub shell (`src/`) is the landing page and shared database helpers. Routes under `/w/a`, `/w/b`, and `/w/e` re-export the pages from each workflow folder.

Rows for A, B, and E are stored in the same Turso database as the faculty workflow, in `rppr_records`. G1 and G2 use the faculty roster tables on that same database.

## Run locally

```bash
cd NACC_Hub
npm install
npm run dev
```

Open http://127.0.0.1:8770/

Copy `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from `REC_Faculty_Workflow/.env` into `NACC_Hub/.env`. Leave both blank to use a local file at `data/nacc_tables.sqlite`.

NACC reference: https://www.naccdata.org/progress-reports-to-nia/
