
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 12 || password.length > 128) {
      setError("Your password must be between 12 and 128 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(
          "We couldn't update your password. Your reset link may have expired or may not have established a valid recovery session. Request a new reset email and try again."
        );
        return;
      }

      setMessage("Your password has been updated successfully.");

      await supabase.auth.signOut();

      router.replace("/login?reset=success");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-sage-soft p-3 text-forest">
            <LockKeyhole size={26} aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-sm text-muted">Baby Bank Finance</p>
          </div>
        </div>

        <p className="mb-6 text-muted">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block font-medium">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-medium"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg bg-sage-soft p-3 text-sm text-forest">
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating password..." : "Update password"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-forest underline">
            Return to sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
