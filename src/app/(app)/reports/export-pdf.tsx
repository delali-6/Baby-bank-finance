
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

export type WeeklyReportData = {
  startDate: string;
  endDate: string;
  label: string;
  income: number;
  expenditure: number;
  balance: number;
};

export type MonthlyReportData = {
  month: string;
  income: number;
  expenditure: number;
};

type ExportPDFProps = {
  transactions: ReportTransaction[];
  weeklyData: WeeklyReportData[];
  monthlyData: MonthlyReportData[];
  from?: string;
  to?: string;
  income: number;
  expenditure: number;
  balance: number;
  charityName?: string;
};

export default function ExportPDF({
  transactions,
  weeklyData,
  monthlyData,
  from,
  to,
  income,
  expenditure,
  balance,
  charityName,
}: ExportPDFProps) {
  async function exportReport() {
    const pdf = new jsPDF();

    try {
      const blob = await (await fetch("/Baby-bank-app-logo.png")).blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      // Logo is 768x288, so keep a 8:3 ratio
      pdf.addImage(dataUrl, "PNG", 196 - 48, 10, 48, 18);
    } catch {
      // Export without the logo if it cannot be loaded
    }

    const money = (amount: number) =>
      `GBP ${amount.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const formatDate = (value: string) =>
      new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });

    // Report heading
    pdf.setFontSize(18);
    pdf.text(`${charityName || "Baby Bank Finance"} Report`, 14, 20, {
      maxWidth: 120,
    });

    pdf.setFontSize(10);
    pdf.text(
      `Period: ${from ? formatDate(from) : "All dates"} to ${
        to ? formatDate(to) : "All dates"
      }`,
      14,
      29,
    );

    pdf.text(
      `Generated: ${new Date().toLocaleDateString("en-GB")}`,
      14,
      35,
    );

    // Overall financial summary
    pdf.setFontSize(12);
    pdf.text("Overall financial summary", 14, 45);

    autoTable(pdf, {
      startY: 49,
      head: [["Financial measure", "Amount"]],
      body: [
        ["Total income", money(income)],
        ["Total expenditure", money(expenditure)],
        ["Net balance", money(balance)],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [50, 83, 68] },
      columnStyles: {
        1: { halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    // Weekly financial summaries
    let currentY = (pdf as any).lastAutoTable.finalY + 12;

    pdf.setFontSize(12);
    pdf.text("Weekly financial summaries", 14, currentY);

    autoTable(pdf, {
      startY: currentY + 4,
      head: [["Financial week", "Income", "Expenditure", "Net balance"]],
      body: weeklyData.map((week) => [
        `${week.label}\n${formatDate(week.startDate)} - ${formatDate(
          week.endDate,
        )}`,
        money(week.income),
        money(week.expenditure),
        money(week.balance),
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [50, 83, 68] },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    // Monthly financial summaries
    currentY = (pdf as any).lastAutoTable.finalY + 12;

    pdf.setFontSize(12);
    pdf.text("Monthly income and expenditure", 14, currentY);

    autoTable(pdf, {
      startY: currentY + 4,
      head: [["Month", "Income", "Expenditure", "Net balance"]],
      body: monthlyData.map((month) => [
        month.month,
        money(month.income),
        money(month.expenditure),
        money(month.income - month.expenditure),
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [50, 83, 68] },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    // Detailed transaction records
    currentY = (pdf as any).lastAutoTable.finalY + 12;

    pdf.setFontSize(12);
    pdf.text("Detailed transaction records", 14, currentY);

    autoTable(pdf, {
      startY: currentY + 4,
      head: [
        ["Date", "Type", "Category", "Description", "Reference", "Amount"],
      ],
      body: transactions.map((transaction) => [
        formatDate(transaction.transaction_date),
        transaction.type,
        transaction.category,
        transaction.description || "—",
        transaction.reference || "—",
        money(Number(transaction.amount)),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [50, 83, 68] },
      columnStyles: {
        2: { cellWidth: 25 },
        3: { cellWidth: 42 },
        4: { cellWidth: 25 },
        5: { halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    pdf.save("baby-bank-finance-report-v2.pdf");
  }

  return (
    <button
      type="button"
      onClick={exportReport}
      className="rounded-lg border-2 bg-forest px-4 py-3 text-sm font-bold text-white"
    >
      Export PDF
    </button>
  );
}
