
import { redirect } from "next/navigation";
import { UserRound, ShieldCheck, BadgeCheck, Mail, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !profile.is_active) {
    redirect("/pending-approval");
  }

  const roleLabel =
    profile.role === "admin"
      ? "Administrator"
      : profile.role === "staff"
        ? "Staff member"
        : String(profile.role ?? "User");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="My profile"
        description="View your account details and access level."
      />

      <Card className="mt-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sage-soft text-forest">
            <UserRound size={28} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-lg font-bold text-ink">
              {user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "Baby Bank Finance user"}
            </h2>
            <p className="mt-1 break-all text-sm text-muted">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t border-border pt-5">
          <div className="flex items-start gap-3">
            <Mail
              size={20}
              className="mt-0.5 shrink-0 text-muted"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm text-muted">Email address</p>
              <p className="break-all font-medium text-ink">
                {user.email || "Not available"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-muted"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm text-muted">Account role</p>
              <p className="font-medium text-ink">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BadgeCheck
              size={20}
              className="mt-0.5 shrink-0 text-muted"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm text-muted">Access status</p>
              <p className="font-medium text-ink">Approved and active</p>
            </div>
          </div>
        </div>
      </Card>

      <form action={signOut} className="mt-6">
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          <LogOut size={18} aria-hidden="true" />
          Log out
        </Button>
      </form>
    </div>
  );
}
