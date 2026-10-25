
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Baby,
  LayoutDashboard,
  ReceiptText,
  History,
  ChartNoAxesCombined,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Transactions",
    href: "/record",
    icon: ReceiptText,
  },
  {
    label: "History",
    href: "/history",
    icon: History,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "User Management",
    href: "/settings/users",
    icon: Users,
  },

];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-border bg-card p-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:p-5">
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-3 rounded-lg p-2"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-forest">
          <Baby size={25} aria-hidden="true" />
        </div>

        <div>
          <p className="font-bold text-forest">
            Baby Bank Finance
          </p>
          <p className="text-xs text-muted">
            Charity finance workspace
          </p>
        </div>
      </Link>

      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
        Workspace
      </p>

      <nav aria-label="Main navigation" className="flex gap-2 overflow-x-auto lg:flex-col">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sage-soft text-forest"
                  : "text-muted hover:bg-surface hover:text-ink"
              )}
            >
              <Icon size={19} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-lg bg-surface p-4 lg:mt-auto">
        <p className="text-sm font-semibold text-forest">
          Financial records
        </p>
        <p className="mt-1 text-sm text-muted">
          Keep records accurate, traceable and up to date.
        </p>
      </div>
    </aside>
  );
}
