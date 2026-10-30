
"use client";

import { useState, type FormEvent } from "react";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signUp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(
        new FormData(event.currentTarget)
      );

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message);
        setPassword("");
        setConfirmPassword("");
      }
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
            <UserPlus size={26} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-sm text-muted">
              Baby Bank Finance
            </p>
          </div>
        </div>

        <p className="mb-6 text-muted">
          Register your account. An administrator must approve
          your access before you can view financial records.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-2 block font-medium">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              required
              maxLength={100}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
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
            <label htmlFor="password" className="mb-2 block font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
              placeholder="At least 12 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-medium"
            >
              Confirm password
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
              placeholder="Enter your password again"
            />
          </div>

            {success && (
            <p
                role="status"
                className="rounded-lg bg-sage-soft p-3 text-sm text-forest"
            >
                {success}
            </p>
            )}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-soft p-3 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            <UserPlus size={18} aria-hidden="true" />
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-forest underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
