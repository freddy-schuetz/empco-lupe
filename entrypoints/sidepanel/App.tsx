import * as React from "react";
import { Settings as SettingsIcon, History as HistoryIcon, Search, Sparkles, FileSearch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConsentScreen } from "@/components/ConsentScreen";
import { StatusBar } from "@/components/StatusBar";
import { FindingCard } from "@/components/FindingCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { HistoryList } from "@/components/HistoryList";
import {
  ApiResponse,
  HistoryEntry,
  Message,
  PageScanResult,
  ScannedSection,
  Severity,
  UiFinding,
  UserSettings,
} from "@/lib/types";
import { ApiRequest } from "@/lib/api";
import { getHistory, getSettings, pushHistory, updateSettings, clearHistory } from "@/lib/storage";

const MAX_API_CALLS_PER_SCAN = 30;
const BATCH_CONCURRENCY = 5;

// --- helpers ------------------------------------------------------------------------------------

async function bgApiCheck(req: ApiRequest): Promise<ApiResponse | null> {
  try {
    const resp = await chrome.runtime.sendMessage({ type: "API_CHECK", request: req });
    if (!resp?.ok) return null;
    return resp.result as ApiResponse;
  } catch {
    return null;
  }
}

async function bgHashUrl(url: string): Promise<string | null> {
  try {
    const resp = await chrome.runtime.sendMessage({ type: "API_HASH_URL", url });
    if (!resp?.ok) return null;
    return String(resp.hash);
  } catch {
    return null;
  }
}

function isScannable(url?: string): boolean {
  return !!url && /^https?:\/\//.test(url);
}

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  // 1) Preferred: active tab in current window.
  const inCurrent = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, resolve);
  });
  if (inCurrent[0] && isScannable(inCurrent[0].url)) return inCurrent[0];
  // 2) Fallback: last focused window.
  const inLast = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, resolve);
  });
  if (inLast[0] && isScannable(inLast[0].url)) return inLast[0];
  // 3) Fallback: any active http(s) tab across all windows, most recently accessed first.
  const allActive = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ active: true }, resolve);
  });
  const scannable = allActive.filter((t) => isScannable(t.url));
  scannable.sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0));
  if (scannable[0]) return scannable[0];
  // 4) Last resort: return whatever we got from current/last so the caller can show a helpful URL in the error.
  return inCurrent[0] ?? inLast[0] ?? allActive[0] ?? null;
}

async function tabSendMessage<T = any>(tabId: number, msg: Message | { type: string; [k: string]: any }): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, msg, (response: any) => {
      if (chrome.runtime.lastError) {
        // Content script not present (chrome:// page, store page, etc.)
        resolve(null);
        return;
      }
      resolve(response as T);
    });
  });
}

function severityRank(s: Severity): number {
  return s === "high" ? 0 : s === "med" ? 1 : 2;
}

function countBySeverity(findings: UiFinding[]): { high: number; med: number; low: number } {
  let high = 0, med = 0, low = 0;
  for (const f of findings) {
    if (f.flagged_hallucinated) continue;
    if (f.severity === "high") high++;
    else if (f.severity === "med") med++;
    else low++;
  }
  return { high, med, low };
}

function pageScoreFromFindings(findings: UiFinding[]): number {
  const c = countBySeverity(findings);
  return Math.max(0, 100 - c.high * 25 - c.med * 12 - c.low * 5);
}

function pageStatusFromFindings(findings: UiFinding[]): "clean" | "warn" | "block" {
  const c = countBySeverity(findings);
  if (c.high === 0 && c.med === 0 && c.low === 0) return "clean";
  return c.high > 0 ? "block" : "warn";
}

// --- component ----------------------------------------------------------------------------------

export const App: React.FC = () => {
  const [settings, setSettings] = React.useState<UserSettings | null>(null);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [scan, setScan] = React.useState<PageScanResult | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);
  const [selectionResult, setSelectionResult] = React.useState<UiFinding | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"current" | "history" | "settings">("current");

  // Initial load
  React.useEffect(() => {
    (async () => {
      const [s, h, t] = await Promise.all([getSettings(), getHistory(), getActiveTab()]);
      setSettings(s);
      setHistory(h);
      if (t?.url) {
        const hash = await bgHashUrl(t.url);
        setScan((prev) => prev ?? {
          page_url_hash: hash ?? "",
          page_title: t.title ?? "",
          page_domain: t.url ? new URL(t.url).hostname : "",
          scanned_at: 0,
          status: "clean",
          page_score: 0,
          sections_scanned: 0,
          sections_checked: 0,
          findings: [],
        });
      }
    })();
  }, []);

  // Listen for context-menu selection handed off by background.
  React.useEffect(() => {
    function handler(msg: any) {
      if (msg?.type === "SELECTION_FROM_BG" && typeof msg.text === "string") {
        void runSelectionCheck(msg.text);
      }
    }
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [settings, scan]);

  function patchSettings(patch: Partial<UserSettings>) {
    (async () => {
      const next = await updateSettings(patch);
      setSettings(next);
    })();
  }

  async function runSelectionCheck(text: string) {
    if (!settings) return;
    if (!settings.consent_accepted) {
      patchSettings({ consent_accepted: true });
    }
    setScanning(true);
    setError(null);
    setSelectionResult(null);
    setTab("current");

    const t = await getActiveTab();
    let page_url_hash = "";
    let page_domain = scan?.page_domain ?? "";
    let page_role: any = "other";
    if (t?.url) {
      page_url_hash = (await bgHashUrl(t.url)) ?? "";
      try { page_domain = new URL(t.url).hostname; } catch {}
    }

    const result = await bgApiCheck({
      text,
      language: settings.language,
      sector: settings.sector === "auto" ? "" : settings.sector,
      section_type: "user_selection",
      page_role,
      page_url_hash,
    });

    setScanning(false);

    if (!result) {
      setError("API-Anfrage fehlgeschlagen. Später erneut versuchen.");
      return;
    }
    const first = result.findings?.[0];
    if (!first) {
      // Build a synthetic "clean" finding so the UI shows confirmation
      setSelectionResult({
        quote: text.slice(0, 200),
        severity: "low",
        rule_id: "",
        explanation: result.status === "clean"
          ? "Keine EmpCo-Risiken erkannt. Markierter Text wirkt unauffällig."
          : "Markierter Text wurde geprüft, aber kein konkretes finding zurückgegeben.",
        citations: [],
        compliant_alternatives: [],
        section_id: "selection",
        section_type: "user_selection",
        page_role,
        source_quote: text,
      });
      return;
    }
    setSelectionResult({
      ...first,
      section_id: "selection",
      section_type: "user_selection",
      page_role,
      source_quote: text,
    });
  }

  async function runScan() {
    if (!settings) return;
    if (!settings.consent_accepted) {
      patchSettings({ consent_accepted: true });
    }
    setScanning(true);
    setError(null);
    setSelectionResult(null);
    setProgress(null);

    const t = await getActiveTab();
    if (!t?.id || !isScannable(t.url)) {
      setScanning(false);
      const seen = t?.url ? ` (gefunden: ${t.url.slice(0, 60)}${t.url.length > 60 ? "..." : ""})` : "";
      setError(`Aktive Seite ist keine http(s)-Seite${seen}. Wechsle in den Tab mit der zu prüfenden Webseite und klicke erneut auf „Prüfen".`);
      return;
    }
    if (settings.skip_domains.includes(new URL(t.url!).hostname)) {
      setScanning(false);
      setError("Diese Domain steht auf der Skip-Liste (Einstellungen).");
      return;
    }

    const scanResp = await tabSendMessage<{ ok: boolean; meta: any; sections: ScannedSection[]; page_role: any; total_scanned: number; truncated: boolean }>(t.id, { type: "SCAN_PAGE", settings });

    if (!scanResp || !scanResp.ok) {
      setScanning(false);
      setError("Content-Skript antwortet nicht. Seite ggf. neu laden und erneut versuchen.");
      return;
    }

    const sections = scanResp.sections.filter((s) => s.trigger_match).slice(0, MAX_API_CALLS_PER_SCAN);
    setProgress({ done: 0, total: sections.length });

    if (sections.length === 0) {
      // Nothing locally interesting -> clean
      const newScan: PageScanResult = {
        page_url_hash: scanResp.meta.page_url_hash,
        page_title: scanResp.meta.page_title,
        page_domain: scanResp.meta.page_domain,
        scanned_at: Date.now(),
        status: "clean",
        page_score: 100,
        sections_scanned: scanResp.sections.length,
        sections_checked: 0,
        findings: [],
      };
      setScan(newScan);
      await persistHistory(newScan);
      setScanning(false);
      setProgress(null);
      return;
    }

    // Batched API calls — capture narrowed locals so async closure doesn't widen.
    const language = settings.language;
    const sectorVal = settings.sector === "auto" ? "" : settings.sector;
    const pageRole = scanResp.page_role;
    const pageUrlHash = scanResp.meta.page_url_hash;

    const uiFindings: UiFinding[] = [];
    let cursor = 0;
    let done = 0;
    async function worker() {
      while (cursor < sections.length) {
        const i = cursor++;
        const sec = sections[i];
        const resp = await bgApiCheck({
          text: sec.text,
          language,
          sector: sectorVal,
          section_type: sec.section_type,
          page_role: pageRole,
          page_url_hash: pageUrlHash,
          surrounding_context: sec.surrounding_context,
        });
        if (resp?.findings) {
          for (const f of resp.findings) {
            uiFindings.push({
              ...f,
              section_id: sec.id,
              section_type: sec.section_type,
              page_role: pageRole,
              source_quote: sec.text,
            });
          }
        }
        done += 1;
        setProgress({ done, total: sections.length });
      }
    }
    await Promise.all(Array.from({ length: Math.min(BATCH_CONCURRENCY, sections.length) }, worker));

    uiFindings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
    const newScan: PageScanResult = {
      page_url_hash: scanResp.meta.page_url_hash,
      page_title: scanResp.meta.page_title,
      page_domain: scanResp.meta.page_domain,
      scanned_at: Date.now(),
      status: pageStatusFromFindings(uiFindings),
      page_score: pageScoreFromFindings(uiFindings),
      sections_scanned: scanResp.sections.length,
      sections_checked: sections.length,
      findings: uiFindings,
    };
    setScan(newScan);
    await persistHistory(newScan);

    // Propagate severity colors back into the page DOM
    for (const f of uiFindings) {
      const ev = new CustomEvent("empco-set-severity", { detail: { section_id: f.section_id, severity: f.severity } });
      window.dispatchEvent(ev); // no-op in sidepanel; we forward via tab message instead
      void tabSendMessage(t.id, { type: "SET_SEVERITY", section_id: f.section_id, severity: f.severity } as any);
    }

    setScanning(false);
    setProgress(null);
  }

  async function persistHistory(s: PageScanResult) {
    const counts = countBySeverity(s.findings);
    const entry: HistoryEntry = {
      page_url_hash: s.page_url_hash,
      page_title: s.page_title,
      page_domain: s.page_domain,
      scanned_at: s.scanned_at,
      status: s.status,
      page_score: s.page_score,
      counts,
    };
    const next = await pushHistory(entry);
    setHistory(next);
  }

  async function jumpToSection(sectionId: string) {
    const t = await getActiveTab();
    if (t?.id) await tabSendMessage(t.id, { type: "JUMP_TO_SECTION", section_id: sectionId });
  }

  if (!settings) {
    return <div className="p-4 text-xs text-muted-foreground">Lade Einstellungen ...</div>;
  }

  if (!settings.consent_accepted) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ConsentScreen onAccept={() => patchSettings({ consent_accepted: true })} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">EmpCo-Lupe</span>
            <Badge variant="outline" className="text-[9px]">BETA</Badge>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="h-7">
              <TabsTrigger value="current" className="h-5 px-2 text-[10px]">Seite</TabsTrigger>
              <TabsTrigger value="history" className="h-5 px-2 text-[10px]"><HistoryIcon className="h-3 w-3" /></TabsTrigger>
              <TabsTrigger value="settings" className="h-5 px-2 text-[10px]"><SettingsIcon className="h-3 w-3" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Tabs value={tab} className="h-full">
          <TabsContent value="current" className="m-0 h-full">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                <StatusBar scan={scan} busy={scanning} onScan={runScan} />

                {error && (
                  <div className="rounded-md border border-[hsl(var(--sev-high))]/50 bg-[hsl(var(--sev-high))]/10 px-3 py-2 text-xs text-foreground">
                    {error}
                  </div>
                )}

                {progress && (
                  <div className="text-xs text-muted-foreground">
                    Prüfe Section {progress.done}/{progress.total} ...
                  </div>
                )}

                {selectionResult && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Selektions-Check
                    </div>
                    <FindingCard finding={selectionResult} index={0} />
                    <Separator />
                  </div>
                )}

                {scan && scan.findings.length === 0 && scan.scanned_at > 0 && !scanning && (
                  <div className="rounded-md border border-[hsl(var(--sev-clean))]/30 bg-[hsl(var(--sev-clean))]/10 p-3 text-xs">
                    Keine EmpCo-Risiken erkannt. Diese Seite enthält keine prüfbaren Werbeaussagen über Umwelt/Nachhaltigkeit, oder alle Aussagen sind ausreichend substantiiert.
                  </div>
                )}

                {scan && scan.findings.length > 0 && (
                  <div className="space-y-3">
                    {scan.findings.map((f, i) => (
                      <FindingCard key={f.section_id + i} finding={f} index={i} onJump={jumpToSection} />
                    ))}
                  </div>
                )}

                <Separator />
                <footer className="space-y-3 text-[11px] text-muted-foreground">
                  <div className="rounded-md border border-border bg-card/60 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs font-semibold">Ein Side-Project von Friedemann Schütz</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      AI Automation Expert &amp; n8n Ambassador. Self-Check-Tools, KI-Assistenten und Workflow-Automatisierungen für DMOs, Reiseveranstalter, Hotelgruppen und Verbände — n8n-basiert, on-premise-fähig.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1 text-[11px]">
                      <a className="inline-flex items-center gap-1 text-primary hover:underline" href="https://friedemann-schuetz.de" target="_blank" rel="noopener noreferrer">
                        <Search className="h-3 w-3" />
                        friedemann-schuetz.de
                      </a>
                      <a className="inline-flex items-center gap-1 text-primary hover:underline" href="mailto:f.schuetz@posteo.de?subject=Anfrage%20zu%20EmpCo-Lupe%20%2F%20n8n-Automation">
                        Anfrage stellen
                      </a>
                    </div>
                  </div>
                  <p className="px-1">
                    <FileSearch className="-mt-0.5 mr-1 inline h-3 w-3" />
                    Multi-Page-Vollaudit deiner Site:{" "}
                    <a className="text-primary hover:underline" href="https://n8n.friedemann-schuetz.de/webhook/empco-self-check-v2" target="_blank" rel="noopener noreferrer">
                      Self-Check V2
                    </a>
                  </p>
                  <p className="px-1 text-[10px] text-muted-foreground/80">
                    Automatisierter Check, keine Rechtsberatung. Bei kritischen Befunden Anwalt konsultieren.
                  </p>
                </footer>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="m-0 h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3 p-4">
                <h2 className="text-sm font-semibold">Letzte Checks</h2>
                <HistoryList
                  entries={history}
                  onClear={async () => {
                    await clearHistory();
                    setHistory([]);
                  }}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="m-0 h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3 p-4">
                <h2 className="text-sm font-semibold">Einstellungen</h2>
                <SettingsPanel
                  settings={settings}
                  onChange={patchSettings}
                  currentDomain={scan?.page_domain ?? ""}
                />
                <Separator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => patchSettings({ consent_accepted: false })}
                >
                  Datenschutz-Hinweis erneut anzeigen
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
