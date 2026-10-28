
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetSuccessful = searchParams.get("reset") === "success";
  const callbackFailed = searchParams.get("error") === "auth_callback";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setError("Unable to sign in. Check your details and try again.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
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
            <h1 className="text-2xl font-bold">Baby Bank Finance</h1>
            <p className="text-sm text-muted">Sign in to your account</p>
          </div>
        </div>

        <p className="mb-6 text-muted">
          Sign in with your registered charity account to continue.
        </p>

        {resetSuccessful && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-sage-soft p-3 text-sm text-forest"
          >
            Your password has been reset. Please sign in with your new password.
          </p>
        )}

        {callbackFailed && (
          <p role="alert" className="mb-4 rounded-lg bg-danger-soft p-3 text-sm text-danger">
            That authentication link could not be verified. Please request a new link and try again.
          </p>
        )}

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

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="password" className="font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-forest underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-soft p-3 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            <LogIn size={18} aria-hidden="true" />
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-xs text-muted">
          Access is intended for authorised charity users. User-approval
          enforcement still needs to be completed before the app is ready
          for real financial records.
        </p>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <Card className="w-full max-w-md p-6 sm:p-8">
            <p className="text-sm text-muted">Loading sign-in...</p>
          </Card>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
