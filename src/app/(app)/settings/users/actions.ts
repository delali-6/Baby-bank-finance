
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

  // Protect the last active administrator from accidental deactivation.
  if (
    target.role === "admin" &&
    target.is_active &&
    activeValue === "false"
  ) {
    throw new Error("Administrator access cannot be changed here.");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_active: activeValue === "true" })
    .eq("id", profileId);

  if (updateError) {
    throw new Error(
      "The change could not be saved. Check your database permissions."
    );
  }

  revalidatePath("/settings/users");
  revalidatePath("/pending-approval");
}
