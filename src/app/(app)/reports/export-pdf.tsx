
"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type ReportTransaction = {
  transaction_date: string;
  type: string;
  description: string | null;
  reference: string | null;
  amount: number | string;
  currency: string;
  category: string;
};

type ExportPDFProps = {
  transactions: ReportTransaction[];
  from?: string;
  to?: string;
  income: number;
  expenditure: number;
  balance: number;
};

export default function ExportPDF({
  transactions,
  from,
  to,
  income,
  expenditure,
  balance,
}: ExportPDFProps) {
  function exportReport() {
    const pdf = new jsPDF();
    const money = (amount: number) =>
      `GBP ${amount.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    pdf.setFontSize(18);
    pdf.text("Baby Bank Finance Report", 14, 20);

    pdf.setFontSize(10);
    pdf.text(
      `Period: ${from || "All dates"} to ${to || "All dates"}`,
      14,
      29,
    );
    pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 14, 35);

    pdf.setFontSize(11);
    pdf.text(`Total income: ${money(income)}`, 14, 45);
    pdf.text(`Total expenditure: ${money(expenditure)}`, 14, 52);
    pdf.text(`Net balance: ${money(balance)}`, 14, 59);

    autoTable(pdf, {
      startY: 68,
      head: [["Date", "Type", "Category", "Description", "Reference", "Amount"]],
      body: transactions.map((transaction) => [
        transaction.transaction_date,
        transaction.type,
        transaction.category,
        transaction.description || "—",
        transaction.reference || "—",
        money(Number(transaction.amount)),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [50, 83, 68] },
      columnStyles: {
        3: { cellWidth: 42 },
        4: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
    });

    pdf.save("baby-bank-finance-report.pdf");
  }

  return (
    <button
      type="button"
      onClick={exportReport}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      Export PDF
    </button>
  );
}
