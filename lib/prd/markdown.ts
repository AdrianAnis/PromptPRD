import { REQUIRED_SECTION_HEADINGS } from "@/lib/prd/schema";

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
  if (missing.length >= REQUIRED_SECTION_HEADINGS.length) return false;
  const tail = REQUIRED_SECTION_HEADINGS.slice(-missing.length);
  return missing.every((heading, index) => heading === tail[index]);
}
