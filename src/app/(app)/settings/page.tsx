
import {
  Building2,
  ShieldCheck,
  Users,
  ClipboardList,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const settingsSections = [
  {
    title: "Charity information",
    description:
      "Organisation details and financial record-keeping preferences.",
    icon: Building2,
    status: "Configuration not yet available",
  },
  {
    title: "User access",
    description:
      "Approved users, staff roles and access permissions.",
    icon: Users,
    status: "User management to be connected",
  },
  {
    title: "Security",
    description:
      "Account access and security-related settings.",
    icon: ShieldCheck,
    status: "Security settings to be connected",
  },
  {
    title: "Audit history",
    description:
      "Review a traceable history of changes to financial records.",
    icon: ClipboardList,
    status: "Audit log to be connected",
  },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your charity's finance workspace and access configuration."
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
        <Info
          size={21}
          className="mt-0.5 shrink-0 text-forest"
          aria-hidden="true"
        />
        <p className="text-sm text-ink">
          These settings are currently a preview. Changes to users,
          permissions and organisation details are not available here yet.
        </p>
      </div>

      <section
        aria-label="Settings sections"
        className="grid gap-4 md:grid-cols-2"
      >
        {settingsSections.map(
          ({ title, description, icon: Icon, status }) => (
            <Card key={title}>
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-sage-soft p-3 text-forest">
                  <Icon size={24} aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="mt-2 text-muted">{description}</p>
                  <p className="mt-4 text-sm font-medium text-muted">
                    {status}
                  </p>
                </div>
              </div>
            </Card>
          )
        )}
      </section>
    </div>
  );
}
