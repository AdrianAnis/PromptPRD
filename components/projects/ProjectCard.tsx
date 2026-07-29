"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { deleteProjectAction, duplicateProjectAction } from "@/lib/projects/actions";
import { resumePath } from "@/lib/constants";
import type { Project } from "@/types/database";

export function ProjectCard({ project }: { project: Project }) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result?.error) showToast(result.error, "error");
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateProjectAction(project.id);
      if (result?.error) showToast(result.error, "error");
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h2 className="font-medium">{project.name}</h2>
        <p className="text-xs text-foreground-muted">
          {project.status === "completed" ? "Completed" : `Step: ${project.current_step}`}
        </p>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <Link href={resumePath(project)}>
          <Button size="sm">Continue</Button>
        </Link>
        <Button variant="outline" size="sm" disabled={isPending} onClick={handleDuplicate}>
          Duplicate
        </Button>
        <Button variant="danger" size="sm" disabled={isPending} onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
