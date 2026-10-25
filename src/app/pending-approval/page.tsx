
import Link from "next/link";
import { Clock3, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PendingApprovalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg p-6 text-center sm:p-10">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-sage-soft text-forest">
          <Clock3 size={32} aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wider text-sage-dark">
          Account access
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Awaiting approval
        </h1>

        <p className="mt-4 text-muted">
          Your account has been created, but a charity administrator
          must approve your access before you can use Baby Bank Finance.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-lg bg-sage-soft p-4 text-left">
          <ShieldCheck
            size={22}
            className="mt-0.5 shrink-0 text-forest"
            aria-hidden="true"
          />
          <p className="text-sm text-forest">
            Your financial access remains restricted while approval
            is pending. Please contact your charity administrator
            if you believe this is a mistake.
          </p>
        </div>

        <form action={signOut} className="mt-7">
          <Button type="submit" variant="outline" className="w-full">
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted">
          <Link href="/login" className="font-medium text-forest underline">
            Return to sign-in
          </Link>
        </p>
      </Card>
    </main>
  );
}
