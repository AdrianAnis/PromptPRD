"use client";

import { useCallback, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MermaidDiagram } from "@/components/ui/MermaidDiagram";
import { downloadPng, downloadSvg } from "@/lib/diagram/export";
import { getExportBundleAction, type ExportBundle } from "@/lib/export/actions";
import { downloadTextFile, toFileSlug } from "@/lib/export/download";
import { countTasks, taskListToMarkdown } from "@/lib/export/tasks";
import { getCurrentTheme } from "@/lib/theme";

interface ExportMenuProps {
  projectId: string;
}

export function ExportMenu({ projectId }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [bundle, setBundle] = useState<ExportBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();

  function handleOpen() {
    setOpen(true);
    setBundle(null);
    setError(null);
    startLoad(async () => {
      const result = await getExportBundleAction(projectId);
      if (result.error || !result.bundle) {
        setError(result.error ?? "Gagal memuat data export.");
        return;
      }
      setBundle(result.bundle);
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        Export
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Export" className="max-w-lg">
        {isLoading && <p className="text-body-sm text-foreground/60">Memuat artefak...</p>}
        {error && <p className="text-sm text-error">{error}</p>}
        {bundle && !isLoading && (
          <ExportOptions projectId={projectId} bundle={bundle} onError={setError} />
        )}
      </Modal>
    </>
  );
}

function ExportSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-4 last:border-b-0 last:pb-0">
      <div>
        <h3 className="text-body-md font-medium">{title}</h3>
        <p className="text-body-sm text-foreground-muted">{hint}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ExportOptions({
  projectId,
  bundle,
  onError,
}: {
  projectId: string;
  bundle: ExportBundle;
  onError: (message: string | null) => void;
}) {
  const [diagramSvg, setDiagramSvg] = useState("");

  const handleRendered = useCallback((svg: string) => setDiagramSvg(svg), []);

  const slug = toFileSlug(bundle.projectName);
  const hasPrd = bundle.prdMarkdown.trim().length > 0;
  const hasTasks = bundle.epics.length > 0;
  const hasDiagram = bundle.mermaidCode.trim().length > 0;

  function handlePrdMarkdown() {
    onError(null);
    downloadTextFile(bundle.prdMarkdown, `${slug}-prd.md`, "text/markdown");
  }

  function handlePrdPdf() {
    onError(null);
    const printWindow = window.open(`/print/${projectId}`, "_blank", "noopener");
    if (!printWindow) {
      onError("Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.");
    }
  }

  function handleTasksMarkdown() {
    onError(null);
    downloadTextFile(
      taskListToMarkdown(bundle.projectName, bundle.epics),
      `${slug}-tasks.md`,
      "text/markdown"
    );
  }

  function handleDiagramSource() {
    onError(null);
    downloadTextFile(bundle.mermaidCode, `${slug}-class-diagram.mmd`, "text/plain");
  }

  function handleDiagramSvg() {
    onError(null);
    downloadSvg(diagramSvg, `${slug}-class-diagram.svg`);
  }

  async function handleDiagramPng() {
    onError(null);
    const background = getCurrentTheme() === "light" ? "#ffffff" : "#0d141b";
    try {
      await downloadPng(diagramSvg, `${slug}-class-diagram.png`, background);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Gagal mengekspor PNG.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ExportSection
        title="PRD"
        hint={hasPrd ? `${bundle.prdMarkdown.length.toLocaleString("id-ID")} karakter` : "Belum ada PRD."}
      >
        <Button variant="outline" size="sm" onClick={handlePrdMarkdown} disabled={!hasPrd}>
          Markdown
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrdPdf} disabled={!hasPrd}>
          PDF
        </Button>
      </ExportSection>

      <ExportSection
        title="Development Tasks"
        hint={
          hasTasks
            ? `${bundle.epics.length} Epic · ${countTasks(bundle.epics)} task`
            : "Belum ada daftar task."
        }
      >
        <Button variant="outline" size="sm" onClick={handleTasksMarkdown} disabled={!hasTasks}>
          Markdown
        </Button>
      </ExportSection>

      <ExportSection
        title="Class Diagram"
        hint={
          !hasDiagram
            ? "Belum ada diagram."
            : diagramSvg
              ? "Siap diunduh."
              : "Merender diagram..."
        }
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleDiagramSvg}
          disabled={!hasDiagram || !diagramSvg}
        >
          SVG
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDiagramPng}
          disabled={!hasDiagram || !diagramSvg}
        >
          PNG
        </Button>
        <Button variant="outline" size="sm" onClick={handleDiagramSource} disabled={!hasDiagram}>
          Mermaid
        </Button>
      </ExportSection>

      {hasDiagram && (
        <div className="hidden">
          <MermaidDiagram code={bundle.mermaidCode} onRendered={handleRendered} />
        </div>
      )}
    </div>
  );
}
