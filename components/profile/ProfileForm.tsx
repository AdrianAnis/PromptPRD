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
  const initial = (fullName || email || "?").charAt(0).toUpperCase();

  return (
    <Card>
      <h1 className="text-headline-md font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-body-sm text-foreground/60">Informasi akun kamu.</p>

      <div className="mt-6 flex items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/20 text-headline-sm font-semibold text-primary">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{fullName || "Untitled User"}</p>
          <p className="truncate text-body-sm text-foreground/60">{email}</p>
        </div>
      </div>

      <div className="my-6 border-t border-border" />

      <form action={profileAction} className="flex flex-col gap-4">
        <Input name="fullName" label="Nama" defaultValue={fullName} required />
        <div>
          <Input label="Email" value={email} disabled />
          <p className="mt-1.5 text-body-sm text-foreground-muted">Email tidak dapat diubah.</p>
        </div>
        {profileState?.error && <p className="text-sm text-error">{profileState.error}</p>}
        {profileState?.success && <p className="text-sm text-success">Profil diperbarui.</p>}
        <Button type="submit" isLoading={profilePending} className="w-fit">
          Simpan Perubahan
        </Button>
      </form>
    </Card>
  );
}
