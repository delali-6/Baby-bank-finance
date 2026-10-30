
import { ShieldCheck } from "lucide-react";

type AppHeaderProps = {
  title: string;
  description?: string;
};

export function AppHeader({
  title,
  description,
}: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-5 sm:px-8">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-forest sm:text-2xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-2 rounded-full bg-sage-soft px-3 py-2 text-xs font-medium text-forest sm:flex">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>Secure workspace</span>
      </div>
    </header>
  );
}
