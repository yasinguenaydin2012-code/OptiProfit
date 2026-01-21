import fs from "node:fs/promises";
import path from "node:path";

export type AIParseResult = {
  item: string | null;
  ek: number | null;
  vk: number | null;
  vkNormal: number | null;
  wkzTotal: number | null;
  menge: number | null;
  notes: string | null;
};

const DEFAULT_MODEL = "gpt-4o-mini";

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

function normalizeText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function ensureSchema(payload: Record<string, unknown>): AIParseResult {
  const mengeValue = normalizeNumber(payload.menge);
  return {
    item: normalizeText(payload.item),
    ek: normalizeNumber(payload.ek),
    vk: normalizeNumber(payload.vk),
    vkNormal: normalizeNumber(payload.vkNormal),
    wkzTotal: normalizeNumber(payload.wkzTotal),
    menge: mengeValue ?? 1,
    notes: normalizeText(payload.notes),
  };
}

async function loadPrompt(filename: string): Promise<string> {
  const filePath = path.resolve(process.cwd(), "..", "prompts", filename);
  return fs.readFile(filePath, "utf-8");
}

function parseJsonResponse(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in response.");
  }
  const jsonText = trimmed.slice(start, end + 1);
  return JSON.parse(jsonText) as Record<string, unknown>;
}

export async function parseWithAI(text: string): Promise<AIParseResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const [systemPrompt, parserPrompt] = await Promise.all([
    loadPrompt("system.txt"),
    loadPrompt("parser.txt"),
  ]);

  const body = {
    model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `${parserPrompt}\n\nInput: "${text}"\nOutput:`,
      },
    ],
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawContent = data.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonResponse(rawContent);
  return ensureSchema(parsed);
}
