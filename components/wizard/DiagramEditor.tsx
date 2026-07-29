"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { MermaidDiagram } from "@/components/ui/MermaidDiagram";
import { InstructionField } from "@/components/wizard/InstructionField";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { updateProjectFieldsAction } from "@/lib/projects/actions";
import { generateClassDiagramAction, saveClassDiagramAction } from "@/lib/diagram/actions";
import { downloadPng, downloadSvg } from "@/lib/diagram/export";
import {
  MAX_MERMAID_LENGTH,
  MIN_MERMAID_LENGTH,
  looksLikeClassDiagram,
} from "@/lib/diagram/schema";
import { getCurrentTheme } from "@/lib/theme";
import type { ClassDiagram } from "@/types/database";

interface DiagramEditorProps {
  projectId: string;
  ideaPrompt: string | null;
  hasPrd: boolean;
  diagram: ClassDiagram | null;
}

export function DiagramEditor({ projectId, ideaPrompt, hasPrd, diagram }: DiagramEditorProps) {
  if (!ideaPrompt || ideaPrompt.trim().length < 10) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-headline-sm font-semibold">Belum ada ide yang tersimpan</h2>
        <p className="text-body-sm text-foreground/60">
          Selesaikan step Prompt dulu sebelum membuat diagram.
        </p>
        <Link href={`/dashboard/projects/${projectId}/prompt`} className="w-fit">
          <Button variant="outline" size="sm">
            Kembali ke step Prompt
          </Button>
        </Link>
      </Card>
    );
  }

  if (!diagram || !diagram.mermaid_code.trim()) {
    return <EmptyState projectId={projectId} hasPrd={hasPrd} />;
  }

  return <Editor projectId={projectId} initialCode={diagram.mermaid_code} />;
}

function EmptyState({ projectId, hasPrd }: { projectId: string; hasPrd: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!hasPrd) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-headline-sm font-semibold">PRD belum dibuat</h2>
        <p className="text-body-sm text-foreground/60">
          Class diagram diturunkan dari PRD, jadi buat PRD dulu.
        </p>
        <Link href={`/dashboard/projects/${projectId}/prd`} className="w-fit">
          <Button variant="outline" size="sm">
            Ke step PRD
          </Button>
        </Link>
      </Card>
    );
  }

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateClassDiagramAction(projectId);
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
        <h2 className="text-headline-sm font-semibold">Buat Class Diagram</h2>
        <p className="text-body-sm text-foreground/60">
          AI akan menghasilkan diagram kelas UML (Mermaid) dari PRD dan struktur produkmu.
        </p>
      </div>
      <Button onClick={handleGenerate} isLoading={isPending} className="w-fit">
        Generate Class Diagram
      </Button>
      {error && <p className="text-sm text-error">{error}</p>}
    </Card>
  );
}

function Editor({ projectId, initialCode }: { projectId: string; initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [previewSource, setPreviewSource] = useState(initialCode);
  const [actionError, setActionError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [isRegenerating, startRegenerate] = useTransition();
  const [isFinishing, startFinish] = useTransition();
  const lastSvgRef = useRef("");
  const router = useRouter();

  const { status: autosaveStatus, flush } = useAutosave(
    code,
    (value) => saveClassDiagramAction(projectId, value),
    { enabled: !isRegenerating }
  );

  const isBusy = isRegenerating || isFinishing;
  const canFinish = looksLikeClassDiagram(code) && code.trim().length >= MIN_MERMAID_LENGTH;

  const handleRendered = useCallback((svg: string) => {
    lastSvgRef.current = svg;
  }, []);

  function backgroundColor(): string {
    return getCurrentTheme() === "light" ? "#ffffff" : "#0d141b";
  }

  function currentDiagramSvg(): string | null {
    if (code !== previewSource) {
      setPreviewSource(code);
      setActionError("Perubahan sedang dirender. Klik Export lagi sebentar.");
      return null;
    }
    if (!lastSvgRef.current) {
      setActionError("Buka tab Preview dulu untuk merender diagram.");
      return null;
    }
    return lastSvgRef.current;
  }

  function handleExportSvg() {
    const svg = currentDiagramSvg();
    if (!svg) return;
    setActionError(null);
    downloadSvg(svg, "class-diagram.svg");
  }

  async function handleExportPng() {
    const svg = currentDiagramSvg();
    if (!svg) return;
    setActionError(null);
    try {
      await downloadPng(svg, "class-diagram.png", backgroundColor());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal mengekspor PNG.");
    }
  }

  function handleRegenerate() {
    if (!confirm("Regenerate akan menimpa kode diagram saat ini. Lanjutkan?")) return;
    setActionError(null);
    startRegenerate(async () => {
      const result = await generateClassDiagramAction(projectId, instruction.trim() || undefined);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleFinish() {
    if (!canFinish) {
      setActionError("Diagram belum valid. Pastikan diawali \"classDiagram\" dan tidak kosong.");
      return;
    }
    setActionError(null);
    startFinish(async () => {
      const saved = await flush();
      if (saved?.error) {
        setActionError(saved.error);
        return;
      }
      const done = await updateProjectFieldsAction(projectId, { status: "completed" });
      if (done?.error) {
        setActionError(done.error);
        return;
      }
      router.push("/dashboard/projects");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Tabs
          onChange={(value) => {
            if (value === "preview") setPreviewSource(code);
          }}
          tabs={[
            {
              value: "editor",
              label: "Editor",
              content: (
                <textarea
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  disabled={isBusy}
                  maxLength={MAX_MERMAID_LENGTH}
                  spellCheck={false}
                  aria-label="Kode Mermaid class diagram"
                  className="min-h-96 w-full resize-y rounded border border-border bg-surface px-3 py-2 font-mono text-body-sm leading-relaxed focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                />
              ),
            },
            {
              value: "preview",
              label: "Preview",
              content: (
                <div className="min-h-96 rounded border border-border bg-surface p-4">
                  <MermaidDiagram code={previewSource} onRendered={handleRendered} />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <InstructionField value={instruction} onChange={setInstruction} disabled={isBusy} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-foreground-muted">
            {autosaveStatus === "saving" && "Menyimpan..."}
            {autosaveStatus === "saved" && "Tersimpan"}
            {autosaveStatus === "error" && "Gagal menyimpan"}
          </span>
          <Button variant="outline" size="sm" onClick={handleExportSvg} disabled={isBusy}>
            Export SVG
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPng} disabled={isBusy}>
            Export PNG
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            isLoading={isRegenerating}
            disabled={isFinishing}
          >
            Regenerate
          </Button>
          <Button
            onClick={handleFinish}
            isLoading={isFinishing}
            disabled={isRegenerating || !canFinish}
          >
            Selesaikan
          </Button>
        </div>
      </div>

      {actionError && <p className="text-sm text-error">{actionError}</p>}
    </div>
  );
}
