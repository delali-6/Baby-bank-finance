
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateUserAccess(formData: FormData) {
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
    throw new Error("You are not authorised to manage user access.");
  }

  const profileId = formData.get("profileId");
  const activeValue = formData.get("active");

  if (
    typeof profileId !== "string" ||
    !profileId ||
    typeof activeValue !== "string" ||
    !["true", "false"].includes(activeValue)
  ) {
    throw new Error("Invalid user access request.");
  }

  if (profileId === user.id) {
    throw new Error("You cannot change your own access here.");
  }

  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", profileId)
    .maybeSingle();

  if (targetError || !target) {
    throw new Error("The selected user could not be found.");
  }

  if (target.role !== "staff") {
    throw new Error(
      "Administrator accounts must be managed separately."
    );
  }

  const requestedActive = activeValue === "true";

  if (target.is_active === requestedActive) {
    throw new Error("This user's access has already been updated.");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_active: requestedActive })
    .eq("id", profileId)
    .eq("role", "staff")
    .eq("is_active", !requestedActive);

  if (updateError) {
    console.error("User access update failed:", updateError);

    throw new Error(
      "The change could not be saved. Please try again."
    );
  }

  revalidatePath("/settings/users");
  revalidatePath("/pending-approval");
  revalidatePath("/dashboard");
}
