
"use client";

import { Menu, LogOut, UserRound } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  onMenuClick: () => void;
  userEmail?: string;
};

export function Topbar({ onMenuClick, userEmail }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-forest hover:bg-surface lg:hidden"
          onClick={onMenuClick}
        >
          <Menu size={24} aria-hidden="true" />
        </button>

        <div>
          <p className="font-semibold text-forest">Baby Bank Finance</p>
          <p className="hidden text-sm text-muted sm:block">
            Financial management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex size-10 items-center justify-center rounded-full bg-sage-soft text-forest">
            <UserRound size={20} aria-hidden="true" />
          </div>
          <span className="max-w-48 truncate text-sm text-muted">
            {userEmail ?? "Signed-in user"}
          </span>
        </div>

        <form action={signOut}>
          <Button
            type="submit"
            variant="outline"
            className="min-h-10 px-3"
            aria-label="Sign out"
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
