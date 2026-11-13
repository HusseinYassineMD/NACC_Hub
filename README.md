# NACC RPPR table hub

Landing page for the ADRC progress-report tables. Each admin, clinical, and ORE table has its own page for entering rows and reviewing what was saved. Tables G1 and G2 open the REC faculty workflow at https://rec-faculty-workflow.vercel.app/rppr/.

Rows for A1–A7, B1, B2, E1, and E2 are stored in the same Turso database as the faculty workflow, in a separate `rppr_records` table.

## Run

```bash
cd NACC_Hub
npm install
npm run dev
```

Open http://127.0.0.1:8770/

Copy `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from `REC_Faculty_Workflow/.env` into `NACC_Hub/.env`. Leave both blank to use a local file at `data/nacc_tables.sqlite`.

NACC reference: https://www.naccdata.org/progress-reports-to-nia/
