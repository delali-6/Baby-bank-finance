
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Info,
  Save,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function RecordTransactionPage() {
  const [type, setType] = useState<"income" | "expenditure">("income");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "This form is a preview. Your transaction has not been saved. Database saving will be connected in a later step."
    );
  }

  return (
    <div>
      <PageHeader
        title="Record transaction"
        description="Enter the details of money received or spent by the charity."
      />

      <Card className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-sage-soft p-4">
          <Info
            size={21}
            className="mt-0.5 shrink-0 text-forest"
            aria-hidden="true"
          />
          <p className="text-sm text-forest">
            Preview mode: this form does not save financial records yet.
            Check your entries before submitting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset>
            <legend className="mb-3 font-semibold text-ink">
              Transaction type
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={type === "income"}
                onClick={() => {
                  setType("income");
                  setMessage("");
                }}
                className={`flex min-h-14 items-center justify-center gap-2 rounded-lg border p-3 font-semibold ${
                  type === "income"
                    ? "border-forest bg-sage-soft text-forest"
                    : "border-border bg-card text-ink"
                }`}
              >
                <ArrowDownLeft size={20} aria-hidden="true" />
                Income
              </button>

              <button
                type="button"
                aria-pressed={type === "expenditure"}
                onClick={() => {
                  setType("expenditure");
                  setMessage("");
                }}
                className={`flex min-h-14 items-center justify-center gap-2 rounded-lg border p-3 font-semibold ${
                  type === "expenditure"
                    ? "border-forest bg-sage-soft text-forest"
                    : "border-border bg-card text-ink"
                }`}
              >
                <ArrowUpRight size={20} aria-hidden="true" />
                Expenditure
              </button>
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="transaction-date" className="mb-2 block font-medium">
                Transaction date
              </label>
              <input
                id="transaction-date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
              />
            </div>

            <div>
              <label htmlFor="transaction-amount" className="mb-2 block font-medium">
                Amount (£)
              </label>
              <input
                id="transaction-amount"
                type="number"
                min="0.01"
                max="999999999"
                step="0.01"
                required
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setMessage("");
                }}
                placeholder="0.00"
                className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
              />
            </div>
          </div>

          <div>
            <label htmlFor="transaction-category" className="mb-2 block font-medium">
              Category
            </label>
            <select
              id="transaction-category"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
            >
              <option value="">Select a category</option>
              {type === "income" ? (
                <>
                  <option value="Donations">Donations</option>
                  <option value="Grants">Grants</option>
                  <option value="Fundraising">Fundraising</option>
                  <option value="Other income">Other income</option>
                </>
              ) : (
                <>
                  <option value="Baby supplies">Baby supplies</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Rent and utilities">Rent and utilities</option>
                  <option value="Transport">Transport</option>
                  <option value="Other expenditure">Other expenditure</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="transaction-description" className="mb-2 block font-medium">
              Description
            </label>
            <textarea
              id="transaction-description"
              required
              minLength={3}
              maxLength={500}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Briefly explain this transaction"
              className="w-full rounded-lg border border-border bg-card p-3"
            />
          </div>

          <div>
            <label htmlFor="transaction-reference" className="mb-2 block font-medium">
              Reference (optional)
            </label>
            <input
              id="transaction-reference"
              type="text"
              maxLength={100}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. receipt or internal reference"
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
            />
          </div>

          {message && (
            <p
              role="status"
              className="rounded-lg bg-warning-soft p-4 text-sm text-ink"
            >
              {message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>

            <Button type="submit">
              <Save size={18} aria-hidden="true" />
              Preview submission
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
