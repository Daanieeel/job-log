const MAX_BULLETS = 5;
const MAX_BULLET_LENGTH = 160;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function capLength(text: string): string {
  return text.length > MAX_BULLET_LENGTH ? `${text.slice(0, MAX_BULLET_LENGTH - 1)}…` : text;
}

/**
 * Non-AI heuristic used when on-device Apple Intelligence is unavailable:
 * dedupe near-identical entries, then surface the longest (most substantive) ones.
 */
export function generateFallbackSummary(entryTexts: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const raw of entryTexts) {
    const text = raw.trim();
    if (!text) continue;
    const key = normalize(text);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(text);
  }

  return unique
    .slice()
    .sort((a, b) => b.length - a.length)
    .slice(0, Math.min(MAX_BULLETS, unique.length))
    .map(capLength);
}
