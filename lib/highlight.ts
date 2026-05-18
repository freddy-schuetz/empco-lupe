// Highlight system: wraps trigger words inside scanned sections using mark.js.
// Severity colors are applied after API responses via data-sev attributes.

import Mark from "mark.js";
import { Severity } from "./types";
import { matchTriggers } from "./triggers";

const MARK_CLASS = "empco-lupe-mark";

let lastInstance: Mark | null = null;

function ensureStylesheet(): void {
  // Inject the highlight.css from web_accessible_resources once per page.
  // Robust against pages that strip our class or CSP-block inline styles.
  const href = chrome.runtime.getURL("styles/highlight.css");
  if (document.querySelector(`link[data-empco-style='1']`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.empcoStyle = "1";
  (document.head ?? document.documentElement).appendChild(link);
}

/**
 * Mark local trigger words inside every scanned section element
 * (i.e. elements with data-empco-section-id set by the scanner).
 * Initial color is "trigger" — turned into severity colors once the API
 * returns findings.
 */
export function markTriggers(language: "de" | "en"): void {
  ensureStylesheet();
  const triggerSet = new Set<string>();
  const targets = Array.from(document.querySelectorAll("[data-empco-section-id]"));
  for (const t of targets) {
    const text = (t.textContent || "").slice(0, 4000);
    for (const w of matchTriggers(text, language)) triggerSet.add(w);
  }
  if (triggerSet.size === 0) return;
  // mark.js operates on a context element. We pass the union of scanned sections.
  const ctx = targets as unknown as HTMLElement[];
  // Reset previous run
  if (lastInstance) {
    try { lastInstance.unmark(); } catch {}
  }
  const instance = new Mark(ctx);
  lastInstance = instance;
  instance.mark(Array.from(triggerSet), {
    accuracy: "partially",
    separateWordSearch: false,
    className: MARK_CLASS,
    caseSensitive: false,
    diacritics: true,
    each: (el: Element) => {
      (el as HTMLElement).dataset.sev = "trigger";
    },
  });
}

/**
 * Re-color highlights for a section based on its highest-severity finding.
 * Pass severity=null to revert to the default "trigger" color.
 */
export function setSectionSeverity(sectionId: string, severity: Severity | null): void {
  const root = document.querySelector(`[data-empco-section-id='${CSS.escape(sectionId)}']`);
  if (!root) return;
  const marks = root.querySelectorAll(`.${MARK_CLASS}`);
  marks.forEach((m) => {
    (m as HTMLElement).dataset.sev = severity ?? "trigger";
  });
}

export function unmarkAll(): void {
  if (lastInstance) {
    try { lastInstance.unmark(); } catch {}
    lastInstance = null;
  }
}
