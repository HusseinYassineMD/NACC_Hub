import { redirect } from "next/navigation";

export default function AdminPage({ searchParams }: { searchParams: { table?: string } }) {
  const table = (searchParams.table || "a1").toLowerCase();
  redirect(`/w/a?table=${table}`);
}
