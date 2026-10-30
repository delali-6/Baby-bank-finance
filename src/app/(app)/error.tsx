"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-xl text-center">
      <h1 className="text-xl font-bold">This page couldn&apos;t be loaded</h1>
      <p role="alert" className="mt-2 text-muted">
        Something went wrong. Please check your internet connection and try
        again. If it keeps happening, contact an administrator.
      </p>
      <Button type="button" className="mt-5" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}
