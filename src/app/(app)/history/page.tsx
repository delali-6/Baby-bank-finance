
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileClock, PlusCircle, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

type SearchParams = Promise<{
  q?: string;
}>;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  let transactionsQuery = supabase
    .from("transactions")
    .select(
      "id, type, amount, currency, transaction_date, description, reference, category:categories(name)"
    )
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (query) {
    const safeQuery = query.replace(/[,%()]/g, " ").trim();
    if (safeQuery) {
      transactionsQuery = transactionsQuery.ilike(
        "description",
        `%${safeQuery}%`
      );
    }
  }

  const { data: transactions, error } = await transactionsQuery;

  if (error) {
    console.error("Transaction history query failed:", error);
  }

  const records = transactions ?? [];

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">All transactions</h2>
            <p className="mt-1 text-sm text-muted">
              {records.length} transaction{records.length === 1 ? "" : "s"} found
            </p>
          </div>

          <form action="/history" method="get" className="flex gap-2">
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
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Description</th>
                  <th className="px-3 py-3 font-medium">Reference</th>
                  <th className="px-3 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const category = Array.isArray(record.category)
                    ? record.category[0]
                    : record.category;

                  return (
                    <tr key={record.id} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap px-3 py-4">
                        {record.transaction_date}
                      </td>
                      <td className="px-3 py-4 capitalize">{record.type}</td>
                      <td className="px-3 py-4">{category?.name ?? "—"}</td>
                      <td className="px-3 py-4">{record.description}</td>
                      <td className="px-3 py-4">{record.reference ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-right font-medium">
                        {new Intl.NumberFormat("en-GB", {
                          style: "currency",
                          currency: record.currency || "GBP",
                        }).format(Number(record.amount))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
