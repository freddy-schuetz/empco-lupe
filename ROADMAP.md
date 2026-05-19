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

- **v3 (live 2026-05-19)**: Selbst-Siegel-Erkennung gefixt, Alternativen-Konsistenz via deterministischem Seed, marketing-taugliche statt bürokratischer Umformulierungen, Anti-Halluzinations-Klausel, Drittzertifikat-Schonung.
- **v4 (geplant)**: Wenn ein konkretes Drittzertifikat (EU Ecolabel, EMAS, etc.) im Satz erwähnt wird, kein Finding mehr darauf erzeugen — das IST die Substantiierung. Plus Cross-Context-Halluzinations-Schutz.

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
