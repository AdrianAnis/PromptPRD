import type { FeatureNode } from "@/types/database";

export const MAX_INSTRUCTION_LENGTH = 400;

export function formatInstruction(instruction?: string): string {
  const trimmed = instruction?.trim().slice(0, MAX_INSTRUCTION_LENGTH);
  if (!trimmed) return "";

  return `\n\nInstruksi tambahan dari pengguna (prioritaskan revisi ini di atas versi sebelumnya):\n"""\n${trimmed}\n"""`;
}

export function formatFeatureTree(structure: FeatureNode[], emptyText: string): string {
  if (structure.length === 0) return emptyText;

  return structure
    .map((mod) => {
      const features = mod.children.map((f) => `  - ${f.name}`).join("\n");
      return features ? `- ${mod.name}\n${features}` : `- ${mod.name}`;
    })
    .join("\n");
}
