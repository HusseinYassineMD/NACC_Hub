import {
  MODALITIES,
  npField,
  yearField,
  type TableDef,
} from "../src/lib/table-fields";

export const workflow = {
  slug: "b",
  group: "Clinical" as const,
  title: "Table B",
  summary:
    "B1 and B2 stay in this workflow. The intake questions follow the Clinical Core imaging instructions.",
};

export const tables: TableDef[] = [
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
];
