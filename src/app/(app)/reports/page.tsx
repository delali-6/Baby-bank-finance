
import MonthlyChart, { type MonthlyData } from "./monthly-chart";
import { ChartNoAxesCombined, TrendingDown, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import ExportPDF, { type ReportTransaction } from "./export-pdf";
import { getFinancialWeek } from "@/lib/financial-week";

type SearchParams = Promise<{
  from?: string;
  to?: string;
}>;

type WeeklyTotals = {
  startDate: string;
  endDate: string;
  label: string;
  income: number;
  expenditure: number;
};

function isValidDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === value;
}

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const from = isValidDate(params.from) ? params.from! : "";
  const to = isValidDate(params.to) ? params.to! : "";
  const invalidRange = !!from && !!to && from > to;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // Load the charity's financial week settings.
  const { data: settings } = await supabase
    .from("organisation_settings")
    .select("week_start_day, timezone, charity_name")
    .eq("id", 1)
    .maybeSingle();

  const weekStartDay = settings?.week_start_day ?? 1;
  const timezone = settings?.timezone ?? "Europe/London";

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

  // Avoid showing totals for a reversed date range.
  const transactions = invalidRange ? [] : (data ?? []);

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenditure = transactions
    .filter((item) => item.type === "expenditure")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expenditure;

  // Prepare transactions for PDF export.
  const pdfTransactions: ReportTransaction[] = transactions.map((transaction) => ({
    transaction_date: transaction.transaction_date,
    type: transaction.type,
    description: transaction.description,
    reference: transaction.reference,
    amount: transaction.amount,
    currency: transaction.currency,
    category:
      transaction.category &&
      typeof transaction.category === "object" &&
      "name" in transaction.category
        ? String(transaction.category.name)
        : "Uncategorised",
  }));

  // Prepare monthly totals.
  const monthlyTotals = new Map<string, MonthlyData>();

  for (const transaction of transactions) {
    const monthKey = transaction.transaction_date.slice(0, 7);
    const monthLabel = new Date(`${monthKey}-01T12:00:00Z`)
      .toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
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

  const monthlyData = [...monthlyTotals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, totals]) => ({
      ...totals,
      income: roundMoney(totals.income),
      expenditure: roundMoney(totals.expenditure),
    }));

  // Group transactions by the charity's configured financial week.
  // Transactions remain restricted to the selected date range.
  const weeklyTotals = new Map<string, WeeklyTotals>();

  for (const transaction of transactions) {
    const week = getFinancialWeek(
      new Date(`${transaction.transaction_date}T12:00:00Z`),
      weekStartDay,
      timezone,
    );

    const existing = weeklyTotals.get(week.startDate) ?? {
      startDate: week.startDate,
      endDate: week.endDate,
      label: week.label,
      income: 0,
      expenditure: 0,
    };

    if (transaction.type === "income") {
      existing.income += Number(transaction.amount);
    } else if (transaction.type === "expenditure") {
      existing.expenditure += Number(transaction.amount);
    }

    weeklyTotals.set(week.startDate, existing);
  }

  const weeklyData = [...weeklyTotals.values()]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((week) => ({
      ...week,
      income: roundMoney(week.income),
      expenditure: roundMoney(week.expenditure),
      balance: roundMoney(week.income - week.expenditure),
    }));

  return (
    <div>
      <PageHeader
        title="Financial reports"
        description="Understand your charity's income and expenditure over time."
      />

      <div className="mt-4 flex justify-end">
        <ExportPDF
          transactions={pdfTransactions}
          weeklyData={weeklyData}
          monthlyData={monthlyData}
          from={from}
          to={to}
          income={income}
          expenditure={expenditure}
          balance={balance}
          charityName={settings?.charity_name ?? undefined}
        />
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold">Report date range</h2>

        <form
          action="/reports"
          method="get"
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="from" className="mb-2 block text-sm font-medium">
              From
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={from}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="to" className="mb-2 block text-sm font-medium">
              To
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={to}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
            />
          </div>

          <button
            type="submit"
            className="min-h-12 rounded-lg bg-forest px-5 font-semibold text-white"
          >
            Apply dates
          </button>

          <a href="/reports" className="py-3 text-sm underline">
            Clear
          </a>
        </form>

        {invalidRange && (
          <p className="mt-3 text-sm text-danger">
            The start date must be on or before the end date.
          </p>
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
              <p className="mt-5 text-3xl font-bold text-forest">
                {formatGBP(income)}
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <TrendingDown size={23} className="text-danger" aria-hidden="true" />
                <h2 className="font-semibold">Total expenditure</h2>
              </div>
              <p className="mt-5 text-3xl font-bold">
                {formatGBP(expenditure)}
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <ChartNoAxesCombined
                  size={23}
                  className="text-forest"
                  aria-hidden="true"
                />
                <h2 className="font-semibold">Net balance</h2>
              </div>
              <p className="mt-5 text-3xl font-bold">{formatGBP(balance)}</p>
            </Card>
          </section>

          <Card className="mt-6">
            <h2 className="text-lg font-bold">Weekly financial summaries</h2>
            <p className="mt-2 text-sm text-muted">
              Weekly income, expenditure and net balance using your charity&apos;s
              configured week start. Totals include only transactions within the
              selected date range.
            </p>

            {weeklyData.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No transactions were found for this date range.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th scope="col" className="px-3 py-3 font-medium">
                        Financial week
                      </th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">
                        Income
                      </th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">
                        Expenditure
                      </th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">
                        Net balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyData.map((week) => (
                      <tr key={week.startDate} className="border-b border-border last:border-0">
                        <td className="px-3 py-3">
                          <span className="font-medium">{week.label}</span>
                          <span className="mt-1 block text-xs text-muted">
                            {formatDate(week.startDate)} – {formatDate(week.endDate)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-forest">
                          {formatGBP(week.income)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {formatGBP(week.expenditure)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold">
                          {formatGBP(week.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

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
