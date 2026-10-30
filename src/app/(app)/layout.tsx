
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
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
    .select("is_active, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    redirect("/pending-approval");
  }

  const { data: settings } = await supabase
    .from("organisation_settings")
    .select("charity_name")
    .eq("id", 1)
    .maybeSingle();

  return (
    <AppShell
      isAdmin={profile.role === "admin"}
      charityName={settings?.charity_name ?? undefined}
    >
      {children}
    </AppShell>
  );
}
