import { redirect } from "next/navigation";
import { FileClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type AuditRecord = {
  id: number;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
};

type AuditProfile = {
  id: string;
  full_name: string | null;
  role: "admin" | "staff";
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  });
}

function formatAction(action: string) {
  switch (action) {
    case "INSERT":
      return "Created";
    case "UPDATE":
      return "Updated";
    case "DELETE":
      return "Deleted";
    case "VOID":
      return "Voided";
    case "RESTORE":
      return "Restored";
    default:
      return action;
  }
}

function JsonDetails({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown> | null;
}) {
  if (!data) return null;

  return (
    <details className="rounded-lg border border-border">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium hover:bg-sage-soft">
        {title}
      </summary>

      <pre className="overflow-x-auto whitespace-pre-wrap break-words border-t border-border bg-background p-3 text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

export default async function AuditLogPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin =
    profile?.role === "admin" &&
    profile?.is_active === true;

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const { data: auditRecords, error } = await supabase
    .from("audit_logs")
    .select(
      "id, user_id, action, table_name, record_id, old_data, new_data, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Audit log query failed:", error);
  }

  const records = (auditRecords ?? []) as AuditRecord[];
  const userIds = [
    ...new Set(
      records
        .map((record) => record.user_id)
        .filter((id): id is string => id !== null)
    ),
  ];

  let profilesById = new Map<string, AuditProfile>();

  if (userIds.length > 0) {
    const { data: auditProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", userIds);

    if (profilesError) {
      console.error("Audit profile lookup failed:", profilesError);
    } else {
      profilesById = new Map(
        ((auditProfiles ?? []) as AuditProfile[]).map((profile) => [
          profile.id,
          profile,
        ])
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Review recorded activity and changes made within your charity's finance system."
      />

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-bold">
            Activity history
          </h2>

          <p className="mt-1 text-sm text-muted">
            Showing the latest {records.length} audit entr
            {records.length === 1 ? "y" : "ies"}.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-lg bg-warning-soft p-4 text-sm"
          >
            We couldn&apos;t load the audit log. Please try again.
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-12 text-center">
            <div className="rounded-full bg-sage-soft p-4 text-forest">
              <FileClock size={28} aria-hidden="true" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              No audit activity yet
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted">
              Recorded activity will appear here when users create,
              update, void or restore records.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <article
                key={record.id}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-sage-soft px-2.5 py-1 text-xs font-semibold text-forest">
                      {formatAction(record.action)}
                    </span>

                    <h3 className="mt-2 font-semibold">
                      {record.table_name}
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      Record ID: {record.record_id}
                    </p>
                  </div>

                  <time
                    dateTime={record.created_at}
                    className="text-sm text-muted"
                  >
                    {formatDate(record.created_at)}
                  </time>
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">
                      Performed by:
                    </span>{" "}
                    {record.user_id
                      ? profilesById.get(record.user_id)?.full_name ||
                        "Name unavailable"
                      : "System / unknown"}
                  </p>

                  {record.user_id && profilesById.has(record.user_id) && (
                    <p className="text-muted">
                      {profilesById.get(record.user_id)?.role === "admin"
                        ? "Administrator"
                        : "Staff member"}
                    </p>
                  )}

                  <p>
                    <span className="font-semibold">
                      Audit entry:
                    </span>{" "}
                    #{record.id}
                  </p>
                </div>

                {(record.old_data || record.new_data) && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <JsonDetails
                      title="Previous data"
                      data={record.old_data}
                    />

                    <JsonDetails
                      title="New data"
                      data={record.new_data}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}