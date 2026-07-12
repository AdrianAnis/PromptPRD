"use client";

import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  return (
    <Card>
      <h1 className="mb-4 text-headline-md font-semibold tracking-tight">Create your account</h1>
      <GoogleSignInButton label="Continue with Google" />
      <p className="mt-4 text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
