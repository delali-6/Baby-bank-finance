
import Link from "next/link";
import { FileClock, PlusCircle, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function HistoryPage() {
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
              Recorded financial activity will appear here.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-muted">
            <Search size={18} aria-hidden="true" />
            <span className="text-sm">Search will be available soon</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-12 text-center">
          <div className="rounded-full bg-sage-soft p-4 text-forest">
            <FileClock size={28} aria-hidden="true" />
          </div>

          <h3 className="mt-4 text-lg font-semibold">
            No transactions to display
          </h3>

          <p className="mt-2 max-w-md text-muted">
            Once financial records are connected, you will be able to review
            transaction dates, categories, amounts and descriptions here.
          </p>

          <Link href="/record" className="mt-5">
            <Button>
              <PlusCircle size={18} aria-hidden="true" />
              Add a transaction
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
