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
  externalHref?: string;
  fields: FieldDef[];
  ratio?: { label: string; numerator: string; denominator: string };
};

export const MODALITIES = ["MRI", "Amyloid PET", "Tau PET", "FDG PET", "Other"];

export function yearField(section: string): FieldDef {
  return {
    key: "reporting_year",
    label: "Reporting year",
    type: "text",
    hint: "The RPPR year this row belongs to.",
    section,
  };
}

export function npField(section: string): FieldDef {
  return {
    key: "np_core",
    label: "NP Core involved?",
    type: "yesno",
    hint: "A center flag so NP rows can be pulled out of the roll-up. This is not an official NACC column.",
    section,
  };
}

export function textField(key: string, label: string, section: string): FieldDef {
  return { key, label, type: "text", section };
}

export function wideField(key: string, label: string, section: string): FieldDef {
  return { key, label, type: "textarea", wide: true, section };
}

export function adcGrantFields(section: string, grantLabel: string): FieldDef[] {
  return [
    yearField(section),
    wideField("pi", "PI/PD", section),
    wideField("grant_number", grantLabel, section),
    wideField("source_amount", "Source and amount", section),
    textField("project_period", "Project period", section),
    wideField("role_of_adc", "Role of ADC", section),
  ];
}
