"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function WorkflowNav({
  slug,
  tables,
}: {
  slug: string;
  tables: { code: string }[];
}) {
  const pathname = usePathname() || "/";
  const params = useSearchParams();
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const section = path.endsWith("/intake") ? "intake" : path.endsWith("/rppr") ? "rppr" : "overview";
  const requested = (params.get("table") || tables[0]?.code || "").toLowerCase();
  const current = tables.some((table) => table.code.toLowerCase() === requested)
    ? requested
    : tables[0]?.code.toLowerCase() ?? "";
  const suffix = section === "overview" ? "" : `/${section}`;

  const itemClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
      active
        ? "bg-cpbh-gold text-cpbh-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_16px_-8px_rgba(0,0,0,0.45)]"
        : "text-white/90 hover:bg-white/15 hover:text-white"
    }`;

  return (
    <nav className="nav-dock" aria-label="Workflow">
      {(
        [
          ["overview", "Overview"],
          ["intake", "Intake form"],
          ["rppr", "RPPR"],
        ] as const
      ).map(([id, label]) => (
        <Link
          key={id}
          href={`/w/${slug}${id === "overview" ? "" : `/${id}`}?table=${current}`}
          className={itemClass(section === id)}
        >
          {label}
        </Link>
      ))}
      <span className="mx-1 hidden h-6 w-px self-center bg-white/30 sm:block" aria-hidden />
      {tables.map((table) => (
        <Link
          key={table.code}
          href={`/w/${slug}${suffix}?table=${table.code.toLowerCase()}`}
          className={itemClass(current === table.code.toLowerCase())}
          aria-current={current === table.code.toLowerCase() ? "page" : undefined}
        >
          {table.code}
        </Link>
      ))}
    </nav>
  );
}
