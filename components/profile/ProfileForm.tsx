"use client";

import { useActionState } from "react";
import { updateProfileAction, type AuthFormState } from "@/lib/auth/actions";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = {};

export function ProfileForm({ email, fullName }: { email: string; fullName: string }) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initialState
  );

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold">Account details</h2>
      <form action={profileAction} className="flex flex-col gap-4">
        <Input label="Email" value={email} disabled />
        <Input name="fullName" label="Full name" defaultValue={fullName} required />
        {profileState?.error && <p className="text-sm text-error">{profileState.error}</p>}
        {profileState?.success && <p className="text-sm text-success">Profile updated.</p>}
        <Button type="submit" isLoading={profilePending} className="w-fit">
          Save changes
        </Button>
      </form>
    </Card>
  );
}
