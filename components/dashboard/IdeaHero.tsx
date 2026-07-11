"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProjectAction, type ProjectFormState } from "@/lib/projects/actions";
import { Textarea } from "@/components/ui/Textarea";

const initialState: ProjectFormState = {};

const EXAMPLE_PLACEHOLDER =
  'Contoh: "Aplikasi tracking pengeluaran harian, bisa input lewat WhatsApp, ada dashboard ringkasan bulanan..."';

export function IdeaHero({ hasPreviousProjects }: { hasPreviousProjects: boolean }) {
  const [state, action, pending] = useActionState(createProjectAction, initialState);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-headline-lg font-semibold">Mau bikin apa?</h1>
        <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
        </span>
      </div>
      <p className="text-body-lg text-foreground/60">
        Ubah ide kamu menjadi rencana yang bisa dipahami AI tools pilihanmu.
      </p>

      <form action={action} className="flex w-full flex-col gap-3">
        <div className="rounded-lg border border-border bg-surface p-4 text-left">
          <Textarea
            name="idea"
            placeholder={EXAMPLE_PLACEHOLDER}
            required
            className="min-h-32 resize-none border-none bg-transparent p-0 text-body-lg focus-visible:ring-0"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-label-md text-foreground/60">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
              </svg>
              Bahasa Indonesia
            </span>
            <button
              type="submit"
              disabled={pending}
              aria-label="Buat project"
              className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
        {state?.error && (
          <p className="rounded border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error">
            {state.error}
          </p>
        )}
      </form>

      {hasPreviousProjects && (
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-body-sm text-foreground/60 hover:text-foreground"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-3.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Lihat PRD sebelumnya
        </Link>
      )}
    </div>
  );
}
