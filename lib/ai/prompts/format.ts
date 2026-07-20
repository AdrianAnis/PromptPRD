import type { FeatureNode } from "@/types/database";

export function formatFeatureTree(structure: FeatureNode[], emptyText: string): string {
  if (structure.length === 0) return emptyText;

  return structure
    .map((mod) => {
      const features = mod.children.map((f) => `  - ${f.name}`).join("\n");
      return features ? `- ${mod.name}\n${features}` : `- ${mod.name}`;
    })
    .join("\n");
}
