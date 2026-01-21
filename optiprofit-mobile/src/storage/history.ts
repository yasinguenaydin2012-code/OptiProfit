import AsyncStorage from "@react-native-async-storage/async-storage";

import type { CalcResult } from "../logic/calc";
import type { ParsedInput } from "../logic/parse";

export type HistoryEntry = {
  id: string;
  created_at: number;
  input: string;
  parsed: ParsedInput;
  result: CalcResult;
};

const HISTORY_KEY = "optiprofit.history.v1";
const HISTORY_LIMIT = 200;

function clampHistory(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.slice(0, HISTORY_LIMIT);
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveHistoryEntry(
  entry: HistoryEntry
): Promise<HistoryEntry[]> {
  const current = await loadHistory();
  const next = clampHistory([entry, ...current]);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
