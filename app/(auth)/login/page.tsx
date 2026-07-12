"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Card } from "@/components/ui/Card";
import { useOneShotSearchParam } from "@/lib/hooks/useOneShotSearchParam";

function LoginCard() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const [oauthError, setOauthError] = useState(false);

  useOneShotSearchParam("error", (value) => {
    if (value === "oauth") setOauthError(true);
  });

  return (
    <Card>
      <h1 className="mb-4 text-headline-md font-semibold tracking-tight">Log in</h1>
      {oauthError && (
        <p className="mb-4 rounded border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error">
          Google sign-in failed. Please try again.
        </p>
      )}
      <GoogleSignInButton redirectTo={redirectTo} label="Continue with Google" />
      <p className="mt-4 text-center text-sm text-foreground/60">
        New here?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  );
}
