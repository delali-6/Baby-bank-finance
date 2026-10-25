
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  ChartNoAxesCombined,
  Settings,
  Baby,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Record transaction", href: "/record", icon: PlusCircle },
  { label: "Transaction history", href: "/history", icon: History },
  { label: "Reports", href: "/reports", icon: ChartNoAxesCombined },
  { label: "Settings", href: "/settings", icon: Settings },
];

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sage-soft text-forest">
            <Baby size={25} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-forest">Baby Bank</p>
            <p className="text-sm text-muted">Finance</p>
          </div>

          <button
            type="button"
            aria-label="Close navigation menu"
            className="ml-auto rounded-lg p-2 text-muted hover:bg-surface lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-2 p-4">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors",
                  active
                    ? "bg-sage-soft text-forest"
                    : "text-muted hover:bg-surface hover:text-ink"
                )}
              >
                <Icon size={21} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-5">
          <p className="text-sm font-medium text-forest">Baby Bank Charity</p>
          <p className="mt-1 text-sm text-muted">
            Secure financial record keeping
          </p>
        </div>
      </aside>
    </>
  );
}
