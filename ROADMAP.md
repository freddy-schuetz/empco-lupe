# Roadmap

Status zum 2026-05-20.

## v0.2.0 (current — GitHub Release)

- 👍 / 👎 Feedback-Buttons pro Finding
- Anonymes Backend-Logging (kein User-Tracking, nur Finding-Bewertungen)

## v0.3.0 (geplant — nach Chrome/Edge Store-Freigabe)

Bekannte Verbesserungen aus realem Testing:

- **Multi-Finding im Selektions-Check** — aktuell wird bei langem markierten Text mit mehreren Verstößen nur das stärkste Finding angezeigt. Liste aller Findings rendern, wie der Page-Scan es schon tut.
- **iframe-aware Status** — in Editor-Iframes (Mailjet, Gmail-Compose, TinyMCE, CKEditor) erreicht der Page-Scan den Inhalt nicht. Aktuell zeigt das Side-Panel dann fälschlich „100/100 UNAUFFÄLLIG". Stattdessen Hinweis: „Page-Scan kann auf dieser Seite nicht greifen — Text markieren + Rechtsklick → EmpCo prüfen."
- **Page-Scan-Abdeckung transparenter** — der Page-Scan prüft nur Sections mit Umwelt-Schlüsselwörtern, nicht die ganze Seite (Kosten-/Zeit-Grenze: eine ganze Seite = zu viele API-Calls). Die lokale Schlüsselwort-Liste wird mit der erweiterten Backend-Liste re-synct, und die Anzeige wird ehrlicher: „X Sections mit Umwelt-Bezug geprüft (von Y gescannt)" statt „X geprüfte Sections".
- **Drei Eskalations-Varianten + Belege-Checkliste** — das Backend liefert seit v6–v8 pro Finding `conservative`/`with_evidence`/`certified`-Umformulierungen plus eine `evidence_required`-Liste. Die UI rendert das künftig als drei klar gelabelte Stufen mit Checkliste.
- **Determinismus auf Grenzfall-Texten** — bei juristisch echten 50/50-Texten kann derselbe Text zwischen „clean" und „warn" wechseln. Geplanter Fix: `seed`-Parameter über direkten OpenAI-API-Call (n8ns Standard-Node unterstützt kein `seed`). Liefert gleicher-Input-gleicher-Output.

## Backend-Verbesserungen (live, beeinflussen alle Extension-Versionen sofort)

Diese Verbesserungen liegen im n8n-Workflow auf dem Server — Extension-Code bleibt unverändert, Updates erreichen alle User automatisch beim nächsten Check:

- **v10 (live 2026-05-20, aus erster echter User-Nutzung)**:
  - **Selektions-Check geht immer zum LLM**: ein bewusster „EmpCo prüfen"-Rechtsklick wird nie mehr vom Schlüsselwort-Cost-Gate übersprungen. Wirkt sofort für alle Versionen inkl. v0.1.0 (reiner Backend-Fix).
  - **Erweiterte Backend-Schlüsselwortliste**: weiche CSR-Vokabeln (`ressourcen`, `umweltbewusst`, `klimaschutz`, `co2`, `emission`, `fußabdruck`, `naturverbunden`, `ökostrom` …), die „EmpCo-evasive" Texte nutzen, um die Buzzwords zu umgehen.
  - **Satzweise Prüfung**: ein Umwelt-Claim wird nicht mehr von operativen/sozialen Sätzen drumherum „verdünnt" — jeder Satz wird eigenständig bewertet.

- **v9 (live 2026-05-19, Konsolidierung + Severity-Anker)**:
  - **Finding-Konsolidierung pro Satz**: mehrere pauschale Aussagen DERSELBEN rule_id im selben Satz werden zu EINEM Finding zusammengefasst. Reduziert UI-Noise massiv (Tirol: 27→20 Findings, ~26% weniger).
  - **Erweiterte Off-Topic-Filter**: catched neue Patterns wie „ohne klaren, eigenständigen Umwelt-Claim", „redaktionelle Anspielung", „Erlebnis- und Komfortwerbung" — der LLM selbst sagt diese Phrasen häufig, die Findings werden jetzt korrekt gedropt.
  - **Severity-Anker** überschreibt Konsolidierung: schwere Verstöße bleiben high. EMPCO-ANHANG-I-4C (Klimakompensation), 4D (Zukunftsversprechen), 2A (Selbst-Siegel) sind mindestens high. 4A/4B mindestens med. Auffang-Normen low.
  - Newsletter mit „klimaneutral + 100% CO2-Kompensation" wird jetzt korrekt block/75 mit 1× high (vorher fälschlich warn/95 mit low durch Konsolidierungs-Verwässerung).

- **v6 + v7 + v8 (live 2026-05-19, BH-Best-Practice-Integration)**:
  - **Juristische Tiefe**: rule_ids zitieren jetzt präzise Anhang-I-Normen (`EMPCO-ANHANG-I-4C` für Klimakompensation, `4A` für allg. Umweltaussagen, `4D` für Zukunftsversprechen, `2A` für Selbst-Siegel) statt generischer Kategorien. Anwalts-fit.
  - **Prüfreihenfolge**: Anhang I → Art. 6 → Art. 7 → UWG §5 — strikte Hierarchie wie BH.
  - **`evidence_required[]`**: pro Finding 2–4 konkret-belegbare Items ("CO2-Bilanz Scope 1+2 nach GHG Protocol", "Audit-URL des Aufforstungs-Projekts"). User-Checkliste statt vager Verbesserungs-Aufforderung.
  - **Drei Eskalations-Varianten** im neuen `suggestions{conservative, with_evidence, certified}`-Objekt — User wählt Risikolevel:
    - `conservative`: ohne Belegpflicht, streicht Claim oder ersetzt durch neutrale Beschreibung
    - `with_evidence`: behält Werbewirkung, mit Beleganker `[X % seit Jahr]` / `[Scope 1+2]`
    - `certified`: stärkster Claim mit Drittzertifikat-Verweis (EU Ecolabel, GreenSign, Travelife Gold)
  - **Vollständig backward-kompatibel**: Extension v0.1/v0.2 lesen weiter `compliant_alternatives` (Backend synthetisiert 3 Strings aus suggestions). v0.3 (Future) wird suggestions + evidence_required nativ rendern.
  - Verifiziert: 17/17 Extension-Cases bestehen, 0 Verbatim-Wiederholungen auf 25 Tirol-Findings, Tirol-Page-Score weiter im WARN-Bereich.

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
