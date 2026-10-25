
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}


export async function signUp(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const fullName = formData.get("fullName");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof fullName !== "string" ||
    !email.trim() ||
    !fullName.trim() ||
    password.length < 12 ||
    password.length > 128
  ) {
    return {
      error:
        "Enter your name and email, and use a password between 12 and 128 characters.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    console.error("Supabase signup error:", error.message);
    return {
      error: "Unable to create the account. Check your details and try again.",
    };
  }

  return {
    success: true,
    message:
      "Account created. Please check your email to confirm your address. Once confirmed, your account will still need administrator approval.",
  };
}
