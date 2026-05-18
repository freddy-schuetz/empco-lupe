# EmpCo-Lupe

Browser-Extension für den Greenwashing-Check von Marketing-Texten nach **EU-EmpCo-Richtlinie 2024/825** und deutschem **UWG**. Side-Project von [Friedemann Schütz](https://friedemann-schuetz.de).

![EmpCo-Lupe Screenshot](store/screenshots/screenshot-04.png)

## Was sie macht

- **Auto-Highlight**: markiert Triggerwörter (klimaneutral, nachhaltig, öko, …) sofort beim Seitenladen — offline, ohne API-Call
- **DOM-aware Prüfung**: unterscheidet automatisch zwischen Hero-Headline, Menüpunkt und Body-Content; bewertet entsprechend streng
- **Selektions-Check**: Text markieren → Rechtsklick → „EmpCo prüfen" → Bewertung im Side-Panel in Sekunden
- **Belegstellen**: jede Bewertung mit verbatim-Citation aus EU-EmpCo-Originaltext, UWG oder einem von 9 anerkannten Drittzertifikaten (EU Ecolabel, EMAS, GreenSign, DEHOGA Umweltcheck u.a.)
- **3 EmpCo-konforme Alternativen** pro kritischem Finding mit Copy-Button
- **Lokale History** der letzten 50 Checks (Domain gehasht, keine Klartext-URLs)

## Installation

### Aus dem Chrome Web Store
*Coming soon — derzeit im Review. [Bei Launch benachrichtigen lassen](https://friedemann-schuetz.de/#usecases).*

### Aus dem Microsoft Edge Add-ons Store
*Coming soon.*

### Direkt-Installation aus dieser Release (Entwickler / Early Tester)

1. ZIP aus dem [Latest Release](../../releases/latest) herunterladen und entpacken
2. Chrome / Edge öffnen → `chrome://extensions/` bzw. `edge://extensions/`
3. **Entwicklermodus** aktivieren (Toggle oben rechts)
4. **„Entpackte Erweiterung laden"** klicken → den entpackten Ordner auswählen
5. Lupen-Icon in der Toolbar anpinnen
6. **`Alt+E`** oder Klick auf das Icon öffnet das Side-Panel

> ⚠️ Bei Sideload zeigt Chrome bei jedem Start eine Warnung über „Developer-mode extensions". Solange ungelöste Permissions im Store-Review hängen, ist das normal. Sobald die Store-Version live ist, wechsle bitte dorthin (automatische Updates, kein Banner).

## Backend / Architektur

Die Extension ruft die **EmpCo Check API** auf `https://n8n.friedemann-schuetz.de/webhook/empco-check` auf. Der Workflow läuft in [n8n](https://n8n.io) auf eigenem Server (Hetzner Frankfurt) und kombiniert:

- **gpt-5.4-mini** für die Compliance-Bewertung (`chainLlm + outputParserStructured + lmChatOpenAi`)
- **Voyage `voyage-law-2`** Embeddings (juristisch optimiert, 1024 dim)
- **Cohere `rerank-v3.5`** als Cross-Encoder zweite Stufe
- **Memory-Stack**: PostgreSQL 17 + pgvector, Hybrid-Search (Vector + BM25 + RRF)
- Kuratierter Korpus: 116 Chunks aus EU-EmpCo-Originaltext, UWG (Stand 02/2026), Tourismus-Leitfäden und 9 Drittzertifikaten

Plus zwei Sub-Workflows für den Multi-Page-Self-Check (Cherry-Picking-Detector, Substantiation-Search).

## Tech-Stack der Extension

| Component | Tech |
|---|---|
| Framework | [WXT](https://wxt.dev) 0.20+ |
| UI | React 18 + TypeScript + [Shadcn/ui](https://ui.shadcn.com) + Tailwind CSS 3 |
| Manifest | V3 (Side Panel API, Service Worker) |
| Highlight | [mark.js](https://markjs.io) |
| Storage | `chrome.storage.local` |
| Browser-Support | Chrome 114+ · Edge 114+ |

## Permissions — was die Extension darf

| Permission | Wozu |
|---|---|
| `sidePanel` | Anzeige der Findings-UI rechts neben dem Tab |
| `storage` | Lokale Settings + History |
| `contextMenus` | Rechtsklick „EmpCo prüfen" |
| `activeTab` | DOM-Lese-Zugriff auf aktiven Tab (nur auf User-Aktion) |
| `scripting` | Content-Script Injection |
| `tabs` | URL des aktiven Tabs auslesen (für SHA-256-Hash + Page-Title) |
| `host_permissions: https://n8n.friedemann-schuetz.de/*` | API-Calls zum Backend (eine einzige Domain, nicht `<all_urls>`) |

## Datenschutz

- Klartext-URLs werden NICHT an den Server übertragen, nur SHA-256-Hash
- History bleibt lokal in `chrome.storage.local`
- Keine Cookies, kein Tracking, keine Werbung
- Telemetrie standardmäßig AUS

Vollständig: [Datenschutzerklärung](https://friedemann-schuetz.de/ai-launchkit/website/empco-lupe-privacy.html)

## Entwicklung

Voraussetzungen: Node 18+, npm 9+.

```bash
npm install
npm run dev       # Hot-Reload, öffnet Chrome mit Extension
npm run build     # Production-Build → .output/chrome-mv3/
npm run zip       # ZIP für Store-Submission
npm run compile   # TypeScript-Check
```

## Roadmap

Geplante Features und bekannte Limitations: [ROADMAP.md](ROADMAP.md).

## Lizenz

[MIT](LICENSE) — frei für eigene Nutzung, Forks willkommen.

## Kontakt

[friedemann-schuetz.de](https://friedemann-schuetz.de) · f.schuetz@posteo.de

Wenn du sowas (Self-Check-Tools, KI-Assistenten, Workflow-Automatisierungen) für deine DMO / Hotelgruppe / Verband brauchst: melde dich.
