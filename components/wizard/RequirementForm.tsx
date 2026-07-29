"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { updateProjectFieldsAction } from "@/lib/projects/actions";
import {
  generateRequirementQuestionsAction,
  saveRequirementAnswersAction,
} from "@/lib/requirements/actions";
import type { Requirement, RequirementAnswer } from "@/types/database";

interface RequirementFormProps {
  projectId: string;
  ideaPrompt: string | null;
  requirement: Requirement | null;
}

export function RequirementForm({ projectId, ideaPrompt, requirement }: RequirementFormProps) {
  const questions = requirement?.questions_and_answers ?? [];

  if (questions.length === 0) {
    return <EmptyState projectId={projectId} ideaPrompt={ideaPrompt} />;
  }

  return <AnsweredForm projectId={projectId} ideaPrompt={ideaPrompt} initialAnswers={questions} />;
}

function EmptyState({ projectId, ideaPrompt }: { projectId: string; ideaPrompt: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!ideaPrompt || ideaPrompt.trim().length < 10) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-headline-sm font-semibold">Belum ada ide yang tersimpan</h2>
        <p className="text-body-sm text-foreground/60">
          Selesaikan step Prompt dulu sebelum AI bisa menyusun pertanyaan requirement.
        </p>
        <Link href={`/dashboard/projects/${projectId}/prompt`} className="w-fit">
          <Button variant="outline" size="sm">
            Kembali ke step Prompt
          </Button>
        </Link>
      </Card>
    );
  }

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateRequirementQuestionsAction(projectId, ideaPrompt!);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-headline-sm font-semibold">Siap menyusun pertanyaan</h2>
      <p className="text-body-sm text-foreground/60">
        AI akan membaca idemu dan menyusun pertanyaan klarifikasi yang relevan.
      </p>
      <Button onClick={handleGenerate} isLoading={isPending} className="w-fit">
        Generate Pertanyaan
      </Button>
      {error && <p className="text-sm text-error">{error}</p>}
    </Card>
  );
}

function AnsweredForm({
  projectId,
  ideaPrompt,
  initialAnswers,
}: {
  projectId: string;
  ideaPrompt: string | null;
  initialAnswers: RequirementAnswer[];
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRegenerating, startRegenerate] = useTransition();
  const [isContinuing, startContinue] = useTransition();
  const router = useRouter();

  const { status: autosaveStatus, flush } = useAutosave(
    answers,
    (value) => saveRequirementAnswersAction(projectId, value),
    { enabled: !isRegenerating }
  );

  const allAnswered = answers.every((a) => a.answer.trim().length > 0);

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? { ...a, answer: value } : a)));
  }

  function handleRegenerate() {
    if (!ideaPrompt) return;

    const hasAnswers = answers.some((a) => a.answer.trim().length > 0);
    if (hasAnswers && !confirm("Regenerate akan menghapus semua jawaban yang sudah kamu isi. Lanjutkan?")) {
      return;
    }

    setActionError(null);
    startRegenerate(async () => {
      const result = await generateRequirementQuestionsAction(projectId, ideaPrompt, {
        force: true,
      });
      if (result.error) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleContinue() {
    setActionError(null);
    startContinue(async () => {
      const saved = await flush();
      if (saved?.error) {
        setActionError(saved.error);
        return;
      }
      const advanced = await updateProjectFieldsAction(projectId, { current_step: "tech" });
      if (advanced?.error) {
        setActionError(advanced.error);
        return;
      }
      router.push(`/dashboard/projects/${projectId}/tech`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {answers.map((item, index) => (
        <Card key={index} className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center rounded-full border border-border px-2 py-0.5 text-label-sm text-foreground/60">
            {item.category}
          </span>
          <p className="font-medium">{item.question}</p>
          <Textarea
            value={item.answer}
            onChange={(event) => updateAnswer(index, event.target.value)}
            className="min-h-20"
          />
        </Card>
      ))}

      <div className="flex items-center justify-between gap-4">
        <span className="text-body-sm text-foreground-muted">
          {autosaveStatus === "saving" && "Menyimpan..."}
          {autosaveStatus === "saved" && "Tersimpan"}
          {autosaveStatus === "error" && "Gagal menyimpan"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            isLoading={isRegenerating}
            disabled={isContinuing}
          >
            Regenerate
          </Button>
          <Button onClick={handleContinue} isLoading={isContinuing} disabled={!allAnswered || isRegenerating}>
            Lanjutkan
          </Button>
        </div>
      </div>

      {actionError && <p className="text-sm text-error">{actionError}</p>}
    </div>
  );
}
