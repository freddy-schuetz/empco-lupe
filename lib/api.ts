// Client for the empco-check-api webhook on n8n.friedemann-schuetz.de.
// The webhook accepts optional DOM/page-context fields added in Phase A.1.

import { ApiResponse, PageRole, SectionType } from "./types";

export const EMPCO_CHECK_URL = "https://n8n.friedemann-schuetz.de/webhook/empco-check";

export interface ApiRequest {
  text: string;
  language?: "de" | "en";
  sector?: "hospitality" | "dmo" | "tour_operator" | "auto" | "";
  section_type?: SectionType;
  page_role?: PageRole;
  page_url_hash?: string;
  surrounding_context?: string;
}

/**
 * Call empco-check-api with retries and timeout.
 * Throws on non-2xx after retries; resolves with parsed JSON on success.
 */
export async function checkText(req: ApiRequest, opts: { timeoutMs?: number; retries?: number } = {}): Promise<ApiResponse> {
  const timeoutMs = opts.timeoutMs ?? 25_000;
  const retries = opts.retries ?? 1;

  const body: Record<string, unknown> = {
    text: req.text,
    language: req.language ?? "de",
  };
  if (req.sector && req.sector !== "auto") body.sector = req.sector;
  if (req.section_type) body.section_type = req.section_type;
  if (req.page_role) body.page_role = req.page_role;
  if (req.page_url_hash) body.page_url_hash = req.page_url_hash;
  if (req.surrounding_context) body.surrounding_context = req.surrounding_context.slice(0, 500);

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(EMPCO_CHECK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = (await resp.json()) as ApiResponse;
      return data;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  throw lastErr ?? new Error("checkText failed");
}

/**
 * Batch helper: send sections in parallel with a concurrency cap (default 5).
 * Returns results in the same order as inputs; failures map to null.
 */
export async function checkBatch<T extends ApiRequest>(
  items: T[],
  concurrency = 5,
): Promise<Array<ApiResponse | null>> {
  const results: Array<ApiResponse | null> = new Array(items.length).fill(null);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = await checkText(items[i]);
      } catch {
        results[i] = null;
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
