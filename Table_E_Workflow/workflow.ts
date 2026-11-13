import {
  npField,
  textField,
  wideField,
  yearField,
  type TableDef,
} from "../src/lib/table-fields";

export const workflow = {
  slug: "e",
  group: "ORE" as const,
  title: "Table E",
  summary:
    "E1 and E2 stay in this workflow. E1 questions match the shared Year 6 ORE events table.",
};

export const tables: TableDef[] = [
  {
    code: "E1",
    title: "ORE community events",
    group: "ORE",
    summary: "ORE Core group events and activities for Year 6, with attendance and audience.",
    instructions:
      "Each row is one event or activity from the shared Year 6 ORE table: the event, how many people attended, the audience or target groups, and the gender breakdown.",
    centerNote: "All 128 Year 6 rows from the shared ORE table are loaded.",
    status: "input",
    fields: [
      yearField("Event"),
      wideField("event_name", "Event or activity", "Event"),
      textField("attendees", "# Attendees/Participants", "Event"),
      wideField("target_groups", "Audience breakdown or target group(s)", "Event"),
      textField("gender", "Gender (%)", "Event"),
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
];
