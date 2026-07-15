"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { updateProjectFieldsAction } from "@/lib/projects/actions";
import { generateRequirementQuestionsAction } from "@/lib/requirements/actions";
import type { Project } from "@/types/database";

export function PromptStepForm({ project }: { project: Project }) {
  const [idea, setIdea] = useState(project.idea_prompt ?? "");
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const autosaveStatus = useAutosave(idea, (value) =>
    updateProjectFieldsAction(project.id, { idea_prompt: value.trim() })
  );

  function handleContinue() {
    setGenerateError(null);
    startTransition(async () => {
      const result = await generateRequirementQuestionsAction(project.id, idea);
      if (result.error) {
        setGenerateError(result.error);
        return;
      }
      router.push(`/dashboard/projects/${project.id}/requirement`);
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-headline-sm font-semibold">Ceritakan ide produkmu</h2>
        <p className="text-body-sm text-foreground/60">
          Jelaskan sedetail mungkin — AI akan menganalisis ini untuk menyusun pertanyaan klarifikasi.
        </p>
      </div>

      <Textarea
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        readOnly={isPending}
        disabled={isPending}
        className="min-h-40"
      />

      <div className="flex items-center justify-between gap-4">
        <span className="text-body-sm text-foreground/50">
          {autosaveStatus === "saving" && "Menyimpan..."}
          {autosaveStatus === "saved" && "Tersimpan"}
          {autosaveStatus === "error" && "Gagal menyimpan"}
        </span>
        <Button onClick={handleContinue} isLoading={isPending} disabled={idea.trim().length < 10}>
          Lanjutkan
        </Button>
      </div>

      {generateError && <p className="text-sm text-error">{generateError}</p>}
    </Card>
  );
}
