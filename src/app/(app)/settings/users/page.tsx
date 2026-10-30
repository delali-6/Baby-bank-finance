
import { redirect } from "next/navigation";
import { Users, ShieldCheck, Clock3, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { updateUserAccess } from "./actions";

type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "staff";
  is_active: boolean;
  created_at: string;
};

export default async function UserManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: currentProfile, error: currentProfileError } =
    await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

  if (
    currentProfileError ||
    !currentProfile ||
    !currentProfile.is_active
  ) {
    redirect("/pending-approval");
  }

  if (currentProfile.role !== "admin") {
    redirect("/dashboard");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active, created_at")
    .order("created_at", { ascending: false });

  const profiles = (data ?? []) as Profile[];

  const pendingCount = profiles.filter(
    (profile) => !profile.is_active
  ).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="User management"
        description="Review staff accounts and manage access to charity financial records."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sage-soft p-3 text-forest">
              <Users size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted">Total profiles</p>
              <p className="text-2xl font-bold text-forest">
                {profiles.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning-soft p-3 text-warning">
              <Clock3 size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted">Awaiting approval</p>
              <p className="text-2xl font-bold text-forest">
                {pendingCount}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sage-soft p-3 text-forest">
              <UserCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted">Active profiles</p>
              <p className="text-2xl font-bold text-forest">
                {profiles.filter((profile) => profile.is_active).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="text-forest" size={22} aria-hidden="true" />
          <h2 className="text-xl font-bold">Registered users</h2>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg bg-danger-soft p-4 text-danger">
            We couldn&apos;t load user profiles. Please try again.
          </p>
        ) : profiles.length === 0 ? (
          <p className="text-muted">No user profiles found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-3 py-3 font-semibold">Name</th>
                  <th className="px-3 py-3 font-semibold">Role</th>
                  <th className="px-3 py-3 font-semibold">Access</th>
                  <th className="px-3 py-3 font-semibold">Joined</th>
                  <th className="px-3 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-4 font-medium">
                      {profile.full_name || "Name not provided"}
                      {profile.id === user.id ? (
                        <span className="ml-2 text-xs text-muted">(You)</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-4 capitalize">{profile.role}</td>
                    <td className="px-3 py-4">
                      <span
                        className={
                          profile.is_active
                            ? "rounded-full bg-sage-soft px-3 py-1 font-medium text-forest"
                            : "rounded-full bg-warning-soft px-3 py-1 font-medium text-warning"
                        }
                      >
                        {profile.is_active ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-muted">
                      {new Date(profile.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3 py-4">
                      {profile.id === user.id ? (
                        <span className="text-sm text-gray-500">
                          Your account
                        </span>
                      ) : profile.role === "admin" ? (
                        <span className="text-sm text-gray-500">
                          Administrator account
                        </span>
                      ) : (
                        <form action={updateUserAccess}>
                          <input
                            type="hidden"
                            name="profileId"
                            value={profile.id}
                          />
                          <input
                            type="hidden"
                            name="active"
                            value={profile.is_active ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                          >
                            {profile.is_active ? "Deactivate" : "Approve"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
