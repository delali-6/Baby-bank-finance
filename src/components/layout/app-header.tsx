
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
    <header className="flex flex-col gap-3 border-b border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-2 text-sm text-forest sm:self-auto">
        <ShieldCheck size={17} aria-hidden="true" />
        <span>Secure workspace</span>
      </div>
    </header>
  );
}
