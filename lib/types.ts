// Shared types between content script, background, and side-panel.

export type Severity = "high" | "med" | "low";

export type SectionType =
  | "hero_headline"
  | "hero_section"
  | "body_headline"
  | "body_content"
  | "body_list_item"
  | "aside"
  | "footer"
  | "navigation"        // skipped by classifier
  | "consent_banner"    // skipped by classifier
  | "user_selection"
  | "unknown";

export type PageRole =
  | "startpage"
  | "sustainability"
  | "about"
  | "booking"
  | "product"
  | "other";

// One scannable unit produced by the DOM scanner.
export interface ScannedSection {
  id: string;                     // stable id within page, e.g. "sec-12"
  section_type: SectionType;
  text: string;
  dom_position: number;           // sequence number in document order
  page_role: PageRole;
  trigger_match: boolean;         // pre-filtered locally before API call
  triggers_matched: string[];     // local trigger words found
  surrounding_context?: string;   // 1-2 sentences from sibling text
}

// Citation as returned by empco-check-api (post-validation).
export interface Citation {
  chunk_id?: string;
  passage: string;
  source?: string;
  ref?: string;
  category?: string;
  valid?: boolean;
  reason?: string;
}

// One finding as returned by empco-check-api.
export interface ApiFinding {
  quote: string;
  severity: Severity;
  rule_id?: string;
  explanation: string;
  citations: Citation[];
  compliant_alternatives: string[];
  flagged_hallucinated?: boolean;
  scope_check?: { in_scope: boolean; reason: string; matched?: string };
}

export interface ApiResponse {
  status: "clean" | "warn" | "block";
  score: number;
  findings: ApiFinding[];
  meta?: Record<string, unknown>;
}

// A finding enriched with which section produced it (for the side-panel jump).
export interface UiFinding extends ApiFinding {
  section_id: string;
  section_type: SectionType;
  page_role: PageRole;
  source_quote: string;          // the section's full text, for context
}

// Per-page scan result, kept in side-panel state and chrome.storage.local history.
export interface PageScanResult {
  page_url_hash: string;         // SHA-256 of URL
  page_title: string;
  page_domain: string;           // host only (not full URL)
  scanned_at: number;            // epoch ms
  status: "clean" | "warn" | "block";
  page_score: number;            // 0-100, derived from worst section
  sections_scanned: number;
  sections_checked: number;      // how many called the API
  findings: UiFinding[];
}

// History entry (no full findings, just summary).
export interface HistoryEntry {
  page_url_hash: string;
  page_title: string;
  page_domain: string;
  scanned_at: number;
  status: "clean" | "warn" | "block";
  page_score: number;
  counts: { high: number; med: number; low: number };
}

// User settings persisted in chrome.storage.local.
export interface UserSettings {
  language: "de" | "en";
  sector: "hospitality" | "dmo" | "tour_operator" | "auto";
  auto_highlight: boolean;
  skip_domains: string[];        // domains where extension stays silent
  telemetry_opt_in: boolean;
  consent_accepted: boolean;     // first-run consent screen passed
}

export const DEFAULT_SETTINGS: UserSettings = {
  language: "de",
  sector: "auto",
  auto_highlight: true,
  skip_domains: [],
  telemetry_opt_in: false,
  consent_accepted: false,
};

// Background <-> content/sidepanel message protocol.
export type Message =
  | { type: "PING" }
  | { type: "SCAN_PAGE"; settings: UserSettings }
  | { type: "SCAN_RESULT"; result: PageScanResult }
  | { type: "JUMP_TO_SECTION"; section_id: string }
  | { type: "CHECK_SELECTION"; text: string; settings: UserSettings }
  | { type: "CHECK_SELECTION_RESULT"; finding: ApiFinding | null; status: "clean" | "warn" | "block"; score: number }
  | { type: "ERROR"; message: string };
