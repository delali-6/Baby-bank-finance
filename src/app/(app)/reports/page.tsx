
import MonthlyChart, { type MonthlyData } from "./monthly-chart";
import { ChartNoAxesCombined, TrendingDown, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import ExportPDF, { type ReportTransaction } from "./export-pdf";

type SearchParams = Promise<{
  from?: string;
  to?: string;
}>;

function isValidDate(value?: string) {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const from = isValidDate(params.from) ? params.from! : "";
  const to = isValidDate(params.to) ? params.to! : "";

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  let query = supabase
    .from("transactions")
    .select(`
      type,
      amount,
      transaction_date,
      description,
      reference,
      currency,
      category:categories(name)
    `)
    .is("deleted_at", null);

  if (from) query = query.gte("transaction_date", from);
  if (to) query = query.lte("transaction_date", to);

  const { data, error } = await query;

  const transactions = data ?? [];
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expenditure = transactions
    .filter((item) => item.type === "expenditure")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = income - expenditure;

  
const monthlyTotals = new Map<string, MonthlyData>();

for (const transaction of transactions) {
  const monthKey = transaction.transaction_date.slice(0, 7);
  const monthLabel = new Date(
    `${monthKey}-01T12:00:00`
  ).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  const existing = monthlyTotals.get(monthKey) ?? {
    month: monthLabel,
    income: 0,
    expenditure: 0,
  };

  if (transaction.type === "income") {
    existing.income += Number(transaction.amount);
  } else if (transaction.type === "expenditure") {
    existing.expenditure += Number(transaction.amount);
  }

  monthlyTotals.set(monthKey, existing);
}
// sort and map monthly data
const monthlyData = [...monthlyTotals.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, totals]) => ({
    ...totals,
    income: Math.round(totals.income * 100) / 100,
    expenditure: Math.round(totals.expenditure * 100) / 100,
  }));


  return (
    <div>
      <PageHeader
        title="Financial reports"
        description="Understand your charity's income and expenditure over time."
      />

      <Card className="mb-6">
        <h2 className="font-semibold">Report date range</h2>
        <form action="/reports" method="get" className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="from" className="mb-2 block text-sm font-medium">From</label>
            <input id="from" name="from" type="date" defaultValue={from}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3" />
          </div>
          <div className="flex-1">
            <label htmlFor="to" className="mb-2 block text-sm font-medium">To</label>
            <input id="to" name="to" type="date" defaultValue={to}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3" />
          </div>
          <button type="submit" className="min-h-12 rounded-lg bg-forest px-5 font-semibold text-white">
            Apply dates
          </button>
          <a href="/reports" className="py-3 text-sm underline">Clear</a>
        </form>
        {from && to && from > to && (
          <p className="mt-3 text-sm text-danger">The start date must be on or before the end date.</p>
        )}
      </Card>

      {error ? (
        <p role="alert" className="mb-6 rounded-lg bg-warning-soft p-4 text-sm">
          We couldn&apos;t load the financial records. Please try again.
        </p>
      ) : (
        <>
          <section aria-label="Report summaries" className="grid gap-4 md:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3">
                <TrendingUp size={23} className="text-forest" aria-hidden="true" />
                <h2 className="font-semibold">Total income</h2>
              </div>
              <p className="mt-5 text-3xl font-bold text-forest">{formatGBP(income)}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <TrendingDown size={23} className="text-danger" aria-hidden="true" />
                <h2 className="font-semibold">Total expenditure</h2>
              </div>
              <p className="mt-5 text-3xl font-bold">{formatGBP(expenditure)}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <ChartNoAxesCombined size={23} className="text-forest" aria-hidden="true" />
                <h2 className="font-semibold">Net balance</h2>
              </div>
              <p className="mt-5 text-3xl font-bold">{formatGBP(balance)}</p>
            </Card>
          </section>

          
        <Card className="mt-6">
          <h2 className="text-lg font-bold">Income and expenditure trends</h2>
          <p className="mt-2 text-sm text-muted">
            Monthly totals based on non-voided transactions in the selected date range.
          </p>
          <MonthlyChart data={monthlyData} />
        </Card>

        </>
      )}
    </div>
  );
}
