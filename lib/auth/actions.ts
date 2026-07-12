"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSafeLocalPath } from "@/lib/utils";

export interface AuthFormState {
  error?: string;
  success?: boolean;
}

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function signInWithGoogleAction(redirectTo?: string) {
  const callbackUrl = new URL("/auth/callback", await requestOrigin());
  if (isSafeLocalPath(redirectTo)) callbackUrl.searchParams.set("redirectTo", redirectTo);

  let oauthUrl: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });

    if (error) {
      console.error("Google sign-in failed:", error.message);
    } else {
      oauthUrl = data.url;
    }
  } catch (err) {
    console.error("Google sign-in threw an unexpected error:", err);
  }
  redirect(oauthUrl ?? "/login?error=oauth");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export async function updateProfileAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", user.id);

  if (error) return { error: error.message };

  return { success: true };
}
