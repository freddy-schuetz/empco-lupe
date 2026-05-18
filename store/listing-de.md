# Chrome Web Store Listing — EmpCo-Lupe (DE)

Alle Texte fertig zum Reinkopieren ins Developer-Dashboard.

---

## Name (max 45 Zeichen)
```
EmpCo-Lupe — Greenwashing-Check
```
*30 Zeichen.*

---

## Kurzbeschreibung (max 132 Zeichen, Pflichtfeld)
```
Prüft Marketing-Texte auf Greenwashing-Risiken nach EU-EmpCo-Richtlinie 2024/825 und UWG. Für DMOs, Hotels und Verbände.
```
*125 Zeichen.*

---

## Detaillierte Beschreibung (max 16.000 Zeichen)

```
Die EmpCo-Lupe prüft jeden Marketing-Text in deinem Browser auf Greenwashing-Risiken nach EU-Richtlinie 2024/825 (EmpCo) und deutschem UWG — innerhalb von Sekunden, mit Belegstellen aus EU-Originaltext.

▶ Worum geht es?

Ab 27.09.2026 ist EmpCo EU-weit verbindlich. Pauschale Umweltaussagen, Selbst-Siegel ohne Drittprüfung und Klimaneutralitäts-Behauptungen rein auf Kompensationsbasis werden verboten. Strafen bis 4 % Jahresumsatz. Wer in Tourismus, Gastronomie oder Verbandskommunikation arbeitet, muss jeden Werbe-Claim juristisch sauber haben.

Die EmpCo-Lupe ist die erste Filter-Schicht: Du markierst einen Satz auf einer beliebigen Webseite — Rechtsklick — "EmpCo prüfen". Oder du klickst auf das Lupen-Icon und lässt die komplette aktuelle Seite scannen.

▶ Features

• AUTO-HIGHLIGHT: Markiert Triggerwörter (klimaneutral, nachhaltig, öko, CO2-neutral, …) sofort beim Laden der Seite — offline, ohne API-Call.

• DOM-AWARE PRÜFUNG: Erkennt automatisch ob eine Aussage in einer H1-Hero-Headline, einem Menüpunkt oder einer Sustainability-Subpage steht — und bewertet entsprechend. Menüpunkte werden ignoriert, Hero-Aussagen streng geprüft.

• SELEKTIONS-CHECK: Markier irgendwo Text (Gmail, WordPress, Word im Browser) — Rechtsklick — Sofort-Bewertung im Side-Panel.

• BELEGSTELLEN: Jede Bewertung wird mit verbatim-Citation aus EU-EmpCo-Originaltext (alle 42 Erwägungsgründe + 6 Artikel), deutschem UWG, oder einem von 9 anerkannten Drittzertifikaten (EU Ecolabel, EMAS, GreenSign, DEHOGA Umweltcheck u.a.) belegt.

• ALTERNATIVEN: Pro kritischem Finding drei konkrete EmpCo-konforme Umformulierungs-Vorschläge mit Copy-Button.

• HISTORY: Letzte 50 geprüfte Domains lokal (gehasht, keine Klartext-URLs).

• PRIVACY: Klartext-URLs verlassen deinen Browser nie. Nur SHA-256-Hash + markierter Text gehen an die Prüf-API.

▶ Wie es funktioniert

Hinter der Extension läuft ein n8n-Workflow mit gpt-5.4-mini, Voyage law-2-Embeddings und Cohere Rerank v3.5. Der Korpus umfasst 116 sorgfältig kuratierte Text-Bausteine aus EU-Recht, deutschem UWG und Tourismus-Branchenleitfäden. Jede zitierte Stelle wird gegen den Originaltext verifiziert — Halluzinationen werden erkannt und in der Severity herabgestuft.

▶ Für wen?

Tourismus-Marketing: DMOs, Hotelbetriebe, Reiseveranstalter, Verbände, Eventagenturen. Pre-Publish-Check für Newsletter, Buchungsseiten, Broschüren, Social-Media-Texte. Auch zum schnellen Mitbewerber-Audit nutzbar.

▶ Tastenkürzel & Bedienung

• Alt+E öffnet das Side-Panel
• Klick auf das Lupen-Icon in der Toolbar
• Rechtsklick auf markiertem Text → "EmpCo prüfen"
• Auto-Hervorhebung an/aus in den Settings
• Skip-Liste für eigene Domains

▶ Was die Extension NICHT ist

• Keine Rechtsberatung. Die Bewertungen sind automatisierte Hinweise. Bei kritischen Befunden konsultiere bitte einen Anwalt für eine rechtssichere Bewertung.
• Keine Garantie auf 100% Treffer. Ergänzendes Tool für die Erstprüfung.

▶ Open Source / Made in Germany

Backend läuft auf eigenem Server in Deutschland (Hetzner Frankfurt). Die Lupe ist ein Side-Project von Friedemann Schütz — AI Automation Expert und n8n Ambassador aus Essen. Solche Self-Check-Tools, KI-Assistenten und Workflow-Automatisierungen baue ich für DMOs, Reiseveranstalter, Hotelgruppen und Verbände — n8n-basiert, on-premise-fähig.

Mehr: https://friedemann-schuetz.de
Anfrage: f.schuetz@posteo.de

▶ Datenschutz

Vollständige Datenschutzerklärung: https://friedemann-schuetz.de/empco-lupe-privacy
Telemetrie standardmäßig AUS. Keine Cookies, kein Tracking, keine Werbung.
```
*~3800 Zeichen.*

---

## Single Purpose Statement (1 Satz)
```
Prüft markierte Marketing-Texte und ganze Webseiten auf Greenwashing-Risiken gemäß EU-EmpCo-Richtlinie 2024/825 und deutschem UWG.
```

---

## Kategorie
**Productivity** (Hauptkategorie) — alternativ "Developer Tools" wenn Productivity nicht passt.

---

## Sprache
Deutsch (Deutschland) — primär. (Englisch später optional.)

---

## Permission Justifications

Jede Permission braucht im Developer-Dashboard eine Begründung:

### sidePanel
```
Anzeige der Bewertungs-UI rechts neben dem Browser-Tab. Ohne sidePanel hätte die Extension keine Möglichkeit, Findings strukturiert mit Severity-Cards, Belegstellen, Alternativen und Jump-Links zu zeigen.
```

### storage
```
Lokale Speicherung von User-Einstellungen (Sprache, Sektor, Auto-Highlight an/aus) und einer optionalen History der letzten 50 Checks (Domains werden gehasht gespeichert, keine Klartext-URLs).
```

### contextMenus
```
Hinzufügen des Eintrags "EmpCo prüfen" zum Rechtsklick-Menü auf markiertem Text — der primäre Anwendungsfall: Marketing-Texter markiert einen Satz und prüft ihn sofort.
```

### activeTab
```
Lesen des DOM des aktuell vom User fokussierten Tabs nach einer User-Aktion (Icon-Klick, Tastenkürzel, Rechtsklick-Menü). Zugriff erfolgt nicht im Hintergrund und nicht auf andere Tabs.
```

### scripting
```
Einfügen des Content-Scripts in den aktiven Tab zur Section-Klassifikation (Hero/Body/Nav-Erkennung) und Highlight-Anzeige der Triggerwörter. Notwendig weil die DOM-Struktur direkt im Browser ausgewertet werden muss, nicht als Markdown-Dump.
```

### tabs
```
Auslesen von Titel und URL des aktiven Tabs, um den Page-Title in der UI anzuzeigen und einen SHA-256-Hash der URL für die Prüf-API zu generieren. Die Klartext-URL wird nicht übertragen, nur der Hash für Telemetrie.
```

### host_permissions: https://n8n.friedemann-schuetz.de/*
```
API-Aufrufe zur Prüf-Logik. Die Bewertung läuft auf einem n8n-Workflow auf dem eigenen Server, der die Anfrage durch eine Vektor-Suche (Voyage law-2), Reranking (Cohere) und ein LLM (gpt-5.4-mini) verarbeitet. Ohne diese Host-Permission kann die Extension keine Bewertungen einholen.
```

---

## Datennutzung (Privacy Practices Tab)

Im Dev-Dashboard musst du für jede Datenkategorie ankreuzen, ob die Extension sie:
- collects: ja / nein
- uses: warum
- shares with 3rd parties: ja / nein

### "Personally identifiable information" — NEIN
Keine Namen, Emails, Telefonnummern, IDs.

### "Health information" — NEIN

### "Financial and payment information" — NEIN

### "Authentication information" — NEIN
Keine Passwörter, Tokens, Sicherheitsfragen.

### "Personal communications" — NEIN
Keine Emails, Chats, Nachrichten.

### "Location" — NEIN

### "Web history" — TEILWEISE
Die Extension speichert lokal in chrome.storage.local einen SHA-256-Hash der URL der letzten 50 geprüften Seiten. Klartext-URLs werden nicht gespeichert oder übertragen. Diese Daten werden ausschließlich lokal genutzt, nicht an Dritte weitergegeben.

### "User activity" — TEILWEISE (optional)
Bei aktivierter Telemetrie (Standard: AUS): Anzahl geprüfter Sections pro Session, Verteilung der Severities. Anonym, ohne User-Identifikation, dient ausschließlich der Verbesserung der Erkennungs-Regeln.

### "Website content" — JA
Der vom User explizit zur Prüfung gewählte Textabschnitt (max 2000 Zeichen) wird an die Prüf-API gesendet. Wird nicht persistent gespeichert, sondern nur für die Dauer der Bewertung verarbeitet. Verarbeitet von OpenAI (LLM), Voyage AI (Embeddings), Cohere (Reranking) gemäß deren DPA.

---

## Privacy Policy URL
```
https://friedemann-schuetz.de/empco-lupe-privacy
```

---

## Homepage URL
```
https://friedemann-schuetz.de
```

---

## Support URL / E-Mail
```
f.schuetz@posteo.de
```

---

## Wichtige Compliance-Punkte

- **Single Purpose**: ja, der Single Purpose Statement passt klar.
- **Limited Use of User Data**: ja, der gesendete Text wird nur für die Bewertung verwendet, nicht für Werbung/Targeting/Modell-Training (per DPA mit OpenAI/Voyage/Cohere ausgeschlossen).
- **Code Obfuscation**: keine — die Extension nutzt nur Standard-Bundling von WXT/Vite.
- **Remote Code**: keine remote-loaded JavaScript-Dateien. Alle Skripte sind im ZIP enthalten.
- **Affiliated**: nicht Google-affiliated.

---

## Was du im Form ausfüllen musst (Schritt für Schritt)

1. **Package** → `npm run zip` ZIP hochladen
2. **Store Listing**:
   - Beschreibung (oben)
   - Icons (sind bereits im manifest, werden automatisch übernommen)
   - Promotional images: Promo Tile 440×280 hochladen (store/promo-tile-440x280.png)
   - Screenshots: 1-5 von dir aufgenommen, 1280×800 (siehe Screenshots-Liste unten)
   - Category: Productivity
   - Language: German (Germany)
3. **Privacy Practices**:
   - Single Purpose Statement (oben)
   - Permission Justifications (oben, eine pro Permission)
   - Data Usage Disclosure (oben)
   - Privacy Policy URL: https://friedemann-schuetz.de/empco-lupe-privacy
   - Bestätigung "I am following Limited Use requirements"
4. **Distribution**:
   - Visibility: Public
   - Distribution regions: All (oder Deutschland/Österreich/Schweiz wenn du fokussiert starten willst)
5. **Submit for Review** → 1-3 Tage typischerweise

---

## Screenshots — was zu zeigen ist (1280×800)

1. **Side-Panel mit Findings auf tirol.at oder einer Bio-Hotel-Site** — zeigt die Hauptfunktion: Severity-Badge, Quote, Belegstelle, Alternative
2. **Auto-Highlight auf der Seite** — gelbe Markierungen auf "nachhaltig", "klimaneutral" sichtbar im Page-Content
3. **Selektions-Check via Kontextmenü** — Screenshot vom Rechtsklick-Menü mit "EmpCo prüfen" und dem Result im Side-Panel
4. **Settings-Tab** — Skip-Liste, Sektor-Hint, Auto-Highlight an/aus
5. **History-Tab** — die letzten geprüften Domains mit Severity-Counts

Tipp: Chrome DevTools "Capture full size screenshot" macht 1280-breit. Oder mit Win+Shift+S Screenshot-Tool, dann auf 1280×800 zuschneiden.
