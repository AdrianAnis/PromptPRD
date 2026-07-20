import { z } from "zod";

export const MAX_MERMAID_LENGTH = 20_000;
export const MIN_MERMAID_LENGTH = 20;

export const savedDiagramSchema = z.string().max(MAX_MERMAID_LENGTH);

export function looksLikeClassDiagram(code: string): boolean {
  return code.trim().startsWith("classDiagram");
}
