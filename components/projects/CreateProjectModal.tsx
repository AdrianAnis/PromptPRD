"use client";

import { useActionState, useState } from "react";
import { createProjectAction, type ProjectFormState } from "@/lib/projects/actions";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: ProjectFormState = {};

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createProjectAction, initialState);

  return (
    <>
      <Button onClick={() => setOpen(true)}>New Project</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create a new project">
        <form action={action} className="flex flex-col gap-4">
          <Input
            name="name"
            label="Project name"
            placeholder="e.g. Sayur Marketplace"
            required
            autoFocus
          />
          {state?.error && <p className="text-sm text-error">{state.error}</p>}
          <Button type="submit" isLoading={pending} className="w-full">
            Create project
          </Button>
        </form>
      </Modal>
    </>
  );
}
