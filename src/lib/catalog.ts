import { tables as adminTables, workflow as adminWorkflow } from "../../Table_A_Workflow/workflow";
import { tables as clinicalTables, workflow as clinicalWorkflow } from "../../Table_B_Workflow/workflow";
import { tables as oreTables, workflow as oreWorkflow } from "../../Table_E_Workflow/workflow";
import type { TableDef, TableGroup, TableStatus } from "./table-fields";

export type { FieldDef, FieldType, TableDef, TableGroup, TableStatus } from "./table-fields";

export const REC_FACULTY_URL = "https://rec-faculty-workflow.vercel.app/";
export const REC_RPPR_URL = "https://rec-faculty-workflow.vercel.app/rppr/";
export const NACC_REFERENCE = "https://www.naccdata.org/progress-reports-to-nia/";
export const INPUT_DEADLINE = "November 24";

const recTables: TableDef[] = [
  {
    code: "G1",
    title: "REC scholars and trainees",
    group: "REC",
    summary: "Scholars and trainees for the Research Education Component.",
    instructions:
      "Table G1 is collected in the REC faculty workflow: roster, intake, and the RPPR preview. This hub opens that site.",
    centerNote: "Aishwarya and Lucy are collecting scholar and trainee rows in the REC faculty workflow.",
    status: "live",
    externalHref: REC_RPPR_URL,
    fields: [],
  },
  {
    code: "G2",
    title: "REC events",
    group: "REC",
    summary: "Training events hosted or supported by the REC.",
    instructions: "Table G2 is the events table in the REC faculty workflow, on the same RPPR page as G1.",
    centerNote: "Aishwarya and Lucy are collecting training events in the REC faculty workflow.",
    status: "live",
    externalHref: REC_RPPR_URL,
    fields: [],
  },
];

export const TABLES: TableDef[] = [...adminTables, ...clinicalTables, ...oreTables, ...recTables];

export const GROUPS: TableGroup[] = ["Admin", "Clinical", "ORE", "REC"];

export type WorkflowDef = {
  slug: string;
  group: Exclude<TableGroup, "REC">;
  title: string;
  summary: string;
};

export const WORKFLOWS: WorkflowDef[] = [adminWorkflow, clinicalWorkflow, oreWorkflow];

export function findWorkflow(slug: string): WorkflowDef | undefined {
  const key = slug.trim().toLowerCase();
  return WORKFLOWS.find((workflow) => workflow.slug === key || workflow.group.toLowerCase() === key);
}

export function workflowForGroup(group: TableGroup): WorkflowDef | undefined {
  return WORKFLOWS.find((workflow) => workflow.group === group);
}

export function findTable(code: string): TableDef | undefined {
  const key = code.trim().toLowerCase();
  return TABLES.find((table) => table.code.toLowerCase() === key);
}

export function tablesInGroup(group: TableGroup): TableDef[] {
  return TABLES.filter((table) => table.group === group);
}

export function statusLabel(status: TableStatus): string {
  if (status === "live") return "Open REC site";
  if (status === "na") return "Marked NA";
  return "Needs input";
}
