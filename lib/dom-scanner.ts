// DOM scanner + section classifier.
// Runs inside the content script. Walks the live document, classifies every
// "scannable unit" by section type and page role, and pre-filters via the
// local trigger word list so we never send irrelevant text to the backend.

import { PageRole, ScannedSection, SectionType } from "./types";
import { matchTriggers } from "./triggers";

// Max number of sections we scan per page (prevents UI freeze on huge pages).
const MAX_SECTIONS = 200;
// Min text length to consider a section.
const MIN_SECTION_CHARS = 8;
// Max chars per section (truncate; very long body paragraphs get split implicitly).
const MAX_SECTION_CHARS = 2000;
// Surrounding-context window (chars on each side).
const SURROUND_CHARS = 250;

const SKIP_SELECTOR = [
  "nav",
  "[role='navigation']",
  "header nav",
  ".cookie-banner",
  "[id*='consent']",
  "[id*='cookie']",
  "[class*='cookie-banner']",
  "[class*='cookie_banner']",
  "[class*='cookieBanner']",
  "[aria-label*='cookie' i]",
  "[aria-label*='consent' i]",
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "[aria-hidden='true']",
  ".empco-lupe-mark",            // already-marked content (prevents reentry)
].join(",");

interface Candidate {
  el: Element;
  section_type: SectionType;
}

function isVisible(el: Element): boolean {
  // Cheap visibility check. We deliberately accept off-screen elements as long
  // as they are visually rendered (display !== "none", visibility !== "hidden").
  const cs = window.getComputedStyle(el);
  if (cs.display === "none" || cs.visibility === "hidden") return false;
  if (cs.opacity && parseFloat(cs.opacity) === 0) return false;
  const rect = (el as HTMLElement).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return true;
}

function isInsideSkipped(el: Element): boolean {
  let n: Element | null = el;
  while (n) {
    if (n.matches?.(SKIP_SELECTOR)) return true;
    n = n.parentElement;
  }
  return false;
}

function classify(el: Element): SectionType {
  if (el.matches("[role='navigation'], nav, header nav")) return "navigation";
  if (
    el.matches(
      ".cookie-banner, [id*='consent'], [id*='cookie'], [class*='cookie-banner'], [class*='cookie_banner'], [class*='cookieBanner']",
    )
  )
    return "consent_banner";

  // Hero detection via class/data hints first (covers theme builders, hero sliders, etc.)
  const cls = (el.className || "").toString().toLowerCase();
  if (el.matches("h1")) return "hero_headline";
  if (cls.includes("hero") || el.matches("[data-section='hero']")) return "hero_section";

  // Body content inside main/article
  if (el.matches("main h2, article h2, [role='main'] h2")) return "body_headline";
  if (el.matches("main p, article p, [role='main'] p")) return "body_content";
  if (el.matches("main li, article li, [role='main'] li")) return "body_list_item";

  // Side / footer
  if (el.matches("aside, .sidebar, [role='complementary']")) return "aside";
  if (el.matches("footer, [role='contentinfo']")) return "footer";

  // Default: treat orphan headlines + paragraphs as body content (less prominent than hero).
  if (el.matches("h2, h3")) return "body_headline";
  if (el.matches("p")) return "body_content";
  if (el.matches("li")) return "body_list_item";

  return "unknown";
}

function detectPageRole(url: URL): PageRole {
  const p = (url.pathname || "/").toLowerCase();
  if (p === "/" || p === "/index" || p === "/home" || p === "/start") return "startpage";
  if (/\b(nachhaltig|sustainab|umwelt|environment|csr|esg)\b/i.test(p)) return "sustainability";
  if (/\b(ueber|uber|about|wir|company|firma)\b/i.test(p)) return "about";
  if (/\b(buchen|booking|reservation|reservierung)\b/i.test(p)) return "booking";
  if (/\b(produkt|product|angebot|leistung|programm|tour|reise)\b/i.test(p)) return "product";
  return "other";
}

function getSurroundingContext(el: Element): string {
  // Combine previous sibling text + next sibling text, capped.
  const parts: string[] = [];
  const prev = el.previousElementSibling;
  const next = el.nextElementSibling;
  if (prev && !isInsideSkipped(prev)) {
    parts.push((prev.textContent || "").trim());
  }
  if (next && !isInsideSkipped(next)) {
    parts.push((next.textContent || "").trim());
  }
  const joined = parts.filter(Boolean).join(" ... ").replace(/\s+/g, " ").trim();
  return joined.slice(0, SURROUND_CHARS);
}

function gatherCandidates(): Candidate[] {
  // Prefer main/article first, then full body. Selector order influences DOM
  // walk only — final dom_position uses real document order.
  const sel = [
    "h1",
    "[class*='hero']",
    "[data-section='hero']",
    "main h2",
    "main p",
    "main li",
    "article h2",
    "article p",
    "article li",
    "[role='main'] h2",
    "[role='main'] p",
    "[role='main'] li",
    "aside p",
    "footer p",
    "h2",
    "h3",
    "p",
    "li",
  ].join(",");
  const all = Array.from(document.querySelectorAll(sel));
  const seen = new Set<Element>();
  const result: Candidate[] = [];
  for (const el of all) {
    if (seen.has(el)) continue;
    seen.add(el);
    if (isInsideSkipped(el)) continue;
    if (!isVisible(el)) continue;
    const sec = classify(el);
    if (sec === "navigation" || sec === "consent_banner") continue;
    result.push({ el, section_type: sec });
  }
  return result;
}

export interface ScanOptions {
  language: "de" | "en";
}

export interface ScanOutput {
  page_role: PageRole;
  sections: ScannedSection[];
  total_scanned: number;
  truncated: boolean;
}

export function scanDom(opts: ScanOptions): ScanOutput {
  const url = new URL(window.location.href);
  const page_role = detectPageRole(url);

  const candidates = gatherCandidates();
  // Truncation: keep first MAX_SECTIONS in document order.
  const truncated = candidates.length > MAX_SECTIONS;
  const limited = candidates.slice(0, MAX_SECTIONS);

  const sections: ScannedSection[] = [];
  limited.forEach((c, i) => {
    const raw = (c.el.textContent || "").replace(/\s+/g, " ").trim();
    if (!raw || raw.length < MIN_SECTION_CHARS) return;
    const text = raw.slice(0, MAX_SECTION_CHARS);
    const triggers = matchTriggers(text, opts.language);
    const id = "sec-" + i.toString().padStart(4, "0");
    // Tag the element so we can highlight + jump back to it later.
    (c.el as HTMLElement).dataset.empcoSectionId = id;
    sections.push({
      id,
      section_type: c.section_type,
      text,
      dom_position: i,
      page_role,
      trigger_match: triggers.length > 0,
      triggers_matched: triggers,
      surrounding_context: getSurroundingContext(c.el),
    });
  });

  return {
    page_role,
    sections,
    total_scanned: candidates.length,
    truncated,
  };
}

/**
 * Look up a previously-scanned element by section id and scroll it into view.
 * Returns true if found, false otherwise.
 */
export function jumpToSection(id: string): boolean {
  const el = document.querySelector(`[data-empco-section-id='${CSS.escape(id)}']`) as HTMLElement | null;
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("empco-lupe-flash");
  setTimeout(() => el.classList.remove("empco-lupe-flash"), 700);
  return true;
}
