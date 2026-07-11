"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initialState: AuthFormState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <Card>
      <h1 className="mb-4 text-headline-md font-semibold">Create your account</h1>
      {state?.success ? (
        <p className="rounded border border-success/30 bg-success/10 px-3 py-2 text-body-sm text-success">
          Account created. Check your email for a confirmation link before logging in.
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <Input name="fullName" label="Full name" placeholder="Jane Doe" required />
          <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
          <Input name="password" type="password" label="Password" placeholder="At least 8 characters" required />
          {state?.error && (
            <p className="rounded border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error">
              {state.error}
            </p>
          )}
          <Button type="submit" isLoading={pending} className="w-full">
            Sign up
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
