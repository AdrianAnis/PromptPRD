const OPENING_FENCE = /^`{3,}[a-zA-Z]*$/;
const CLOSING_FENCE = /^`{3,}$/;
const ANY_FENCE = /^`{3,}/;
const SINGLE_LINE_FENCE = /^`{3,}[a-zA-Z]*\s*([\s\S]*?)\s*`{3,}$/;

export function stripWrappingCodeFence(text: string): string {
  const trimmed = text.trim();
  const lines = trimmed.split(/\r?\n/);

  if (lines.length === 1) {
    const singleLine = trimmed.match(SINGLE_LINE_FENCE);
    return singleLine ? singleLine[1].trim() : trimmed;
  }

  const first = lines[0].trim();
  const last = lines[lines.length - 1].trim();
  if (!OPENING_FENCE.test(first) || !CLOSING_FENCE.test(last)) return trimmed;

  const inner = lines.slice(1, -1);
  const innerFenceCount = inner.filter((line) => ANY_FENCE.test(line.trim())).length;
  if (innerFenceCount % 2 !== 0) return trimmed;

  return inner.join("\n").trim();
}
