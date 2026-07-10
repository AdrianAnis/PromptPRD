"use client";

import { useActionState } from "react";
import { updateProfileAction, updatePasswordAction, type AuthFormState } from "@/lib/auth/actions";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = {};

export function ProfileForm({ email, fullName }: { email: string; fullName: string }) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initialState
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updatePasswordAction,
    initialState
  );

  return (
    <>
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

      <Card>
        <h2 className="mb-4 text-sm font-semibold">Change password</h2>
        <form action={passwordAction} className="flex flex-col gap-4">
          <Input name="password" type="password" label="New password" required />
          {passwordState?.error && <p className="text-sm text-error">{passwordState.error}</p>}
          {passwordState?.success && <p className="text-sm text-success">Password updated.</p>}
          <Button type="submit" isLoading={passwordPending} className="w-fit">
            Update password
          </Button>
        </form>
      </Card>
    </>
  );
}
