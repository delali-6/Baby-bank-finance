
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  PlusCircle,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getFinancialWeek } from "@/lib/financial-week";

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DashboardPageProps = {
  searchParams: Promise<{ weekOffset?: string }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const parsedOffset = Number(params.weekOffset ?? "0");
  const weekOffset =
    Number.isInteger(parsedOffset) && parsedOffset >= -1040 && parsedOffset <= 1040
      ? parsedOffset
      : 0;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: settings } = await supabase
    .from("organisation_settings")
    .select("week_start_day, timezone")
    .eq("id", 1)
    .maybeSingle();

  const weekStartDay = Number(settings?.week_start_day ?? 1);
  const timezone = settings?.timezone ?? "Europe/London";

  const week = getFinancialWeek(
    new Date(),
    weekStartDay,
    timezone,
    weekOffset
  );

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      type,
      amount,
      transaction_date,
      description,
      reference,
      category:categories(name)
    `)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  const transactions = data ?? [];

  // Keep the existing lifetime financial totals.
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenditure = transactions
    .filter((item) => item.type === "expenditure")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expenditure;

  // Calculate the selected week's totals using transaction dates.
  const weeklyTransactions = transactions.filter(
    (item) =>
      item.transaction_date >= week.startDate &&
      item.transaction_date <= week.endDate
  );

  const weeklyIncome = weeklyTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const weeklyExpenditure = weeklyTransactions
    .filter((item) => item.type === "expenditure")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const weeklyBalance = weeklyIncome - weeklyExpenditure;

  const summaryCards = [
    {
      title: "Total income",
      amount: formatGBP(income),
      note: "From recorded transactions",
      icon: ArrowDownLeft,
    },
    {
      title: "Total expenditure",
      amount: formatGBP(expenditure),
      note: "From recorded transactions",
      icon: ArrowUpRight,
    },
    {
      title: "Current balance",
      amount: formatGBP(balance),
      note: "Income minus expenditure",
      icon: Wallet,
    },
  ];

  const weeklySummaryCards = [
    {
      title: "Weekly income",
      amount: formatGBP(weeklyIncome),
      icon: ArrowDownLeft,
      amountClass: "text-forest",
    },
    {
      title: "Weekly expenditure",
      amount: formatGBP(weeklyExpenditure),
      icon: ArrowUpRight,
      amountClass: "text-danger",
    },
    {
      title: "Weekly net balance",
      amount: formatGBP(weeklyBalance),
      icon: Wallet,
      amountClass: weeklyBalance < 0 ? "text-danger" : "text-forest",
    },
  ];

  const weekHeading =
    weekOffset === 0
      ? "This week"
      : weekOffset === -1
        ? "Previous week"
        : weekOffset === 1
          ? "Next week"
          : weekOffset < 0
            ? `${Math.abs(weekOffset)} weeks ago`
            : `${weekOffset} weeks ahead`;

  const previousWeekHref =
    weekOffset - 1 === 0
      ? "/dashboard"
      : `/dashboard?weekOffset=${weekOffset - 1}`;

  const nextWeekHref =
    weekOffset + 1 === 0
      ? "/dashboard"
      : `/dashboard?weekOffset=${weekOffset + 1}`;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to Baby Bank Finance. Here's an overview of your charity's finances."
        action={
          <Link href="/record">
            <Button>
              <PlusCircle size={18} aria-hidden="true" />
              Record transaction
            </Button>
          </Link>
        }
      />

      <section
        aria-label="Lifetime financial summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {summaryCards.map(({ title, amount, note, icon: Icon }) => (
          <Card key={title}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-muted">{title}</p>
                <p className="mt-3 break-words text-2xl font-bold tracking-tight text-forest sm:text-3xl">
                  {amount}
                </p>
                <p className="mt-2 text-sm text-muted">{note}</p>
              </div>
              <div className="shrink-0 rounded-xl bg-sage-soft p-3 text-forest">
                <Icon size={24} aria-hidden="true" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-8" aria-labelledby="weekly-summary-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="weekly-summary-heading" className="text-xl font-bold">
              Weekly financial summary
            </h2>
            <p className="mt-1 text-sm text-muted">
              {weekHeading} · {week.label}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={previousWeekHref}
              aria-label="View previous week"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-sage-soft"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Previous
            </Link>
            <Link
              href={nextWeekHref}
              aria-label="View next week"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-sage-soft"
            >
              Next
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg bg-warning-soft p-4 text-sm">
            We couldn&apos;t load the weekly summary. Please try again.
          </p>
        ) : (
          <>
            <section
              aria-label="Selected week totals"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {weeklySummaryCards.map(
                ({ title, amount, icon: Icon, amountClass }) => (
                  <Card key={title}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-muted">{title}</p>
                        <p
                          className={`mt-3 break-words text-2xl font-bold tracking-tight sm:text-3xl ${amountClass}`}
                        >
                          {amount}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-xl bg-sage-soft p-3 text-forest">
                        <Icon size={24} aria-hidden="true" />
                      </div>
                    </div>
                  </Card>
                )
              )}
            </section>

            <p className="mt-3 text-sm text-muted">
              {weeklyTransactions.length}{" "}
              {weeklyTransactions.length === 1
                ? "transaction"
                : "transactions"}{" "}
              in this week. The net balance is weekly income minus weekly
              expenditure.
            </p>
          </>
        )}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-lg bg-sage-soft p-3 text-forest">
              <ReceiptText size={23} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Recent transactions</h2>
              <p className="text-sm text-muted">
                Your latest financial activity.
              </p>
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-6 rounded-lg bg-warning-soft p-4 text-sm">
              We couldn&apos;t load transactions. Please try again.
            </p>
          ) : transactions.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <p className="font-semibold text-ink">No transactions yet</p>
              <p className="mt-2 text-sm text-muted">
                Recorded transactions will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-3 sm:hidden">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-medium">
                          {transaction.description || "No description"}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {formatDate(transaction.transaction_date)}
                          {" · "}
                          {transaction.category &&
                          typeof transaction.category === "object" &&
                          "name" in transaction.category
                            ? String(transaction.category.name)
                            : "Uncategorised"}
                        </p>
                      </div>
                      <p
                        className={`shrink-0 text-right font-semibold ${
                          transaction.type === "income"
                            ? "text-forest"
                            : "text-danger"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "−"}
                        {formatGBP(Number(transaction.amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 hidden overflow-x-auto sm:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="px-3 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium">Transaction</th>
                      <th className="px-3 py-3 font-medium">Type</th>
                      <th className="px-3 py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="whitespace-nowrap px-3 py-3">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="px-3 py-3">
                          <p className="break-words font-medium">
                            {transaction.description || "No description"}
                          </p>
                          <p className="text-xs text-muted">
                            {transaction.category &&
                            typeof transaction.category === "object" &&
                            "name" in transaction.category
                              ? String(transaction.category.name)
                              : "Uncategorised"}
                          </p>
                        </td>
                        <td className="px-3 py-3 capitalize">
                          {transaction.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                          {formatGBP(Number(transaction.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="mt-4">
            <Link
              href="/history"
              className="text-sm font-semibold text-forest underline"
            >
              View all transactions
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Quick actions</h2>
          <p className="mt-1 text-sm text-muted">
            Common tasks to help you manage your records.
          </p>

          <div className="mt-5 space-y-3">
            <Link href="/record" className="block">
              <Button className="w-full justify-start">
                <PlusCircle size={19} aria-hidden="true" />
                Record a transaction
              </Button>
            </Link>
            <Link href="/history" className="block">
              <Button variant="outline" className="w-full justify-start">
                <ReceiptText size={19} aria-hidden="true" />
                View transaction history
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
