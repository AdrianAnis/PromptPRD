import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSafeLocalPath } from "@/lib/utils";

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
