import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSafeLocalPath } from "@/lib/utils";

// How close created_at/last_sign_in_at must be to treat a sign-in as a fresh
// registration (see isNewUser below). Widened past a "same instant" check to
// tolerate normal latency in Supabase's identity-linking pipeline; a real
// persisted "just registered" flag would be sturdier if this ever needs to
// drive more than a one-off welcome toast.
const NEW_USER_WINDOW_MS = 10_000;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectToParam = searchParams.get("redirectTo");
  const redirectTo = isSafeLocalPath(redirectToParam) ? redirectToParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const user = data.user;
      // Google OAuth signs a new user's very first sign-in itself, so there's
      // no separate "register" step to hook into — treat created_at and
      // last_sign_in_at landing within the same window as "just registered".
      const isNewUser =
        !!user &&
        Math.abs(
          new Date(user.created_at).getTime() -
            new Date(user.last_sign_in_at ?? user.created_at).getTime()
        ) < NEW_USER_WINDOW_MS;

      const redirectUrl = new URL(redirectTo, origin);
      if (isNewUser) redirectUrl.searchParams.set("welcome", "1");
      return NextResponse.redirect(redirectUrl);
    }

    console.error("Failed to exchange OAuth code for a session:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
