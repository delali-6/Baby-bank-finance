"use client";

import { useActionState } from "react";
import { updateOrganisationSettings } from "./actions";
import { Card } from "@/components/ui/card";

type OrganisationSettings = {
  charity_name: string;
  currency: string;
  timezone: string;
  week_start_day: number;
};

type FormState = {
  success: boolean;
  message: string;
};

const initialState: FormState = {
  success: false,
  message: "",
};

type Props = {
  settings: OrganisationSettings;
  canEdit: boolean;
};

export function OrganisationSettingsForm({
  settings,
  canEdit,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    updateOrganisationSettings,
    initialState
  );

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-lg font-bold">Charity information</h2>
        <p className="mt-1 text-sm text-muted">
          Organisation details and financial record-keeping preferences.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="charity_name"
            className="mb-2 block text-sm font-medium"
          >
            Charity name
          </label>
          <input
            id="charity_name"
            name="charity_name"
            type="text"
            required
            maxLength={150}
            defaultValue={settings.charity_name}
            readOnly={!canEdit}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink read-only:opacity-75"
          />
        </div>

        <div>
          <label
            htmlFor="currency"
            className="mb-2 block text-sm font-medium"
          >
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={settings.currency.trim()}
            disabled={!canEdit}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink disabled:opacity-75"
          >
            <option value="GBP">GBP — British Pound (£)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="USD">USD — US Dollar ($)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="timezone"
            className="mb-2 block text-sm font-medium"
          >
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={settings.timezone}
            disabled={!canEdit}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink disabled:opacity-75"
          >
            <option value="Europe/London">
              Europe/London — UK time
            </option>
            <option value="UTC">UTC</option>
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="America/New_York">
              America/New_York
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="week_start_day"
            className="mb-2 block text-sm font-medium"
          >
            First day of the week
          </label>
          <select
            id="week_start_day"
            name="week_start_day"
            defaultValue={String(settings.week_start_day)}
            disabled={!canEdit}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink disabled:opacity-75"
          >
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
            <option value="7">Sunday</option>
          </select>
          <p className="mt-1 text-xs text-muted">
            This setting records your preferred week start. Existing reports
            will only follow it if their date calculations use this setting.
          </p>
        </div>

        {state.message && (
          <p
            role={state.success ? "status" : "alert"}
            className={`rounded-lg border p-3 text-sm ${
              state.success
                ? "border-border bg-surface text-ink"
                : "border-red-300 bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </p>
        )}

        {canEdit ? (
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-forest px-5 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save charity settings"}
          </button>
        ) : (
          <p className="text-sm text-muted">
            Only an active administrator can change these settings.
          </p>
        )}
      </form>
    </Card>
  );
}