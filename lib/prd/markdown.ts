import { REQUIRED_SECTION_HEADINGS } from "@/lib/prd/schema";

const OPENING_FENCE = /^`{3,}[a-zA-Z]*$/;
const CLOSING_FENCE = /^`{3,}$/;
const ANY_FENCE = /^`{3,}/;

export function stripWrappingCodeFence(text: string): string {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return text.trim();

  const first = lines[0].trim();
  const last = lines[lines.length - 1].trim();
  if (!OPENING_FENCE.test(first) || !CLOSING_FENCE.test(last)) return text.trim();

  const inner = lines.slice(1, -1);
  const innerFenceCount = inner.filter((line) => ANY_FENCE.test(line.trim())).length;
  if (innerFenceCount % 2 !== 0) return text.trim();

  return inner.join("\n").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function headingPattern(heading: string): RegExp {
  return new RegExp(
    `^#{1,3}\\s*(?:\\d+[.)]\\s*)?\\*{0,2}${escapeRegExp(heading)}\\*{0,2}\\s*$`,
    "im"
  );
}

export function findMissingSectionHeadings(markdown: string): string[] {
  return REQUIRED_SECTION_HEADINGS.filter((heading) => !headingPattern(heading).test(markdown));
}

export function isMissingOnlyTrailingSections(missing: string[]): boolean {
  if (missing.length === 0) return false;
  const tail = REQUIRED_SECTION_HEADINGS.slice(-missing.length);
  return missing.every((heading, index) => heading === tail[index]);
}
