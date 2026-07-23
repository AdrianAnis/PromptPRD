"use client";

import { MAX_INSTRUCTION_LENGTH } from "@/lib/ai/prompts/format";

interface InstructionFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function InstructionField({ value, onChange, disabled }: InstructionFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-body-sm text-foreground/60">
        Instruksi tambahan untuk regenerate (opsional)
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        maxLength={MAX_INSTRUCTION_LENGTH}
        placeholder="mis. tambahkan fitur loyalty dan program poin"
        className="w-full rounded border border-border bg-surface px-3 py-2 text-body-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
      />
    </label>
  );
}
