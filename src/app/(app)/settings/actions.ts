"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CURRENCIES = ["GBP", "EUR", "USD"] as const;

type FormState = {
  success: boolean;
  message: string;
};

export async function updateOrganisationSettings(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin" ||
    !profile.is_active
  ) {
    return {
      success: false,
      message: "You are not authorised to change charity settings.",
    };
  }

  const charityName = formData.get("charity_name");
  const currency = formData.get("currency");
  const timezone = formData.get("timezone");
  const weekStartValue = formData.get("week_start_day");

  if (
    typeof charityName !== "string" ||
    !charityName.trim() ||
    charityName.trim().length > 150
  ) {
    return {
      success: false,
      message: "Enter a charity name of up to 150 characters.",
    };
  }

  if (
    typeof currency !== "string" ||
    !CURRENCIES.includes(currency as (typeof CURRENCIES)[number])
  ) {
    return {
      success: false,
      message: "Select a supported currency.",
    };
  }

  if (
    typeof timezone !== "string" ||
    !["Europe/London", "UTC", "Europe/Paris", "America/New_York"].includes(
      timezone
    )
  ) {
    return {
      success: false,
      message: "Select a supported timezone.",
    };
  }

  if (
    typeof weekStartValue !== "string" ||
    !/^[1-7]$/.test(weekStartValue)
  ) {
    return {
      success: false,
      message: "Select a valid week-start day.",
    };
  }

  const { data: existingSettings, error: readError } = await supabase
    .from("organisation_settings")
    .select("id")
    .eq("id", 1)
    .maybeSingle();

  if (readError || !existingSettings) {
    return {
      success: false,
      message: "The charity settings could not be found.",
    };
  }

  const { error: updateError } = await supabase
    .from("organisation_settings")
    .update({
      charity_name: charityName.trim(),
      currency,
      timezone,
      week_start_day: Number(weekStartValue),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

    if (updateError) {
    console.error("Organisation settings update failed:", {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
    });

    return {
        success: false,
        message: "Settings could not be saved. Check the server terminal for the error details.",
    };
    }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    message: "Charity settings saved successfully.",
  };
}