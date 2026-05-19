# Roadmap

Status zum 2026-05-18.

## v0.2.0 (current — GitHub Release)

- 👍 / 👎 Feedback-Buttons pro Finding
- Anonymes Backend-Logging (kein User-Tracking, nur Finding-Bewertungen)

## v0.3.0 (geplant — nach Chrome/Edge Store-Freigabe)

Bekannte Verbesserungen aus realem Testing:

- **Multi-Finding im Selektions-Check** — aktuell wird bei langem markierten Text mit mehreren Verstößen nur das stärkste Finding angezeigt. Liste aller Findings rendern, wie der Page-Scan es schon tut.
- **iframe-aware Status** — in Editor-Iframes (Mailjet, Gmail-Compose, TinyMCE, CKEditor) erreicht der Page-Scan den Inhalt nicht. Aktuell zeigt das Side-Panel dann fälschlich „100/100 UNAUFFÄLLIG". Stattdessen Hinweis: „Page-Scan kann auf dieser Seite nicht greifen — Text markieren + Rechtsklick → EmpCo prüfen."

## Backend-Verbesserungen (live, beeinflussen alle Extension-Versionen sofort)

Diese Verbesserungen liegen im n8n-Workflow auf dem Server — Extension-Code bleibt unverändert, Updates erreichen alle User automatisch beim nächsten Check:

- **v3 + v4 + v5 (live 2026-05-19, user-verifiziert auf zwei realen DMO-Pages)**:
  - **Selbst-Siegel-Verstöße** werden korrekt erkannt (hauseigene Siegel ohne Drittprüfung)
  - **Anerkannte Drittzertifikate** (EU Ecolabel, EMAS, GreenSign, DEHOGA Umweltcheck, Viabono, Green Key, GSTC, Travelife, Blauer Engel, Österreichisches Umweltzeichen) werden respektiert — Sätze die solche Cert namentlich nennen werden nicht hart bewertet (Severity max `low`)
  - **Anti-Verbatim-Regel** (Step 5): Alternativen wiederholen niemals die geflaggte pauschale Aussage 1:1. Bei „regionale Produkte" landen Vorschläge wie „Tiroler Spezialitäten" oder „Produkte vom Hof XY" statt einer Wiederholung des Verstoßes
  - **Severity-Cap bei Cert-Erwähnung im Satz**: kein BLOCK mehr auf cert-substantiierten Pages — Score-Niveau bleibt aussagekräftig statt panisch
  - **Konsistente Rule-IDs** zwischen Runs (JSON-Schema Enum, 11 fixe Werte)
  - **Marketing-taugliche Alternativen** statt bürokratischer Umformulierungen, mit Pflicht zu konkreten Bezügen aus Original
  - **Anti-Halluzinations-Klauseln** gegen erfundene Orte/Daten und Cross-Context-Detail-Leakage
  - **~22 % schneller** (Mean Latency 4.7 s)
  - Verifiziert mit 20 produktiven Inputs + 5 synthetischen Cert-Tests + 17 Extension-Use-Cases + 2 reale DMO-Page-Tests (tirol.at/nachhaltige-unterkuenfte: 65/100 WARN; thueringen-entdecken.de/nachhaltig: 80/100 WARN). Test-Skripte im Repo unter `workflows/empco/`.

## Phase 2 (später, nach Demand-Signal aus Waitlist)

- **CMS-Live-Mode** (Grammarly-Style) für WordPress Gutenberg, TinyMCE, CKEditor 5 (Typo3) — Live-Underline während des Tippens, MutationObserver + Overlay-Layer
- **Pro-Mode** mit API-Key + höheres Rate-Limit + Team-Dashboard
- **i18n der UI** (aktuell DE only) + Multi-Language-Store-Listings
- **Firefox-Build** via WXT Cross-Browser
- **History-Export als PDF**
- **Native Typo3 CKEditor 5 Extension** statt nur Browser-Extension (für Typo3-Kunden)
- **Native WordPress Plugin** (Sidebar + Pre-Publish-Gate) statt nur Browser-Extension

## Feedback & Wünsche

Issue oder Pull Request gerne hier im Repo. Oder direkt: f.schuetz@posteo.de.
