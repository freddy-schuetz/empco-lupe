# Datenschutzerklärung — EmpCo-Lupe (Chrome Extension)

**Stand:** 18. Mai 2026
**Betreiber:** Friedemann Schütz, Essen — f.schuetz@posteo.de

Die EmpCo-Lupe ist eine kostenlose Browser-Extension zur Überprüfung von Marketing-Texten auf Greenwashing-Risiken gemäß EU-Richtlinie 2024/825 (EmpCo) und dem deutschen UWG.

Diese Erklärung beschreibt vollständig, welche Daten die Extension verarbeitet, wohin sie gehen und was nicht passiert.

## 1. Welche Daten werden verarbeitet?

### Lokal (in deinem Browser, gehen nicht raus)
- **Einstellungen**: Sprache, Sektor-Hint, Auto-Hervorhebung an/aus, Skip-Liste — gespeichert in `chrome.storage.local`.
- **History**: bis zu 50 letzte Checks (Domain als SHA-256-Hash, Zeitstempel, Severity-Zähler, Page-Title). Keine Klartext-URLs, keine Findings-Texte, keine Personendaten.
- **Triggerwort-Highlights**: DOM-Markierungen werden direkt im Browser angezeigt, nichts wird übertragen.

### An die Prüf-API (`https://n8n.friedemann-schuetz.de/webhook/empco-check`)
Nur wenn du **aktiv** auf „Prüfen" klickst oder einen markierten Text via Rechtsklick prüfen lässt, werden folgende Daten gesendet:
- **Textabschnitt** des aktuellen DOM-Elements (max 2.000 Zeichen)
- **Section-Typ** (`hero_headline`, `body_content`, `navigation`, ...) zur Disambiguierung
- **Seitenrolle** (`startpage`, `sustainability`, `about`, ...)
- **Umfeld-Kontext** (1–2 angrenzende Sätze, max 500 Zeichen)
- **SHA-256-Hash der Seiten-URL** (nicht die URL selbst)
- Sprache (`de`/`en`) und Sektor-Hinweis (optional)

**Niemals übertragen werden:**
- Klartext-URLs der besuchten Seiten
- Cookies, Login-Daten, Account-Informationen
- Inhalte außerhalb des explizit geprüften Textabschnitts
- IP-Adressen werden vom Server nur transient für die Anfrage benötigt (Standard-Webserver-Verhalten, kein Tracking).

## 2. Wer verarbeitet die Daten?

Die Prüf-API läuft auf einem Server in Deutschland (Hetzner Cloud, Frankfurt) und wird vom Anbieter selbst betrieben. Für die Bewertung werden folgende Subdienstleister einbezogen:

| Dienst | Zweck | Datenstandort | DPA |
|---|---|---|---|
| OpenAI Inc. (USA) | LLM-Bewertung (gpt-5.4-mini) | EU-Region / USA | DPA + EU-SCC |
| Voyage AI (USA) | Embedding-Berechnung (voyage-law-2) | USA | DPA |
| Cohere Inc. (KA) | Re-Ranking (rerank-v3.5) | EU/Kanada | DPA |

Der übermittelte Text wird zur Bewertung kurzzeitig an diese Dienste weitergeleitet, dort verarbeitet und das Ergebnis zurückgegeben. Die Anbieter speichern Anfragen gemäß ihren Vertragsbedingungen typischerweise 0–30 Tage zur Missbrauchserkennung.

## 3. Wie lange werden Daten gespeichert?

- **Lokal im Browser**: dauerhaft, bis du die Extension deinstallierst oder die History/Einstellungen über das UI löschst.
- **Server-Log der Prüf-API**: technische Logs (Anfrage-Zeitpunkt, page_url_hash, Status, Severity-Summary) werden 30 Tage für Qualitätssicherung und Missbrauchserkennung gespeichert, anschließend automatisch gelöscht.
- **Textinhalte werden nicht persistent gespeichert** — sie werden nur für die Dauer der Bewertung im Speicher gehalten.

## 4. Telemetrie

Optional. Standard: **aus**. Wenn du im Settings-Tab „Anonyme Nutzungsdaten teilen" aktivierst, werden zusätzlich folgende Daten übertragen:
- Anzahl geprüfter Sections pro Domain (gehasht)
- Verteilung der Severities pro Check
- Anonyme Session-ID (zufällig, keine Personen­zuordnung)

Diese Telemetrie dient ausschließlich der Verbesserung der Erkennungsregeln. Du kannst sie jederzeit wieder deaktivieren.

## 5. Berechtigungen der Extension

| Permission | Wozu |
|---|---|
| `sidePanel` | Anzeige der Findings-UI rechts neben der Seite |
| `storage` | Lokale Speicherung von Settings + History |
| `contextMenus` | Rechtsklick „EmpCo prüfen" auf markiertem Text |
| `activeTab` | Zugriff auf den aktuell fokussierten Tab (nur auf User-Aktion) |
| `scripting` | Einfügen des Content-Scripts in den aktiven Tab |
| `tabs` | URL des aktiven Tabs auslesen (für Hash + Page-Title) |
| `host_permissions: https://n8n.friedemann-schuetz.de/*` | API-Aufrufe an unsere Prüf-API |

Es werden **keine** `<all_urls>`-Berechtigungen angefragt. Die Extension kann nicht im Hintergrund auf beliebige Seiten zugreifen.

## 6. Deine Rechte (DSGVO)

Da die Extension nur SHA-256-Hashes und anonyme Textabschnitte verarbeitet, lassen sich Personendaten in den meisten Fällen nicht zuordnen. Falls du dennoch Auskunft, Berichtigung, Löschung oder Beschwerde nach Art. 15-22 DSGVO geltend machen möchtest, kontaktiere uns:

- **E-Mail**: f.schuetz@posteo.de
- **Aufsichtsbehörde**: Landesbeauftragte für Datenschutz NRW (https://www.ldi.nrw.de)

## 7. Cookies / Drittanbieter-Tracking

Diese Extension setzt **keine** Cookies, nutzt **keine** Tracking-Pixel und integriert **keine** Werbe- oder Analytics-Dienste von Drittanbietern (kein Google Analytics, kein Facebook Pixel, etc.).

## 8. Open Source

Quellcode der Extension: auf Anfrage. Die Backend-Workflows laufen in n8n (https://n8n.io) auf eigener Infrastruktur.

## 9. Änderungen dieser Erklärung

Wir aktualisieren diese Erklärung bei substanziellen Änderungen am Datenverarbeitungs­vorgang. Die jeweils aktuelle Version ist immer unter https://friedemann-schuetz.de/empco-lupe-privacy abrufbar.

---

**Verantwortlich für die Datenverarbeitung im Sinne des Art. 4 Nr. 7 DSGVO:**

Friedemann Schütz
Essen, Deutschland
f.schuetz@posteo.de
