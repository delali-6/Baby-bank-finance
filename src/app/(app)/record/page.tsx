
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Info,
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

type TransactionType = "income" | "expenditure";

type Category = {
  id: string;
  name: string;
  type: TransactionType;
  is_active: boolean;
};

export default function RecordTransactionPage() {
  const [type, setType] = useState<TransactionType>("income");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoading(true);
      setCategory("");

      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, type, is_active")
        .eq("type", type)
        .eq("is_active", true)
        .order("name");

      if (cancelled) return;

      if (error) {
        setCategories([]);
        setMessage("Unable to load categories. Please try again.");
        setMessageType("error");
      } else {
        setCategories((data ?? []) as Category[]);
        setMessage("");
        setMessageType("");
      }

      setCategoriesLoading(false);
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [type]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (savingRef.current) return;

    const trimmedAmount = amount.trim();

    if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount) || Number(trimmedAmount) <= 0) {
      setMessage("Enter an amount greater than £0.00, with no more than 2 decimal places.");
      setMessageType("error");
      return;
    }

    const numericAmount = Math.round(Number(trimmedAmount) * 100) / 100;

    if (!category || !categories.some((item) => item.id === category)) {
      setMessage("Please select an active category.");
      setMessageType("error");
      return;
    }

    if (description.trim().length < 3) {
      setMessage("Description must contain at least 3 characters.");
      setMessageType("error");
      return;
    }

    if (!navigator.onLine) {
      setMessage(
        "You appear to be offline. Your transaction has not been saved. Please check your connection and try again."
      );
      setMessageType("error");
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage("Your session may have expired. Please sign in again.");
        setMessageType("error");
        return;
      }

      const { error } = await supabase.from("transactions").insert({
        type,
        amount: numericAmount,
        transaction_date: date,
        category_id: category,
        description: description.trim(),
        reference: reference.trim() || null,
        created_by: user.id,
      });

      if (error) {
        console.error("Transaction save failed:", error);
        setMessage(
          /fetch|network|timeout/i.test(error.message ?? "")
            ? "Your transaction couldn't be saved. Please check your connection and try again."
            : "The transaction could not be saved. Check your access and entries, then try again."
        );
        setMessageType("error");
        return;
      }

      setMessage("Transaction saved successfully.");
      setMessageType("success");
      setAmount("");
      setCategory("");
      setDescription("");
      setReference("");
    } catch (error) {
      console.error("Unexpected transaction save error:", error);
      setMessage(
        "Your transaction couldn't be saved. Please check your connection and try again."
      );
      setMessageType("error");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
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
            Enter the transaction details carefully. Saved records are subject
            to your account permissions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={saving}>
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
                  setMessageType("");
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
                  setMessageType("");
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
                onChange={(event) => setAmount(event.target.value)}
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
              disabled={categoriesLoading || saving}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select a category"}
              </option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {!categoriesLoading && categories.length === 0 && (
              <p className="mt-2 text-sm text-ink">
                No active categories are available for this transaction type.
              </p>
            )}
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
              maxLength={60}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. receipt or internal reference"
              className="min-h-12 w-full rounded-lg border border-border bg-card px-3"
            />
          </div>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-lg p-4 text-sm ${
                messageType === "success"
                  ? "bg-sage-soft text-forest"
                  : "bg-warning-soft text-ink"
              }`}
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

            <Button
              type="submit"
              disabled={saving || categoriesLoading || categories.length === 0}
            >
              <Save size={18} aria-hidden="true" />
              {saving ? "Saving..." : "Save transaction"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
