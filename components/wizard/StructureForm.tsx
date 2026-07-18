"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { updateProjectFieldsAction } from "@/lib/projects/actions";
import {
  generateProductStructureAction,
  saveProductStructureAction,
} from "@/lib/structure/actions";
import { newId, cn } from "@/lib/utils";
import type { FeatureNode, ProductStructure } from "@/types/database";

interface StructureFormProps {
  projectId: string;
  ideaPrompt: string | null;
  productStructure: ProductStructure | null;
}

export function StructureForm({ projectId, ideaPrompt, productStructure }: StructureFormProps) {
  const [manualSeed, setManualSeed] = useState<FeatureNode[] | null>(null);

  if (!ideaPrompt || ideaPrompt.trim().length < 10) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-headline-sm font-semibold">Belum ada ide yang tersimpan</h2>
        <p className="text-body-sm text-foreground/60">
          Selesaikan step Prompt dulu sebelum menyusun struktur produk.
        </p>
        <Link href={`/dashboard/projects/${projectId}/prompt`} className="w-fit">
          <Button variant="outline" size="sm">
            Kembali ke step Prompt
          </Button>
        </Link>
      </Card>
    );
  }

  if (!productStructure && !manualSeed) {
    return (
      <EmptyState
        projectId={projectId}
        onManual={() => setManualSeed([{ id: newId(), name: "", children: [] }])}
      />
    );
  }

  return (
    <TreeEditor
      projectId={projectId}
      initialModules={productStructure?.structure ?? manualSeed ?? []}
    />
  );
}

function EmptyState({ projectId, onManual }: { projectId: string; onManual: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateProductStructureAction(projectId);
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
        <h2 className="text-headline-sm font-semibold">Susun struktur produk</h2>
        <p className="text-body-sm text-foreground/60">
          AI akan memecah idemu jadi modul dan fitur yang bisa kamu edit.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleGenerate} isLoading={isPending} className="flex-1">
          Generate Struktur
        </Button>
        <Button variant="outline" onClick={onManual} disabled={isPending} className="flex-1">
          Buat manual
        </Button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </Card>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 transition-transform", collapsed ? "" : "rotate-90")}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
    </svg>
  );
}

const inlineInputClass =
  "w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm " +
  "hover:border-border focus-visible:outline-none focus-visible:border-primary " +
  "focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50";

function TreeEditor({
  projectId,
  initialModules,
}: {
  projectId: string;
  initialModules: FeatureNode[];
}) {
  const [modules, setModules] = useState<FeatureNode[]>(initialModules);
  // Collapse state is UI-only — keeping it out of `modules` stops chevron
  // clicks from triggering an autosave and leaking view state into the DB.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [isRegenerating, startRegenerate] = useTransition();
  const [isContinuing, startContinue] = useTransition();
  const router = useRouter();

  const autosaveStatus = useAutosave(
    modules,
    (value) => saveProductStructureAction(projectId, value),
    { enabled: !isRegenerating }
  );

  const isBusy = isRegenerating || isContinuing;
  const canContinue =
    modules.length > 0 &&
    modules.every(
      (m) => m.name.trim().length > 0 && m.children.every((f) => f.name.trim().length > 0)
    );

  function toggleCollapsed(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renameModule(moduleId: string, name: string) {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, name } : m)));
  }

  function renameFeature(moduleId: string, featureId: string, name: string) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, children: m.children.map((f) => (f.id === featureId ? { ...f, name } : f)) }
          : m
      )
    );
  }

  function addModule() {
    setModules((prev) => [...prev, { id: newId(), name: "", children: [] }]);
  }

  function deleteModule(moduleId: string) {
    const target = modules.find((m) => m.id === moduleId);
    if (target && target.children.length > 0 && !confirm(`Hapus modul "${target.name || "tanpa nama"}" beserta ${target.children.length} fiturnya?`)) {
      return;
    }
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
  }

  function addFeature(moduleId: string) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, children: [...m.children, { id: newId(), name: "", children: [] }] }
          : m
      )
    );
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.delete(moduleId);
      return next;
    });
  }

  function deleteFeature(moduleId: string, featureId: string) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, children: m.children.filter((f) => f.id !== featureId) } : m
      )
    );
  }

  function handleRegenerate() {
    if (modules.length > 0 && !confirm("Regenerate akan menimpa seluruh struktur yang ada. Lanjutkan?")) {
      return;
    }

    setRegenerateError(null);
    startRegenerate(async () => {
      const result = await generateProductStructureAction(projectId);
      if (result.error) {
        setRegenerateError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleContinue() {
    startContinue(async () => {
      const saved = await saveProductStructureAction(projectId, modules);
      if (saved.error) {
        setRegenerateError(saved.error);
        return;
      }
      await updateProjectFieldsAction(projectId, { current_step: "prd" });
      router.push(`/dashboard/projects/${projectId}/prd`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        {modules.length === 0 && (
          <p className="py-4 text-center text-body-sm text-foreground/50">
            Belum ada modul. Tambahkan modul pertamamu.
          </p>
        )}

        {modules.map((mod) => {
          const isCollapsed = collapsed.has(mod.id);
          return (
            <div key={mod.id} className="rounded-lg border border-border">
              <div className="flex items-center gap-1 p-2">
                <button
                  type="button"
                  onClick={() => toggleCollapsed(mod.id)}
                  aria-label={isCollapsed ? "Buka modul" : "Tutup modul"}
                  aria-expanded={!isCollapsed}
                  className="rounded p-1 text-foreground/50 hover:bg-surface-strong hover:text-foreground"
                >
                  <ChevronIcon collapsed={isCollapsed} />
                </button>
                <input
                  value={mod.name}
                  onChange={(e) => renameModule(mod.id, e.target.value)}
                  disabled={isBusy}
                  placeholder="Nama modul"
                  aria-label="Nama modul"
                  className={cn(inlineInputClass, "flex-1 font-medium")}
                />
                <span className="shrink-0 px-1 text-label-sm text-foreground/40">
                  {mod.children.length} fitur
                </span>
                <button
                  type="button"
                  onClick={() => deleteModule(mod.id)}
                  disabled={isBusy}
                  aria-label={`Hapus modul ${mod.name || "tanpa nama"}`}
                  className="rounded p-1 text-foreground/40 hover:bg-error/10 hover:text-error disabled:opacity-50"
                >
                  <TrashIcon />
                </button>
              </div>

              {!isCollapsed && (
                <div className="flex flex-col gap-1 border-t border-border p-2 pl-8">
                  {mod.children.map((feature) => (
                    <div key={feature.id} className="flex items-center gap-1">
                      <span aria-hidden className="text-foreground/30">
                        •
                      </span>
                      <input
                        value={feature.name}
                        onChange={(e) => renameFeature(mod.id, feature.id, e.target.value)}
                        disabled={isBusy}
                        placeholder="Nama fitur"
                        aria-label="Nama fitur"
                        className={cn(inlineInputClass, "flex-1")}
                      />
                      <button
                        type="button"
                        onClick={() => deleteFeature(mod.id, feature.id)}
                        disabled={isBusy}
                        aria-label={`Hapus fitur ${feature.name || "tanpa nama"}`}
                        className="rounded p-1 text-foreground/40 hover:bg-error/10 hover:text-error disabled:opacity-50"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFeature(mod.id)}
                    disabled={isBusy}
                    className="w-fit rounded px-2 py-1 text-body-sm text-primary hover:bg-primary/10 disabled:opacity-50"
                  >
                    + Tambah fitur
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addModule}
          disabled={isBusy}
          className="w-fit rounded px-2 py-1 text-body-sm text-primary hover:bg-primary/10 disabled:opacity-50"
        >
          + Tambah modul
        </button>
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

      {regenerateError && <p className="text-sm text-error">{regenerateError}</p>}
    </div>
  );
}
