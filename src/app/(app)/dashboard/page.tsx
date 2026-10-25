
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const summaryCards = [
  {
    title: "Total income",
    amount: "£0.00",
    note: "No transactions recorded yet",
    icon: ArrowDownLeft,
  },
  {
    title: "Total expenditure",
    amount: "£0.00",
    note: "No transactions recorded yet",
    icon: ArrowUpRight,
  },
  {
    title: "Current balance",
    amount: "£0.00",
    note: "Based on recorded transactions",
    icon: Wallet,
  },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to Baby Bank Finance. Here&apos;s an overview of your charity&apos;s finances."
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
        aria-label="Financial summary"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {summaryCards.map(({ title, amount, note, icon: Icon }) => (
          <Card key={title}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-muted">{title}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-forest">
                  {amount}
                </p>
                <p className="mt-2 text-sm text-muted">{note}</p>
              </div>

              <div className="rounded-xl bg-sage-soft p-3 text-forest">
                <Icon size={24} aria-hidden="true" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sage-soft p-3 text-forest">
              <ReceiptText size={23} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Recent transactions</h2>
              <p className="text-sm text-muted">
                Your latest financial activity will appear here.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-10 text-center">
            <p className="font-semibold text-ink">No transactions yet</p>
            <p className="mt-2 text-sm text-muted">
              Once transactions are recorded, you&apos;ll be able to review them here.
            </p>
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

      <p className="mt-6 text-sm text-muted">
        Figures will update when financial records are connected.
      </p>
    </div>
  );
}
