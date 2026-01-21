export type ParsedInput = {
  item: string | null;
  ek: number | null;
  vk: number | null;
  vk_normal: number | null;
  wkz_total: number | null;
  menge: number | null;
  notes?: string | null;
};

type AIParsedInput = {
  item: string | null;
  ek: number | null;
  vk: number | null;
  vkNormal: number | null;
  wkzTotal: number | null;
  menge: number | null;
  notes: string | null;
};

const NUMBER_RE = /-?\d+(?:[.,]\d+)?/;

function parseNumber(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const normalized = value.replace(",", ".");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : null;
}

function extractAfter(text: string, label: RegExp): number | null {
  const match = text.match(label);
  if (!match || match.length < 2) {
    return null;
  }
  return parseNumber(match[1]);
}

function guessItem(text: string): string | null {
  const tokenIndex = text.search(/\b(ek|vk|wkz|menge|aktion|statt)\b/i);
  const raw = tokenIndex > 0 ? text.slice(0, tokenIndex) : text;
  const trimmed = raw.trim().replace(/[:,-]+$/, "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseInput(text: string): ParsedInput {
  const cleaned = text.trim();
  const item = cleaned ? guessItem(cleaned) : null;

  const ek = extractAfter(cleaned, /\bek\b[^0-9-]*(${NUMBER_RE.source})/i);
  const vk = extractAfter(cleaned, /\bvk\b[^0-9-]*(${NUMBER_RE.source})/i);
  const wkz = extractAfter(cleaned, /\bwkz\b[^0-9-]*(${NUMBER_RE.source})/i);
  const menge = extractAfter(cleaned, /\bmenge\b[^0-9-]*(${NUMBER_RE.source})/i);

  const aktionVk = extractAfter(
    cleaned,
    /\baktion\b[^0-9-]*(${NUMBER_RE.source})/i
  );
  const vkNormal = extractAfter(
    cleaned,
    /\bstatt\b[^0-9-]*(${NUMBER_RE.source})/i
  );

  return {
    item,
    ek,
    vk: aktionVk ?? vk,
    vk_normal: vkNormal,
    wkz_total: wkz,
    menge: menge ?? 1,
    notes: null,
  };
}

function normalizeNumber(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const normalized = value.replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function parseWithAI(text: string): Promise<ParsedInput> {
  const url =
    process.env.EXPO_PUBLIC_AI_PARSE_URL ?? "http://localhost:3001/parse";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`AI parse failed: ${response.status}`);
  }

  const data = (await response.json()) as AIParsedInput;
  return {
    item: data.item ?? null,
    ek: normalizeNumber(data.ek),
    vk: normalizeNumber(data.vk),
    vk_normal: normalizeNumber(data.vkNormal),
    wkz_total: normalizeNumber(data.wkzTotal),
    menge: normalizeNumber(data.menge) ?? 1,
    notes: data.notes ?? null,
  };
}
