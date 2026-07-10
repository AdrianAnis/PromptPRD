"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initialState: AuthFormState = {};

function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "";

  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Log in</h1>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
        <Input name="password" type="password" label="Password" required />
        {state?.error && <p className="text-sm text-error">{state.error}</p>}
        <Button type="submit" isLoading={pending} className="w-full">
          Log in
        </Button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-foreground/60">
        <Link href="/forgot-password" className="hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
