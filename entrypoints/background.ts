// EmpCo-Lupe background service worker.
//
// Tasks:
//   1. Configure sidePanel.setPanelBehavior so the action icon opens the panel.
//   2. Create context menu "EmpCo prüfen" for selected text.
//   3. Relay messages between sidepanel and active tab content script.
//   4. Run the actual API calls (so the heavy stuff happens off the page).

import { defineBackground } from "wxt/utils/define-background";
import { Message } from "@/lib/types";
import { checkText } from "@/lib/api";
import { sha256 } from "@/lib/hash";
import { getSettings } from "@/lib/storage";

const CONTEXT_MENU_ID = "empco-check-selection";

export default defineBackground(() => {
  // Action click opens the side panel for the current tab.
  chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true }).catch(() => {});

  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: "EmpCo prüfen: \"%s\"",
      contexts: ["selection"],
    }, () => {
      // Swallow "duplicate id" errors on hot-reload during development.
      void chrome.runtime.lastError;
    });
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText || !tab?.id) return;
    const text = info.selectionText.trim();
    if (text.length < 5) return;

    // Open side panel for this tab and hand it the selection.
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch {
      // Some Chrome versions require a windowId fallback.
      try { await chrome.sidePanel.open({ windowId: tab.windowId }); } catch {}
    }

    // Hand off the selection via runtime message; sidepanel listens on mount.
    chrome.runtime.sendMessage({ type: "SELECTION_FROM_BG", text, tabId: tab.id } as any).catch(() => {});
  });

  // Sidepanel can ask us to run an API call. Doing it from the background keeps
  // the network request out of any restrictive page CSP and isolates failures.
  chrome.runtime.onMessage.addListener((msg: any, _sender, sendResponse) => {
    (async () => {
      try {
        if (msg?.type === "API_CHECK") {
          const result = await checkText(msg.request);
          sendResponse({ ok: true, result });
          return;
        }
        if (msg?.type === "API_HASH_URL") {
          const hash = await sha256(String(msg.url || ""));
          sendResponse({ ok: true, hash });
          return;
        }
      } catch (err) {
        sendResponse({ ok: false, error: (err as Error).message || String(err) });
      }
    })();
    return true;
  });
});
