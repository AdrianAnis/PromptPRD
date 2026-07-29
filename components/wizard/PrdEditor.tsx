"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Markdown } from "@/components/ui/Markdown";
import { InstructionField } from "@/components/wizard/InstructionField";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { updateProjectFieldsAction } from "@/lib/projects/actions";
import { generatePrdAction, savePrdAction } from "@/lib/prd/actions";
import { MAX_PRD_LENGTH, MIN_PRD_LENGTH } from "@/lib/prd/schema";
import type { Prd } from "@/types/database";

const GENERATION_TIME_NOTE = "Prosesnya biasanya beberapa detik.";

interface PrdEditorProps {
  projectId: string;
  ideaPrompt: string | null;
  hasStructure: boolean;
  prd: Prd | null;
}

export function PrdEditor({ projectId, ideaPrompt, hasStructure, prd }: PrdEditorProps) {
  if (!ideaPrompt || ideaPrompt.trim().length < 10) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-headline-sm font-semibold">Belum ada ide yang tersimpan</h2>
        <p className="text-body-sm text-foreground/60">
          Selesaikan step Prompt dulu sebelum AI bisa menyusun PRD.
        </p>
        <Link href={`/dashboard/projects/${projectId}/prompt`} className="w-fit">
          <Button variant="outline" size="sm">
            Kembali ke step Prompt
          </Button>
        </Link>
      </Card>
    );
  }

  if (!prd) {
    return <EmptyState projectId={projectId} hasStructure={hasStructure} />;
  }

  return <DocumentEditor projectId={projectId} initialMarkdown={prd.content_markdown} />;
}

function EmptyState({ projectId, hasStructure }: { projectId: string; hasStructure: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generatePrdAction(projectId);
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
        <h2 className="text-headline-sm font-semibold">Susun PRD</h2>
        <p className="text-body-sm text-foreground/60">
          AI akan menulis Product Requirement Document lengkap dari ide, jawaban requirement, tech
          stack, dan struktur produkmu. {GENERATION_TIME_NOTE}
        </p>
      </div>

      {!hasStructure && (
        <p className="rounded border border-warning/30 bg-warning/10 px-3 py-2 text-body-sm text-warning">
          Struktur produk belum dibuat. PRD tetap bisa disusun, tapi bagian Kebutuhan Fungsional akan
          lebih generik.{" "}
          <Link
            href={`/dashboard/projects/${projectId}/structure`}
            className="underline underline-offset-2"
          >
            Susun struktur dulu
          </Link>
        </p>
      )}

      <Button onClick={handleGenerate} isLoading={isPending} className="w-fit">
        Generate PRD
      </Button>
      {error && <p className="text-sm text-error">{error}</p>}
    </Card>
  );
}

function DocumentEditor({
  projectId,
  initialMarkdown,
}: {
  projectId: string;
  initialMarkdown: string;
}) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [previewSource, setPreviewSource] = useState(initialMarkdown);
  const [actionError, setActionError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [isRegenerating, startRegenerate] = useTransition();
  const [isContinuing, startContinue] = useTransition();
  const router = useRouter();

  const { status: autosaveStatus, flush } = useAutosave(
    markdown,
    (value) => savePrdAction(projectId, value),
    { enabled: !isRegenerating }
  );

  const isBusy = isRegenerating || isContinuing;
  const canContinue = markdown.trim().length >= MIN_PRD_LENGTH;

  function handleRegenerate() {
    if (!confirm("Regenerate akan menimpa seluruh isi PRD saat ini. Lanjutkan?")) {
      return;
    }

    setActionError(null);
    startRegenerate(async () => {
      const result = await generatePrdAction(projectId, instruction.trim() || undefined);
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
      const advanced = await updateProjectFieldsAction(projectId, { current_step: "tasks" });
      if (advanced?.error) {
        setActionError(advanced.error);
        return;
      }
      router.push(`/dashboard/projects/${projectId}/tasks`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Tabs
          onChange={(value) => {
            if (value === "preview") setPreviewSource(markdown);
          }}
          tabs={[
            {
              value: "editor",
              label: "Editor",
              content: (
                <textarea
                  value={markdown}
                  onChange={(event) => setMarkdown(event.target.value)}
                  disabled={isBusy}
                  maxLength={MAX_PRD_LENGTH}
                  spellCheck={false}
                  aria-label="Isi PRD dalam format Markdown"
                  className="min-h-[28rem] w-full resize-y rounded border border-border bg-surface px-3 py-2 font-mono text-body-sm leading-relaxed focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                />
              ),
            },
            {
              value: "preview",
              label: "Preview",
              content: (
                <div className="min-h-[28rem] rounded border border-border bg-surface px-4 py-3">
                  <Markdown source={previewSource} />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <InstructionField value={instruction} onChange={setInstruction} disabled={isBusy} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-body-sm text-foreground-muted">
            {autosaveStatus === "saving" && "Menyimpan..."}
            {autosaveStatus === "saved" && "Tersimpan"}
            {autosaveStatus === "error" && "Gagal menyimpan"}
          </span>
          <span className="text-body-sm text-foreground-muted">
            {markdown.length.toLocaleString("id-ID")} / {MAX_PRD_LENGTH.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            isLoading={isRegenerating}
            disabled={isContinuing}
          >
            Regenerate
          </Button>
          <Button
            onClick={handleContinue}
            isLoading={isContinuing}
            disabled={!canContinue || isRegenerating}
          >
            Lanjutkan
          </Button>
        </div>
      </div>

      {actionError && <p className="text-sm text-error">{actionError}</p>}
    </div>
  );
}
