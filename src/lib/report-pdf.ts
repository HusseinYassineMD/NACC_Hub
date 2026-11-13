import type { TableDef } from "./catalog";

export async function downloadWorkflowPdf(doc: {
  filename: string;
  title: string;
  tables: { table: TableDef; headers: string[]; rows: string[][] }[];
}) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  const margin = 36;
  const navy: [number, number, number] = [26, 39, 68];

  doc.tables.forEach((section, index) => {
    if (index > 0) pdf.addPage();
    let y = 40;
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...navy);
    if (index === 0) {
      pdf.setFontSize(16);
      pdf.text(doc.title, margin, y);
      y = 62;
    }
    pdf.setFontSize(12);
    pdf.text(`Table ${section.table.code}. ${section.table.title}`, margin, y);
    autoTable(pdf, {
      startY: y + 12,
      head: [section.headers],
      body: section.rows.length ? section.rows : [section.headers.map(() => "")],
      margin: { left: margin, right: margin },
      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 3,
        overflow: "linebreak",
        textColor: navy,
        lineColor: [213, 219, 230],
        lineWidth: 0.4,
      },
      headStyles: { fillColor: navy, textColor: 255, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 247, 251] },
    });
  });

  pdf.save(doc.filename);
}

export function downloadJsonReport(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
