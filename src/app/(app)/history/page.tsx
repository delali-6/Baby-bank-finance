
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileClock, PlusCircle, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFinancialWeek } from "@/lib/financial-week";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionActions } from "./transaction-actions";

type SearchParams = Promise<{
  q?: string;
  view?: string;
}>;

type TransactionRecord = {
  id: string;
  type: string;
  amount: number | string;
  currency: string | null;
  transaction_date: string;
  description: string | null;
  reference: string | null;
  category:
    | { name: string }
    | { name: string }[]
    | null;
  deleted_at: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
};

function formatMoney(amount: number, currency: string | null) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
    }).format(amount);
  } catch {
    return formatGBP(amount);
  }
}

function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCategoryName(
  category: TransactionRecord["category"]
): string {
  const value = Array.isArray(category) ? category[0] : category;
  return value?.name ?? "—";
}

function TransactionTable({
  records,
  isAdmin,
}: {
  records: TransactionRecord[];
  isAdmin: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto text-left text-sm">
        <caption className="sr-only">
          Transaction history, including dates, categories, descriptions, status and amounts.
        </caption>
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="px-3 py-3 font-medium">Date</th>
            <th className="px-3 py-3 font-medium">Type</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Description</th>
            <th className="px-3 py-3 font-medium">Reference</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 text-right font-medium">Amount</th>
            {isAdmin && (
              <th className="px-3 py-3 text-right font-medium">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-b border-border last:border-0"
            >
              <td className="whitespace-nowrap px-3 py-4">
                {formatDate(record.transaction_date)}
              </td>
              <td className="px-3 py-4 capitalize">{record.type}</td>
              <td className="px-3 py-4">
                {getCategoryName(record.category)}
              </td>
              <td className="max-w-xs break-words px-3 py-4">
                {record.description || "—"}
              </td>
              <td className="max-w-40 break-words px-3 py-4">
                {record.reference ?? "—"}
              </td>
              <td className="w-px min-w-28 max-w-56 px-3 py-4">
                {record.deleted_at ? (
                  <div className="space-y-2">
                    <span className="inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
                      Voided
                    </span>

                    {isAdmin && (
                      <div className="space-y-1 text-xs text-muted">
                        <p>
                          <span className="font-semibold">Voided on:</span>{" "}
                          {new Date(record.deleted_at).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Europe/London",
                          })}
                        </p>

                        <p className="whitespace-normal">
                          <span className="font-semibold">Reason:</span>{" "}
                          {record.deletion_reason || "No reason recorded"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex rounded-full bg-sage-soft px-2.5 py-1 text-xs font-semibold text-forest">
                    Active
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-right font-medium">
                {formatMoney(Number(record.amount), record.currency)}
              </td>
              {isAdmin && (
                <td className="px-3 py-4 text-right">
                  <TransactionActions
                    transactionId={record.id}
                    isVoided={!!record.deleted_at}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", view = "all" } = await searchParams;
  const query = q.trim();
  const groupedByWeek = view === "week";

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
  .from("profiles")
  .select("role, is_active")
  .eq("id", user.id)
  .maybeSingle();

  const isAdmin =
  profile?.role === "admin" && profile?.is_active === true;

  const { data: settings } = await supabase
    .from("organisation_settings")
    .select("week_start_day, timezone")
    .eq("id", 1)
    .maybeSingle();

  const weekStartDay = Number(settings?.week_start_day ?? 1);
  const timezone = settings?.timezone ?? "Europe/London";

  let transactionsQuery = supabase
  .from("transactions")
  .select(
    "id, type, amount, currency, transaction_date, description, reference, deleted_at, deleted_by, deletion_reason, category:categories(name)"
  )
  .order("transaction_date", { ascending: false })
  .order("created_at", { ascending: false });

  if (!isAdmin) {
    transactionsQuery = transactionsQuery.is("deleted_at", null);
  }

  if (query) {
    transactionsQuery = transactionsQuery.ilike(
      "description",
      `%${query}%`
    );
  }

  const { data: transactions, error } = await transactionsQuery;

  if (error) {
    console.error("Transaction history query failed:", error);
  }

  const records = (transactions ?? []) as TransactionRecord[];

  const weekGroups = new Map<
    string,
    {
      startDate: string;
      endDate: string;
      label: string;
      records: TransactionRecord[];
      income: number;
      expenditure: number;
    }
  >();

  if (groupedByWeek) {
    for (const record of records) {
      const week = getFinancialWeek(
        new Date(`${record.transaction_date}T12:00:00Z`),
        weekStartDay,
        timezone
      );

      let group = weekGroups.get(week.startDate);

      if (!group) {
        group = {
          startDate: week.startDate,
          endDate: week.endDate,
          label: week.label,
          records: [],
          income: 0,
          expenditure: 0,
        };
        weekGroups.set(week.startDate, group);
      }

      group.records.push(record);

      if (!record.deleted_at) {
        if (record.type === "income") {
          group.income += Number(record.amount);
        } else if (record.type === "expenditure") {
          group.expenditure += Number(record.amount);
        }
      }
    }
  }

  const groups = [...weekGroups.values()].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  const allHref = query
    ? `/history?q=${encodeURIComponent(query)}`
    : "/history";

  const weeklyHref = query
    ? `/history?q=${encodeURIComponent(query)}&view=week`
    : "/history?view=week";

  return (
    <div>
      <PageHeader
        title="Transaction history"
        description="Review and search your charity's recorded income and expenditure."
        action={
          <Link href="/record">
            <Button>
              <PlusCircle size={18} aria-hidden="true" />
              Record transaction
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {groupedByWeek ? "Transactions by week" : "All transactions"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {error
                  ? "Transaction count unavailable"
                  : `${records.length} transaction${records.length === 1 ? "" : "s"} found`}
              </p>
            </div>

            <form action="/history" method="get" className="flex gap-2">
              <input
                type="hidden"
                name="view"
                value={groupedByWeek ? "week" : "all"}
              />
              <label htmlFor="history-search" className="sr-only">
                Search descriptions
              </label>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3">
                <Search size={18} aria-hidden="true" />
                <input
                  id="history-search"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Search descriptions"
                  className="min-h-10 min-w-0 flex-1 bg-transparent outline-none"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Transaction display mode">
            <Link
              href={allHref}
              aria-current={!groupedByWeek ? "page" : undefined}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                !groupedByWeek
                  ? "border-forest bg-sage-soft text-forest"
                  : "border-border hover:bg-sage-soft"
              }`}
            >
              All transactions
            </Link>
            <Link
              href={weeklyHref}
              aria-current={groupedByWeek ? "page" : undefined}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                groupedByWeek
                  ? "border-forest bg-sage-soft text-forest"
                  : "border-border hover:bg-sage-soft"
              }`}
            >
              Group by week
            </Link>
          </div>
        </div>

        {error ? (
          <div role="alert" className="mt-6 rounded-lg bg-warning-soft p-4 text-sm">
            We couldn&apos;t load transaction history. Please try again.
          </div>
        ) : records.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-12 text-center">
            <div className="rounded-full bg-sage-soft p-4 text-forest">
              <FileClock size={28} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              {query ? "No matching transactions" : "No transactions to display"}
            </h3>
            <p className="mt-2 max-w-md text-muted">
              {query
                ? "Try a different search term."
                : "Saved financial records will appear here."}
            </p>
            {!query && (
              <Link href="/record" className="mt-5">
                <Button>
                  <PlusCircle size={18} aria-hidden="true" />
                  Add a transaction
                </Button>
              </Link>
            )}
          </div>
        ) : groupedByWeek ? (
          <div className="mt-6 space-y-6">
            {groups.map((group) => {
              const netBalance = group.income - group.expenditure;

              return (
                <section
                  key={group.startDate}
                  className="overflow-hidden rounded-xl border border-border"
                  aria-label={`Transactions for ${group.label}`}
                >
                  <div className="border-b border-border bg-sage-soft p-4">
                    <h3 className="font-bold">
                      {group.label}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {group.records.length} transaction
                      {group.records.length === 1 ? "" : "s"}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-background p-3">
                        <p className="text-sm text-muted">Income</p>
                        <p className="mt-1 break-words font-bold text-forest">
                          {formatGBP(group.income)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-background p-3">
                        <p className="text-sm text-muted">Expenditure</p>
                        <p className="mt-1 break-words font-bold text-danger">
                          {formatGBP(group.expenditure)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-background p-3">
                        <p className="text-sm text-muted">Net balance</p>
                        <p className={`mt-1 break-words font-bold ${
                          netBalance < 0 ? "text-danger" : "text-forest"
                        }`}>
                          {formatGBP(netBalance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <TransactionTable
                    records={group.records}
                    isAdmin={isAdmin}
                  />
                </section>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <TransactionTable
              records={records}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
