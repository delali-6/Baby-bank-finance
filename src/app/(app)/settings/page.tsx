import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, UserRound, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { OrganisationSettingsForm } from "./organisation-settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    redirect("/pending-approval");
  }

  const isAdmin = profile.role === "admin";

  const { data: settings, error: settingsError } = await supabase
    .from("organisation_settings")
    .select("charity_name, currency, timezone, week_start_day")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="View your charity's information and manage workspace preferences."
      />

      <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
        <Info
          size={21}
          className="mt-0.5 shrink-0 text-forest"
          aria-hidden="true"
        />
        <p className="text-sm text-ink">
          {isAdmin
            ? "You can update the charity information below. Changes are recorded by the database audit trigger."
            : "You can view your charity's current information. Only an active administrator can change these settings."}
        </p>
      </div>

      {settingsError || !settings ? (
        <Card>
          <h2 className="font-bold">Charity settings unavailable</h2>
          <p className="mt-2 text-sm text-muted">
            We couldn&apos;t load the organisation settings. Please refresh the
            page or contact an administrator.
          </p>
        </Card>
      ) : (
        <OrganisationSettingsForm
          settings={{
            charity_name: settings.charity_name ?? "",
            currency: settings.currency.trim(),
            timezone: settings.timezone,
            week_start_day: settings.week_start_day,
          }}
          canEdit={isAdmin}
        />
      )}

      <section aria-label="Account and access" className="grid gap-4 md:grid-cols-2">
        {isAdmin && (
          <Card>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-sage-soft p-3 text-forest">
                <Users size={24} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold">User management</h2>
                <p className="mt-2 text-sm text-muted">
                  Approve users and manage staff access.
                </p>
                <Link
                  href="/settings/users"
                  className="mt-4 inline-block font-semibold text-forest underline underline-offset-4"
                >
                  Manage users
                </Link>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-sage-soft p-3 text-forest">
              <UserRound size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Your profile</h2>
              <p className="mt-2 text-sm text-muted">
                View your account information and access status.
              </p>
              <Link
                href="/profile"
                className="mt-4 inline-block font-semibold text-forest underline underline-offset-4"
              >
                View profile
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}