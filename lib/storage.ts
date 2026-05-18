// Typed wrapper around chrome.storage.local.
// We persist user settings and a small history of scanned pages.

import { DEFAULT_SETTINGS, HistoryEntry, UserSettings } from "./types";

const KEYS = {
  settings: "empco_settings_v1",
  history: "empco_history_v1",
} as const;

const HISTORY_MAX = 50;

async function getRaw<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (out) => {
      resolve(out[key] as T | undefined);
    });
  });
}

async function setRaw(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

export async function getSettings(): Promise<UserSettings> {
  const stored = await getRaw<Partial<UserSettings>>(KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function setSettings(next: UserSettings): Promise<void> {
  await setRaw(KEYS.settings, next);
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await setSettings(next);
  return next;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  return (await getRaw<HistoryEntry[]>(KEYS.history)) ?? [];
}

export async function pushHistory(entry: HistoryEntry): Promise<HistoryEntry[]> {
  const existing = await getHistory();
  // Dedupe by page_url_hash, keep newest
  const filtered = existing.filter((e) => e.page_url_hash !== entry.page_url_hash);
  const next = [entry, ...filtered].slice(0, HISTORY_MAX);
  await setRaw(KEYS.history, next);
  return next;
}

export async function clearHistory(): Promise<void> {
  await setRaw(KEYS.history, []);
}
