import WorkflowFrame from "../../src/components/workflow/WorkflowFrame";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <WorkflowFrame slug="e">{children}</WorkflowFrame>;
}
