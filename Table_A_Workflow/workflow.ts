import {
  adcGrantFields,
  textField,
  wideField,
  yearField,
  type TableDef,
} from "../src/lib/table-fields";

export const workflow = {
  slug: "a",
  group: "Admin" as const,
  title: "Table A",
  summary:
    "A1 through A7 stay in this workflow. The intake questions are the columns from the Year 6 admin documents.",
};

export const tables: TableDef[] = [
  {
    code: "A1",
    title: "Federal funded grants",
    group: "Admin",
    summary: "Federally funded grants that use any ADRC resource.",
    instructions:
      "Federally funded grants that use ADRC resources. Therapeutic trials belong on Table A3. The Year 6 rows from the shared table are already loaded, including the new-award list.",
    centerNote: "Open this table from the admin workflow. Add a row when the NP Core is involved.",
    status: "input",
    fields: [
      ...adcGrantFields("Grant", "Grant title and number"),
      {
        key: "grant_set",
        label: "List",
        type: "select",
        options: ["Supported by ADRC resources", "New federal award"],
        section: "Grant",
      },
    ],
  },
  {
    code: "A2",
    title: "Non-federal funding",
    group: "Admin",
    summary: "Foundation and other non-federal grants that use any ADRC resource.",
    instructions:
      "Non-federal funding that uses ADRC resources. Therapeutic trials belong on Table A3. The Year 6 rows from the shared table are already loaded.",
    centerNote: "Open this table from the admin workflow. Add a row when the NP Core is involved.",
    status: "input",
    fields: adcGrantFields("Grant", "Grant title / number"),
  },
  {
    code: "A3",
    title: "Therapeutic trials",
    group: "Admin",
    summary: "Therapeutic trials supported by ADRC resources, from any funding source.",
    instructions:
      "List therapeutic trials here even when a federal grant pays for them. Funding source uses the four NACC codes. Referred means the ADRC discussed the trial with the participant and the participant agreed to a warm handoff. If consented counts are not tracked, enter Unknown.",
    centerNote: "Year 6 trials from the shared table are loaded. Funding codes: 1 NIH, 2 other federal, 3 industry, 4 all others.",
    status: "input",
    fields: [
      yearField("Trial"),
      wideField("pi", "PI last name, first", "Trial"),
      textField("funding_source", "Funding source", "Trial"),
      wideField("grant_title", "Grant title", "Trial"),
      textField("nct", "NCT number", "Trial"),
      textField("project_period", "Project period", "Trial"),
      textField("participants_referred", "Participants referred", "Trial"),
      textField("participants_consented", "Participants consented", "Trial"),
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
      wideField("pi", "PI", "Award"),
      wideField("grant_title", "Grant title / type of award", "Award"),
      textField("project_period", "Project period", "Award"),
      wideField("funding_amount", "Funding source and amount", "Award"),
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
    fields: adcGrantFields("Collaboration", "Grant title and number"),
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
      wideField("grant_title", "Grant title and number", "Grant"),
      wideField("pi", "PI", "Grant"),
      textField("award_period", "Award period", "Grant"),
      textField("total_award", "Total award amount", "Grant"),
      wideField("disparities_topic", "Health disparities topic", "Grant"),
      textField("funding_agency", "Funding agency", "Grant"),
      wideField("target_groups", "Target group(s)", "Grant"),
    ],
  },
  {
    code: "A7",
    title: "Biomarkers",
    group: "Admin",
    summary: "Biomarker types the Center collects, one line each, with Yes or No and details.",
    instructions:
      "Each line is one biomarker category from the shared Year 6 biomarker table. Yes or No is taken from the explanation, and the rest of the explanation is kept as the detail.",
    centerNote: "Abhay Sagre leads this table. Annie reviews the final version.",
    status: "input",
    owner: "Abhay Sagre",
    fields: [
      yearField("Biomarker"),
      textField("biomarker", "Biomarker category", "Biomarker"),
      { key: "collected", label: "Collected by the Center?", type: "yesno", section: "Biomarker" },
      wideField("details", "Explanation", "Biomarker"),
    ],
  },
];
