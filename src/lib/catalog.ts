export type FieldType = "text" | "textarea" | "date" | "select" | "yesno" | "number";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  hint?: string;
  wide?: boolean;
  section: string;
};

export type TableStatus = "input" | "na" | "live";

export type TableGroup = "Admin" | "Clinical" | "ORE" | "REC";

export type TableDef = {
  code: string;
  title: string;
  group: TableGroup;
  summary: string;
  instructions: string;
  centerNote: string;
  status: TableStatus;
  owner?: string;
  /** G1 and G2 already live on the REC faculty workflow. */
  externalHref?: string;
  fields: FieldDef[];
  ratio?: { label: string; numerator: string; denominator: string };
};

export const REC_FACULTY_URL = "https://rec-faculty-workflow.vercel.app/";
export const REC_RPPR_URL = "https://rec-faculty-workflow.vercel.app/rppr/";
export const NACC_REFERENCE = "https://www.naccdata.org/progress-reports-to-nia/";
export const INPUT_DEADLINE = "November 24";

const FUNDING_SOURCES = [
  "1 — U.S. National Institutes of Health",
  "2 — Other U.S. federal agency",
  "3 — Industry",
  "4 — All others",
];

const MODALITIES = ["MRI", "Amyloid PET", "Tau PET", "FDG PET", "Other"];

const BIOMARKERS = [
  "CSF amyloid",
  "CSF tau / p-tau",
  "Plasma amyloid",
  "Plasma p-tau",
  "Amyloid PET",
  "Tau PET",
  "FDG PET",
  "MRI",
  "Genetics / APOE / DNA",
  "Neuropathology",
  "Other",
];

function yearField(section: string): FieldDef {
  return {
    key: "reporting_year",
    label: "Reporting year",
    type: "text",
    hint: "The RPPR year this row belongs to.",
    section,
  };
}

function npField(section: string): FieldDef {
  return {
    key: "np_core",
    label: "NP Core involved?",
    type: "yesno",
    hint: "A center flag so NP rows can be pulled out of the roll-up. This is not an official NACC column.",
    section,
  };
}

function resourceFields(): FieldDef[] {
  const section = "ADRC resources contributed";
  return [
    { key: "resource_data", label: "Data", type: "yesno", hint: "Data of any type.", section },
    { key: "resource_neuroimages", label: "Neuroimages", type: "yesno", section },
    {
      key: "resource_biosamples",
      label: "Biosamples",
      type: "yesno",
      hint: "Biofluids, including DNA, or tissue.",
      section,
    },
    { key: "resource_participants", label: "Participants", type: "yesno", section },
    { key: "resource_expertise", label: "Expertise", type: "yesno", section },
    {
      key: "resource_use",
      label: "How the resources are used",
      type: "textarea",
      wide: true,
      section,
    },
  ];
}

function grantFields(fundingHint: string): FieldDef[] {
  const section = "Grant";
  return [
    yearField(section),
    {
      key: "funding_source",
      label: "Funding source",
      type: "text",
      hint: fundingHint,
      section,
    },
    { key: "grant_number", label: "Grant or contract number", type: "text", section },
    { key: "project_title", label: "Project title", type: "text", wide: true, section },
    { key: "pi_name", label: "Principal investigator", type: "text", section },
    { key: "project_start", label: "Project start", type: "date", section },
    { key: "project_end", label: "Project end", type: "date", section },
    ...resourceFields(),
    npField("For this center"),
    { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
  ];
}

export const TABLES: TableDef[] = [
  {
    code: "A1",
    title: "Federal funded grants",
    group: "Admin",
    summary: "Federally funded grants that use any ADRC resource.",
    instructions:
      "Include a grant when the ADRC contributed data, neuroimaging, biofluid or tissue samples, participants, or expertise. Therapeutic trials belong on Table A3. If the NP Core is part of the work, add the row here.",
    centerNote: "Prepare a row for any federal grant that involves the NP Core.",
    status: "input",
    fields: grantFields("NIH institute or other federal agency."),
  },
  {
    code: "A2",
    title: "Non-federal funding",
    group: "Admin",
    summary: "Foundation and other non-federal grants that use any ADRC resource.",
    instructions:
      "Same resource questions as Table A1, for funding that is not federal. Therapeutic trials belong on Table A3. Include neuroimaging, biofluid or tissue samples, data, and expertise.",
    centerNote: "Prepare a row for any non-federal grant that involves the NP Core.",
    status: "input",
    fields: grantFields("Foundation, association, institution, or other non-federal source."),
  },
  {
    code: "A3",
    title: "Therapeutic trials",
    group: "Admin",
    summary: "Therapeutic trials supported by ADRC resources, from any funding source.",
    instructions:
      "List therapeutic trials here even when a federal grant pays for them. Funding source uses the four NACC codes. Referred means the ADRC discussed the trial with the participant and the participant agreed to a warm handoff. If consented counts are not tracked, enter Unknown.",
    centerNote: "Marked NA for the NP Core this cycle. Leave the table empty unless another core has a trial to add.",
    status: "na",
    fields: [
      yearField("Trial"),
      { key: "trial_name", label: "Trial name", type: "text", wide: true, section: "Trial" },
      {
        key: "funding_source",
        label: "Funding source",
        type: "select",
        options: FUNDING_SOURCES,
        section: "Trial",
      },
      { key: "pi_name", label: "Principal investigator", type: "text", section: "Trial" },
      { key: "grant_number", label: "Grant or contract number", type: "text", section: "Trial" },
      {
        key: "participants_referred",
        label: "Participants referred",
        type: "number",
        hint: "Warm handoff: the participant agreed to share contact information with the trial.",
        section: "Participants",
      },
      {
        key: "participants_consented",
        label: "Participants consented",
        type: "text",
        hint: "A number, or Unknown.",
        section: "Participants",
      },
      npField("For this center"),
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
  },
  {
    code: "A4",
    title: "Training awards",
    group: "Admin",
    summary: "Funded training awards whose PI or mentor has an ADRC role.",
    instructions:
      "Include CTSI, T, F, and K programs, fellowships, Physician Scientist Awards, and similar mentee awards. The PI or mentor should be affiliated with the ADRC and should have used center resources in the last 5 years. REC scholars belong on Table G1.",
    centerNote: "Add a row when Annie, Mike, or the NP Core was involved in the training award.",
    status: "input",
    fields: [
      yearField("Award"),
      { key: "trainee_name", label: "Trainee name", type: "text", section: "Award" },
      { key: "award_name", label: "Award name", type: "text", section: "Award" },
      {
        key: "mechanism",
        label: "Mechanism",
        type: "select",
        options: ["T program", "F award", "K award", "CTSI", "Fellowship", "Physician Scientist Award", "Other"],
        section: "Award",
      },
      { key: "grant_number", label: "Grant number", type: "text", section: "Award" },
      {
        key: "mentor_name",
        label: "PI / mentor",
        type: "text",
        hint: "Must have a role in the Center.",
        section: "Award",
      },
      { key: "mentor_role", label: "Mentor role at the ADRC", type: "text", section: "Award" },
      { key: "award_start", label: "Award start", type: "date", section: "Award" },
      { key: "award_end", label: "Award end", type: "date", section: "Award" },
      {
        key: "annie_mike_np",
        label: "Annie, Mike, or NP Core involved?",
        type: "yesno",
        section: "For this center",
      },
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
  },
  {
    code: "A5",
    title: "ADRC collaborations",
    group: "Admin",
    summary: "NACC projects, industry, Alzheimer’s Association chapters, and other institutions.",
    instructions:
      "Include NACC projects and other collaborations. Some rows will also appear on a grant table. List the relationship here as well so the collaboration table stays complete.",
    centerNote: "Add collaborations that involve the NP Core.",
    status: "input",
    fields: [
      yearField("Collaboration"),
      { key: "partner", label: "Partner or institution", type: "text", section: "Collaboration" },
      {
        key: "collaboration_type",
        label: "Type",
        type: "select",
        options: ["NACC project", "Industry", "Alzheimer's Association chapter", "Other institution"],
        section: "Collaboration",
      },
      { key: "description", label: "What the collaboration covers", type: "textarea", wide: true, section: "Collaboration" },
      { key: "adrc_contact", label: "ADRC contact", type: "text", section: "Collaboration" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Active", "Completed", "Planned"],
        section: "Collaboration",
      },
      { key: "start_date", label: "Start", type: "date", section: "Collaboration" },
      npField("For this center"),
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
  },
  {
    code: "A6",
    title: "At-risk population grants",
    group: "Admin",
    summary: "Grants whose main focus is an understudied, at-risk, or limited-access group.",
    instructions:
      "Include a grant when the at-risk population is the subject of the study. A study about another topic that also recruits understudied groups stays off this table. Overlap with A1 or A2 is expected.",
    centerNote: "Add a row when an at-risk population grant involves the NP Core.",
    status: "input",
    fields: [
      yearField("Grant"),
      { key: "grant_number", label: "Grant number", type: "text", section: "Grant" },
      { key: "funding_source", label: "Funding source", type: "text", section: "Grant" },
      { key: "project_title", label: "Project title", type: "text", wide: true, section: "Grant" },
      { key: "pi_name", label: "Principal investigator", type: "text", section: "Grant" },
      { key: "project_start", label: "Project start", type: "date", section: "Grant" },
      { key: "project_end", label: "Project end", type: "date", section: "Grant" },
      {
        key: "population_focus",
        label: "Population that is the main focus",
        type: "textarea",
        wide: true,
        hint: "Understudied, at-risk, or limited-access group.",
        section: "Focus",
      },
      npField("For this center"),
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
  },
  {
    code: "A7",
    title: "Biomarkers",
    group: "Admin",
    summary: "Biomarker types the Center collects, one line each, with Yes or No and details.",
    instructions:
      "Each line is one biomarker type. Answer whether the Center collects it, then add the detail NIA asks for. The categories below are a working list for data entry until the final biomarker table is confirmed.",
    centerNote: "Abhay Sagre leads this table. Annie reviews the final version.",
    status: "input",
    owner: "Abhay Sagre",
    fields: [
      yearField("Biomarker"),
      {
        key: "biomarker",
        label: "Biomarker",
        type: "select",
        options: BIOMARKERS,
        section: "Biomarker",
      },
      { key: "collected", label: "Collected by the Center?", type: "yesno", section: "Biomarker" },
      {
        key: "details",
        label: "Details",
        type: "textarea",
        wide: true,
        hint: "Assay, modality, sample type, or anything else this line needs.",
        section: "Biomarker",
      },
      { key: "lead", label: "Lead for this line", type: "text", section: "For this center" },
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
  },
  {
    code: "B1",
    title: "Clinical Core imaging, this year",
    group: "Clinical",
    summary: "Clinical Core participants imaged during the current reporting year.",
    instructions:
      "One row per modality. Count participants imaged in this reporting year. This table is for Centers on the current Clinical Core imaging instructions.",
    centerNote: "Add a row when imaging for the reporting year involves the NP Core.",
    status: "input",
    fields: [
      yearField("Imaging"),
      { key: "modality", label: "Modality", type: "select", options: MODALITIES, section: "Imaging" },
      {
        key: "imaged_this_year",
        label: "Participants imaged this year",
        type: "number",
        section: "Imaging",
      },
      {
        key: "clinical_core_n",
        label: "Clinical Core participants (denominator)",
        type: "number",
        hint: "Leave blank if the denominator is not ready.",
        section: "Imaging",
      },
      npField("For this center"),
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
  },
  {
    code: "B2",
    title: "Clinical Core imaging, five-year",
    group: "Clinical",
    summary: "Share of enrolled Clinical Core participants with images over the five-year period.",
    instructions:
      "Cumulative counts for the five-year project period, using participants actually enrolled. One row per modality.",
    centerNote: "Add a row when the five-year imaging totals involve the NP Core.",
    status: "input",
    fields: [
      yearField("Imaging"),
      { key: "modality", label: "Modality", type: "select", options: MODALITIES, section: "Imaging" },
      {
        key: "with_images",
        label: "Participants with images available",
        type: "number",
        section: "Imaging",
      },
      {
        key: "enrolled_n",
        label: "Enrolled Clinical Core participants",
        type: "number",
        section: "Imaging",
      },
      npField("For this center"),
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
    ratio: { label: "Proportion", numerator: "with_images", denominator: "enrolled_n" },
  },
  {
    code: "E1",
    title: "ORE community events",
    group: "ORE",
    summary: "At-risk community events and activities for the current reporting year.",
    instructions:
      "Report at-risk, understudied, or limited-access events from this reporting year only, including an estimated number of attendees. Include an activity from another core when it belongs in the ORE story. Skip events that are not about at-risk topics.",
    centerNote: "Presumed NA for the NP Core this cycle. Add a row if an ORE event should still be listed.",
    status: "na",
    fields: [
      yearField("Event"),
      { key: "event_name", label: "Event or activity", type: "text", wide: true, section: "Event" },
      { key: "event_date", label: "Date", type: "date", section: "Event" },
      { key: "attendees", label: "Estimated attendees", type: "number", section: "Event" },
      {
        key: "population_focus",
        label: "At-risk focus",
        type: "textarea",
        wide: true,
        section: "Event",
      },
      { key: "description", label: "Description", type: "textarea", wide: true, section: "Event" },
      npField("For this center"),
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
  },
  {
    code: "E2",
    title: "ORE community activity summary",
    group: "ORE",
    summary: "At-risk participants in non-Clinical Core studies, compared with all participants in those studies.",
    instructions:
      "For pilots, projects, and clinical trials outside the Clinical Core, enter the at-risk participant count and the total participant count. The page calculates the ratio. Use numbers that are already on hand.",
    centerNote: "Presumed NA for the NP Core this cycle. Add a row if a ratio should still be reported.",
    status: "na",
    fields: [
      yearField("Activity"),
      {
        key: "activity",
        label: "Pilot, project, or trial",
        type: "text",
        wide: true,
        section: "Activity",
      },
      {
        key: "at_risk_n",
        label: "At-risk participants",
        type: "number",
        section: "Activity",
      },
      {
        key: "total_n",
        label: "Total participants",
        type: "number",
        section: "Activity",
      },
      { key: "explanation", label: "Explanation", type: "textarea", wide: true, section: "Activity" },
      npField("For this center"),
      { key: "notes", label: "Notes", type: "textarea", wide: true, section: "For this center" },
    ],
    ratio: { label: "Ratio", numerator: "at_risk_n", denominator: "total_n" },
  },
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
    instructions:
      "Table G2 is the events table in the REC faculty workflow, on the same RPPR page as G1.",
    centerNote: "Aishwarya and Lucy are collecting training events in the REC faculty workflow.",
    status: "live",
    externalHref: REC_RPPR_URL,
    fields: [],
  },
];

export const GROUPS: TableGroup[] = ["Admin", "Clinical", "ORE", "REC"];

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
