# Microsoft Edge Add-ons Store — Listing EmpCo-Lupe

Alle Werte für das Edge Partner Center Form, copy-paste-ready.
Edge unterscheidet sich an 3 Stellen vom Chrome-Listing: längere Short-Description,
Search-Keywords (max 7), Hardware/Accessibility-Felder.

---

## Package upload
- **Datei**: `extensions/empco-lupe/.output/empco-lupe-0.2.0-chrome.zip` (105 KB)
- **Identisches MV3-ZIP wie Chrome** — Edge akzeptiert es direkt, keine Anpassung nötig
- v0.2.0 enthält den Feedback-Loop (👍/👎 pro Finding); Edge startet damit gleich auf aktuellem Stand

---

## Store Listing → Properties

### Category
**Productivity**

### Sub-category (falls verfügbar)
**Workflow & Planning** (alternativ: "Tools")

### Hardware preferences
**None / No specific hardware required**

### Accessibility support
**No specific accessibility features claimed**

(Plugin nutzt Standard-DOM-Operationen, kein Screen-Reader-spezifisches Markup. Falls Edge eine "WCAG-compliant"-Checkbox hat: unchecked lassen.)

### Languages supported
**Deutsch (Deutschland)** — für Submission. (Englisch später nachrüsten falls gewünscht.)

---

## Store Listing → Properties → Search Terms (max 7 Tags)
```
EmpCo
UWG
Greenwashing
Tourismus
Nachhaltigkeit
Compliance
Marketing-Check
```

---

## Store Listing → Description (DE)

### Short description (max 200 Zeichen, Edge erlaubt mehr als Chrome)
```
Browser-Extension für den Greenwashing-Check von Marketing-Texten nach EU-EmpCo-Richtlinie 2024/825 und UWG. DOM-aware, mit verbatim-Citation aus EU-Originaltext. Side-Project von Friedemann Schütz.
```
*~200 Zeichen.*

### Detailed description
(Gleicher Text wie Chrome — copy aus `listing-de.md` Abschnitt "Detaillierte Beschreibung")

### Disclosure (optional, Edge-spezifisch)
**Nothing** auswählen — keine Werbung, kein In-App-Käufe, kein User-Tracking. Wir haben keine "advertising / in-app purchases / promotional content" zu disclosure.

---

## Store Listing → Logos & Screenshots

### Store logo (Required, 300×300 px)
Edge erwartet ein 300×300-Logo. Unser 128×128 ist zu klein — lass mich ein 300×300-Variante ableiten falls Edge sich beschwert. Sonst nimm das aktuelle 128×128 (manche Edge-Felder akzeptieren das auch).

**Aktion falls 128×128 abgelehnt wird**: Bescheid sagen, ich rendere 300×300.

### Tile (Required, 358×358 px oder bigger square)
- Nimm `store/icon-128-rgb.png` (klein, aber wird upscaled gehen) ODER
- Sag Bescheid, ich render einen 358×358 Tile

### Screenshots (mindestens 1, max 10)
- Größe: **640×480 bis 1280×800**, PNG/JPG
- Verwende dieselben aus `store/screenshots/screenshot-01..05.png`

### Promotional images (optional)
- **Large promotional tile**: 1400×560 — nimm `store/marquee-1400x560.png`
- **Small promotional tile** (optional, 440×280): nimm `store/promo-tile-440x280-rgb.png`

---

## Privacy Practices

### Privacy URL (PFLICHT)
```
https://friedemann-schuetz.de/ai-launchkit/website/empco-lupe-privacy.html
```

### Permissions Justification
**Identisch wie Chrome — copy aus `listing-de.md` Abschnitt "Permission Justifications"**:
- sidePanel
- storage
- contextMenus
- activeTab
- scripting
- tabs
- host_permissions

### Data collection disclosure
**Nur "Website content" ankreuzen** (gleiche Begründung wie Chrome).

Alle anderen Datenkategorien: NEIN.

### "Single purpose" statement
```
Prüft markierte Marketing-Texte und ganze Webseiten auf Greenwashing-Risiken gemäß EU-EmpCo-Richtlinie 2024/825 und deutschem UWG.
```

### Remote code disclosure
**Nein**, kein Remote Code.

---

## Availability & Pricing

### Markets
**All markets** ankreuzen (oder gezielt: Germany, Austria, Switzerland für DACH-only).

### Pricing
**Free** (kein In-App-Pricing).

### Visibility
**Public** ankreuzen.

---

## Support contact

### Website URL
```
https://friedemann-schuetz.de
```

### Contact email
```
f.schuetz@posteo.de
```

---

## Was Edge automatisch will (aber Chrome nicht hatte)

1. **Notes for certification** (free-text Feld für Reviewer):
```
Diese Extension prüft Tourismus-Marketing-Texte auf EmpCo/UWG-Greenwashing-Konformität.
Die Content-Script-Matches auf alle http(s)-Seiten sind erforderlich, damit User
auf jeder beliebigen Tourismus-Webseite das Side-Panel öffnen und einen Text
prüfen können. host_permissions sind auf eine einzige Backend-Domain begrenzt
(n8n.friedemann-schuetz.de). Es werden keine User-Daten gesammelt außer dem
explizit markierten Text, der an die Backend-API gesendet wird.

Privacy-Policy: https://friedemann-schuetz.de/ai-launchkit/website/empco-lupe-privacy.html
Backend-Server: eigene Infrastruktur in Deutschland (Hetzner Frankfurt).
```

2. **Test instructions for reviewer** (kurze Demo-Anleitung):
```
1. Extension installieren und Side-Panel via Klick auf Lupen-Icon oder Alt+E öffnen
2. Datenschutz-Hinweis bestätigen (First-Run)
3. Navigation zu https://www.tirol.at/unterkuenfte/nachhaltige-unterkuenfte
4. Side-Panel zeigt "Prüfen"-Button — klicken
5. Nach ~10-30 Sekunden erscheinen Findings mit Belegstellen + Alternativen

Alternativ: irgendwo Text "Klimaneutrales Hotel durch 100% CO2-Kompensation"
markieren, Rechtsklick → "EmpCo prüfen". Side-Panel zeigt sofort die Bewertung.
```

---

## Review-Zeit

**Edge-Reviews dauern typischerweise 1-7 Werktage** — oft schneller als Chrome weil weniger Submissions. Bei broad-content-script-matches: vermutlich am oberen Ende.

---

## Nach Approval

1. Extension geht **automatisch live** im Edge Add-ons Store
2. Du bekommst eine Notification + Direct-Link
3. Website-Update: Badge in `friedemann-schuetz.de/index.html` für EmpCo-Lupe von "Chrome Web Store · Review" auf "Verfügbar in Chrome + Edge" ändern, CTA-Button bekommt zweiten Link
