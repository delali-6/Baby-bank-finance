"use client";

import { useState, useTransition } from "react";
import {
  restoreTransaction,
  voidTransaction,
} from "./actions";

export function TransactionActions({
  transactionId,
  isVoided,
}: {
  transactionId: string;
  isVoided: boolean;
}) {
  const [showVoidForm, setShowVoidForm] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleVoid(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanReason = reason.trim();

    if (!cleanReason) {
      setMessage("Please provide a reason.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to void this transaction? It will no longer count towards financial totals."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await voidTransaction(
        transactionId,
        cleanReason
      );

      setMessage(result.message);

      if (result.success) {
        setReason("");
        setShowVoidForm(false);
      }
    });
  }

  function handleRestore() {
    if (
      !window.confirm(
        "Are you sure you want to restore this transaction? It will count towards financial totals again."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await restoreTransaction(transactionId);
      setMessage(result.message);
    });
  }

  return (
    <div className="min-w-36 space-y-2">
      {isVoided ? (
        <button
          type="button"
          onClick={handleRestore}
          disabled={isPending}
          className="rounded-lg border border-forest px-3 py-2 text-xs font-semibold text-forest hover:bg-sage-soft disabled:opacity-50"
        >
          {isPending ? "Restoring..." : "Restore"}
        </button>
      ) : (
        <>
          {!showVoidForm ? (
            <button
              type="button"
              onClick={() => {
                setMessage("");
                setShowVoidForm(true);
              }}
              className="rounded-lg border border-danger px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10"
            >
              Void
            </button>
          ) : (
            <form onSubmit={handleVoid} className="space-y-2">
              <label
                htmlFor={`void-reason-${transactionId}`}
                className="block text-xs font-medium"
              >
                Reason for voiding
              </label>

              <textarea
                id={`void-reason-${transactionId}`}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                required
                rows={2}
                disabled={isPending}
                placeholder="Explain why this record is being voided..."
                className="w-full rounded-lg border border-border bg-background p-2 text-xs"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isPending || !reason.trim()}
                  className="rounded-lg bg-danger px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isPending ? "Voiding..." : "Confirm void"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowVoidForm(false);
                    setReason("");
                    setMessage("");
                  }}
                  disabled={isPending}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {message && (
        <p
          role="status"
          className="max-w-48 text-xs text-muted"
        >
          {message}
        </p>
      )}
    </div>
  );
}