"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthFormState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initialState: AuthFormState = {};

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Reset your password</h1>
      {state?.success ? (
        <p className="text-sm text-success">
          Check your email for a link to reset your password.
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
          {state?.error && <p className="text-sm text-error">{state.error}</p>}
          <Button type="submit" isLoading={pending} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-foreground/60">
        <Link href="/login" className="text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </Card>
  );
}
