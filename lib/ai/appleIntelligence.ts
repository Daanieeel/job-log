import * as AppleIntelligence from '@eitjuh/expo-apple-intelligence';
import type { Entry } from '@/lib/db/entries';
import type { AppLanguage } from '@/lib/i18n';
import { formatTimestamp } from '@/lib/i18n/format';

export type AvailabilityStatus = AppleIntelligence.AvailabilityStatus;

export function checkAvailability(): Promise<AvailabilityStatus> {
  return AppleIntelligence.getAvailabilityStatus();
}

const MAX_BULLETS = 5;
const MIN_BULLETS = 3;
const MAX_BULLET_LENGTH = 160;

const LANGUAGE_NAME: Record<AppLanguage, string> = { en: 'English', de: 'German' };

function buildPrompt(entries: Entry[], periodLabel: string, language: AppLanguage): string {
  const lines = entries
    .map((e) => `- [${formatTimestamp(new Date(e.createdAt), language)}] ${e.text}`)
    .join('\n');

  return [
    `You are summarizing a personal work log for the period "${periodLabel}", written for the ` +
      `person who logged it, for their own later reference — not addressed to anyone else.`,
    `Raw log entries for this period (they may be written in English or German):`,
    lines,
    ``,
    `Write ${MIN_BULLETS} to ${MAX_BULLETS} concise bullet points summarizing what was ` +
      `accomplished. Rules:`,
    `- Write the bullets in ${LANGUAGE_NAME[language]}, regardless of the language the entries were written in.`,
    `- Plain text lines only, no markdown, no numbering, no leading dashes or bullet characters.`,
    `- One accomplishment per line.`,
    `- No fluff, no restating the period or dates — those are already shown elsewhere.`,
    `- Each line under ${MAX_BULLET_LENGTH} characters.`,
  ].join('\n');
}

function stripBulletPrefix(line: string): string {
  return line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim();
}

function capLength(text: string): string {
  return text.length > MAX_BULLET_LENGTH ? `${text.slice(0, MAX_BULLET_LENGTH - 1)}…` : text;
}

/** Defensively parses the model's free-text response into clean bullet lines. */
export function parseBullets(raw: string): string[] {
  return raw
    .split('\n')
    .map(stripBulletPrefix)
    .filter((line) => line.length > 0)
    .map(capLength)
    .slice(0, MAX_BULLETS);
}

export class AppleIntelligenceError extends Error {}

export async function summarizeWithAppleIntelligence(
  entries: Entry[],
  periodLabel: string,
  language: AppLanguage
): Promise<string[]> {
  const result = await AppleIntelligence.generateResponse(
    buildPrompt(entries, periodLabel, language)
  );

  if (!result.success || !result.response) {
    throw new AppleIntelligenceError(result.error ?? 'On-device model failed to generate a response.');
  }

  const bullets = parseBullets(result.response);
  if (bullets.length === 0) {
    throw new AppleIntelligenceError('On-device model returned no usable summary.');
  }

  return bullets;
}
