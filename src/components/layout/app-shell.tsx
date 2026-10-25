
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
};

export function AppShell({
  children,
}: {
  children: React.ReactNode;
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
      <AppSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader
          title={current.title}
          description={current.description}
        />

        <main className="flex-1 px-5 py-6 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
