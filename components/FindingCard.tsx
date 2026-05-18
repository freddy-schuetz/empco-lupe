import * as React from "react";
import { Copy, ChevronDown, ChevronRight, Locate, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UiFinding } from "@/lib/types";
import { sendFeedback, findingId } from "@/lib/feedback";

interface Props {
  finding: UiFinding;
  index: number;
  onJump?: (sectionId: string) => void;
  pageUrlHash?: string;
  extensionVersion?: string;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

const SEC_LABEL: Record<string, string> = {
  hero_headline: "Hero H1",
  hero_section: "Hero",
  body_headline: "Headline",
  body_content: "Body",
  body_list_item: "List",
  aside: "Aside",
  footer: "Footer",
  navigation: "Nav",
  consent_banner: "Consent",
  user_selection: "Selektion",
  unknown: "Section",
};

const PAGE_LABEL: Record<string, string> = {
  startpage: "Startseite",
  sustainability: "Nachhaltigkeit",
  about: "Über",
  booking: "Buchung",
  product: "Produkt",
  other: "Andere",
};

export const FindingCard: React.FC<Props> = ({ finding, index, onJump, pageUrlHash, extensionVersion }) => {
  const [openCitations, setOpenCitations] = React.useState(false);
  const [feedbackSent, setFeedbackSent] = React.useState<"up" | "down" | null>(null);

  const sevVariant = finding.severity as "high" | "med" | "low";
  const sevLabel = finding.severity === "high" ? "HOCH" : finding.severity === "med" ? "MITTEL" : "NIEDRIG";

  const fid = React.useMemo(
    () => findingId(finding.rule_id, finding.quote, finding.section_id),
    [finding.rule_id, finding.quote, finding.section_id],
  );

  function submitFeedback(thumb: "up" | "down") {
    if (feedbackSent) return;
    setFeedbackSent(thumb);
    void sendFeedback({
      finding_id: fid,
      thumb,
      rule_id: finding.rule_id,
      severity: finding.severity,
      quote: finding.quote?.slice(0, 200),
      section_type: finding.section_type,
      page_role: finding.page_role,
      page_url_hash: pageUrlHash,
      extension_version: extensionVersion,
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={sevVariant}>{sevLabel}</Badge>
          {finding.section_type && <Badge variant="outline">{SEC_LABEL[finding.section_type] ?? finding.section_type}</Badge>}
          {finding.page_role && <Badge variant="secondary">{PAGE_LABEL[finding.page_role] ?? finding.page_role}</Badge>}
          {finding.flagged_hallucinated && <Badge variant="outline">unbelegt</Badge>}
          <span className="ml-auto text-[10px] text-muted-foreground">#{index + 1}</span>
        </div>
        <div className="text-sm font-semibold leading-snug text-foreground">
          &bdquo;{finding.quote}&ldquo;
        </div>
        {onJump && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 self-start text-xs text-muted-foreground"
            onClick={() => onJump(finding.section_id)}
          >
            <Locate className="h-3 w-3" />
            Auf Seite zeigen
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {finding.explanation && (
          <p className="text-xs leading-relaxed text-muted-foreground">{finding.explanation}</p>
        )}

        {finding.citations && finding.citations.length > 0 && (
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
            <button
              type="button"
              onClick={() => setOpenCitations((v) => !v)}
              className="flex w-full items-center gap-1 text-xs font-medium text-foreground"
            >
              {openCitations ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Belegstellen ({finding.citations.length})
            </button>
            {openCitations && (
              <ul className="mt-2 space-y-2">
                {finding.citations.map((c, i) => (
                  <li key={i} className="space-y-1 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1">
                      {c.source && <span className="font-mono text-muted-foreground">{c.source}</span>}
                      {c.ref && <span className="text-muted-foreground">&middot; {c.ref}</span>}
                      {c.valid === false && <Badge variant="outline">nicht validiert</Badge>}
                    </div>
                    {c.passage && <p className="italic text-foreground/80">&bdquo;{c.passage}&ldquo;</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {finding.compliant_alternatives && finding.compliant_alternatives.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              EmpCo-konforme Umformulierung
            </div>
            <ul className="space-y-2">
              {finding.compliant_alternatives.slice(0, 3).map((alt, i) => (
                <li key={i} className="flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2">
                  <span className="flex-1 text-xs leading-relaxed text-foreground">{alt}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyToClipboard(alt)} title="Kopieren">
                    <Copy className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border pt-2">
          <span className="text-[10px] text-muted-foreground">
            {feedbackSent ? "Danke fürs Feedback!" : "Hilfreich?"}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant={feedbackSent === "up" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => submitFeedback("up")}
              disabled={!!feedbackSent}
              title="Hilfreich"
              aria-label="Hilfreich"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant={feedbackSent === "down" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => submitFeedback("down")}
              disabled={!!feedbackSent}
              title="Nicht hilfreich / False Positive"
              aria-label="Nicht hilfreich"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
