// Client for the empco-lupe-feedback webhook.
// Fire-and-forget: errors are swallowed so UI never blocks.

import { PageRole, SectionType, Severity } from "./types";

const FEEDBACK_URL = "https://n8n.friedemann-schuetz.de/webhook/empco-lupe-feedback";

export interface FeedbackPayload {
  finding_id: string;
  thumb: "up" | "down";
  rule_id?: string;
  severity?: Severity;
  quote?: string;
  section_type?: SectionType;
  page_role?: PageRole;
  page_url_hash?: string;
  extension_version?: string;
}

export async function sendFeedback(payload: FeedbackPayload): Promise<boolean> {
  try {
    const resp = await fetch(FEEDBACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// Synthesize a stable id for a finding so repeat-clicks dedupe + analytics can group.
// Inputs: rule_id (may be empty), quote (always present), section_id (from UiFinding).
// We use a simple FNV-1a hash over the concatenated string -> 8-char hex.
export function findingId(rule_id: string | undefined, quote: string, section_id: string): string {
  const src = `${rule_id || "no-rule"}|${quote}|${section_id}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < src.length; i++) {
    h ^= src.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ("00000000" + h.toString(16)).slice(-8);
}
