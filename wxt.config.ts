import { defineConfig } from "wxt";

// WXT config for EmpCo-Lupe.
// Cross-browser MV3 build with React side-panel.
//
// Permission rationale (for Chrome Web Store review):
// - sidePanel        : open detailed findings UI alongside the page
// - storage          : persist history (hashed) + user settings locally
// - contextMenus     : right-click "EmpCo prüfen" on selected text
// - activeTab        : read DOM of the currently focused tab (no broad host_permissions)
// - scripting        : injected DOM scanner (content script + dynamic exec for selection)
//
// We deliberately avoid <all_urls> in host_permissions and rely on activeTab.
// This means the content script's auto-highlight runs on any http(s) page (via matches)
// but actual API calls (which require activeTab) only run when the user clicks the icon.
export default defineConfig({
  srcDir: ".",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "EmpCo-Lupe",
    description: "Greenwashing-Check für Marketing-Texte nach EU-EmpCo-Richtlinie 2024/825 + UWG. Side-Project von Friedemann Schütz.",
    version: "0.2.0",
    permissions: ["sidePanel", "storage", "contextMenus", "activeTab", "scripting", "tabs"],
    host_permissions: ["https://n8n.friedemann-schuetz.de/*"],
    icons: {
      "16": "icons/16.png",
      "32": "icons/32.png",
      "48": "icons/48.png",
      "128": "icons/128.png",
    },
    action: {
      default_title: "EmpCo-Lupe öffnen (Alt+E)",
      default_icon: {
        "16": "icons/16.png",
        "32": "icons/32.png",
      },
    },
    commands: {
      _execute_action: {
        suggested_key: { default: "Alt+E" },
        description: "Side-Panel öffnen",
      },
    },
    side_panel: {
      default_path: "sidepanel.html",
    },
    web_accessible_resources: [
      {
        resources: ["styles/highlight.css"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
