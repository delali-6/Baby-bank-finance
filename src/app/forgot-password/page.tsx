
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

      if (resetError) {
        setError(
          "We couldn't send the reset email. Please check your details and try again."
        );
        return;
      }

      setMessage(
        "If your account can receive a password reset, check your email for the recovery link."
      );
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
            <h1 className="text-2xl font-bold">Forgot your password?</h1>
            <p className="text-sm text-muted">Baby Bank Finance</p>
          </div>
        </div>

        <p className="mb-6 text-muted">
          Enter the email address associated with your account and we&apos;ll
          send you a password-reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
              placeholder="you@example.com"
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
            {loading ? "Sending link..." : "Send reset link"}
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
