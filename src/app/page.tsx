
import Link from "next/link";
import { ArrowRight, Baby, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-sage-soft text-forest">
            <Baby size={32} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Baby Bank Finance</h1>
            <p className="text-sm text-muted">Charity financial management</p>
          </div>
        </div>

        <Card className="p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-sage-dark">
            Welcome
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Clearer finances. Better support for families.
          </h2>

          <p className="mt-4 text-lg text-muted">
            A dedicated workspace to help your baby bank charity organise
            financial records, review transactions and understand income
            and expenditure.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto">
                Open dashboard
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-lg bg-sage-soft p-4">
            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0 text-forest"
              aria-hidden="true"
            />
            <p className="text-sm text-forest">
              Access to financial records must be restricted to authorised
              users. Security and approval checks still need to be completed
              before this application is ready for real financial data.
            </p>
          </div>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          Built to support responsible charity finance management.
        </p>
      </div>
    </main>
  );
}
