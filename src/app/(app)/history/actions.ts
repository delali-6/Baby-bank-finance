"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

async function getActiveAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    isAdmin:
      profile?.role === "admin" &&
      profile?.is_active === true,
  };
}

export async function voidTransaction(
  transactionId: string,
  reason: string
): Promise<ActionResult> {
  const cleanReason = reason.trim();

  if (!transactionId || !cleanReason) {
    return {
      success: false,
      message: "A reason is required to void this transaction.",
    };
  }

  if (cleanReason.length > 500) {
    return {
      success: false,
      message: "The reason must be 500 characters or fewer.",
    };
  }

  const { supabase, isAdmin } = await getActiveAdmin();

  if (!isAdmin) {
    return {
      success: false,
      message: "You are not authorised to void transactions.",
    };
  }

  const { data, error } = await supabase
    .from("transactions")
    .update({
      deleted_at: new Date().toISOString(),
      deletion_reason: cleanReason,
    })
    .eq("id", transactionId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Transaction void failed:", error);

    return {
      success: false,
      message:
        "The transaction could not be voided. It may already have been voided, or you may not have permission.",
    };
  }

  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    message: "Transaction voided successfully.",
  };
}

export async function restoreTransaction(
  transactionId: string
): Promise<ActionResult> {
  if (!transactionId) {
    return {
      success: false,
      message: "The transaction ID is missing.",
    };
  }

  const { supabase, isAdmin } = await getActiveAdmin();

  if (!isAdmin) {
    return {
      success: false,
      message: "You are not authorised to restore transactions.",
    };
  }

  const { data, error } = await supabase
    .from("transactions")
    .update({
      deleted_at: null,
    })
    .eq("id", transactionId)
    .not("deleted_at", "is", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Transaction restore failed:", error);

    return {
      success: false,
      message:
        "The transaction could not be restored. It may already be active, or you may not have permission.",
    };
  }

  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    message: "Transaction restored successfully.",
  };
}