
import {
  ChartNoAxesCombined,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Financial reports"
        description="Understand your charity&apos;s income and expenditure over time."
        action={
          <Button variant="outline" disabled>
            <Download size={18} aria-hidden="true" />
            Export report
          </Button>
        }
      />

      <section
        aria-label="Report summaries"
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sage-soft p-3 text-forest">
              <TrendingUp size={23} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold">Income overview</h2>
              <p className="text-sm text-muted">
                Total money received
              </p>
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-forest">£0.00</p>
          <p className="mt-2 text-sm text-muted">
            Figures will appear when financial records are connected.
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-danger-soft p-3 text-danger">
              <TrendingDown size={23} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold">Expenditure overview</h2>
              <p className="text-sm text-muted">
                Total money spent
              </p>
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-forest">£0.00</p>
          <p className="mt-2 text-sm text-muted">
            Figures will appear when financial records are connected.
          </p>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-sage-soft p-3 text-forest">
            <ChartNoAxesCombined size={23} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Income and expenditure trends</h2>
            <p className="text-sm text-muted">
              A visual comparison of your charity&apos;s finances.
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <ChartNoAxesCombined
            size={38}
            className="text-muted"
            aria-hidden="true"
          />
          <p className="mt-4 font-semibold">Your report chart will appear here</p>
          <p className="mt-2 max-w-md text-sm text-muted">
            Once transaction data is available, this area can display monthly
            income, expenditure and balance trends.
          </p>
        </div>
      </Card>
    </div>
  );
}
