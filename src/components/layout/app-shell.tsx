
"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

const pageInfo: Record<
  string,
  { title: string; description: string }
> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Overview of your charity's finances.",
  },
  "/record": {
    title: "Record transaction",
    description: "Add income or expenditure.",
  },
  "/history": {
    title: "Transaction history",
    description: "Review recorded financial activity.",
  },
  "/reports": {
    title: "Financial reports",
    description: "Income and expenditure summaries.",
  },
  "/settings": {
    title: "Settings",
    description: "Manage your charity workspace.",
  },
    "/profile": {
    title: "My Profile",
    description: "View your account information.",
  },
  "/settings/users": {
    title: "User Management",
    description: "Manage staff access to your charity workspace.",
  },
  "/audit-log": {
    title: "Audit Log",
    description: "Review administrative and financial activity.",
  },
};

export function AppShell({
  children, isAdmin, charityName,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  charityName?: string;
}) {
  const pathname = usePathname();

  const current = useMemo(() => {
    return (
      pageInfo[pathname] ?? {
        title: "Baby Bank Finance",
        description: "Secure charity finance workspace.",
      }
    );
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <AppSidebar isAdmin={isAdmin} charityName={charityName} />

      <div className="flex min-h-screen flex-1 flex-col">
        

        <main className="flex-1 px-5 py-6 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
