"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InstructionField } from "@/components/wizard/InstructionField";
import { updateProjectFieldsAction } from "@/lib/projects/actions";
import { generateTaskListAction } from "@/lib/tasks/actions";
import { cn } from "@/lib/utils";
import type { Epic, TaskList as TaskListData } from "@/types/database";

interface TaskListProps {
  projectId: string;
  ideaPrompt: string | null;
  hasPrd: boolean;
  taskList: TaskListData | null;
}

export function TaskList({ projectId, ideaPrompt, hasPrd, taskList }: TaskListProps) {
  if (!ideaPrompt || ideaPrompt.trim().length < 10) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-headline-sm font-semibold">Belum ada ide yang tersimpan</h2>
        <p className="text-body-sm text-foreground/60">
          Selesaikan step Prompt dulu sebelum menyusun daftar task.
        </p>
        <Link href={`/dashboard/projects/${projectId}/prompt`} className="w-fit">
          <Button variant="outline" size="sm">
            Kembali ke step Prompt
          </Button>
        </Link>
      </Card>
    );
  }

  if (!taskList || taskList.epics.length === 0) {
    return <EmptyState projectId={projectId} hasPrd={hasPrd} />;
  }

  return <TaskTree projectId={projectId} epics={taskList.epics} />;
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
          Daftar task diturunkan dari PRD, jadi buat PRD dulu.
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
      const result = await generateTaskListAction(projectId);
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
        <h2 className="text-headline-sm font-semibold">Susun daftar task</h2>
        <p className="text-body-sm text-foreground/60">
          AI akan memecah PRD jadi Epic, User Story, dan Task yang siap dikerjakan tim.
        </p>
      </div>
      <Button onClick={handleGenerate} isLoading={isPending} className="w-fit">
        Generate Tasks
      </Button>
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
      className={cn("size-4 shrink-0 transition-transform", collapsed ? "" : "rotate-90")}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function TaskTree({ projectId, epics }: { projectId: string; epics: Epic[] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [isRegenerating, startRegenerate] = useTransition();
  const [isContinuing, startContinue] = useTransition();
  const router = useRouter();

  const totalTasks = epics.reduce(
    (sum, epic) => sum + epic.stories.reduce((s, story) => s + story.tasks.length, 0),
    0
  );

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRegenerate() {
    if (!confirm("Regenerate akan menimpa seluruh daftar task yang ada. Lanjutkan?")) return;
    setActionError(null);
    startRegenerate(async () => {
      const result = await generateTaskListAction(projectId, instruction.trim() || undefined);
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
      const advanced = await updateProjectFieldsAction(projectId, { current_step: "diagram" });
      if (advanced?.error) {
        setActionError(advanced.error);
        return;
      }
      router.push(`/dashboard/projects/${projectId}/diagram`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-foreground-muted">
        {epics.length} Epic · {totalTasks} task
      </p>

      <div className="flex flex-col gap-2">
        {epics.map((epic) => {
          const epicCollapsed = collapsed.has(epic.id);
          return (
            <Card key={epic.id} className="flex flex-col gap-0 p-0">
              <button
                type="button"
                onClick={() => toggle(epic.id)}
                aria-expanded={!epicCollapsed}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-left hover:bg-surface-strong"
              >
                <ChevronIcon collapsed={epicCollapsed} />
                <span className="font-medium">{epic.title}</span>
                <span className="ml-auto text-label-sm text-foreground-muted">
                  {epic.stories.length} story
                </span>
              </button>

              {!epicCollapsed && (
                <div className="flex flex-col gap-3 border-t border-border p-4">
                  {epic.stories.map((story) => (
                    <div key={story.id} className="flex flex-col gap-2">
                      <p className="text-body-md font-medium text-foreground/90">{story.title}</p>
                      <ul className="flex flex-col gap-1.5 border-l border-border pl-4">
                        {story.tasks.map((task) => (
                          <li key={task.id}>
                            <p className="text-body-sm">{task.title}</p>
                            {task.description && (
                              <p className="text-body-sm text-foreground-muted">{task.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <InstructionField
        value={instruction}
        onChange={setInstruction}
        disabled={isRegenerating || isContinuing}
      />

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleRegenerate}
          isLoading={isRegenerating}
          disabled={isContinuing}
        >
          Regenerate
        </Button>
        <Button onClick={handleContinue} isLoading={isContinuing} disabled={isRegenerating}>
          Lanjutkan
        </Button>
      </div>

      {actionError && <p className="text-right text-sm text-error">{actionError}</p>}
    </div>
  );
}
