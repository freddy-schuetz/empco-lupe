// EmpCo-Lupe content script.
//
// Responsibilities:
//   1. Scan DOM on page-load + on significant DOM mutations.
//   2. Auto-highlight local trigger words (no API call yet).
//   3. Respond to background/sidepanel messages: full scan, jump-to-section, selection check.
//
// We deliberately scan on demand (when the side-panel opens) rather than
// firing API calls on every page-load. That keeps cost + latency low.

import { defineContentScript } from "wxt/utils/define-content-script";
import { Message, ScannedSection } from "@/lib/types";
import { scanDom, jumpToSection } from "@/lib/dom-scanner";
import { markTriggers, setSectionSeverity, unmarkAll } from "@/lib/highlight";
import { sha256 } from "@/lib/hash";
import { getSettings } from "@/lib/storage";

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  excludeMatches: ["http://localhost/*", "https://localhost/*"],
  runAt: "document_idle",
  allFrames: false,

  async main() {
    // Persisted scan output of the current page (sent to sidepanel on SCAN_PAGE).
    let lastScan: { sections: ScannedSection[]; page_role: string } | null = null;
    let lastHash: string | null = null;
    let mutationDebounce: number | null = null;

    async function getPageMeta() {
      const url = window.location.href;
      const hash = await sha256(url);
      lastHash = hash;
      return {
        page_url_hash: hash,
        page_title: document.title || "",
        page_domain: window.location.hostname,
      };
    }

    async function maybeAutoHighlight() {
      const settings = await getSettings();
      if (!settings.auto_highlight) return;
      if (settings.skip_domains.includes(window.location.hostname)) return;
      const result = scanDom({ language: settings.language });
      lastScan = { sections: result.sections, page_role: result.page_role };
      markTriggers(settings.language);
    }

    // Initial pass after page idle
    setTimeout(() => {
      maybeAutoHighlight().catch(() => {});
    }, 250);

    // Re-scan on significant mutations (SPA navigation, lazy-load).
    const observer = new MutationObserver(() => {
      if (mutationDebounce) {
        clearTimeout(mutationDebounce);
      }
      mutationDebounce = window.setTimeout(() => {
        maybeAutoHighlight().catch(() => {});
      }, 1500);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
      (async () => {
        switch (msg.type) {
          case "PING": {
            sendResponse({ ok: true });
            return;
          }
          case "SCAN_PAGE": {
            const meta = await getPageMeta();
            const result = scanDom({ language: msg.settings.language });
            lastScan = { sections: result.sections, page_role: result.page_role };
            markTriggers(msg.settings.language);
            sendResponse({
              ok: true,
              meta,
              page_role: result.page_role,
              sections: result.sections,
              total_scanned: result.total_scanned,
              truncated: result.truncated,
            });
            return;
          }
          case "JUMP_TO_SECTION": {
            const ok = jumpToSection(msg.section_id);
            sendResponse({ ok });
            return;
          }
          // Side-panel updates the highlight color for one section after API response.
          // Not in the strict Message union (sidepanel <-> content only), so cast.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          case "SET_SEVERITY" as any: {
            const m = msg as unknown as { section_id: string; severity: any };
            setSectionSeverity(m.section_id, m.severity ?? null);
            sendResponse({ ok: true });
            return;
          }
          case "CHECK_SELECTION": {
            // Selection is performed in background; content just confirms the meta.
            const meta = await getPageMeta();
            sendResponse({ ok: true, meta });
            return;
          }
        }
      })();
      // Indicate we will respond asynchronously.
      return true;
    });

    // Allow sidepanel to update section colors after API results come back.
    // We accept a custom event so background can broadcast severity updates.
    window.addEventListener("empco-set-severity" as any, (e: CustomEvent) => {
      const { section_id, severity } = e.detail || {};
      if (section_id) setSectionSeverity(section_id, severity);
    });

    // Clean up on pagehide (BFCache-friendly).
    window.addEventListener("pagehide", () => {
      try { observer.disconnect(); } catch {}
      unmarkAll();
    });
  },
});
