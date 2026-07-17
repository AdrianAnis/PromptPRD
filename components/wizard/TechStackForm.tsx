"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { updateProjectFieldsAction } from "@/lib/projects/actions";
import { generateTechRecommendationAction, saveTechStackAction } from "@/lib/tech/actions";
import { TECH_CATEGORIES, TECH_OPTIONS, CATEGORY_LABELS, type TechCategory } from "@/lib/tech/options";
import type { TechStack } from "@/types/database";

type FieldState = Record<TechCategory, string>;

interface TechStackFormProps {
  projectId: string;
  ideaPrompt: string | null;
  techStack: TechStack | null;
}

export function TechStackForm({ projectId, ideaPrompt, techStack }: TechStackFormProps) {
  const [manualMode, setManualMode] = useState(false);

  if (!ideaPrompt || ideaPrompt.trim().length < 10) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-headline-sm font-semibold">Belum ada ide yang tersimpan</h2>
        <p className="text-body-sm text-foreground/60">
          Selesaikan step Prompt dulu sebelum memilih teknologi.
        </p>
        <Link href={`/dashboard/projects/${projectId}/prompt`} className="w-fit">
          <Button variant="outline" size="sm">
            Kembali ke step Prompt
          </Button>
        </Link>
      </Card>
    );
  }

  if (techStack || manualMode) {
    return <DropdownForm projectId={projectId} techStack={techStack} />;
  }

  return <ChoiceScreen projectId={projectId} onManual={() => setManualMode(true)} />;
}

function ChoiceScreen({ projectId, onManual }: { projectId: string; onManual: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAI() {
    setError(null);
    startTransition(async () => {
      const result = await generateTechRecommendationAction(projectId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-headline-sm font-semibold">Pilih teknologi</h2>
        <p className="text-body-sm text-foreground/60">
          Biarkan AI merekomendasikan stack berdasarkan idemu, atau pilih sendiri.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleAI} isLoading={isPending} className="flex-1">
          Biarkan AI memilih
        </Button>
        <Button variant="outline" onClick={onManual} disabled={isPending} className="flex-1">
          Pilih sendiri
        </Button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </Card>
  );
}

function DropdownForm({
  projectId,
  techStack,
}: {
  projectId: string;
  techStack: TechStack | null;
}) {
  const [fields, setFields] = useState<FieldState>(() =>
    Object.fromEntries(
      TECH_CATEGORIES.map((cat) => [cat, techStack?.[cat] ?? ""])
    ) as FieldState
  );
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [isRegenerating, startRegenerate] = useTransition();
  const [isContinuing, startContinue] = useTransition();
  const router = useRouter();

  const autosaveStatus = useAutosave(
    fields,
    (value) => saveTechStackAction(projectId, value),
    { enabled: !isRegenerating }
  );

  const canContinue = !!fields.frontend && !!fields.backend && !!fields.database;

  function updateField(category: TechCategory, value: string) {
    setFields((prev) => ({ ...prev, [category]: value }));
  }

  function handleRegenerate() {
    const hasAny = TECH_CATEGORIES.some((cat) => fields[cat]);
    if (hasAny && !confirm("Rekomendasi AI akan menimpa pilihan teknologi saat ini. Lanjutkan?")) {
      return;
    }

    setRegenerateError(null);
    startRegenerate(async () => {
      const result = await generateTechRecommendationAction(projectId);
      if (result.error) {
        setRegenerateError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleContinue() {
    startContinue(async () => {
      await updateProjectFieldsAction(projectId, { current_step: "structure" });
      router.push(`/dashboard/projects/${projectId}/structure`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TECH_CATEGORIES.map((cat) => (
          <Dropdown
            key={cat}
            label={CATEGORY_LABELS[cat]}
            value={fields[cat]}
            onChange={(event) => updateField(cat, event.target.value)}
            options={[
              { label: "Pilih...", value: "" },
              ...TECH_OPTIONS[cat].map((o) => ({ label: o, value: o })),
            ]}
          />
        ))}
      </Card>

      <div className="flex items-center justify-between gap-4">
        <span className="text-body-sm text-foreground/50">
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
            Rekomendasikan dengan AI
          </Button>
          <Button onClick={handleContinue} isLoading={isContinuing} disabled={!canContinue || isRegenerating}>
            Lanjutkan
          </Button>
        </div>
      </div>

      {regenerateError && <p className="text-sm text-error">{regenerateError}</p>}
    </div>
  );
}
